import { Anatomy3DViewer } from "@/components/anatomy-3d-viewer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Anatomy Viewer | MedIQ",
  description: "Interactive 3D human anatomy visualization powered by Three.js",
};

export default function Anatomy3DPage() {
  return (
    <div className="min-h-screen">
      <Anatomy3DViewer />
    </div>
  );
}
