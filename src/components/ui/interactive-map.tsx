"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { VanLoading } from "@/components/ui/van-loading";

interface Establishment {
  id: string;
  slug: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  price: string;
  type: string;
  description: string;
  image?: string;
  amenities?: string[];
}

interface InteractiveMapProps {
  establishments?: Establishment[]; // Ajouter les établissements
  fullHeight?: boolean;
  showTitle?: boolean;
  hoveredEstablishmentId?: string | null;
  onMarkerClick?: (establishmentId: string) => void;
  center?: { lat: number; lng: number } | null;
  zoom?: number;
  availabilityData?: Record<
    string,
    {
      availableRooms: number;
      totalRooms: number;
      status: "available" | "limited" | "full";
      nextAvailable?: string | null;
    }
  >;
  disableAutoGeolocation?: boolean;
}

// Composant Map dynamique pour éviter les problèmes SSR
const DirectMap = dynamic(() => import("@/components/ui/direct-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-lg">
      <VanLoading message="Chargement de la carte..." size="md" />
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
  availabilityData,
  disableAutoGeolocation = false,
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
        className={`w-full ${fullHeight ? "h-screen" : "h-96"} bg-gray-50 flex items-center justify-center rounded-lg`}
      >
        <VanLoading message="Préparation de votre carte..." size="md" />
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
          availabilityData={availabilityData}
          disableAutoGeolocation={disableAutoGeolocation}
        />
      </div>
    </div>
  );
}
