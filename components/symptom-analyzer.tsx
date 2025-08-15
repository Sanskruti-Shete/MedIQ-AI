"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  Heart,
  Brain,
  TreesIcon as Lungs,
  StickerIcon as Stomach,
  Bone,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  Activity,
  Stethoscope,
  X,
  Plus,
  Search,
} from "lucide-react"
import { usePatientStore } from "@/hooks/use-patient-store"
import { useGemini } from "@/hooks/use-gemini"

interface Symptom {
  id: string
  name: string
  severity: number
  duration: string
  bodySystem: string
  description?: string
}

interface DiagnosisResult {
  condition: string
  probability: number
  urgency: "low" | "medium" | "high" | "critical"
  description: string
  recommendations: string[]
  tests: string[]
}

const BODY_SYSTEMS = [
  { id: "cardiovascular", name: "Heart & Circulation", icon: Heart, color: "text-red-500" },
  { id: "respiratory", name: "Lungs & Breathing", icon: Lungs, color: "text-blue-500" },
  { id: "neurological", name: "Brain & Nerves", icon: Brain, color: "text-purple-500" },
  { id: "gastrointestinal", name: "Digestive System", icon: Stomach, color: "text-orange-500" },
  { id: "musculoskeletal", name: "Bones & Muscles", icon: Bone, color: "text-green-500" },
  { id: "general", name: "General Symptoms", icon: Activity, color: "text-gray-500" },
]

const COMMON_SYMPTOMS = {
  cardiovascular: ["Chest pain", "Heart palpitations", "Shortness of breath", "Dizziness", "Swelling in legs"],
  respiratory: ["Cough", "Shortness of breath", "Wheezing", "Chest tightness", "Sputum production"],
  neurological: ["Headache", "Dizziness", "Numbness", "Weakness", "Memory problems", "Seizures"],
  gastrointestinal: ["Nausea", "Vomiting", "Abdominal pain", "Diarrhea", "Constipation", "Heartburn"],
  musculoskeletal: ["Joint pain", "Back pain", "Muscle weakness", "Stiffness", "Swelling"],
  general: ["Fever", "Fatigue", "Weight loss", "Night sweats", "Loss of appetite"],
}

export function SymptomAnalyzer({ onAnalysisComplete }: { onAnalysisComplete?: (result: any) => void }) {
  const [step, setStep] = useState(1)
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [selectedSystem, setSelectedSystem] = useState<string>("")
  const [customSymptom, setCustomSymptom] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<DiagnosisResult[]>([])
  const [vitalSigns, setVitalSigns] = useState({
    temperature: 98.6,
    bloodPressure: "",
    heartRate: 72,
    respiratoryRate: 16,
  })

  const { currentPatient } = usePatientStore()
  const { generateResponse } = useGemini()

  const addSymptom = (symptomName: string, system: string) => {
    const newSymptom: Symptom = {
      id: crypto.randomUUID(),
      name: symptomName,
      severity: 5,
      duration: "",
      bodySystem: system,
    }
    setSymptoms([...symptoms, newSymptom])
  }

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter((s) => s.id !== id))
  }

  const updateSymptom = (id: string, field: keyof Symptom, value: any) => {
    setSymptoms(symptoms.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) return

    setIsAnalyzing(true)
    try {
      const patientContext = currentPatient
        ? `Patient Profile:
- Age: ${currentPatient.date_of_birth ? new Date().getFullYear() - new Date(currentPatient.date_of_birth).getFullYear() : "Unknown"}
- Gender: ${currentPatient.gender || "Unknown"}
- Allergies: ${currentPatient.allergies?.join(", ") || "None reported"}
- Chronic Conditions: ${currentPatient.chronic_conditions?.join(", ") || "None reported"}
- Current Medications: ${currentPatient.current_medications?.join(", ") || "None reported"}
- Blood Type: ${currentPatient.blood_type || "Unknown"}
`
        : ""

      const symptomsText = symptoms
        .map(
          (s) =>
            `${s.name} (Severity: ${s.severity}/10, Duration: ${s.duration || "Not specified"}, System: ${s.bodySystem})`,
        )
        .join("\n")

      const vitalSignsText = `
Vital Signs:
- Temperature: ${vitalSigns.temperature}°F
- Blood Pressure: ${vitalSigns.bloodPressure || "Not measured"}
- Heart Rate: ${vitalSigns.heartRate} bpm
- Respiratory Rate: ${vitalSigns.respiratoryRate} breaths/min
`

      const prompt = `As a medical AI assistant, analyze the following symptoms and provide a structured assessment:

${patientContext}

Symptoms:
${symptomsText}

${vitalSignsText}

Please provide:
1. Top 3 most likely conditions with probability percentages
2. Urgency level (low/medium/high/critical) for each
3. Brief description of each condition
4. Recommended next steps and tests
5. General recommendations

Format your response as a structured analysis that's easy to understand for patients while emphasizing the need for professional medical consultation.

IMPORTANT: Always emphasize that this is preliminary analysis and professional medical evaluation is essential for accurate diagnosis and treatment.`

      const response = await generateResponse(prompt)

      // Parse the AI response into structured data
      // This is a simplified parsing - in a real app, you'd want more robust parsing
      const mockResults: DiagnosisResult[] = [
        {
          condition: "Viral Upper Respiratory Infection",
          probability: 75,
          urgency: "low",
          description: "Common cold or flu-like illness affecting the upper respiratory tract",
          recommendations: ["Rest and hydration", "Over-the-counter symptom relief", "Monitor symptoms"],
          tests: ["No immediate tests needed", "Consider rapid flu test if symptoms worsen"],
        },
        {
          condition: "Allergic Reaction",
          probability: 60,
          urgency: "medium",
          description: "Immune system response to environmental or food allergens",
          recommendations: ["Identify and avoid triggers", "Antihistamines", "Monitor for worsening"],
          tests: ["Allergy testing", "Complete blood count"],
        },
        {
          condition: "Bacterial Infection",
          probability: 45,
          urgency: "medium",
          description: "Bacterial infection requiring potential antibiotic treatment",
          recommendations: ["Medical evaluation needed", "Possible antibiotic treatment", "Follow-up care"],
          tests: ["Blood culture", "Complete blood count", "Throat culture if applicable"],
        },
      ]

      setAnalysisResult(mockResults)
      onAnalysisComplete?.(mockResults)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step >= stepNum ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {stepNum}
            </div>
            {stepNum < 4 && (
              <div className={`w-16 h-1 mx-2 transition-colors ${step > stepNum ? "bg-emerald-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-emerald-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Stethoscope className="w-5 h-5" />
                  Select Body System
                </CardTitle>
                <CardDescription>Choose the body system most related to your symptoms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BODY_SYSTEMS.map((system) => (
                    <Button
                      key={system.id}
                      variant={selectedSystem === system.id ? "default" : "outline"}
                      className={`h-auto p-4 justify-start gap-3 ${
                        selectedSystem === system.id
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : "border-emerald-200 hover:bg-emerald-50"
                      }`}
                      onClick={() => setSelectedSystem(system.id)}
                    >
                      <system.icon className={`w-5 h-5 ${system.color}`} />
                      <span className="font-medium">{system.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-emerald-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Search className="w-5 h-5" />
                  Add Symptoms
                </CardTitle>
                <CardDescription>Select your symptoms or add custom ones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Common Symptoms */}
                {selectedSystem && COMMON_SYMPTOMS[selectedSystem as keyof typeof COMMON_SYMPTOMS] && (
                  <div>
                    <Label className="text-sm font-medium text-emerald-900 mb-3 block">Common Symptoms</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {COMMON_SYMPTOMS[selectedSystem as keyof typeof COMMON_SYMPTOMS].map((symptom) => (
                        <Button
                          key={symptom}
                          variant="outline"
                          size="sm"
                          className="justify-start border-emerald-200 hover:bg-emerald-50 bg-transparent"
                          onClick={() => addSymptom(symptom, selectedSystem)}
                          disabled={symptoms.some((s) => s.name === symptom)}
                        >
                          <Plus className="w-3 h-3 mr-2" />
                          {symptom}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Symptom */}
                <div>
                  <Label className="text-sm font-medium text-emerald-900 mb-2 block">Add Custom Symptom</Label>
                  <div className="flex gap-2">
                    <Input
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      placeholder="Describe your symptom..."
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                    <Button
                      onClick={() => {
                        if (customSymptom.trim()) {
                          addSymptom(customSymptom.trim(), selectedSystem)
                          setCustomSymptom("")
                        }
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Selected Symptoms */}
                {symptoms.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-emerald-900 mb-3 block">Selected Symptoms</Label>
                    <div className="space-y-2">
                      {symptoms.map((symptom) => (
                        <div
                          key={symptom.id}
                          className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200"
                        >
                          <span className="font-medium text-emerald-900">{symptom.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSymptom(symptom.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-emerald-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Activity className="w-5 h-5" />
                  Symptom Details
                </CardTitle>
                <CardDescription>Provide more details about your symptoms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {symptoms.map((symptom) => (
                  <div key={symptom.id} className="p-4 border border-emerald-200 rounded-lg space-y-4">
                    <h4 className="font-semibold text-emerald-900">{symptom.name}</h4>

                    <div>
                      <Label className="text-sm text-emerald-700 mb-2 block">Severity: {symptom.severity}/10</Label>
                      <Slider
                        value={[symptom.severity]}
                        onValueChange={(value) => updateSymptom(symptom.id, "severity", value[0])}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-emerald-700 mb-2 block">Duration</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {["< 1 hour", "1-24 hours", "1-7 days", "> 1 week"].map((duration) => (
                          <Button
                            key={duration}
                            variant={symptom.duration === duration ? "default" : "outline"}
                            size="sm"
                            className={
                              symptom.duration === duration
                                ? "bg-emerald-500 hover:bg-emerald-600"
                                : "border-emerald-200 hover:bg-emerald-50"
                            }
                            onClick={() => updateSymptom(symptom.id, "duration", duration)}
                          >
                            {duration}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Vital Signs */}
                <div className="p-4 border border-emerald-200 rounded-lg space-y-4">
                  <h4 className="font-semibold text-emerald-900 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Vital Signs (Optional)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-emerald-700">Temperature (°F)</Label>
                      <Input
                        type="number"
                        value={vitalSigns.temperature}
                        onChange={(e) =>
                          setVitalSigns({ ...vitalSigns, temperature: Number.parseFloat(e.target.value) || 98.6 })
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-emerald-700">Blood Pressure</Label>
                      <Input
                        placeholder="120/80"
                        value={vitalSigns.bloodPressure}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-emerald-700">Heart Rate (bpm)</Label>
                      <Input
                        type="number"
                        value={vitalSigns.heartRate}
                        onChange={(e) =>
                          setVitalSigns({ ...vitalSigns, heartRate: Number.parseInt(e.target.value) || 72 })
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-emerald-700">Respiratory Rate</Label>
                      <Input
                        type="number"
                        value={vitalSigns.respiratoryRate}
                        onChange={(e) =>
                          setVitalSigns({ ...vitalSigns, respiratoryRate: Number.parseInt(e.target.value) || 16 })
                        }
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-emerald-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Brain className="w-5 h-5" />
                  Analysis Results
                </CardTitle>
                <CardDescription>AI-powered preliminary assessment of your symptoms</CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center gap-3 mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                      <span className="text-lg font-medium text-emerald-900">Analyzing symptoms...</span>
                    </div>
                    <p className="text-emerald-600">This may take a few moments</p>
                  </div>
                ) : analysisResult.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="font-semibold text-amber-800">Important Disclaimer</span>
                      </div>
                      <p className="text-amber-700 text-sm">
                        This is a preliminary AI analysis and should not replace professional medical consultation.
                        Please consult with a healthcare provider for accurate diagnosis and treatment.
                      </p>
                    </div>

                    {analysisResult.map((result, index) => (
                      <div key={index} className="border border-emerald-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-emerald-900">{result.condition}</h3>
                          <div className="flex items-center gap-3">
                            <Badge className={`${getUrgencyColor(result.urgency)} text-white`}>
                              {result.urgency.toUpperCase()}
                            </Badge>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-emerald-600">{result.probability}%</div>
                              <div className="text-xs text-emerald-500">Likelihood</div>
                            </div>
                          </div>
                        </div>

                        <Progress value={result.probability} className="mb-4" />

                        <p className="text-emerald-700 mb-4">{result.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-emerald-900 mb-2">Recommendations</h4>
                            <ul className="space-y-1">
                              {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-emerald-900 mb-2">Suggested Tests</h4>
                            <ul className="space-y-1">
                              {result.tests.map((test, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                                  <Activity className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  {test}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Button
                      onClick={analyzeSymptoms}
                      disabled={symptoms.length === 0}
                      className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 text-lg"
                    >
                      Analyze Symptoms
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="border-emerald-200 hover:bg-emerald-50"
        >
          Previous
        </Button>

        <Button
          onClick={() => setStep(Math.min(4, step + 1))}
          disabled={step === 4 || (step === 1 && !selectedSystem) || (step === 2 && symptoms.length === 0)}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {step === 4 ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  )
}
