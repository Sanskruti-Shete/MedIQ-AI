"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SymptomAnalyzer } from "@/components/symptom-analyzer";
import {
  Send,
  Mic,
  Paperclip,
  Heart,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MicOff,
  ImageIcon,
  FileText,
  X,
  Stethoscope,
  Activity,
  Brain,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  Cpu,
} from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { useGemini } from "@/hooks/use-gemini";
import { useNLP } from "@/hooks/use-nlp";
import { useMedicalRecords } from "@/hooks/use-medical-records";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  chatId: string | null;
}

const MEDICAL_PROMPTS = [
  {
    icon: Heart,
    text: "Start symptom analysis",
    category: "Diagnosis",
    color: "text-red-500",
    bg: "bg-red-50 hover:bg-red-100 border-red-200",
    action: "symptom-analysis",
  },
  {
    icon: Activity,
    text: "Review medical history",
    category: "Records",
    color: "text-orange-500",
    bg: "bg-orange-50 hover:bg-orange-100 border-orange-200",
  },
  {
    icon: Brain,
    text: "Treatment options",
    category: "Therapy",
    color: "text-purple-500",
    bg: "bg-purple-50 hover:bg-purple-100 border-purple-200",
  },
  {
    icon: Stethoscope,
    text: "Medical diagnosis",
    category: "Assessment",
    color: "text-emerald-500",
    bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
  },
  {
    icon: Shield,
    text: "Health assessment",
    category: "Prevention",
    color: "text-blue-500",
    bg: "bg-blue-50 hover:bg-blue-100 border-blue-200",
  },
  {
    icon: Zap,
    text: "Emergency protocols",
    category: "Urgent",
    color: "text-red-600",
    bg: "bg-red-50 hover:bg-red-100 border-red-200",
  },
];

const MessageContent = ({
  content,
  role,
}: {
  content: string;
  role: string;
}) => {
  const formatMedicalContent = (text: string) => {
    const sections = text.split("\n\n");

    return sections.map((section, index) => {
      if (section.startsWith("**") && section.includes("**")) {
        const headerMatch = section.match(/\*\*(.*?)\*\*/);
        if (headerMatch) {
          const header = headerMatch[1];
          const content = section.replace(/\*\*(.*?)\*\*/, "").trim();

          return (
            <div key={index} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <h3 className="font-bold text-lg text-slate-800 font-serif">
                  {header}
                </h3>
              </div>
              {content && (
                <div className="pl-4 border-l-2 border-emerald-200 text-slate-700 leading-relaxed">
                  {content}
                </div>
              )}
            </div>
          );
        }
      }

      if (section.includes("•") || section.includes("-")) {
        const lines = section.split("\n");
        return (
          <div key={index} className="mb-4">
            <ul className="space-y-2">
              {lines.map((line, lineIndex) => {
                if (
                  line.trim().startsWith("•") ||
                  line.trim().startsWith("-")
                ) {
                  return (
                    <li key={lineIndex} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div>
                      <span className="text-slate-700 leading-relaxed">
                        {line.replace(/^[•-]\s*/, "")}
                      </span>
                    </li>
                  );
                }
                return (
                  line && (
                    <p
                      key={lineIndex}
                      className="text-slate-700 leading-relaxed mb-2"
                    >
                      {line}
                    </p>
                  )
                );
              })}
            </ul>
          </div>
        );
      }

      return (
        section.trim() && (
          <p
            key={index}
            className="text-slate-700 leading-relaxed mb-4 font-light"
          >
            {section}
          </p>
        )
      );
    });
  };

  if (role === "assistant") {
    return (
      <div className="prose prose-slate max-w-none">
        <div className="space-y-4 font-sans">
          {formatMedicalContent(content)}
        </div>
      </div>
    );
  }

  return (
    <div className="prose prose-slate max-w-none">
      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-base font-medium">
        {content}
      </p>
    </div>
  );
};

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showSymptomAnalyzer, setShowSymptomAnalyzer] = useState(false);
  const [useNLPBackend, setUseNLPBackend] = useState(false); // Toggle for NLP backend
  const [nlpStatus, setNLPStatus] = useState<string>("unknown"); // Track NLP backend status

  const { chats, getCurrentChat, addMessage, createChat } = useChatStore();
  const { generateResponse } = useGemini();
  const {
    generateMedicalResponse,
    analyzeImage,
    checkNLPHealth,
    isLoading: nlpLoading,
    isImageAnalyzing,
  } = useNLP();
  const { getMedicalHistory, addMedicalRecord } = useMedicalRecords();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentChat = getCurrentChat(chatId);

  // Check NLP backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const health = await checkNLPHealth();
        setNLPStatus(
          health.status === "healthy" ? "connected" : "disconnected"
        );
      } catch (error) {
        setNLPStatus("disconnected");
      }
    };

    checkBackendHealth();
  }, [checkNLPHealth]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  useEffect(() => {
    if (currentChat?.messages.length) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [chatId]);

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setInput(
          (prev) =>
            prev + "[Voice message recorded - Speech-to-text integration ready]"
        );
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    setShowFilePreview(true);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setShowFilePreview(false);
    }
  };

  const handleSubmit = async (message?: string) => {
    const messageText = message || input.trim();
    const currentlyLoading = isLoading || nlpLoading || isImageAnalyzing;

    if ((!messageText && selectedFiles.length === 0) || currentlyLoading)
      return;

    let activeChatId = chatId;

    if (!activeChatId) {
      activeChatId = createChat();
      router.push(`/?chatId=${activeChatId}`);
    }

    let fullMessage = messageText;
    let hasImages = false;

    // Handle image files separately for NLP backend
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    const otherFiles = selectedFiles.filter(
      (file) => !file.type.startsWith("image/")
    );

    if (selectedFiles.length > 0) {
      const fileNames = selectedFiles.map((file) => file.name).join(", ");
      fullMessage += `\n\n[Medical files attached: ${fileNames}]`;
      hasImages = imageFiles.length > 0;
    }

    addMessage(activeChatId, {
      role: "user",
      content: fullMessage,
      timestamp: Date.now(),
    });

    setInput("");
    setSelectedFiles([]);
    setShowFilePreview(false);
    setIsLoading(true);

    try {
      let response = "";
      let analysisResults: any[] = [];

      // Handle image analysis first if using NLP backend and images are present
      if (useNLPBackend && hasImages && nlpStatus === "connected") {
        for (const imageFile of imageFiles) {
          const imageAnalysis = await analyzeImage(
            imageFile,
            messageText ||
              "Analyze this medical image for any findings or abnormalities."
          );

          if (imageAnalysis.success) {
            analysisResults.push({
              fileName: imageFile.name,
              analysis: imageAnalysis.analysis,
            });
          }
        }
      }

      // Generate text response
      if (useNLPBackend && nlpStatus === "connected") {
        // Use NLP backend for medical consultation
        const nlpResponse = await generateMedicalResponse(messageText);

        if (nlpResponse.success) {
          response = nlpResponse.response.text;

          // Add urgency and diagnosis info if available
          if (
            nlpResponse.response.urgency !== "low" ||
            nlpResponse.response.emergency_warning
          ) {
            response += `\n\n**⚠️ Urgency Level: ${nlpResponse.response.urgency.toUpperCase()}**`;

            if (nlpResponse.response.emergency_warning) {
              response +=
                "\n\n🚨 **IMPORTANT**: This may require immediate medical attention. Please consult with a healthcare professional promptly.";
            }
          }

          if (
            nlpResponse.response.diagnosis &&
            nlpResponse.response.diagnosis !== "Analysis pending"
          ) {
            response += `\n\n**Primary Assessment**: ${nlpResponse.response.diagnosis}`;
          }

          if (nlpResponse.response.confidence) {
            response += `\n\n**Confidence Level**: ${nlpResponse.response.confidence}`;
          }

          // Add follow-up questions if available
          if (
            nlpResponse.response.follow_up_questions &&
            nlpResponse.response.follow_up_questions.length > 0
          ) {
            response += "\n\n**Follow-up Questions**:";
            nlpResponse.response.follow_up_questions.forEach((q, index) => {
              response += `\n${index + 1}. ${q}`;
            });
          }
        } else {
          response = nlpResponse.response.text;
        }
      } else {
        // Fallback to Gemini API
        const medicalHistory = await getMedicalHistory();
        const historyContext =
          medicalHistory.length > 0
            ? `\n\nPatient Medical History:\n${medicalHistory
                .map(
                  (record) =>
                    `- ${record.date}: ${record.diagnosis} (${record.treatment})`
                )
                .join("\n")}`
            : "";

        const medicalContext = `You are MedicalAI, an advanced healthcare assistant with access to the patient's medical history. Provide comprehensive, well-structured medical information with clear sections and bullet points. Use professional medical terminology while remaining accessible. Always emphasize consulting healthcare professionals for diagnosis and treatment.${historyContext}\n\nPatient Query: `;

        response = await generateResponse(medicalContext + fullMessage);
      }

      // Add image analysis results to the response if any
      if (analysisResults.length > 0) {
        response += "\n\n**Medical Image Analysis Results**:\n\n";

        analysisResults.forEach((result, index) => {
          response += `**Image ${index + 1}: ${result.fileName}**\n`;
          response += `${result.analysis.text}\n\n`;

          if (result.analysis.findings && result.analysis.findings.length > 0) {
            response += "**Key Findings**:\n";
            result.analysis.findings.forEach((finding: any) => {
              response += `• ${finding.finding} (${finding.model}, ${finding.confidence} confidence)\n`;
            });
            response += "\n";
          }

          if (result.analysis.recommendations) {
            response += "**Recommendations**:\n";
            result.analysis.recommendations.forEach((rec: string) => {
              response += `• ${rec}\n`;
            });
            response += "\n";
          }
        });
      }

      addMessage(activeChatId, {
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      });

      await addMedicalRecord({
        date: new Date().toISOString().split("T")[0],
        type: "consultation",
        description: messageText,
        diagnosis: useNLPBackend ? "AI NLP Consultation" : "AI Consultation",
        treatment: "Medical guidance provided",
        notes: response.substring(0, 500) + "...",
      });
    } catch (error) {
      console.error("Error generating response:", error);
      addMessage(activeChatId, {
        role: "assistant",
        content:
          "I apologize, but I'm experiencing technical difficulties. For immediate medical concerns, please contact your healthcare provider or emergency services.",
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (prompt: any) => {
    if (prompt.action === "symptom-analysis") {
      setShowSymptomAnalyzer(true);
    } else {
      handleSubmit(prompt.text);
    }
  };

  const handleSymptomAnalysisComplete = (result: any) => {
    setShowSymptomAnalyzer(false);

    let activeChatId = chatId;
    if (!activeChatId) {
      activeChatId = createChat();
      router.push(`/?chatId=${activeChatId}`);
    }

    const analysisMessage = `**Symptom Analysis Results**

${result
  .map(
    (r: any, i: number) => `**${i + 1}. ${r.condition}** (${
      r.probability
    }% likelihood)
   
**Urgency Level:** ${r.urgency.toUpperCase()}
   
**Description:**
${r.description}
   
**Recommendations:**
${r.recommendations.map((rec: string) => `• ${rec}`).join("\n")}
   
**Suggested Tests:**
${r.tests.map((test: string) => `• ${test}`).join("\n")}
`
  )
  .join("\n\n")}

**⚠️ Important Medical Disclaimer**
This is a preliminary AI analysis based on reported symptoms. Please consult with a qualified healthcare provider for accurate diagnosis, treatment recommendations, and medical care.`;

    addMessage(activeChatId, {
      role: "assistant",
      content: analysisMessage,
      timestamp: Date.now(),
    });
  };

  if (showSymptomAnalyzer) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-emerald-200/50 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-emerald-900 font-serif">
              Symptom Analysis
            </h2>
            <Button
              variant="ghost"
              onClick={() => setShowSymptomAnalyzer(false)}
              className="hover:bg-emerald-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <SymptomAnalyzer onAnalysisComplete={handleSymptomAnalysisComplete} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className="flex flex-col h-full"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Backend Selection Header */}
      <div className="border-b border-emerald-200/50 bg-white/80 backdrop-blur-xl p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-slate-800">MedIQ AI</span>
            </div>

            {/* Backend Status Indicators */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    nlpStatus === "connected" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs text-slate-600">NLP Backend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-slate-600">Gemini AI</span>
              </div>
            </div>
          </div>

          {/* Backend Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm transition-colors ${
                  !useNLPBackend
                    ? "text-blue-600 font-medium"
                    : "text-slate-500"
                }`}
              >
                Gemini
              </span>
              <Switch
                checked={useNLPBackend}
                onCheckedChange={(checked) => setUseNLPBackend(checked)}
                disabled={nlpStatus !== "connected"}
                className="data-[state=checked]:bg-emerald-600"
              />
              <span
                className={`text-sm transition-colors ${
                  useNLPBackend
                    ? "text-emerald-600 font-medium"
                    : "text-slate-500"
                }`}
              >
                NLP AI
              </span>
            </div>

            {nlpStatus !== "connected" && (
              <div className="flex items-center gap-1 text-amber-600 text-xs">
                <AlertTriangle className="h-3 w-3" />
                <span>NLP offline</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 md:px-8">
        <div className="max-w-5xl mx-auto py-8">
          {!currentChat?.messages.length ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-12"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white mb-8 shadow-2xl shadow-emerald-500/25"
                >
                  <Stethoscope className="h-12 w-12" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent font-serif">
                    MedicalAI Assistant
                  </h1>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
                    Your intelligent healthcare companion powered by advanced
                    AI. Get instant medical insights, symptom analysis, and
                    personalized health guidance with access to your complete
                    medical history.
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <p className="text-amber-700 font-medium">
                      Always consult healthcare professionals for diagnosis and
                      treatment
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
              >
                {MEDICAL_PROMPTS.map((prompt, index) => {
                  const IconComponent = prompt.icon;
                  return (
                    <motion.div
                      key={prompt.text}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-auto p-6 text-left flex flex-col items-start gap-3 transition-all duration-300 border-2",
                          prompt.bg,
                          "hover:shadow-lg hover:shadow-emerald-500/10"
                        )}
                        onClick={() => handlePromptClick(prompt)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div
                            className={cn(
                              "p-2 rounded-lg bg-white/80",
                              prompt.color
                            )}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">
                              {prompt.text}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {prompt.category}
                            </p>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="flex flex-wrap justify-center items-center gap-8 pt-12 border-t border-emerald-100"
              >
                <div className="flex items-center gap-3 text-emerald-600">
                  <Heart className="h-6 w-6" />
                  <span className="font-medium">Cardiology</span>
                </div>
                <div className="flex items-center gap-3 text-teal-600">
                  <Brain className="h-6 w-6" />
                  <span className="font-medium">Neurology</span>
                </div>
                <div className="flex items-center gap-3 text-cyan-600">
                  <Activity className="h-6 w-6" />
                  <span className="font-medium">Diagnostics</span>
                </div>
                <div className="flex items-center gap-3 text-blue-600">
                  <Shield className="h-6 w-6" />
                  <span className="font-medium">Prevention</span>
                </div>
              </motion.div>

              {/* AI Backend Selection */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                className="flex justify-center items-center gap-4 mt-8 p-4 bg-white/80 rounded-xl border border-emerald-200/50"
              >
                <span className="text-sm font-medium text-slate-700">
                  AI Backend:
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={!useNLPBackend ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseNLPBackend(false)}
                    className={cn(
                      "transition-all duration-200",
                      !useNLPBackend
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "border-emerald-200 hover:bg-emerald-50"
                    )}
                  >
                    Gemini 2.0 Flash
                  </Button>
                  <Button
                    variant={useNLPBackend ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseNLPBackend(true)}
                    disabled={nlpStatus !== "connected"}
                    className={cn(
                      "transition-all duration-200",
                      useNLPBackend
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "border-blue-200 hover:bg-blue-50",
                      nlpStatus !== "connected" &&
                        "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          nlpStatus === "connected"
                            ? "bg-green-400"
                            : "bg-red-400"
                        )}
                      />
                      NLP Backend
                    </div>
                  </Button>
                </div>
                <div className="text-xs text-slate-500">
                  {nlpStatus === "connected"
                    ? "✅ NLP Backend Available"
                    : "❌ NLP Backend Offline"}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {currentChat.messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex gap-4 p-6 rounded-2xl border transition-all duration-200",
                      message.role === "user"
                        ? "bg-gradient-to-br from-emerald-50 to-teal-50 ml-8 border-emerald-200/50 shadow-sm"
                        : "bg-gradient-to-br from-slate-50 to-gray-50 mr-8 border-slate-200/50 shadow-sm"
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                        message.role === "user"
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                          : "bg-gradient-to-br from-slate-600 to-gray-600 text-white"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Stethoscope className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <MessageContent
                        content={message.content}
                        role={message.role}
                      />

                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 rounded-lg"
                            onClick={() =>
                              copyToClipboard(message.content, `${index}`)
                            }
                          >
                            {copiedMessageId === `${index}` ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="ml-1 text-xs text-green-600 font-medium">
                                  Copied!
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                <span className="ml-1 text-xs">Copy</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 hover:bg-green-50 hover:text-green-700 transition-all duration-200 rounded-lg"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="ml-1 text-xs">Helpful</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-lg"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            <span className="ml-1 text-xs">Not helpful</span>
                          </Button>
                          <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            {new Date(message.timestamp).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {(isLoading || nlpLoading) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 mr-8 border border-slate-200/50 shadow-sm"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-gray-600 text-white flex items-center justify-center shadow-lg">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      <span className="text-sm text-slate-600 ml-2 font-medium">
                        {useNLPBackend
                          ? "Analyzing with medical NLP system..."
                          : "Analyzing medical query with your history..."}
                      </span>
                    </div>
                    {isImageAnalyzing && (
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        🔍 Processing medical images...
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="border-t border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6"
      >
        <div className="max-w-5xl mx-auto">
          {showFilePreview && selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">
                  Medical files attached:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-emerald-200 shadow-sm"
                  >
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-teal-500" />
                    )}
                    <span className="text-sm truncate max-w-[150px] font-medium">
                      {file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-red-100"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms, ask about medications, or request health guidance..."
              className="min-h-[80px] max-h-[200px] pr-24 resize-none bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border-2 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 text-base rounded-xl font-light"
              disabled={isLoading}
            />

            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 hover:bg-emerald-100 hover:text-emerald-700 transition-colors",
                  isRecording &&
                    "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                )}
                disabled={isLoading}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>

              <Button
                onClick={() => handleSubmit()}
                disabled={
                  (!input.trim() && selectedFiles.length === 0) ||
                  isLoading ||
                  nlpLoading
                }
                size="icon"
                className="h-9 w-9 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className={cn(
                  "px-3 py-1 border",
                  useNLPBackend
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : "bg-emerald-100 text-emerald-700 border-emerald-200"
                )}
              >
                <Stethoscope className="h-3 w-3 mr-1" />
                {useNLPBackend ? "NLP Medical AI" : "Gemini Medical AI"}
              </Badge>
              <span className="font-light">
                {useNLPBackend
                  ? "Powered by Medical NLP Engine • Advanced symptom analysis • Image processing"
                  : "Powered by Gemini 2.5 Flash • Advanced medical knowledge • Medical history integrated"}
              </span>
              {nlpStatus !== "connected" && (
                <span className="text-amber-600 font-medium">
                  ⚠️ NLP Backend Offline - Using Gemini fallback
                </span>
              )}
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 text-red-500 font-medium">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Recording medical query...</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
