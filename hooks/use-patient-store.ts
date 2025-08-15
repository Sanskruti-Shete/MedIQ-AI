import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Patient } from "@/types/medical"

interface PatientState {
  currentPatient: Patient | null
  isRegistered: boolean
  registerPatient: (data: Partial<Patient>) => Promise<void>
  updatePatient: (data: Partial<Patient>) => Promise<void>
  clearPatient: () => void
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      currentPatient: null,
      isRegistered: false,

      registerPatient: async (data) => {
        try {
          // Generate a patient ID
          const patientId = `P${Date.now().toString().slice(-6)}`

          const newPatient: Patient = {
            id: crypto.randomUUID(),
            user_id: crypto.randomUUID(),
            patient_id: patientId,
            full_name: data.full_name || "",
            email: data.email || "",
            phone: data.phone,
            date_of_birth: data.date_of_birth,
            gender: data.gender as "male" | "female" | "other",
            emergency_contact_name: data.emergency_contact_name,
            emergency_contact_phone: data.emergency_contact_phone,
            blood_type: data.blood_type as Patient["blood_type"],
            allergies: data.allergies || [],
            chronic_conditions: data.chronic_conditions || [],
            current_medications: data.current_medications || [],
            height_cm: data.height_cm ? Number.parseInt(data.height_cm.toString()) : undefined,
            weight_kg: data.weight_kg ? Number.parseFloat(data.weight_kg.toString()) : undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          set({
            currentPatient: newPatient,
            isRegistered: true,
          })
        } catch (error) {
          console.error("Failed to register patient:", error)
          throw error
        }
      },

      updatePatient: async (data) => {
        const { currentPatient } = get()
        if (!currentPatient) return

        const updatedPatient = {
          ...currentPatient,
          ...data,
          updated_at: new Date().toISOString(),
        }

        set({ currentPatient: updatedPatient })
      },

      clearPatient: () => {
        set({
          currentPatient: null,
          isRegistered: false,
        })
      },
    }),
    {
      name: "patient-store",
      version: 1,
    },
  ),
)
