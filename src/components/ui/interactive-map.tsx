"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface InteractiveMapProps {
  fullHeight?: boolean;
  showTitle?: boolean;
}

// Composant Map dynamique pour éviter les problèmes SSR
const DynamicMap = dynamic(() => import("@/components/ui/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
      <div className="text-gray-500">Chargement de la carte...</div>
    </div>
  ),
});

export default function InteractiveMap({
  fullHeight = false,
  showTitle = true,
}: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-full ${fullHeight ? "h-screen" : "h-96"} bg-gray-100 flex items-center justify-center rounded-lg`}
      >
        <div className="text-gray-500">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {showTitle && (
        <h2 className="text-2xl font-bold text-center mb-6 text-[#9EA173]">
          Emplacements disponibles
        </h2>
      )}
      <div
        className={`w-full ${fullHeight ? "h-full" : "h-96"} rounded-lg overflow-hidden`}
      >
        <DynamicMap />
      </div>
    </div>
  );
}
