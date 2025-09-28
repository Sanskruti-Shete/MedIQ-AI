"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { PatientDashboard } from "@/components/patient-dashboard";
import { PatientRegistration } from "@/components/patient-registration";
import { MedicalKnowledgeBase } from "@/components/medical-knowledge-base";
import { HumanBodyVisualization } from "@/components/human-body-3d";
import { MedicalRecords } from "@/components/medical-records";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Canvas } from "@react-three/fiber";
import {
  X,
  Sidebar,
  User,
  MessageSquare,
  FileText,
  BookOpen,
  Activity,
  Heart,
  Sparkles,
  Settings,
} from "lucide-react";
import { usePatientStore } from "@/hooks/use-patient-store";
import { ViewMode } from "@/types/ui";

export default function MedIQPlatform() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("onboarding");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const patientStore = usePatientStore();
  const currentPatient = patientStore?.currentPatient || null;
  const isRegistered = patientStore?.isRegistered || false;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowRegistration(true);
  };

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
    setViewMode("dashboard");
  };

  const navigationItems = [
    {
      id: "chat",
      label: "AI Consultation",
      icon: MessageSquare,
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "3d-body",
      label: "3D Body Scan",
      icon: Activity,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "dashboard",
      label: "Health Dashboard",
      icon: Heart,
      color: "from-red-500 to-rose-500",
    },
    {
      id: "records",
      label: "Medical Records",
      icon: FileText,
      color: "from-orange-500 to-amber-500",
    },
    {
      id: "knowledge",
      label: "Medical Library",
      icon: BookOpen,
      color: "from-teal-500 to-cyan-500",
    },
  ];

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      );
    }

    try {
      switch (viewMode) {
        case "dashboard":
          return <PatientDashboard onNavigate={setViewMode} />;
        case "chat":
          return (
            <ChatInterface
              chatId={currentChatId}
              onNewChat={setCurrentChatId}
            />
          );
        case "3d-body":
          return <HumanBodyVisualization />;
        case "records":
          return <MedicalRecords onNavigate={setViewMode} />;
        case "knowledge":
          return <MedicalKnowledgeBase />;
        default:
          return (
            <ChatInterface
              chatId={currentChatId}
              onNewChat={setCurrentChatId}
            />
          );
      }
    } catch (error) {
      console.error("Component rendering error:", error);
      return (
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">Error loading component</div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Reload Page
          </Button>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (showRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <PatientRegistration onComplete={handleRegistrationComplete} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-emerald-50/30 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute bottom-32 left-40 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-70 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-40 animate-bounce"></div>
      </div>

      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-lg">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-emerald-100 transition-all duration-300 hover:scale-105 rounded-xl"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Sidebar className="h-5 w-5" />
              )}
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-slate-800 text-lg leading-tight">
                  Medical Patient
                </h1>
                <p className="text-sm text-emerald-600 font-medium">
                  Welcome to MedIQ
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={viewMode === item.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2 transition-all duration-300 rounded-xl px-3 py-2 h-10",
                  viewMode === item.id
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg hover:shadow-xl transform hover:scale-105`
                    : "text-slate-700 hover:bg-slate-100 hover:scale-105"
                )}
                onClick={() => setViewMode(item.id as ViewMode)}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0",
                    viewMode === item.id
                      ? "text-white"
                      : `bg-gradient-to-r ${item.color} text-white`
                  )}
                >
                  {item.icon && <item.icon className="w-3 h-3" />}
                </div>
                <span className="hidden xl:inline text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-200 hover:to-teal-200 transition-all duration-300 shadow-sm px-3 py-1 rounded-full"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">AI Powered</span>
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-slate-100 transition-all duration-300 rounded-xl w-10 h-10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="lg:hidden px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={viewMode === item.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2 transition-all duration-300 rounded-xl flex-shrink-0",
                  viewMode === item.id
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : "text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => setViewMode(item.id as ViewMode)}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-md flex items-center justify-center",
                    viewMode === item.id
                      ? "text-white"
                      : `bg-gradient-to-r ${item.color} text-white`
                  )}
                >
                  {item.icon && <item.icon className="w-2.5 h-2.5" />}
                </div>
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              opacity: { duration: 0.3 },
            }}
            className="fixed left-0 top-20 lg:top-24 bottom-0 w-80 bg-white/95 backdrop-blur-xl border-r border-slate-200/50 shadow-2xl z-40"
          >
            <div className="h-full">
              <ChatSidebar
                currentChatId={currentChatId}
                onChatSelect={setCurrentChatId}
                onCloseSidebar={() => setSidebarOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          "pt-20 lg:pt-24",
          sidebarOpen ? "lg:ml-80" : "ml-0"
        )}
      >
        <div className="flex-1 relative">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full"
          >
            {renderMainContent()}
          </motion.div>
        </div>
      </div>

      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
