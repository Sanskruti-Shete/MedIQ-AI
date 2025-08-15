"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Activity,
  FileText,
  AlertTriangle,
  Pill,
  User,
  Phone,
  Droplets,
  Ruler,
  Weight,
  MessageSquare,
  TrendingUp,
  Brain,
  Shield,
  Target,
} from "lucide-react";
import { usePatientStore } from "@/hooks/use-patient-store";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { ViewMode } from "@/types/ui";

interface PatientDashboardProps {
  onNavigate: (view: ViewMode) => void;
}

const healthTrendData = [
  { date: "Mon", heartRate: 72, bloodPressure: 120, steps: 8500, sleep: 7.5 },
  { date: "Tue", heartRate: 75, bloodPressure: 118, steps: 9200, sleep: 8.0 },
  { date: "Wed", heartRate: 70, bloodPressure: 122, steps: 7800, sleep: 6.5 },
  { date: "Thu", heartRate: 73, bloodPressure: 119, steps: 10200, sleep: 7.8 },
  { date: "Fri", heartRate: 71, bloodPressure: 121, steps: 9500, sleep: 8.2 },
  { date: "Sat", heartRate: 69, bloodPressure: 117, steps: 11000, sleep: 9.0 },
  { date: "Sun", heartRate: 68, bloodPressure: 115, steps: 6500, sleep: 8.5 },
];

const medicationData = [
  { name: "Morning", taken: 95, missed: 5, color: "#10b981" },
  { name: "Afternoon", taken: 88, missed: 12, color: "#f59e0b" },
  { name: "Evening", taken: 92, missed: 8, color: "#3b82f6" },
  { name: "Night", taken: 85, missed: 15, color: "#8b5cf6" },
];

const activityData = [
  { activity: "Walking", minutes: 45, calories: 180 },
  { activity: "Running", minutes: 20, calories: 240 },
  { activity: "Cycling", minutes: 30, calories: 200 },
  { activity: "Swimming", minutes: 25, calories: 300 },
  { activity: "Yoga", minutes: 40, calories: 120 },
];

export function PatientDashboard({ onNavigate }: PatientDashboardProps) {
  const { currentPatient } = usePatientStore();
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    // Animate health score
    const timer = setTimeout(() => setHealthScore(85), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!currentPatient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-emerald-900 mb-2">
            Welcome to MedIQ
          </h2>
          <p className="text-emerald-600">
            Please complete your registration to continue.
          </p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Start AI Consultation",
      description: "Get instant medical guidance",
      icon: MessageSquare,
      action: () => onNavigate("chat"),
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      title: "3D Body Scan",
      description: "Interactive body visualization",
      icon: Activity,
      action: () => onNavigate("3d-body"),
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "View Medical Records",
      description: "Access your health history",
      icon: FileText,
      action: () => onNavigate("records"),
      color: "bg-blue-500 hover:bg-blue-600",
    },
  ];

  const vitalStats = [
    {
      label: "Blood Type",
      value: currentPatient.blood_type || "Not specified",
      icon: Droplets,
      color: "text-red-500",
    },
    {
      label: "Height",
      value: currentPatient.height_cm
        ? `${currentPatient.height_cm} cm`
        : "Not specified",
      icon: Ruler,
      color: "text-blue-500",
    },
    {
      label: "Weight",
      value: currentPatient.weight_kg
        ? `${currentPatient.weight_kg} kg`
        : "Not specified",
      icon: Weight,
      color: "text-green-500",
    },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-emerald-900 mb-2">
          Welcome back, {currentPatient.full_name?.split(" ")[0]}!
        </h1>
        <p className="text-emerald-600">
          Patient ID: {currentPatient.patient_id}
        </p>
      </motion.div>

      {/* Health Score and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <TrendingUp className="w-5 h-5" />
                Health Score
              </CardTitle>
              <CardDescription>
                Based on your medical profile and recent activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={healthScore} className="h-3" />
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {healthScore}%
                </div>
              </div>
              <p className="text-sm text-emerald-600 mt-2">
                Excellent! Keep up the good work with regular check-ups.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-blue-200/50 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Heart className="w-5 h-5" />
                Today's Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Heart Rate</span>
                  <span className="font-semibold text-blue-900">72 BPM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Blood Pressure</span>
                  <span className="font-semibold text-blue-900">120/80</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Steps</span>
                  <span className="font-semibold text-blue-900">8,500</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-purple-200/50 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Brain className="w-5 h-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className="bg-green-100 text-green-800 w-full justify-center">
                  <Shield className="w-3 h-3 mr-1" />
                  All systems normal
                </Badge>
                <p className="text-sm text-purple-600">
                  Your health metrics are within optimal ranges.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-emerald-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="border-emerald-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={action.action}
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-emerald-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-emerald-600">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Health Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-emerald-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Activity className="w-5 h-5" />
                Weekly Health Trends
              </CardTitle>
              <CardDescription>
                Your vital signs over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Area
                      type="monotone"
                      dataKey="heartRate"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="steps"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      yAxisId="right"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-blue-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Pill className="w-5 h-5" />
                Medication Adherence
              </CardTitle>
              <CardDescription>
                Daily medication compliance rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={medicationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Bar dataKey="taken" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="missed"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity and Personal Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-orange-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Target className="w-5 h-5" />
                Weekly Activity Breakdown
              </CardTitle>
              <CardDescription>
                Your exercise activities and calories burned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityData.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-orange-900">
                          {activity.activity}
                        </p>
                        <p className="text-sm text-orange-600">
                          {activity.minutes} minutes
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      {activity.calories} cal
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-emerald-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {vitalStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon
                      className={`w-6 h-6 mx-auto mb-2 ${stat.color}`}
                    />
                    <p className="text-sm font-medium text-emerald-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-emerald-600">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-emerald-200/50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-emerald-600">Email:</span>
                    <span className="text-sm font-medium text-emerald-900">
                      {currentPatient.email}
                    </span>
                  </div>
                  {currentPatient.phone && (
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-600">Phone:</span>
                      <span className="text-sm font-medium text-emerald-900">
                        {currentPatient.phone}
                      </span>
                    </div>
                  )}
                  {currentPatient.date_of_birth && (
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-600">
                        Date of Birth:
                      </span>
                      <span className="text-sm font-medium text-emerald-900">
                        {new Date(
                          currentPatient.date_of_birth
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Information */}
              {(currentPatient.allergies?.length ||
                currentPatient.chronic_conditions?.length ||
                currentPatient.current_medications?.length) && (
                <div className="pt-4 border-t border-emerald-200/50 space-y-4">
                  {currentPatient.allergies &&
                    currentPatient.allergies.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-emerald-900">
                            Allergies
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {currentPatient.allergies.map((allergy, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-orange-100 text-orange-800 text-xs"
                            >
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {currentPatient.chronic_conditions &&
                    currentPatient.chronic_conditions.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-emerald-900">
                            Chronic Conditions
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {currentPatient.chronic_conditions.map(
                            (condition, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-red-100 text-red-800 text-xs"
                              >
                                {condition}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {currentPatient.current_medications &&
                    currentPatient.current_medications.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-emerald-900">
                            Current Medications
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {currentPatient.current_medications.map(
                            (medication, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-blue-100 text-blue-800 text-xs"
                              >
                                {medication}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Emergency Contact */}
              {currentPatient.emergency_contact_name && (
                <div className="pt-4 border-t border-emerald-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-900">
                      Emergency Contact
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-emerald-900">
                      {currentPatient.emergency_contact_name}
                    </p>
                    {currentPatient.emergency_contact_phone && (
                      <p className="text-sm text-emerald-600">
                        {currentPatient.emergency_contact_phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
