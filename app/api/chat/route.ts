import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { message, medicalContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          response:
            "I'm sorry, but I need a Gemini API key to function properly. Please add your GEMINI_API_KEY to the environment variables in your Vercel project settings.",
        },
        { status: 200 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const enhancedPrompt = `You are MedIQ AI, a sophisticated medical consultation assistant. You provide evidence-based healthcare guidance while emphasizing the importance of professional medical care.

IMPORTANT GUIDELINES:
- Always recommend consulting healthcare professionals for diagnosis and treatment
- Provide educational information, not definitive medical advice
- Be empathetic and supportive in your responses
- Use clear, accessible language while maintaining medical accuracy
- Acknowledge limitations and encourage professional consultation

${medicalContext ? `PATIENT MEDICAL CONTEXT:\n${medicalContext}\n\n` : ""}

PATIENT QUERY: ${message}

Please provide a helpful, informative response that considers the patient's medical history (if provided) while maintaining appropriate medical disclaimers.`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Error generating response:", error);

    let errorMessage =
      "I apologize, but I encountered an error while processing your request. Please try again.";

    if (error?.message?.includes("API_KEY_INVALID")) {
      errorMessage =
        "The Gemini API key appears to be invalid. Please check your GEMINI_API_KEY environment variable.";
    } else if (error?.message?.includes("QUOTA_EXCEEDED")) {
      errorMessage =
        "I've reached my usage limit for now. Please try again later or check your Gemini API quota.";
    } else if (error?.message?.includes("RATE_LIMIT_EXCEEDED")) {
      errorMessage =
        "I'm receiving too many requests right now. Please wait a moment and try again.";
    } else if (error?.message?.includes("SAFETY")) {
      errorMessage =
        "I can't provide a response to that request due to safety guidelines. Please try rephrasing your question.";
    }

    return NextResponse.json({ response: errorMessage }, { status: 200 });
  }
}
