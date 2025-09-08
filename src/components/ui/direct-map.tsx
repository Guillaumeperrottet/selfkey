"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Créer une icône personnalisée avec le logo SelfCamp
const createAnimatedIcon = (isHovered: boolean) => {
  const iconSize = isHovered ? [35, 35] : [28, 28];
  const pulseOpacity = isHovered ? "0.4" : "0.2";

  return L.divIcon({
    html: `
      <div class="map-pin-container" style="
        width: ${iconSize[0]}px;
        height: ${iconSize[1]}px;
        position: relative;
        transition: all 0.3s ease;
        cursor: pointer;
        ${isHovered ? "animation: pinBounce 0.8s ease-in-out infinite;" : ""}
      ">
        <!-- Effet de pulse autour du pin -->
        <div class="pulse-ring" style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: ${iconSize[0] + 20}px;
          height: ${iconSize[0] + 20}px;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: ${pulseOpacity};
          animation: pulse 2s ease-out infinite;
        "></div>
        
        <!-- Logo SelfCamp -->
        <div class="map-pin" style="
          width: ${iconSize[0]}px;
          height: ${iconSize[1]}px;
          background: white;
          border: 3px solid #3b82f6;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        ">
          <!-- Logo image -->
          <img 
            src="/logo_map.png" 
            alt="SelfCamp" 
            style="
              width: ${iconSize[0] - 8}px;
              height: ${iconSize[1] - 8}px;
              object-fit: contain;
              border-radius: 50%;
            "
          />
        </div>
      </div>
      
      <style>
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: ${pulseOpacity}; }
          100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
        }
        
        @keyframes pinBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-4px) scale(1.05); }
          50% { transform: translateY(-8px) scale(1.1); }
          75% { transform: translateY(-4px) scale(1.05); }
        }
      </style>
    `,
    className: "",
    iconSize: iconSize as [number, number],
    iconAnchor: [iconSize[0] / 2, iconSize[1] / 2] as [number, number],
  });
};

// Fixer les icônes Leaflet par défaut
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

interface DirectMapProps {
  establishments: Establishment[];
  hoveredEstablishmentId?: string | null;
  onMarkerClick?: (establishmentId: string) => void;
  center?: { lat: number; lng: number } | null;
  zoom?: number;
}

// Composant pour mettre à jour la carte quand les props changent
const MapUpdater = ({
  center,
  zoom,
}: {
  center?: { lat: number; lng: number } | null;
  zoom?: number;
}) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      console.log("MapUpdater - Centrage sur:", center, "zoom:", zoom);
      map.setView([center.lat, center.lng], zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  return null;
};

// Composant de marqueur pour les établissements
const EstablishmentMarker = ({
  establishment,
  isHovered,
  onMarkerClick,
}: {
  establishment: Establishment;
  isHovered: boolean;
  onMarkerClick?: (establishmentId: string) => void;
}) => {
  const handleClick = () => {
    if (onMarkerClick) {
      onMarkerClick(establishment.id);
    }
  };

  return (
    <Marker
      position={[establishment.latitude, establishment.longitude]}
      icon={createAnimatedIcon(isHovered)}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Popup>
        <div className="text-center">
          <h3 className="font-semibold text-[#9EA173]">{establishment.name}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {establishment.description}
          </p>
          <p className="text-xs text-gray-500">{establishment.location}</p>
        </div>
      </Popup>
    </Marker>
  );
};

export default function DirectMap({
  establishments,
  hoveredEstablishmentId,
  onMarkerClick,
  center,
  zoom = 6,
}: DirectMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Log pour debug
  useEffect(() => {
    console.log(
      "DirectMap - Establishments reçus:",
      establishments?.length,
      establishments
    );
  }, [establishments]);

  // Ne pas rendre côté serveur
  if (!mounted || typeof window === 'undefined') {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-gray-500">Chargement de la carte...</div>
      </div>
    );
  }

  // Coordonnées par défaut (Suisse)
  const defaultCenter: [number, number] = [46.8182, 8.2275];
  const mapCenter: [number, number] = center
    ? [center.lat, center.lng]
    : defaultCenter;

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg"
    >
      <MapUpdater center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Marqueurs des établissements */}
      {establishments.map((establishment) => (
        <EstablishmentMarker
          key={establishment.id}
          establishment={establishment}
          isHovered={hoveredEstablishmentId === establishment.id}
          onMarkerClick={onMarkerClick}
        />
      ))}
    </MapContainer>
  );
}
