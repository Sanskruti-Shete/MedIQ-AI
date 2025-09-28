"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Html,
  useGLTF,
  Text,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  Brain,
  Activity,
  Loader2,
} from "lucide-react";
import * as THREE from "three";

// GLB Model Component
function AnatomyModel({
  isAnimating,
  intensity,
  selectedPart,
}: {
  isAnimating: boolean;
  intensity: number;
  selectedPart: string | null;
}) {
  const modelRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/human_anatomy.glb");

  // Clone the scene to avoid modifying the original
  const clonedScene = scene.clone();

  useFrame((state) => {
    if (modelRef.current && isAnimating) {
      // Gentle breathing animation
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.01;
      modelRef.current.scale.setScalar(breathingScale);

      // Subtle rotation
      modelRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={clonedScene} scale={[2, 2, 2]} position={[0, -1, 0]} />

      {/* Interactive elements overlay */}
      {selectedPart && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-blue-200 min-w-[200px]">
            <h3 className="text-lg font-semibold text-blue-900 capitalize mb-1">
              {selectedPart}
            </h3>
            <p className="text-sm text-blue-600 mb-2">
              Analysis Intensity: {Math.round(intensity * 100)}%
            </p>
            <div className="flex gap-1">
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
              <Badge variant="outline" className="text-xs">
                3D Model
              </Badge>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Loading Component
function ModelLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-gray-700">
          Loading 3D Anatomy Model...
        </p>
        <p className="text-xs text-gray-500">This may take a few moments</p>
      </div>
    </Html>
  );
}

// Error Fallback Component
function ModelError() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 p-6 bg-red-50 backdrop-blur-sm rounded-lg shadow-lg border border-red-200">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <Eye className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-sm font-medium text-red-700">
          Failed to load 3D model
        </p>
        <p className="text-xs text-red-500 text-center max-w-[250px]">
          Please ensure human_anatomy.glb exists in the public folder
        </p>
      </div>
    </Html>
  );
}

// Main Component
export function Anatomy3DViewer() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [intensity, setIntensity] = useState(0.7);
  const [selectedPart, setSelectedPart] = useState<string | null>("Full Body");
  const [cameraPosition, setCameraPosition] = useState<
    [number, number, number]
  >([5, 2, 5]);
  const [viewMode, setViewMode] = useState<"perspective" | "orthographic">(
    "perspective"
  );

  const anatomyParts = [
    "Full Body",
    "Skeletal System",
    "Muscular System",
    "Circulatory System",
    "Nervous System",
    "Respiratory System",
    "Digestive System",
  ];

  const resetView = () => {
    setCameraPosition([5, 2, 5]);
    setSelectedPart("Full Body");
    setIntensity(0.7);
  };

  const zoomIn = () => {
    setCameraPosition((prev) => [prev[0] * 0.8, prev[1] * 0.8, prev[2] * 0.8]);
  };

  const zoomOut = () => {
    setCameraPosition((prev) => [prev[0] * 1.2, prev[1] * 1.2, prev[2] * 1.2]);
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Control Panel */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="w-80 bg-white/95 backdrop-blur-xl border-r border-blue-200 p-6 overflow-y-auto shadow-xl"
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 mb-2">
              3D Anatomy Viewer
            </h1>
            <p className="text-blue-600 text-sm">
              Interactive human anatomy visualization
            </p>
          </div>

          {/* Viewer Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Viewer Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAnimating(!isAnimating)}
                  className="flex items-center gap-1"
                >
                  {isAnimating ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  {isAnimating ? "Pause" : "Play"}
                </Button>
                <Button variant="outline" size="sm" onClick={resetView}>
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={zoomIn}>
                  <ZoomIn className="w-3 h-3" />
                  Zoom In
                </Button>
                <Button variant="outline" size="sm" onClick={zoomOut}>
                  <ZoomOut className="w-3 h-3" />
                  Zoom Out
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Detail Level: {Math.round(intensity * 100)}%
                </label>
                <Slider
                  value={[intensity]}
                  onValueChange={(value) => setIntensity(value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Anatomy Systems */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Anatomy Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {anatomyParts.map((part) => (
                  <motion.div
                    key={part}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={selectedPart === part ? "default" : "ghost"}
                      className={`w-full justify-start h-auto p-3 ${
                        selectedPart === part
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "hover:bg-blue-50"
                      }`}
                      onClick={() => setSelectedPart(part)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{part}</div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Selection Info */}
          <AnimatePresence>
            {selectedPart && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-500" />
                      Currently Viewing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          {selectedPart}
                        </h3>
                        <p className="text-sm text-blue-600 mt-1">
                          Interactive 3D visualization with detailed anatomy
                          structure
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          Intensity: {Math.round(intensity * 100)}%
                        </Badge>
                        <Badge variant={isAnimating ? "default" : "outline"}>
                          {isAnimating ? "Animated" : "Static"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="w-full h-full"
        >
          <Canvas
            camera={{
              position: cameraPosition,
              fov: 50,
              type:
                viewMode === "orthographic" ? "orthographic" : "perspective",
            }}
            shadows
            className="bg-gradient-to-b from-blue-50 to-indigo-100"
          >
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, -10, -5]} intensity={0.4} />
            <spotLight
              position={[0, 20, 10]}
              intensity={0.5}
              angle={0.3}
              penumbra={1}
              castShadow
            />

            {/* 3D Model */}
            <Suspense fallback={<ModelLoader />}>
              <AnatomyModel
                isAnimating={isAnimating}
                intensity={intensity}
                selectedPart={selectedPart}
              />
            </Suspense>

            {/* Ground Shadow */}
            <ContactShadows
              position={[0, -2.5, 0]}
              opacity={0.3}
              scale={15}
              blur={2}
              far={4}
            />

            {/* Environment */}
            <Environment preset="studio" />

            {/* Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={20}
              maxPolarAngle={Math.PI / 2}
              target={[0, 0, 0]}
            />
          </Canvas>
        </motion.div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4 space-y-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Badge className="bg-blue-500 text-white shadow-lg">
              <Brain className="w-3 h-3 mr-1" />
              3D Anatomy Active
            </Badge>
          </motion.div>
        </div>

        {/* Quick Info Panel */}
        <div className="absolute bottom-4 left-4 right-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{selectedPart}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Interactive View</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  GLB Model
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Real-time 3D
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Preload the GLB model
useGLTF.preload("/human_anatomy.glb");
