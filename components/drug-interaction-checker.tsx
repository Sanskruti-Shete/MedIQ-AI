"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, X, AlertTriangle, CheckCircle, Info, Pill, Shield } from "lucide-react"

interface Drug {
  id: string
  name: string
  genericName: string
  dosage: string
  frequency: string
}

interface Interaction {
  severity: "high" | "moderate" | "low"
  description: string
  recommendation: string
  drugs: string[]
}

const SAMPLE_DRUGS = [
  { id: "1", name: "Aspirin", genericName: "Acetylsalicylic acid", dosage: "81mg", frequency: "Daily" },
  { id: "2", name: "Lisinopril", genericName: "Lisinopril", dosage: "10mg", frequency: "Daily" },
  { id: "3", name: "Metformin", genericName: "Metformin HCl", dosage: "500mg", frequency: "Twice daily" },
  { id: "4", name: "Warfarin", genericName: "Warfarin sodium", dosage: "5mg", frequency: "Daily" },
  { id: "5", name: "Ibuprofen", genericName: "Ibuprofen", dosage: "200mg", frequency: "As needed" },
]

const SAMPLE_INTERACTIONS: Interaction[] = [
  {
    severity: "high",
    description: "Aspirin and Warfarin may increase bleeding risk",
    recommendation: "Monitor INR closely and consider dose adjustment",
    drugs: ["Aspirin", "Warfarin"],
  },
  {
    severity: "moderate",
    description: "Ibuprofen may reduce effectiveness of Lisinopril",
    recommendation: "Monitor blood pressure regularly",
    drugs: ["Ibuprofen", "Lisinopril"],
  },
]

export function DrugInteractionChecker() {
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [interactions, setInteractions] = useState<Interaction[]>([])

  const filteredDrugs = SAMPLE_DRUGS.filter(
    (drug) =>
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addDrug = (drug: Drug) => {
    if (!selectedDrugs.find((d) => d.id === drug.id)) {
      const newSelectedDrugs = [...selectedDrugs, drug]
      setSelectedDrugs(newSelectedDrugs)
      checkInteractions(newSelectedDrugs)
    }
    setSearchTerm("")
  }

  const removeDrug = (drugId: string) => {
    const newSelectedDrugs = selectedDrugs.filter((d) => d.id !== drugId)
    setSelectedDrugs(newSelectedDrugs)
    checkInteractions(newSelectedDrugs)
  }

  const checkInteractions = (drugs: Drug[]) => {
    const drugNames = drugs.map((d) => d.name)
    const foundInteractions = SAMPLE_INTERACTIONS.filter((interaction) =>
      interaction.drugs.every((drugName) => drugNames.includes(drugName)),
    )
    setInteractions(foundInteractions)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="w-4 h-4" />
      case "moderate":
        return <Info className="w-4 h-4" />
      case "low":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Drug Interaction Checker
        </h1>
        <p className="text-emerald-600">Check for potential interactions between medications</p>
      </div>

      {/* Drug Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-600" />
            Add Medications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search for medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          <AnimatePresence>
            {searchTerm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg overflow-hidden"
              >
                <ScrollArea className="max-h-48">
                  {filteredDrugs.map((drug) => (
                    <div
                      key={drug.id}
                      className="p-3 hover:bg-emerald-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => addDrug(drug)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{drug.name}</p>
                          <p className="text-sm text-gray-600">{drug.genericName}</p>
                        </div>
                        <Plus className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Selected Drugs */}
      {selectedDrugs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Current Medications ({selectedDrugs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {selectedDrugs.map((drug) => (
                <motion.div
                  key={drug.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Pill className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-900">{drug.name}</p>
                      <p className="text-sm text-emerald-600">
                        {drug.dosage} - {drug.frequency}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDrug(drug.id)}
                    className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interaction Results */}
      {selectedDrugs.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-600" />
              Interaction Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interactions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-600 font-medium">No interactions found</p>
                <p className="text-sm text-gray-600">Your current medications appear to be safe together</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interactions.map((interaction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getSeverityIcon(interaction.severity)}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(interaction.severity)}>
                            {interaction.severity.toUpperCase()} RISK
                          </Badge>
                          <div className="flex gap-1">
                            {interaction.drugs.map((drug, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {drug}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-900">{interaction.description}</p>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Recommendation:</strong> {interaction.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important Disclaimer</p>
              <p>
                This tool is for informational purposes only and should not replace professional medical advice. Always
                consult with your healthcare provider or pharmacist before making changes to your medications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
