import { type NextRequest, NextResponse } from "next/server";

const NLP_SERVER_URL = process.env.NLP_SERVER_URL || "http://localhost:8000";

// GET /api/nlp/session/[sessionId] - Get session summary
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${NLP_SERVER_URL}/api/session/${sessionId}/summary`,
      {
        method: "GET",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: "Session not found",
            summary: null,
          },
          { status: 404 }
        );
      }
      throw new Error(
        `Session API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      sessionId,
      summary: data,
      source: "nlp_backend",
    });
  } catch (error: any) {
    console.error("Error fetching session summary:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch session summary",
        summary: null,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/nlp/session/[sessionId] - Clear session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${NLP_SERVER_URL}/api/session/${sessionId}`, {
      method: "DELETE",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: "Session not found",
          },
          { status: 404 }
        );
      }
      throw new Error(
        `Session API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      sessionId,
      message: data.message || "Session cleared successfully",
      source: "nlp_backend",
    });
  } catch (error: any) {
    console.error("Error clearing session:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to clear session",
      },
      { status: 500 }
    );
  }
}

// POST /api/nlp/session/[sessionId]/validate - Validate diagnosis
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const { hypothesis, symptoms } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (!hypothesis || !symptoms || !Array.isArray(symptoms)) {
      return NextResponse.json(
        { error: "Hypothesis and symptoms array are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${NLP_SERVER_URL}/api/validate-diagnosis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hypothesis,
        symptoms,
        session_id: sessionId,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(
        `Validation API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      sessionId,
      validation: data,
      source: "nlp_backend",
    });
  } catch (error: any) {
    console.error("Error validating diagnosis:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to validate diagnosis",
        validation: {
          hypothesis: "Unknown",
          symptoms: [],
          validation_result: "Unable to validate due to system error",
          confidence: "unknown",
          recommendations: [
            "Please consult with a qualified healthcare professional for proper diagnosis",
            "System validation is currently unavailable",
          ],
        },
      },
      { status: 200 }
    ); // Return 200 to allow graceful handling
  }
}
