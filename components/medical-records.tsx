"use client";

import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Calendar,
  Pill,
  Activity,
  Heart,
  Brain,
  Stethoscope,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Upload,
  ImageIcon,
  File,
} from "lucide-react";
import { useMedicalRecords } from "@/hooks/use-medical-records";
import { cn } from "@/lib/utils";

interface MedicalRecord {
  id: string;
  date: string;
  type: "consultation" | "prescription" | "test" | "diagnosis" | "treatment";
  description: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
  doctor?: string;
  facility?: string;
  attachments?: string[];
}

import { ViewMode } from "@/types/ui";

interface MedicalRecordsProps {
  onNavigate: (view: ViewMode) => void;
}

const recordTypeIcons = {
  consultation: Stethoscope,
  prescription: Pill,
  test: Activity,
  diagnosis: Brain,
  treatment: Heart,
};

const recordTypeColors = {
  consultation: "bg-emerald-100 text-emerald-700 border-emerald-200",
  prescription: "bg-blue-100 text-blue-700 border-blue-200",
  test: "bg-purple-100 text-purple-700 border-purple-200",
  diagnosis: "bg-orange-100 text-orange-700 border-orange-200",
  treatment: "bg-red-100 text-red-700 border-red-200",
};

export function MedicalRecords({ onNavigate }: MedicalRecordsProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [newRecord, setNewRecord] = useState<Partial<MedicalRecord>>({
    date: new Date().toISOString().split("T")[0],
    type: "consultation",
    description: "",
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
    doctor: "",
    facility: "",
    attachments: [],
  });

  const {
    getMedicalHistory,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    uploadFile,
  } = useMedicalRecords();

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, filterType]);

  const loadRecords = async () => {
    try {
      const medicalHistory = await getMedicalHistory();
      setRecords(medicalHistory);
    } catch (error) {
      console.error("Error loading medical records:", error);
    }
  };

  const filterRecords = () => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((record) => record.type === filterType);
    }

    setFilteredRecords(filtered);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleAddRecord = async () => {
    try {
      const attachmentUrls = [];
      for (const file of uploadedFiles) {
        const url = await uploadFile(file);
        attachmentUrls.push(url);
      }

      const recordWithAttachments = {
        ...newRecord,
        attachments: attachmentUrls,
      } as MedicalRecord;

      await addMedicalRecord(recordWithAttachments);
      setIsAddingRecord(false);
      setUploadedFiles([]);
      setNewRecord({
        date: new Date().toISOString().split("T")[0],
        type: "consultation",
        description: "",
        diagnosis: "",
        treatment: "",
        prescription: "",
        notes: "",
        doctor: "",
        facility: "",
        attachments: [],
      });
      loadRecords();
    } catch (error) {
      console.error("Error adding medical record:", error);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteMedicalRecord(id);
      loadRecords();
    } catch (error) {
      console.error("Error deleting medical record:", error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-serif">
            Medical Records
          </h1>
          <p className="text-slate-600 mt-1 font-light">
            Comprehensive health history and medical documentation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onNavigate("chat")}
            className="flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-700 border-emerald-200 rounded-xl"
          >
            <MessageSquare className="w-4 h-4" />
            AI Consultation
          </Button>
          <Dialog open={isAddingRecord} onOpenChange={setIsAddingRecord}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif">
                  Add Medical Record
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={newRecord.date}
                      onChange={(e) =>
                        setNewRecord({ ...newRecord, date: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Type
                    </label>
                    <Select
                      value={newRecord.type}
                      onValueChange={(value) =>
                        setNewRecord({ ...newRecord, type: value as any })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">
                          Consultation
                        </SelectItem>
                        <SelectItem value="prescription">
                          Prescription
                        </SelectItem>
                        <SelectItem value="test">Test/Lab</SelectItem>
                        <SelectItem value="diagnosis">Diagnosis</SelectItem>
                        <SelectItem value="treatment">Treatment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Description
                  </label>
                  <Textarea
                    value={newRecord.description}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description of the medical record..."
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Doctor
                    </label>
                    <Input
                      value={newRecord.doctor}
                      onChange={(e) =>
                        setNewRecord({ ...newRecord, doctor: e.target.value })
                      }
                      placeholder="Dr. Smith"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Facility
                    </label>
                    <Input
                      value={newRecord.facility}
                      onChange={(e) =>
                        setNewRecord({ ...newRecord, facility: e.target.value })
                      }
                      placeholder="General Hospital"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {newRecord.type === "diagnosis" && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Diagnosis
                    </label>
                    <Textarea
                      value={newRecord.diagnosis}
                      onChange={(e) =>
                        setNewRecord({
                          ...newRecord,
                          diagnosis: e.target.value,
                        })
                      }
                      placeholder="Medical diagnosis details..."
                      className="rounded-xl"
                    />
                  </div>
                )}

                {newRecord.type === "treatment" && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Treatment
                    </label>
                    <Textarea
                      value={newRecord.treatment}
                      onChange={(e) =>
                        setNewRecord({
                          ...newRecord,
                          treatment: e.target.value,
                        })
                      }
                      placeholder="Treatment plan and procedures..."
                      className="rounded-xl"
                    />
                  </div>
                )}

                {newRecord.type === "prescription" && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Prescription
                    </label>
                    <Textarea
                      value={newRecord.prescription}
                      onChange={(e) =>
                        setNewRecord({
                          ...newRecord,
                          prescription: e.target.value,
                        })
                      }
                      placeholder="Medication details, dosage, duration..."
                      className="rounded-xl"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Notes
                  </label>
                  <Textarea
                    value={newRecord.notes}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, notes: e.target.value })
                    }
                    placeholder="Additional notes and observations..."
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Upload Documents (Prescriptions, Lab Reports, Images)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        PDF, DOC, Images up to 10MB each
                      </p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center gap-2">
                            {file.type.startsWith("image/") ? (
                              <ImageIcon className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <File className="w-4 h-4 text-blue-600" />
                            )}
                            <span className="text-sm text-slate-700">
                              {file.name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingRecord(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddRecord}
                    className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                  >
                    Add Record
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search medical records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="consultation">Consultations</SelectItem>
              <SelectItem value="prescription">Prescriptions</SelectItem>
              <SelectItem value="test">Tests/Labs</SelectItem>
              <SelectItem value="diagnosis">Diagnoses</SelectItem>
              <SelectItem value="treatment">Treatments</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-transparent rounded-xl"
        >
          <Download className="w-4 h-4" />
          Export Records
        </Button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {filteredRecords.map((record, index) => {
            const IconComponent = recordTypeIcons[record.type];
            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            recordTypeColors[record.type]
                          )}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-slate-800 font-serif">
                              {record.description}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={cn(
                                recordTypeColors[record.type],
                                "rounded-full"
                              )}
                            >
                              {record.type}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(record.date).toLocaleDateString()}
                            </div>
                            {record.doctor && (
                              <div className="flex items-center gap-1">
                                <Stethoscope className="w-4 h-4" />
                                {record.doctor}
                              </div>
                            )}
                            {record.facility && (
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {record.facility}
                              </div>
                            )}
                          </div>

                          {record.attachments &&
                            record.attachments.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <FileText className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-600">
                                  {record.attachments.length} attachment
                                  {record.attachments.length > 1 ? "s" : ""}
                                </span>
                              </div>
                            )}

                          {record.diagnosis && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-slate-700">
                                Diagnosis:
                              </p>
                              <p className="text-sm text-slate-600 mt-1">
                                {record.diagnosis}
                              </p>
                            </div>
                          )}

                          {record.treatment && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-slate-700">
                                Treatment:
                              </p>
                              <p className="text-sm text-slate-600 mt-1">
                                {record.treatment}
                              </p>
                            </div>
                          )}

                          {record.prescription && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-slate-700">
                                Prescription:
                              </p>
                              <p className="text-sm text-slate-600 mt-1">
                                {record.prescription}
                              </p>
                            </div>
                          )}

                          {record.notes && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-slate-700">
                                Notes:
                              </p>
                              <p className="text-sm text-slate-600 mt-1">
                                {record.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                          className="hover:bg-emerald-50 hover:text-emerald-700 rounded-xl"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-blue-50 hover:text-blue-700 rounded-xl"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="hover:bg-red-50 hover:text-red-700 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            No medical records found
          </h3>
          <p className="text-slate-500 mb-4">
            {searchTerm || filterType !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Start by adding your first medical record"}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => setIsAddingRecord(true)}
              className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Medical Record
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("chat")}
              className="hover:bg-emerald-50 hover:text-emerald-700 border-emerald-200 rounded-xl"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Start AI Consultation
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={!!selectedRecord}
        onOpenChange={() => setSelectedRecord(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif flex items-center gap-2">
                  {React.createElement(recordTypeIcons[selectedRecord.type], {
                    className: "w-5 h-5",
                  })}
                  {selectedRecord.description}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Date</p>
                    <p className="text-slate-600">
                      {new Date(selectedRecord.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Type</p>
                    <Badge className={recordTypeColors[selectedRecord.type]}>
                      {selectedRecord.type}
                    </Badge>
                  </div>
                </div>

                {selectedRecord.doctor && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">Doctor</p>
                    <p className="text-slate-600">{selectedRecord.doctor}</p>
                  </div>
                )}

                {selectedRecord.facility && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Facility
                    </p>
                    <p className="text-slate-600">{selectedRecord.facility}</p>
                  </div>
                )}

                {selectedRecord.diagnosis && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Diagnosis
                    </p>
                    <p className="text-slate-600">{selectedRecord.diagnosis}</p>
                  </div>
                )}

                {selectedRecord.treatment && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Treatment
                    </p>
                    <p className="text-slate-600">{selectedRecord.treatment}</p>
                  </div>
                )}

                {selectedRecord.prescription && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Prescription
                    </p>
                    <p className="text-slate-600">
                      {selectedRecord.prescription}
                    </p>
                  </div>
                )}

                {selectedRecord.notes && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">Notes</p>
                    <p className="text-slate-600">{selectedRecord.notes}</p>
                  </div>
                )}

                {selectedRecord.attachments &&
                  selectedRecord.attachments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700">
                        Attachments:
                      </p>
                      <div className="mt-2 space-y-2">
                        {selectedRecord.attachments.map((url, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-600">
                                Attachment {index + 1}
                              </span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
