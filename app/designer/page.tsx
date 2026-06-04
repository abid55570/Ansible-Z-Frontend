"use client";

import dynamic from "next/dynamic";

// React Flow needs the browser — load the canvas client-only (no SSR).
const Canvas = dynamic(() => import("@/components/designer/Canvas"), { ssr: false });

export default function DesignerPage() {
  return <Canvas />;
}
