import { type NextRequest, NextResponse } from "next/server";

const NLP_SERVER_URL = process.env.NLP_SERVER_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, type = "medical_query" } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Generate session ID if not provided
    const effectiveSessionId =
      sessionId ||
      `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let response;

    if (type === "websocket_simulation") {
      // For REST API simulation of WebSocket functionality
      response = await fetch(`${NLP_SERVER_URL}/api/medical-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: message,
          session_id: effectiveSessionId,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });
    } else {
      // Direct medical query endpoint
      response = await fetch(`${NLP_SERVER_URL}/api/medical-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: message,
          session_id: effectiveSessionId,
        }),
        signal: AbortSignal.timeout(30000),
      });
    }

    if (!response.ok) {
      throw new Error(
        `NLP server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Transform the response to match the expected format
    if (data.response) {
      return NextResponse.json({
        success: true,
        sessionId: effectiveSessionId,
        response: {
          text: data.response.response_text,
          urgency: data.response.urgency_level,
          confidence: data.response.confidence_level,
          diagnosis: data.response.primary_diagnosis,
          emergency_warning: data.response.emergency_warning,
          follow_up_questions: data.response.follow_up_questions || [],
        },
        source: "nlp_backend",
      });
    }

    // Fallback response format
    return NextResponse.json({
      success: true,
      sessionId: effectiveSessionId,
      response: {
        text: data.message || "Response received from NLP backend",
        urgency: data.urgency_level || "low",
        confidence: data.confidence_level || "medium",
        diagnosis: data.primary_diagnosis || "Analysis pending",
        emergency_warning: data.emergency_warning || false,
        follow_up_questions: data.follow_up_questions || [],
      },
      source: "nlp_backend",
    });
  } catch (error: any) {
    console.error("Error communicating with NLP backend:", error);

    let errorMessage = "Failed to connect to the medical AI system. ";
    let fallbackResponse = "";

    if (error.name === "AbortError" || error.message?.includes("timeout")) {
      errorMessage += "The request timed out. Please try again.";
      fallbackResponse =
        "I'm experiencing some delays processing your request. Please try again or consult with a healthcare professional for immediate concerns.";
    } else if (
      error.message?.includes("ECONNREFUSED") ||
      error.message?.includes("fetch")
    ) {
      errorMessage += "The NLP server is not available. ";
      fallbackResponse =
        "The medical AI backend is currently unavailable. For immediate medical concerns, please contact your healthcare provider or emergency services.";
    } else {
      errorMessage += error.message || "Unknown error occurred.";
      fallbackResponse =
        "I encountered an error processing your medical query. Please try again or consult with a healthcare professional.";
    }

    // Return a structured error response that the frontend can handle
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        response: {
          text: fallbackResponse,
          urgency: "unknown",
          confidence: "low",
          diagnosis: "System Error",
          emergency_warning: true, // Set to true to encourage professional consultation
          follow_up_questions: [
            "Have you consulted with a healthcare professional about your symptoms?",
            "Is this a medical emergency requiring immediate attention?",
          ],
        },
        source: "error_fallback",
        sessionId: null,
      },
      { status: 200 }
    ); // Return 200 to allow frontend to handle the error gracefully
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check endpoint for the NLP backend
    const response = await fetch(`${NLP_SERVER_URL}/api/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5 second timeout for health check
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const healthData = await response.json();

    return NextResponse.json({
      status: "healthy",
      nlp_backend: "connected",
      nlp_server_url: NLP_SERVER_URL,
      backend_status: healthData,
    });
  } catch (error: any) {
    console.error("NLP backend health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        nlp_backend: "disconnected",
        nlp_server_url: NLP_SERVER_URL,
        error: error.message || "Unknown error",
      },
      { status: 503 }
    );
  }
}
