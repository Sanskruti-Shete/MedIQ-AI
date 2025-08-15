"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface MedicalRecord {
  id: string
  patient_id: string
  date: string
  type: "consultation" | "prescription" | "test" | "diagnosis" | "treatment"
  description: string
  diagnosis?: string
  treatment?: string
  prescription?: string
  notes?: string
  doctor?: string
  facility?: string
  created_at: string
  updated_at: string
}

interface Prescription {
  id: string
  patient_id: string
  medical_record_id?: string
  medication_name: string
  dosage: string
  frequency: string
  duration?: string
  instructions?: string
  prescribed_by?: string
  prescribed_date: string
  start_date?: string
  end_date?: string
  status: "active" | "completed" | "discontinued"
  created_at: string
  updated_at: string
}

interface MedicalHistorySummary {
  id: string
  patient_id: string
  chronic_conditions: string[]
  allergies: string[]
  current_medications: string[]
  family_history?: string
  lifestyle_factors?: Record<string, any>
  last_updated: string
}

export function useMedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [historySummary, setHistorySummary] = useState<MedicalHistorySummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const getCurrentPatientId = () => {
    // In production, this would get the authenticated user's ID
    // For demo, we'll use localStorage to persist a demo patient ID
    let patientId = localStorage.getItem("demo-patient-id")
    if (!patientId) {
      patientId = `patient-${Date.now()}`
      localStorage.setItem("demo-patient-id", patientId)
    }
    return patientId
  }

  const uploadFile = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `medical-records/${getCurrentPatientId()}/${fileName}`

      const { data, error } = await supabase.storage.from("medical-files").upload(filePath, file)

      if (error) {
        console.error("Upload error:", error)
        throw error
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("medical-files").getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error("Error uploading file:", error)
      throw new Error("Failed to upload file")
    }
  }

  const getMedicalHistory = async (): Promise<MedicalRecord[]> => {
    try {
      setLoading(true)
      setError(null)

      const patientId = getCurrentPatientId()

      // Try to fetch from Supabase first
      const { data: supabaseRecords, error: supabaseError } = await supabase
        .from("medical_records")
        .select("*")
        .eq("patient_id", patientId)
        .order("date", { ascending: false })

      if (supabaseError) {
        console.log("Supabase not available, using demo data:", supabaseError)
      }

      // Enhanced mock data with more comprehensive medical history
      const mockRecords: MedicalRecord[] = [
        {
          id: "1",
          patient_id: patientId,
          date: "2024-01-15",
          type: "consultation",
          description: "Annual Physical Examination",
          diagnosis: "Overall good health, mild hypertension noted (140/90 mmHg)",
          treatment: "Lifestyle modifications: reduce sodium intake, increase exercise to 30min daily",
          notes: "Patient reports feeling well, no major concerns. Family history of cardiovascular disease.",
          doctor: "Dr. Sarah Johnson, MD",
          facility: "City Medical Center",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          patient_id: patientId,
          date: "2024-01-20",
          type: "prescription",
          description: "Antihypertensive Medication",
          prescription: "Lisinopril 10mg once daily in the morning, 30-day supply. Monitor BP weekly.",
          notes: "Patient counseled on medication adherence and potential side effects (dry cough, dizziness)",
          doctor: "Dr. Sarah Johnson, MD",
          facility: "City Medical Center Pharmacy",
          created_at: "2024-01-20T14:30:00Z",
          updated_at: "2024-01-20T14:30:00Z",
        },
        {
          id: "3",
          patient_id: patientId,
          date: "2024-02-01",
          type: "test",
          description: "Comprehensive Metabolic Panel & Lipid Profile",
          notes:
            "Fasting glucose: 95 mg/dL (normal), Total cholesterol: 185 mg/dL, LDL: 110 mg/dL, HDL: 55 mg/dL, Triglycerides: 120 mg/dL. Kidney function normal.",
          doctor: "Dr. Sarah Johnson, MD",
          facility: "City Medical Center Laboratory",
          created_at: "2024-02-01T09:00:00Z",
          updated_at: "2024-02-01T09:00:00Z",
        },
        {
          id: "4",
          patient_id: patientId,
          date: "2024-02-15",
          type: "diagnosis",
          description: "Hypertension Management Follow-up",
          diagnosis: "Stage 1 Hypertension, well-controlled with medication. BP: 125/80 mmHg",
          treatment: "Continue current medication regimen. Dietary consultation recommended.",
          notes: "Patient adherent to medication. Reports no side effects. Weight stable.",
          doctor: "Dr. Sarah Johnson, MD",
          facility: "City Medical Center",
          created_at: "2024-02-15T11:00:00Z",
          updated_at: "2024-02-15T11:00:00Z",
        },
      ]

      // Use Supabase data if available, otherwise use mock data
      const finalRecords = supabaseRecords && supabaseRecords.length > 0 ? supabaseRecords : mockRecords

      setRecords(finalRecords)
      return finalRecords
    } catch (err) {
      console.error("Error fetching medical history:", err)
      setError("Failed to fetch medical history")
      return []
    } finally {
      setLoading(false)
    }
  }

  const addMedicalRecord = async (record: Partial<MedicalRecord>): Promise<MedicalRecord | null> => {
    try {
      setLoading(true)
      setError(null)

      // For demo purposes, create a mock record
      const newRecord: MedicalRecord = {
        id: Date.now().toString(),
        patient_id: getCurrentPatientId(),
        date: record.date || new Date().toISOString().split("T")[0],
        type: record.type || "consultation",
        description: record.description || "",
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        prescription: record.prescription,
        notes: record.notes,
        doctor: record.doctor,
        facility: record.facility,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setRecords((prev) => [newRecord, ...prev])
      return newRecord
    } catch (err) {
      console.error("Error adding medical record:", err)
      setError("Failed to add medical record")
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateMedicalRecord = async (id: string, updates: Partial<MedicalRecord>): Promise<MedicalRecord | null> => {
    try {
      setLoading(true)
      setError(null)

      setRecords((prev) =>
        prev.map((record) =>
          record.id === id ? { ...record, ...updates, updated_at: new Date().toISOString() } : record,
        ),
      )

      const updatedRecord = records.find((r) => r.id === id)
      return updatedRecord || null
    } catch (err) {
      console.error("Error updating medical record:", err)
      setError("Failed to update medical record")
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteMedicalRecord = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      setRecords((prev) => prev.filter((record) => record.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting medical record:", err)
      setError("Failed to delete medical record")
      return false
    } finally {
      setLoading(false)
    }
  }

  const getPrescriptions = async (): Promise<Prescription[]> => {
    try {
      setLoading(true)
      setError(null)

      // Mock prescriptions data
      const mockPrescriptions: Prescription[] = [
        {
          id: "1",
          patient_id: "demo-patient-id",
          medication_name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Take with or without food",
          prescribed_by: "Dr. Sarah Johnson",
          prescribed_date: "2024-01-20",
          start_date: "2024-01-20",
          status: "active",
          created_at: "2024-01-20T14:30:00Z",
          updated_at: "2024-01-20T14:30:00Z",
        },
      ]

      setPrescriptions(mockPrescriptions)
      return mockPrescriptions
    } catch (err) {
      console.error("Error fetching prescriptions:", err)
      setError("Failed to fetch prescriptions")
      return []
    } finally {
      setLoading(false)
    }
  }

  const getMedicalSummary = async (): Promise<MedicalHistorySummary | null> => {
    try {
      setLoading(true)
      setError(null)

      // Mock medical summary
      const mockSummary: MedicalHistorySummary = {
        id: "1",
        patient_id: "demo-patient-id",
        chronic_conditions: ["Hypertension"],
        allergies: ["Penicillin", "Shellfish"],
        current_medications: ["Lisinopril 10mg daily"],
        family_history: "Father: Heart disease, Mother: Diabetes",
        lifestyle_factors: {
          smoking: false,
          alcohol: "occasional",
          exercise: "moderate",
          diet: "balanced",
        },
        last_updated: "2024-01-15T10:00:00Z",
      }

      setHistorySummary(mockSummary)
      return mockSummary
    } catch (err) {
      console.error("Error fetching medical summary:", err)
      setError("Failed to fetch medical summary")
      return null
    } finally {
      setLoading(false)
    }
  }

  const getMedicalContextForAI = async (): Promise<string> => {
    try {
      const records = await getMedicalHistory()
      const prescriptions = await getPrescriptions()
      const summary = await getMedicalSummary()

      let context = "PATIENT MEDICAL CONTEXT:\n\n"

      if (summary) {
        context += "MEDICAL SUMMARY:\n"
        context += `- Chronic Conditions: ${summary.chronic_conditions.join(", ") || "None reported"}\n`
        context += `- Allergies: ${summary.allergies.join(", ") || "None reported"}\n`
        context += `- Current Medications: ${summary.current_medications.join(", ") || "None"}\n`
        if (summary.family_history) {
          context += `- Family History: ${summary.family_history}\n`
        }
        context += "\n"
      }

      if (records.length > 0) {
        context += "RECENT MEDICAL HISTORY:\n"
        records.slice(0, 5).forEach((record, index) => {
          context += `${index + 1}. ${record.date} - ${record.type.toUpperCase()}: ${record.description}\n`
          if (record.diagnosis) context += `   Diagnosis: ${record.diagnosis}\n`
          if (record.treatment) context += `   Treatment: ${record.treatment}\n`
          if (record.prescription) context += `   Prescription: ${record.prescription}\n`
          if (record.notes) context += `   Notes: ${record.notes}\n`
          context += "\n"
        })
      }

      if (prescriptions.length > 0) {
        context += "CURRENT PRESCRIPTIONS:\n"
        prescriptions
          .filter((p) => p.status === "active")
          .forEach((prescription, index) => {
            context += `${index + 1}. ${prescription.medication_name} ${prescription.dosage} - ${prescription.frequency}\n`
            if (prescription.instructions) context += `   Instructions: ${prescription.instructions}\n`
          })
        context += "\n"
      }

      context +=
        "Please use this medical context to provide personalized, relevant healthcare guidance. Always recommend consulting with healthcare professionals for medical decisions."

      return context
    } catch (error) {
      console.error("Error generating medical context:", error)
      return "No medical history available. Please consult with a healthcare professional for medical advice."
    }
  }

  return {
    records,
    prescriptions,
    historySummary,
    loading,
    error,
    getMedicalHistory,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getPrescriptions,
    getMedicalSummary,
    uploadFile, // Added file upload functionality
    getMedicalContextForAI, // Added AI context generation
  }
}
