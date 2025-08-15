"use client"

import React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, User, AlertTriangle, Pill, X } from "lucide-react"
import { usePatientStore } from "@/hooks/use-patient-store"

interface PatientRegistrationProps {
  onComplete: () => void
}

export function PatientRegistration({ onComplete }: PatientRegistrationProps) {
  const { registerPatient } = usePatientStore()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    blood_type: "",
    height_cm: "",
    weight_kg: "",
    allergies: [] as string[],
    chronic_conditions: [] as string[],
    current_medications: [] as string[],
  })

  const [newAllergy, setNewAllergy] = useState("")
  const [newCondition, setNewCondition] = useState("")
  const [newMedication, setNewMedication] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addItem = (field: "allergies" | "chronic_conditions" | "current_medications", value: string) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }))
    }
  }

  const removeItem = (field: "allergies" | "chronic_conditions" | "current_medications", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async () => {
    try {
      await registerPatient(formData)
      onComplete()
    } catch (error) {
      console.error("Registration failed:", error)
    }
  }

  const steps = [
    {
      title: "Personal Information",
      description: "Let's start with your basic details",
      icon: User,
    },
    {
      title: "Medical Information",
      description: "Help us understand your health profile",
      icon: Heart,
    },
    {
      title: "Health History",
      description: "Share your medical history with us",
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Card className="border-emerald-200/50 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              {React.createElement(steps[step - 1].icon, { className: "w-8 h-8 text-white" })}
            </div>
            <CardTitle className="text-2xl text-emerald-900">{steps[step - 1].title}</CardTitle>
            <CardDescription className="text-emerald-600">{steps[step - 1].description}</CardDescription>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index + 1 <= step ? "bg-emerald-500" : "bg-emerald-200"
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="Enter your full name"
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your.email@example.com"
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <div className="flex gap-4">
                    {["male", "female", "other"].map((gender) => (
                      <Button
                        key={gender}
                        type="button"
                        variant={formData.gender === gender ? "default" : "outline"}
                        className={
                          formData.gender === gender
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "border-emerald-200 hover:bg-emerald-50"
                        }
                        onClick={() => handleInputChange("gender", gender)}
                      >
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                      placeholder="Contact person name"
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blood_type">Blood Type</Label>
                    <select
                      id="blood_type"
                      value={formData.blood_type}
                      onChange={(e) => handleInputChange("blood_type", e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Select blood type</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height_cm">Height (cm)</Label>
                    <Input
                      id="height_cm"
                      type="number"
                      value={formData.height_cm}
                      onChange={(e) => handleInputChange("height_cm", e.target.value)}
                      placeholder="170"
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      step="0.1"
                      value={formData.weight_kg}
                      onChange={(e) => handleInputChange("weight_kg", e.target.value)}
                      placeholder="70.5"
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {/* Allergies */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Allergies
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="Add an allergy"
                      className="border-emerald-200 focus:border-emerald-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addItem("allergies", newAllergy)
                          setNewAllergy("")
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addItem("allergies", newAllergy)
                        setNewAllergy("")
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.allergies.map((allergy, index) => (
                      <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                        {allergy}
                        <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeItem("allergies", index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Chronic Conditions
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      placeholder="Add a chronic condition"
                      className="border-emerald-200 focus:border-emerald-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addItem("chronic_conditions", newCondition)
                          setNewCondition("")
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addItem("chronic_conditions", newCondition)
                        setNewCondition("")
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.chronic_conditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                        {condition}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => removeItem("chronic_conditions", index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Current Medications */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-blue-500" />
                    Current Medications
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="Add a medication"
                      className="border-emerald-200 focus:border-emerald-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addItem("current_medications", newMedication)
                          setNewMedication("")
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addItem("current_medications", newMedication)
                        setNewMedication("")
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.current_medications.map((medication, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {medication}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => removeItem("current_medications", index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="border-emerald-200 hover:bg-emerald-50"
              >
                Previous
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && (!formData.full_name || !formData.email || !formData.date_of_birth)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-600">
                  Complete Registration
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
