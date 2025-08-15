"use client"

import { useState } from "react"

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false)

  const generateResponse = async (prompt: string): Promise<string> => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          throw new Error("Please configure your Gemini API key in the environment variables.")
        }
        throw error
      }
      throw new Error("An unexpected error occurred while generating the response.")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    generateResponse,
    isLoading,
  }
}
