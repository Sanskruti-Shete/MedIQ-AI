import { type NextRequest, NextResponse } from "next/server";

const NLP_SERVER_URL = process.env.NLP_SERVER_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    // Parse the form data for file upload
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const query =
      (formData.get("query") as string) ||
      "Analyze this medical image and describe any findings or abnormalities you can see.";

    if (!file) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Create form data for the Python backend
    const nlpFormData = new FormData();
    nlpFormData.append("image", file);

    // Send to Python NLP backend
    const response = await fetch(`${NLP_SERVER_URL}/api/analyze-image`, {
      method: "POST",
      body: nlpFormData,
      signal: AbortSignal.timeout(60000), // 60 second timeout for image processing
    });

    if (!response.ok) {
      throw new Error(
        `NLP server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        {
          success: false,
          error: data.error,
          analysis: {
            text: "Failed to analyze the medical image. Please try again or consult with a healthcare professional for image interpretation.",
            findings: [],
            confidence: "low",
            recommendations: [
              "Consult with a qualified healthcare professional for proper image interpretation",
              "Ensure the image is clear and properly focused",
              "Consider getting a professional medical imaging study if needed",
            ],
          },
          source: "error_fallback",
        },
        { status: 200 }
      );
    }

    // Transform the response for frontend consumption
    const analysisResult = {
      success: true,
      analysis: {
        text: data.summary || "Image analysis completed",
        findings: data.findings || [],
        confidence: "medium", // Default confidence level
        llama11b_analysis: data.llama11b_analysis,
        llama90b_analysis: data.llama90b_analysis,
        analysis_type: data.analysis_type || "groq_vision",
        timestamp: data.timestamp,
        recommendations: [
          "This is an AI-powered analysis for educational purposes only",
          "Always consult with qualified healthcare professionals for medical image interpretation",
          "Professional radiological review is recommended for diagnostic purposes",
        ],
      },
      source: "nlp_backend",
    };

    // Extract key findings from the analyses
    if (data.llama11b_analysis || data.llama90b_analysis) {
      const findings = [];

      if (data.llama11b_analysis) {
        findings.push({
          model: "LLaMA 11B",
          finding:
            data.llama11b_analysis.substring(0, 200) +
            (data.llama11b_analysis.length > 200 ? "..." : ""),
          confidence: "medium",
        });
      }

      if (data.llama90b_analysis) {
        findings.push({
          model: "LLaMA 90B",
          finding:
            data.llama90b_analysis.substring(0, 200) +
            (data.llama90b_analysis.length > 200 ? "..." : ""),
          confidence: "high",
        });
      }

      analysisResult.analysis.findings = findings;

      // Use the more detailed analysis as the main text
      analysisResult.analysis.text =
        data.llama90b_analysis ||
        data.llama11b_analysis ||
        analysisResult.analysis.text;
    }

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("Error in image analysis:", error);

    let errorMessage = "Failed to analyze the medical image. ";
    let fallbackResponse = "";

    if (error.name === "AbortError" || error.message?.includes("timeout")) {
      errorMessage += "The analysis timed out.";
      fallbackResponse =
        "Image analysis is taking longer than expected. Please try again with a smaller image or consult with a healthcare professional.";
    } else if (
      error.message?.includes("ECONNREFUSED") ||
      error.message?.includes("fetch")
    ) {
      errorMessage += "The analysis server is not available.";
      fallbackResponse =
        "The medical image analysis service is currently unavailable. Please consult with a healthcare professional for image interpretation.";
    } else if (error.message?.includes("File too large")) {
      errorMessage += "The image file is too large.";
      fallbackResponse = "Please try with a smaller image file (under 10MB).";
    } else {
      errorMessage += error.message || "Unknown error occurred.";
      fallbackResponse =
        "I encountered an error analyzing your medical image. Please try again or consult with a healthcare professional.";
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        analysis: {
          text: fallbackResponse,
          findings: [],
          confidence: "low",
          recommendations: [
            "Consult with qualified healthcare professionals for medical image interpretation",
            "Professional radiological review is recommended",
            "Ensure proper medical imaging studies are performed when needed",
          ],
        },
        source: "error_fallback",
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  // Health check for image analysis endpoint
  try {
    const response = await fetch(`${NLP_SERVER_URL}/api/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    return NextResponse.json({
      status: response.ok ? "healthy" : "unhealthy",
      image_analysis: "available",
      nlp_server_url: NLP_SERVER_URL,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        image_analysis: "unavailable",
        error: error.message || "Unknown error",
      },
      { status: 503 }
    );
  }
}
