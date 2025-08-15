"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"
import {
  Brain,
  Heart,
  Activity,
  Shield,
  Zap,
  Users,
  CheckCircle,
  Stethoscope,
  Microscope,
  Calendar,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react"

const ResponsiveLine = dynamic(() => import("@nivo/line").then((m) => m.ResponsiveLine), { ssr: false })
const ResponsivePie = dynamic(() => import("@nivo/pie").then((m) => m.ResponsivePie), { ssr: false })

interface OnboardingFlowProps {
  onComplete: () => void
}

const healthData = [
  {
    id: "consultations",
    color: "#10b981",
    data: [
      { x: "Jan", y: 45 },
      { x: "Feb", y: 52 },
      { x: "Mar", y: 48 },
      { x: "Apr", y: 61 },
      { x: "May", y: 55 },
      { x: "Jun", y: 67 },
    ],
  },
  {
    id: "satisfaction",
    color: "#3b82f6",
    data: [
      { x: "Jan", y: 98 },
      { x: "Feb", y: 97 },
      { x: "Mar", y: 99 },
      { x: "Apr", y: 98 },
      { x: "May", y: 99 },
      { x: "Jun", y: 100 },
    ],
  },
]

const specialtyData = [
  { id: "Cardiology", label: "Cardiology", value: 35, color: "#ef4444" },
  { id: "Neurology", label: "Neurology", value: 25, color: "#8b5cf6" },
  { id: "General", label: "General", value: 20, color: "#10b981" },
  { id: "Pediatrics", label: "Pediatrics", value: 20, color: "#f59e0b" },
]

const features = [
  {
    icon: Brain,
    title: "AI-Powered Diagnosis",
    description: "Advanced machine learning algorithms analyze symptoms and provide accurate preliminary diagnoses",
    color: "from-purple-500 to-indigo-600",
    stats: "99.2% Accuracy",
  },
  {
    icon: Activity,
    title: "3D Body Visualization",
    description: "Interactive 3D human body model for precise symptom mapping and medical education",
    color: "from-blue-500 to-cyan-500",
    stats: "Real-time Rendering",
  },
  {
    icon: Heart,
    title: "Health Monitoring",
    description: "Continuous health tracking with personalized insights and recommendations",
    color: "from-red-500 to-pink-500",
    stats: "24/7 Monitoring",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "HIPAA-compliant platform ensuring your medical data remains completely secure",
    color: "from-green-500 to-emerald-500",
    stats: "Bank-level Security",
  },
]

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextStep = () => {
    if (currentStep < 3) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 300)
    } else {
      onComplete()
    }
  }

  const steps = [
    {
      title: "Welcome to MedIQ",
      subtitle: "Your Advanced Medical AI Companion",
      content: (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-2xl animate-glow">
                <Brain className="w-16 h-16 text-white animate-pulse-medical" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-3 h-3 text-white animate-heartbeat" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-serif">
              MedIQ Platform
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
              Experience the future of healthcare with our AI-powered medical consultation platform. Get accurate
              diagnoses, personalized treatment plans, and comprehensive health management.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "50K+ Patients", color: "bg-blue-500" },
              { icon: Stethoscope, label: "1M+ Consultations", color: "bg-green-500" },
              { icon: CheckCircle, label: "99.2% Accuracy", color: "bg-purple-500" },
              { icon: Shield, label: "HIPAA Compliant", color: "bg-red-500" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 rounded-2xl bg-white shadow-lg border border-slate-200 hover-lift"
              >
                <div className={`w-12 h-12 mx-auto rounded-2xl ${stat.color} flex items-center justify-center mb-2`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-slate-800 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Powerful Features",
      subtitle: "Everything you need for comprehensive healthcare",
      content: (
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-slate-200 hover:shadow-xl transition-all duration-500 group rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-800 font-serif">{feature.title}</h3>
                        <Badge variant="secondary" className="text-xs rounded-full">
                          {feature.stats}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-light">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      title: "Platform Analytics",
      subtitle: "See how MedIQ is transforming healthcare",
      content: (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-slate-200 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 font-serif">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  Monthly Consultations & Satisfaction
                </h3>
                <div className="h-64">
                  <ResponsiveLine
                    data={healthData}
                    margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                    xScale={{ type: "point" }}
                    yScale={{ type: "linear", min: "auto", max: "auto", stacked: false, reverse: false }}
                    curve="cardinal"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                    }}
                    pointSize={8}
                    pointColor={{ theme: "background" }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: "serieColor" }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                    enableGridX={false}
                    colors={["#10b981", "#3b82f6"]}
                    lineWidth={3}
                    animate={true}
                    motionConfig="gentle"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 font-serif">
                  <Microscope className="w-5 h-5 text-purple-500" />
                  Specialty Distribution
                </h3>
                <div className="h-64">
                  <ResponsivePie
                    data={specialtyData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    innerRadius={0.4}
                    padAngle={2}
                    cornerRadius={4}
                    activeOuterRadiusOffset={8}
                    colors={{ datum: "data.color" }}
                    borderWidth={2}
                    borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#64748b"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: "color" }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                    animate={true}
                    motionConfig="gentle"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Calendar, title: "Medical Records", value: "45,231", change: "+18%" },
              { icon: FileText, title: "Health Assessments", value: "8,934", change: "+31%" },
              { icon: Heart, title: "Patient Satisfaction", value: "99.2%", change: "+2.1%" },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-500 rounded-2xl overflow-hidden hover-lift">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg">
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1 font-serif">{metric.title}</h3>
                    <p className="text-2xl font-bold text-emerald-600 mb-1">{metric.value}</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 rounded-full">
                      {metric.change} this month
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Ready to Get Started?",
      subtitle: "Join thousands of patients already using MedIQ",
      content: (
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="w-40 h-40 mx-auto rounded-3xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-2xl animate-glow">
              <CheckCircle className="w-20 h-20 text-white animate-pulse-medical" />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white animate-heartbeat" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-800 font-serif">You're All Set!</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
              Complete your registration to access personalized medical consultations, 3D body visualization, and
              comprehensive health management tools with integrated medical records.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { step: "1", title: "Register", desc: "Complete your profile" },
              { step: "2", title: "Consult", desc: "Get AI-powered diagnosis" },
              { step: "3", title: "Monitor", desc: "Track your health" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-lg border border-slate-200 hover-lift"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {item.step}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-slate-600 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-4 h-4 bg-emerald-300/40 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-teal-300/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-40 w-3 h-3 bg-blue-300/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-purple-300/40 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-10 w-8 h-8 bg-pink-300/30 rounded-2xl animate-bounce"></div>
        <div className="absolute top-1/3 right-10 w-6 h-6 bg-orange-300/30 rounded-2xl animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <motion.h1
                  className="text-4xl md:text-5xl font-bold text-slate-800 font-serif"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {steps[currentStep].title}
                </motion.h1>
                <motion.p
                  className="text-xl text-slate-600 max-w-3xl mx-auto font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {steps[currentStep].subtitle}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {steps[currentStep].content}
              </motion.div>

              <div className="flex items-center justify-between max-w-md mx-auto">
                <div className="flex gap-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-3 rounded-full transition-all duration-500 ${
                        index === currentStep
                          ? "bg-emerald-500 w-8 shadow-lg"
                          : index < currentStep
                            ? "bg-emerald-300 w-3"
                            : "bg-slate-200 w-3"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 group hover-lift"
                >
                  {currentStep < 3 ? "Continue" : "Start Registration"}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
