"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Text,
  Html,
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
} from "lucide-react";
import type * as THREE from "three";

// Enhanced Human Body Model with medical visualization
function HumanBodyModel({
  selectedBodyPart,
  symptomIntensity,
  isAnimating,
  onBodyPartClick,
}: {
  selectedBodyPart: string | null;
  symptomIntensity: number;
  isAnimating: boolean;
  onBodyPartClick: (part: string) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useThree();

  // Body parts with medical mapping
  const bodyParts = {
    head: {
      position: [0, 1.7, 0],
      color: "#ff6b6b",
      conditions: ["Headache", "Migraine", "Sinusitis"],
    },
    chest: {
      position: [0, 1, 0],
      color: "#4ecdc4",
      conditions: ["Chest Pain", "Breathing Issues", "Heart Problems"],
    },
    abdomen: {
      position: [0, 0.3, 0],
      color: "#45b7d1",
      conditions: ["Stomach Pain", "Nausea", "Digestive Issues"],
    },
    leftArm: {
      position: [-0.8, 1, 0],
      color: "#96ceb4",
      conditions: ["Arm Pain", "Joint Issues", "Muscle Strain"],
    },
    rightArm: {
      position: [0.8, 1, 0],
      color: "#96ceb4",
      conditions: ["Arm Pain", "Joint Issues", "Muscle Strain"],
    },
    leftLeg: {
      position: [-0.3, -0.8, 0],
      color: "#feca57",
      conditions: ["Leg Pain", "Knee Issues", "Muscle Cramps"],
    },
    rightLeg: {
      position: [0.3, -0.8, 0],
      color: "#feca57",
      conditions: ["Leg Pain", "Knee Issues", "Muscle Cramps"],
    },
  };

  useFrame((state) => {
    if (meshRef.current && isAnimating) {
      // Breathing animation
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      meshRef.current.scale.setScalar(breathingScale);

      // Gentle rotation
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main body structure */}
      {Object.entries(bodyParts).map(([partName, part]) => (
        <group key={partName} position={part.position}>
          <mesh
            onClick={() => onBodyPartClick(partName)}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "auto";
            }}
          >
            {partName === "head" && <sphereGeometry args={[0.15, 32, 32]} />}
            {partName === "chest" && <boxGeometry args={[0.4, 0.6, 0.2]} />}
            {partName === "abdomen" && <boxGeometry args={[0.35, 0.4, 0.18]} />}
            {(partName === "leftArm" || partName === "rightArm") && (
              <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
            )}
            {(partName === "leftLeg" || partName === "rightLeg") && (
              <capsuleGeometry args={[0.1, 0.8, 4, 8]} />
            )}

            <meshStandardMaterial
              color={selectedBodyPart === partName ? part.color : "#e8f4f8"}
              transparent
              opacity={selectedBodyPart === partName ? 0.8 : 0.6}
              emissive={selectedBodyPart === partName ? part.color : "#000000"}
              emissiveIntensity={
                selectedBodyPart === partName ? symptomIntensity * 0.3 : 0
              }
            />
          </mesh>

          {/* Symptom visualization particles */}
          {selectedBodyPart === partName && (
            <group>
              {Array.from({ length: 10 }).map((_, i) => (
                <mesh
                  key={i}
                  position={[
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5,
                  ]}
                >
                  <sphereGeometry args={[0.02, 8, 8]} />
                  <meshBasicMaterial
                    color={part.color}
                    transparent
                    opacity={0.6}
                  />
                </mesh>
              ))}
            </group>
          )}

          {/* Body part labels */}
          {selectedBodyPart === partName && (
            <Html position={[0, 0.3, 0]} center>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-emerald-200">
                <p className="text-sm font-medium text-emerald-900 capitalize">
                  {partName}
                </p>
                <p className="text-xs text-emerald-600">
                  Intensity: {Math.round(symptomIntensity * 100)}%
                </p>
              </div>
            </Html>
          )}
        </group>
      ))}

      {/* Vital signs visualization */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.1}
        color="#059669"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.ttf"
      >
        3D Medical Visualization
      </Text>
    </group>
  );
}

export function HumanBodyVisualization() {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [symptomIntensity, setSymptomIntensity] = useState(0.5);
  const [isAnimating, setIsAnimating] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<
    [number, number, number]
  >([0, 0, 3]);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleBodyPartClick = (part: string) => {
    setSelectedBodyPart(part === selectedBodyPart ? null : part);
  };

  const resetView = () => {
    setCameraPosition([0, 0, 3]);
    setSelectedBodyPart(null);
    setSymptomIntensity(0.5);
  };

  return (
    <motion.div
      ref={containerRef}
      className="h-screen flex bg-gradient-to-br from-slate-50 to-emerald-50"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Control Panel */}
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

          {/* Controls */}
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
                  onValueChange={(value) => setSymptomIntensity(value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Body Parts List */}
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

          {/* Selected Body Part Info */}
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

      {/* 3D Visualization */}
      <div className="flex-1 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="w-full h-full"
        >
          <Canvas
            camera={{ position: cameraPosition, fov: 50 }}
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
              minDistance={1}
              maxDistance={10}
            />
          </Canvas>
        </motion.div>

        {/* Floating UI Elements */}
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
