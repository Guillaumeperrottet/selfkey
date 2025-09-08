"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface Establishment {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  price: string;
  type: string;
  description: string;
}

interface InteractiveMapProps {
  establishments?: Establishment[]; // Ajouter les établissements
  fullHeight?: boolean;
  showTitle?: boolean;
  hoveredEstablishmentId?: string | null;
  onMarkerClick?: (establishmentId: string) => void;
  center?: { lat: number; lng: number } | null;
  zoom?: number;
}

// Composant Map dynamique pour éviter les problèmes SSR
const DirectMap = dynamic(() => import("@/components/ui/direct-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
      <div className="text-gray-500">Chargement de la carte...</div>
    </div>
  ),
});

export default function InteractiveMap({
  establishments = [], // Recevoir les établissements
  fullHeight = false,
  showTitle = true,
  hoveredEstablishmentId = null,
  onMarkerClick,
  center,
  zoom,
}: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug log
  useEffect(() => {
    console.log(
      "InteractiveMap - establishments received:",
      establishments?.length,
      establishments
    );
    console.log("InteractiveMap - About to pass to DirectMap:", establishments);
  }, [establishments]);

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
        <DirectMap
          establishments={establishments || []} // Passer les établissements
          hoveredEstablishmentId={hoveredEstablishmentId}
          onMarkerClick={onMarkerClick}
          center={center}
          zoom={zoom}
        />
      </div>
    </div>
  );
}
