"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// Créer une icône personnalisée avec animation
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
        
        <!-- Pin principal rond -->
        <div class="map-pin" style="
          width: ${iconSize[0]}px;
          height: ${iconSize[1]}px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Point central du pin -->
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      </div>
      
      <style>
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: ${pulseOpacity}; }
          100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
        }
        
        @keyframes pinBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
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

interface MapComponentProps {
  hoveredEstablishmentId?: string | null;
  onMarkerClick?: (establishmentId: string) => void;
  center?: { lat: number; lng: number } | null;
  zoom?: number;
  onMapMove?: (bounds: {
    center: { lat: number; lng: number };
    zoom: number;
  }) => void;
}

// Composant de marqueur animé
const AnimatedMarker = ({
  spot,
  isHovered,
  onMarkerClick,
}: {
  spot: Establishment;
  isHovered: boolean;
  onMarkerClick?: (establishmentId: string) => void;
}) => {
  const [markerRef, setMarkerRef] = useState<L.Marker | null>(null);

  useEffect(() => {
    if (markerRef) {
      const newIcon = createAnimatedIcon(isHovered);
      markerRef.setIcon(newIcon);
    }
  }, [isHovered, markerRef]);

  const handleClick = () => {
    if (onMarkerClick) {
      onMarkerClick(spot.id);
    }
  };

  return (
    <Marker
      key={spot.id}
      position={[spot.latitude, spot.longitude]}
      icon={createAnimatedIcon(isHovered)}
      ref={(ref) => setMarkerRef(ref)}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Popup>
        <div className="text-center">
          <h3 className="font-semibold text-[#9EA173]">{spot.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{spot.description}</p>
          <p className="text-xs text-gray-500 mb-1">{spot.location}</p>
          <p className="font-bold text-[#A8B17A]">{spot.price}</p>
        </div>
      </Popup>
    </Marker>
  );
};

// Composant pour mettre à jour la vue de la carte
const MapUpdater = ({
  center,
  zoom,
}: {
  center?: { lat: number; lng: number } | null;
  zoom?: number;
}) => {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, map]);

  return null;
};

// Composant pour gérer les événements de la carte
const MapEvents = ({
  onMapMove,
}: {
  onMapMove?: (bounds: {
    center: { lat: number; lng: number };
    zoom: number;
  }) => void;
}) => {
  useMapEvents({
    moveend: (e) => {
      if (onMapMove) {
        const map = e.target;
        const center = map.getCenter();
        const zoom = map.getZoom();
        onMapMove({
          center: { lat: center.lat, lng: center.lng },
          zoom: zoom,
        });
      }
    },
  });
  return null;
};

export default function MapComponent({
  hoveredEstablishmentId,
  onMarkerClick,
  center,
  zoom = 6,
  onMapMove,
}: MapComponentProps) {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstablishments = async () => {
      try {
        const response = await fetch("/api/public/establishments");
        if (response.ok) {
          const data = await response.json();
          setEstablishments(data);
        } else {
          console.error("Erreur lors du chargement des établissements");
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishments();
  }, []);

  // Données par défaut si pas d'établissements
  const defaultSpots = [
    {
      id: "default-1",
      name: "Le Pied Total",
      latitude: 46.8182,
      longitude: 7.1619,
      price: "25 CHF/nuit",
      type: "camping",
      description: "Magnificent bucolic square between garden and forest",
      location: "Fribourg, Switzerland",
    },
  ];

  const spotsToShow = establishments.length > 0 ? establishments : defaultSpots;

  // Définir les limites de la carte (Europe occidentale avec focus sur Suisse/France)
  const maxBounds: [[number, number], [number, number]] = [
    [42.0, -5.0], // Sud-Ouest (limite sud pour éviter de descendre trop)
    [51.5, 15.0], // Nord-Est (couvre bien la Suisse, France, Allemagne du sud)
  ];

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Chargement des emplacements...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={
        center
          ? [center.lat, center.lng]
          : spotsToShow.length > 0
            ? [spotsToShow[0].latitude, spotsToShow[0].longitude]
            : [46.8182, 7.1619]
      }
      zoom={center ? zoom : 10}
      style={{ height: "100%", width: "100%" }}
      maxBounds={maxBounds}
      maxBoundsViscosity={1.0}
      minZoom={6}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} zoom={zoom} />
      <MapEvents onMapMove={onMapMove} />
      {spotsToShow.map((spot) => (
        <AnimatedMarker
          key={spot.id}
          spot={spot}
          isHovered={hoveredEstablishmentId === spot.id}
          onMarkerClick={onMarkerClick}
        />
      ))}
    </MapContainer>
  );
}
