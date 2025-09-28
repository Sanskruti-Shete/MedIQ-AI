"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Video,
  MapPin,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentType:
    | "consultation"
    | "follow-up"
    | "emergency"
    | "routine-checkup";
  consultationMode: "in-person" | "video" | "phone";
  date: string;
  time: string;
  duration: number;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  symptoms: string;
  notes: string;
  urgency: "low" | "medium" | "high" | "critical";
  createdAt: string;
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    patientEmail: "sarah.johnson@email.com",
    patientPhone: "+1 (555) 123-4567",
    appointmentType: "consultation",
    consultationMode: "video",
    date: "2024-01-15",
    time: "09:00",
    duration: 30,
    status: "scheduled",
    symptoms: "Persistent headaches, fatigue",
    notes: "Patient reports headaches lasting 3+ days",
    urgency: "medium",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    patientName: "Michael Chen",
    patientEmail: "michael.chen@email.com",
    patientPhone: "+1 (555) 987-6543",
    appointmentType: "follow-up",
    consultationMode: "in-person",
    date: "2024-01-15",
    time: "14:30",
    duration: 45,
    status: "confirmed",
    symptoms: "Post-surgery follow-up",
    notes: "Checking recovery progress after appendectomy",
    urgency: "low",
    createdAt: "2024-01-08T14:30:00Z",
  },
];

export function AppointmentManager() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no-show":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConsultationIcon = (mode: string) => {
    switch (mode) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "in-person":
        return <MapPin className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (filterStatus !== "all" && appointment.status !== filterStatus)
      return false;
    if (viewMode === "calendar" && appointment.date !== selectedDate)
      return false;
    return true;
  });

  const updateAppointmentStatus = (
    id: string,
    status: Appointment["status"]
  ) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Appointment Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage patient appointments and consultations
          </p>
        </div>

        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Book a new appointment for a patient consultation
              </DialogDescription>
            </DialogHeader>
            <AppointmentBookingForm
              onClose={() => setIsBookingOpen(false)}
              onSave={(appointment) => {
                setAppointments((prev) => [
                  ...prev,
                  { ...appointment, id: Date.now().toString() },
                ]);
                setIsBookingOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "list" | "calendar")}
        >
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {viewMode === "calendar" && (
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <AnimatePresence>
          {filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover-lift">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-emerald-600" />
                        {appointment.patientName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.time} ({appointment.duration}min)
                        </span>
                        <span className="flex items-center gap-1">
                          {getConsultationIcon(appointment.consultationMode)}
                          {appointment.consultationMode}
                        </span>
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getUrgencyColor(appointment.urgency)}>
                        {appointment.urgency}
                      </Badge>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Symptoms:
                      </p>
                      <p className="text-sm">{appointment.symptoms}</p>
                    </div>

                    {appointment.notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Notes:
                        </p>
                        <p className="text-sm">{appointment.notes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {appointment.patientPhone}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {appointment.status === "scheduled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "confirmed"
                              )
                            }
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                        )}

                        {(appointment.status === "scheduled" ||
                          appointment.status === "confirmed") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "completed"
                              )
                            }
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingAppointment(appointment)}
                          className="text-gray-600 border-gray-200 hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteAppointment(appointment.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAppointments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No appointments found
            </h3>
            <p className="text-sm text-muted-foreground">
              {filterStatus !== "all"
                ? `No appointments with status "${filterStatus}"`
                : "No appointments scheduled for this period"}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function AppointmentBookingForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, "id">) => void;
}) {
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    appointmentType: "consultation" as Appointment["appointmentType"],
    consultationMode: "video" as Appointment["consultationMode"],
    date: "",
    time: "",
    duration: 30,
    symptoms: "",
    notes: "",
    urgency: "medium" as Appointment["urgency"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, patientName: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="patientEmail">Email</Label>
          <Input
            id="patientEmail"
            type="email"
            value={formData.patientEmail}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, patientEmail: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientPhone">Phone</Label>
          <Input
            id="patientPhone"
            value={formData.patientPhone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, patientPhone: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="appointmentType">Appointment Type</Label>
          <Select
            value={formData.appointmentType}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                appointmentType: value as Appointment["appointmentType"],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="routine-checkup">Routine Checkup</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, time: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration (min)</Label>
          <Select
            value={formData.duration.toString()}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                duration: Number.parseInt(value),
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 min</SelectItem>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="45">45 min</SelectItem>
              <SelectItem value="60">60 min</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="symptoms">Symptoms</Label>
        <Textarea
          id="symptoms"
          value={formData.symptoms}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, symptoms: e.target.value }))
          }
          placeholder="Describe the patient's symptoms..."
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Any additional notes or observations..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-emerald-600 to-teal-600"
        >
          Schedule Appointment
        </Button>
      </div>
    </form>
  );
}
