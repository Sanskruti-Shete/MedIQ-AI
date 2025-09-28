"use client";

import { useState } from "react";

interface NLPResponse {
  success: boolean;
  sessionId: string | null;
  response: {
    text: string;
    urgency: string;
    confidence: string;
    diagnosis: string;
    emergency_warning: boolean;
    follow_up_questions: string[];
  };
  source: string;
  error?: string;
}

interface ImageAnalysisResponse {
  success: boolean;
  analysis: {
    text: string;
    findings: Array<{
      model: string;
      finding: string;
      confidence: string;
    }>;
    confidence: string;
    llama11b_analysis?: string;
    llama90b_analysis?: string;
    analysis_type?: string;
    timestamp?: string;
    recommendations: string[];
  };
  source: string;
  error?: string;
}

interface SessionSummaryResponse {
  success: boolean;
  sessionId: string;
  summary: any;
  source: string;
  error?: string;
}

export function useNLP() {
  const [isLoading, setIsLoading] = useState(false);
  const [isImageAnalyzing, setIsImageAnalyzing] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const generateMedicalResponse = async (
    query: string,
    sessionId?: string
  ): Promise<NLPResponse> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/nlp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
          sessionId: sessionId || currentSessionId,
          type: "medical_query",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NLPResponse = await response.json();

      // Update current session ID if we got a new one
      if (data.sessionId) {
        setCurrentSessionId(data.sessionId);
      }

      return data;
    } catch (error) {
      console.error("Error calling NLP API:", error);

      // Return a structured error response
      return {
        success: false,
        sessionId: currentSessionId,
        response: {
          text: "I apologize, but I encountered an error processing your medical query. Please try again or consult with a healthcare professional for immediate concerns.",
          urgency: "unknown",
          confidence: "low",
          diagnosis: "System Error",
          emergency_warning: true,
          follow_up_questions: [
            "Have you consulted with a healthcare professional about your symptoms?",
            "Is this a medical emergency requiring immediate attention?",
          ],
        },
        source: "error_fallback",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeImage = async (
    image: File,
    query?: string
  ): Promise<ImageAnalysisResponse> => {
    setIsImageAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("image", image);
      if (query) {
        formData.append("query", query);
      }

      const response = await fetch("/api/nlp/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ImageAnalysisResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error analyzing image:", error);

      return {
        success: false,
        analysis: {
          text: "I encountered an error analyzing your medical image. Please try again or consult with a healthcare professional for image interpretation.",
          findings: [],
          confidence: "low",
          recommendations: [
            "Consult with qualified healthcare professionals for medical image interpretation",
            "Professional radiological review is recommended",
            "Ensure proper medical imaging studies are performed when needed",
          ],
        },
        source: "error_fallback",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    } finally {
      setIsImageAnalyzing(false);
    }
  };

  const validateDiagnosis = async (
    hypothesis: string,
    symptoms: string[],
    sessionId?: string
  ): Promise<any> => {
    setIsLoading(true);

    try {
      const effectiveSessionId =
        sessionId || currentSessionId || `validation-${Date.now()}`;

      const response = await fetch(`/api/nlp/session/${effectiveSessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hypothesis,
          symptoms,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error validating diagnosis:", error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
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
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionSummary = async (
    sessionId?: string
  ): Promise<SessionSummaryResponse> => {
    try {
      const effectiveSessionId = sessionId || currentSessionId;

      if (!effectiveSessionId) {
        return {
          success: false,
          sessionId: "",
          summary: null,
          source: "error",
          error: "No session ID available",
        };
      }

      const response = await fetch(`/api/nlp/session/${effectiveSessionId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SessionSummaryResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting session summary:", error);

      return {
        success: false,
        sessionId: sessionId || currentSessionId || "",
        summary: null,
        source: "error_fallback",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };

  const clearSession = async (sessionId?: string): Promise<any> => {
    try {
      const effectiveSessionId = sessionId || currentSessionId;

      if (!effectiveSessionId) {
        return { success: false, error: "No session ID available" };
      }

      const response = await fetch(`/api/nlp/session/${effectiveSessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Clear current session if it was the one being cleared
      if (effectiveSessionId === currentSessionId) {
        setCurrentSessionId(null);
      }

      return data;
    } catch (error) {
      console.error("Error clearing session:", error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };

  const checkNLPHealth = async (): Promise<any> => {
    try {
      const response = await fetch("/api/nlp", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking NLP health:", error);

      return {
        status: "unhealthy",
        nlp_backend: "disconnected",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };

  return {
    // Core functions
    generateMedicalResponse,
    analyzeImage,
    validateDiagnosis,

    // Session management
    getSessionSummary,
    clearSession,
    currentSessionId,
    setCurrentSessionId,

    // Utility
    checkNLPHealth,

    // Loading states
    isLoading,
    isImageAnalyzing,
  };
}
