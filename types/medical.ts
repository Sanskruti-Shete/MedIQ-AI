export interface User {
  id: string
  email: string
  full_name?: string
  role: "patient" | "doctor" | "admin"
  phone?: string
  date_of_birth?: string
  gender?: "male" | "female" | "other"
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  user_id: string
  patient_id: string
  full_name: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: "male" | "female" | "other"
  emergency_contact_name?: string
  emergency_contact_phone?: string
  blood_type?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  allergies?: string[]
  chronic_conditions?: string[]
  current_medications?: string[]
  height_cm?: number
  weight_kg?: number
  created_at: string
  updated_at: string
}

export interface MedicalCondition {
  id: string
  name: string
  category: "symptom" | "disease" | "condition"
  description?: string
  severity_level?: number
  body_system?: string
  icd_10_code?: string
  created_at: string
}

export interface Consultation {
  id: string
  patient_id: string
  consultation_id: string
  chief_complaint: string
  symptoms: string[]
  symptom_duration?: string
  pain_scale?: number
  vital_signs?: {
    temperature?: number
    blood_pressure?: string
    heart_rate?: number
    respiratory_rate?: number
    oxygen_saturation?: number
  }
  preliminary_diagnosis?: string[]
  recommended_tests?: string[]
  treatment_plan?: string
  medications_prescribed?: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
  }>
  follow_up_required: boolean
  follow_up_date?: string
  urgency_level: "low" | "medium" | "high" | "critical"
  status: "active" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  consultation_id?: string
  appointment_id: string
  appointment_type: "consultation" | "follow-up" | "emergency"
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  reason: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"
  notes?: string
  created_at: string
  updated_at: string
}

export interface DrugInteraction {
  id: string
  drug_a: string
  drug_b: string
  interaction_type: "major" | "moderate" | "minor"
  description: string
  clinical_significance?: string
  management_strategy?: string
  created_at: string
}

export interface MedicalKnowledge {
  id: string
  title: string
  category: "disease" | "treatment" | "drug" | "procedure"
  content: string
  tags: string[]
  references: string[]
  last_updated: string
}

export interface ChatSession {
  id: string
  patient_id: string
  consultation_id?: string
  session_title?: string
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
  is_active: boolean
  created_at: string
  updated_at: string
}
