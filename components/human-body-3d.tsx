"use client";

import { useRef, useState, Suspense, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Text,
  Html,
  useGLTF,
} from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  RotateCcw,
  Play,
  Pause,
  Heart,
  Brain,
  Activity,
  Thermometer,
  Stethoscope,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import * as THREE from "three";
import { useMedicalRecords } from "@/hooks/use-medical-records";

useGLTF.preload("/human_anatomy.glb");

// Medical condition mapping to body areas
type Hotspot = {
  position: [number, number, number];
  color: string;
  severity: string;
};

const MEDICAL_HOTSPOTS: { [key: string]: Hotspot } = {
  hypertension: { position: [0, 20, 10], color: "#ff4444", severity: "high" },
  heart: { position: [-15, 10, 5], color: "#ff6b6b", severity: "medium" },
  head: { position: [0, 70, 0], color: "#ffa726", severity: "low" },
  chest: { position: [0, 20, 0], color: "#42a5f5", severity: "medium" },
  abdomen: { position: [0, -10, 0], color: "#66bb6a", severity: "low" },
  kidney: { position: [20, -5, -10], color: "#ab47bc", severity: "medium" },
};

function HumanBodyModel({
  selectedBodyPart,
  symptomIntensity,
  isAnimating,
  onBodyPartClick,
  medicalConditions,
}: {
  selectedBodyPart: string | null;
  symptomIntensity: number;
  isAnimating: boolean;
  onBodyPartClick: (part: string) => void;
  medicalConditions: Array<{
    condition: string;
    area: string;
    severity: string;
    details: string;
  }>;
}) {
  // GLB Model Loader Component
  function GLBModel() {
    const { scene: gltfScene } = useGLTF("/human_anatomy.glb");
    const modelRef = useRef<THREE.Group>(null);

    if (!gltfScene) {
      console.error("Failed to load GLB model");
      return null;
    }

    useFrame((state) => {
      if (modelRef.current && isAnimating) {
        const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.01;
        modelRef.current.scale.setScalar(breathingScale);
        const gentleRotation = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        modelRef.current.rotation.y = gentleRotation;
      }
    });

    return (
      <group ref={modelRef}>
        <primitive
          object={gltfScene.clone()}
          scale={[700, 700, 700]}
          position={[0, -50, 0]}
          onClick={() => onBodyPartClick("glb-model")}
        />
      </group>
    );
  }

  // Loading Component for GLB
  function ModelLoader() {
    return (
      <Html center>
        <div className="flex items-center gap-2 p-3 bg-white/90 rounded-lg shadow-lg">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          <span className="text-sm text-emerald-700">Loading 3D model...</span>
        </div>
      </Html>
    );
  }

  // Medical Hotspots Component
  function MedicalHotspots() {
    return (
      <group>
        {medicalConditions.map((condition, index) => {
          const hotspot =
            MEDICAL_HOTSPOTS[condition.area as keyof typeof MEDICAL_HOTSPOTS];
          if (!hotspot) return null;

          const isSelected = selectedBodyPart === condition.area;
          const intensityMultiplier =
            condition.severity === "high"
              ? 1.5
              : condition.severity === "medium"
              ? 1.2
              : 1;

          return (
            <group key={index}>
              {/* Hotspot Marker */}
              <mesh
                position={hotspot.position}
                onClick={() => onBodyPartClick(condition.area)}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "auto";
                }}
              >
                <sphereGeometry args={[3, 16, 16]} />
                <meshStandardMaterial
                  color={hotspot.color}
                  transparent
                  opacity={isSelected ? 0.9 : 0.7}
                  emissive={hotspot.color}
                  emissiveIntensity={
                    isSelected
                      ? 0.4 * intensityMultiplier
                      : 0.2 * intensityMultiplier
                  }
                />
              </mesh>

              {/* Pulsing Ring Effect */}
              {condition.severity === "high" && (
                <mesh position={hotspot.position}>
                  <ringGeometry args={[4, 6, 16]} />
                  <meshBasicMaterial
                    color={hotspot.color}
                    transparent
                    opacity={0.3 + Math.sin(Date.now() * 0.005) * 0.2}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}

              {/* Information Label */}
              {isSelected && (
                <Html
                  position={[
                    hotspot.position[0],
                    hotspot.position[1] + 15,
                    hotspot.position[2],
                  ]}
                  center
                >
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-red-200 max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle
                        className={`w-4 h-4 ${
                          condition.severity === "high"
                            ? "text-red-500"
                            : condition.severity === "medium"
                            ? "text-orange-500"
                            : "text-yellow-500"
                        }`}
                      />
                      <p className="font-medium text-sm text-gray-900">
                        {condition.condition}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {condition.details}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        condition.severity === "high"
                          ? "border-red-300 text-red-700"
                          : condition.severity === "medium"
                          ? "border-orange-300 text-orange-700"
                          : "border-yellow-300 text-yellow-700"
                      }`}
                    >
                      {condition.severity} priority
                    </Badge>
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </group>
    );
  }

  return (
    <Suspense fallback={<ModelLoader />}>
      <GLBModel />
      <MedicalHotspots />
      {selectedBodyPart &&
        !medicalConditions.find((c) => c.area === selectedBodyPart) && (
          <Html position={[0, 100, 0]} center>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-emerald-200">
              <p className="text-lg font-medium text-emerald-900">
                3D Anatomy Model
              </p>
              <p className="text-base text-emerald-600">
                Intensity: {Math.round(symptomIntensity * 100)}%
              </p>
            </div>
          </Html>
        )}
      <Text
        position={[0, 150, 0]}
        fontSize={15}
        color="#059669"
        anchorX="center"
        anchorY="middle"
      >
        3D Medical Visualization
      </Text>
    </Suspense>
  );
}

export function HumanBodyVisualization() {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [symptomIntensity, setSymptomIntensity] = useState(0.5);
  const [isAnimating, setIsAnimating] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<
    [number, number, number]
  >([0, 0, 200]);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    getMedicalHistory,
    getMedicalSummary,
    loading: medicalLoading,
  } = useMedicalRecords();
  const [medicalConditions, setMedicalConditions] = useState<
    Array<{
      condition: string;
      area: string;
      severity: string;
      details: string;
    }>
  >([]);

  useEffect(() => {
    const loadMedicalData = async () => {
      try {
        const [records, summary] = await Promise.all([
          getMedicalHistory(),
          getMedicalSummary(),
        ]);

        const conditions: {
          condition: string;
          area: string;
          severity: string;
          details: string;
        }[] = [];

        if (summary?.chronic_conditions) {
          summary.chronic_conditions.forEach((condition) => {
            let area = "chest";
            let severity = "medium";

            if (
              condition.toLowerCase().includes("hypertension") ||
              condition.toLowerCase().includes("heart")
            ) {
              area = "hypertension";
              severity = "high";
            } else if (condition.toLowerCase().includes("diabetes")) {
              area = "abdomen";
              severity = "high";
            } else if (condition.toLowerCase().includes("kidney")) {
              area = "kidney";
              severity = "medium";
            }

            conditions.push({
              condition: condition,
              area: area,
              severity: severity,
              details: `Chronic condition requiring ongoing monitoring and treatment.`,
            });
          });
        }

        records.slice(0, 3).forEach((record) => {
          if (record.diagnosis) {
            let area = "chest";
            let severity = "low";

            if (record.diagnosis.toLowerCase().includes("hypertension")) {
              area = "hypertension";
              severity = "high";
            } else if (record.diagnosis.toLowerCase().includes("heart")) {
              area = "heart";
              severity = "high";
            } else if (
              record.diagnosis.toLowerCase().includes("head") ||
              record.diagnosis.toLowerCase().includes("migraine")
            ) {
              area = "head";
              severity = "medium";
            }

            conditions.push({
              condition: record.diagnosis,
              area: area,
              severity: severity,
              details:
                record.notes || record.treatment || "Recent medical diagnosis",
            });
          }
        });

        setMedicalConditions(conditions);
      } catch (error) {
        console.error("Error loading medical data:", error);
      }
    };

    loadMedicalData();
  }, [getMedicalHistory, getMedicalSummary]);

  const bodyParts = {
    head: { name: "Head", conditions: ["Headache", "Migraine", "Sinusitis"] },
    chest: {
      name: "Chest",
      conditions: ["Chest Pain", "Breathing Issues", "Heart Problems"],
    },
    abdomen: {
      name: "Abdomen",
      conditions: ["Stomach Pain", "Nausea", "Digestive Issues"],
    },
    leftArm: {
      name: "Left Arm",
      conditions: ["Arm Pain", "Joint Issues", "Muscle Strain"],
    },
    rightArm: {
      name: "Right Arm",
      conditions: ["Arm Pain", "Joint Issues", "Muscle Strain"],
    },
    leftLeg: {
      name: "Left Leg",
      conditions: ["Leg Pain", "Knee Issues", "Muscle Cramps"],
    },
    rightLeg: {
      name: "Right Leg",
      conditions: ["Leg Pain", "Knee Issues", "Muscle Cramps"],
    },
  };

  const handleBodyPartClick = useCallback(
    (part: string) => {
      setSelectedBodyPart(part === selectedBodyPart ? null : part);
    },
    [selectedBodyPart]
  );

  const handleSymptomIntensityChange = useCallback((value: number[]) => {
    setSymptomIntensity(value[0]);
  }, []);

  const resetView = useCallback(() => {
    setCameraPosition([0, 0, 200]);
    setSelectedBodyPart(null);
    setSymptomIntensity(0.5);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="h-screen flex bg-gradient-to-br from-slate-50 to-emerald-50"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="w-80 bg-white/90 backdrop-blur-xl border-r border-emerald-200 p-6 overflow-y-auto"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">
              3D Body Scanner
            </h2>
            <p className="text-emerald-600 text-sm">
              Click on body parts to analyze symptoms
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Visualization Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAnimating(!isAnimating)}
                  className="flex-1"
                >
                  {isAnimating ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isAnimating ? "Pause" : "Play"}
                </Button>
                <Button variant="outline" size="sm" onClick={resetView}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Symptom Intensity: {Math.round(symptomIntensity * 100)}%
                </label>
                <Slider
                  value={[symptomIntensity]}
                  onValueChange={handleSymptomIntensityChange}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Medical Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medicalLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">
                    Loading medical data...
                  </span>
                </div>
              ) : medicalConditions.length > 0 ? (
                <div className="space-y-2">
                  {medicalConditions.map((condition, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer"
                      onClick={() => handleBodyPartClick(condition.area)}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          className={`w-4 h-4 mt-0.5 ${
                            condition.severity === "high"
                              ? "text-red-500"
                              : condition.severity === "medium"
                              ? "text-orange-500"
                              : "text-yellow-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm text-red-900">
                            {condition.condition}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            {condition.details.slice(0, 60)}...
                          </p>
                          <Badge
                            variant="outline"
                            className={`mt-1 text-xs ${
                              condition.severity === "high"
                                ? "border-red-300 text-red-700"
                                : condition.severity === "medium"
                                ? "border-orange-300 text-orange-700"
                                : "border-yellow-300 text-yellow-700"
                            }`}
                          >
                            {condition.severity} priority
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 py-4">
                  No medical conditions found in your records.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Body Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(bodyParts).map(([key, part]) => (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={selectedBodyPart === key ? "default" : "ghost"}
                      className={`w-full justify-start h-auto p-3 ${
                        selectedBodyPart === key
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : "hover:bg-emerald-50"
                      }`}
                      onClick={() => handleBodyPartClick(key)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{part.name}</div>
                        <div className="text-xs opacity-70">
                          {part.conditions.slice(0, 2).join(", ")}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <AnimatePresence>
            {selectedBodyPart && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      {
                        bodyParts[selectedBodyPart as keyof typeof bodyParts]
                          ?.name
                      }{" "}
                      Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          Intensity: {Math.round(symptomIntensity * 100)}%
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Common Conditions:
                        </h4>
                        <div className="space-y-1">
                          {bodyParts[
                            selectedBodyPart as keyof typeof bodyParts
                          ]?.conditions.map((condition, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="mr-1 mb-1"
                            >
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="flex-1 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="w-full h-full"
        >
          <Canvas
            camera={{ position: cameraPosition, fov: 60 }}
            shadows
            className="bg-gradient-to-b from-blue-50 to-emerald-50"
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <pointLight position={[-10, -10, -5]} intensity={0.3} />

            <HumanBodyModel
              selectedBodyPart={selectedBodyPart}
              symptomIntensity={symptomIntensity}
              isAnimating={isAnimating}
              onBodyPartClick={handleBodyPartClick}
              medicalConditions={medicalConditions}
            />

            <ContactShadows
              position={[0, -2, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
            />

            <Environment preset="studio" />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={20}
              maxDistance={150}
              target={[0, 0, 0]}
            />
          </Canvas>
        </motion.div>

        <div className="absolute top-4 right-4 space-y-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Badge className="bg-emerald-500 text-white">
              <Brain className="w-3 h-3 mr-1" />
              AI Analysis Active
            </Badge>
          </motion.div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-emerald-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-sm">98.6°F</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm">72 BPM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Normal</span>
                </div>
              </div>
              <Badge variant="secondary">Real-time Monitoring</Badge>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
