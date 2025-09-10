"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Image from "next/image";
import "leaflet/dist/leaflet.css";
import "@/styles/mobile-map.css";

// Créer une icône personnalisée avec le logo SelfCamp (responsive mobile)
const createAnimatedIcon = (isHovered: boolean) => {
  const mobile =
    typeof window !== "undefined" &&
    (window.innerWidth <= 768 || "ontouchstart" in window);
  const baseSize = mobile ? 32 : 28; // Plus grand sur mobile pour faciliter le touch
  const iconSize = isHovered
    ? [baseSize + 7, baseSize + 7]
    : [baseSize, baseSize];
  const pulseOpacity = isHovered ? "0.4" : "0.2";

  return L.divIcon({
    html: `
      <div class="map-pin-container" style="
        width: ${iconSize[0]}px;
        height: ${iconSize[1]}px;
        position: relative;
        transition: all 0.3s ease;
        cursor: pointer;
        ${isHovered ? "animation: pinBounce 1.5s ease-in-out infinite;" : ""}
        touch-action: manipulation;
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
          touch-action: manipulation;
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
          25% { transform: translateY(-3px) scale(1.02); }
          50% { transform: translateY(-5px) scale(1.05); }
          75% { transform: translateY(-2px) scale(1.02); }
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

interface DirectMapProps {
  establishments: Establishment[];
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
    if (
      center &&
      typeof center.lat === "number" &&
      typeof center.lng === "number"
    ) {
      console.log("MapUpdater - Centrage sur:", center, "zoom:", zoom);
      map.setView([center.lat, center.lng], zoom || map.getZoom());
    } else if (center) {
      console.error("Coordonnées invalides:", center);
    }
  }, [center, zoom, map]);

  return null;
};

// Composant de marqueur pour les établissements
const EstablishmentMarker = ({
  establishment,
  isHovered,
  onMarkerClick,
  availabilityData,
}: {
  establishment: Establishment;
  isHovered: boolean;
  onMarkerClick?: (establishmentId: string) => void;
  availabilityData?: Record<
    string,
    {
      availableRooms: number;
      totalRooms: number;
      status: "available" | "limited" | "full";
      nextAvailable?: string | null;
    }
  >;
}) => {
  const handleClick = () => {
    if (onMarkerClick) {
      onMarkerClick(establishment.id);
    }
  };

  const mobile =
    typeof window !== "undefined" &&
    (window.innerWidth <= 768 || "ontouchstart" in window);

  // Récupérer les données de disponibilité pour cet établissement
  const availability = availabilityData?.[establishment.slug];

  const getAvailabilityInfo = () => {
    if (!availability) {
      return {
        text: "Information non disponible",
        color: "text-gray-500",
        emoji: "ℹ️",
      };
    }

    const { availableRooms, totalRooms, status, nextAvailable } = availability;

    switch (status) {
      case "available":
        return {
          text: `${availableRooms}/${totalRooms} places disponibles`,
          color: "text-green-600 font-medium",
          emoji: "✅",
        };
      case "limited":
        return {
          text: `${availableRooms}/${totalRooms} places disponibles`,
          color: "text-orange-600 font-medium",
          emoji: "⚠️",
        };
      case "full":
        return nextAvailable
          ? {
              text: `Complet - Libre le ${nextAvailable}`,
              color: "text-red-600",
              emoji: "📅",
            }
          : { text: "Complet", color: "text-red-600", emoji: "❌" };
      default:
        return { text: "Statut inconnu", color: "text-gray-500", emoji: "❓" };
    }
  };

  const availabilityInfo = getAvailabilityInfo();

  // Fonction pour ouvrir Google Maps avec les coordonnées
  const openGoogleMaps = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation vers le popup
    const url = `https://www.google.com/maps/dir/?api=1&destination=${establishment.latitude},${establishment.longitude}&destination_place_id=${encodeURIComponent(establishment.name)}`;
    window.open(url, "_blank");
  };

  // Fonction pour ouvrir la page de réservation
  const openBookingPage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation vers le popup
    // Créer l'URL de réservation avec le slug de l'établissement
    const bookingUrl = `/${establishment.slug}`;
    window.open(bookingUrl, "_blank");
  };

  return (
    <Marker
      position={[establishment.latitude, establishment.longitude]}
      icon={createAnimatedIcon(isHovered)}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Popup
        closeButton={true}
        autoClose={false}
        autoPan={true}
        // Configuration mobile-friendly pour les popups
        maxWidth={mobile ? 280 : 300}
        minWidth={mobile ? 250 : 200}
        className="mobile-popup"
      >
        <div className={`${mobile ? "p-1" : "p-2"}`}>
          {/* Image de l'établissement */}
          {establishment.image && (
            <div className="mb-3">
              <Image
                src={establishment.image}
                alt={establishment.name}
                width={280}
                height={96}
                className="w-full h-24 object-cover rounded-lg"
                onError={(e) => {
                  // Image de fallback si l'image principale ne charge pas
                  e.currentTarget.src = "/selfcamp_logo.png";
                }}
              />
            </div>
          )}
          <h3 className="font-semibold text-[#9EA173] text-base mb-2 leading-tight">
            {establishment.name}
          </h3>
          {/* Informations de disponibilité - design harmonisé Selfcamp */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                availabilityInfo.text.includes("26/26")
                  ? "bg-green-100 text-green-700"
                  : availabilityInfo.text.includes("Complet")
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
              }`}
            >
              <span>{availabilityInfo.emoji}</span>
              <span>{availabilityInfo.text}</span>
            </div>
          </div>{" "}
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
            <span>📍</span>
            <span>{establishment.location}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {establishment.description}
          </p>
          {/* Petite note discrète sur la réservation avec style Selfcamp */}
          <div
            className="text-xs mb-3 flex items-center gap-1"
            style={{ color: "#C4A484" }}
          >
            <span>ℹ️</span>
            <span>Réservation en ligne disponible</span>
          </div>
          {/* Boutons d'action */}
          <div className="flex gap-2">
            {/* Bouton GPS avec style Selfcamp */}
            <button
              onClick={openGoogleMaps}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-action-manipulation flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#2D4A34",
                color: "#C4A484",
                border: "1px solid #C4A484",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1e3d3d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2D4A34";
              }}
            >
              <span>🧭</span>
              <span>GPS</span>
            </button>

            {/* Bouton réserver avec style Selfcamp */}
            <button
              onClick={openBookingPage}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-action-manipulation"
              style={{
                backgroundColor: "#C4A484",
                color: "#2D4A34",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#B5987A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#C4A484";
              }}
            >
              Réserver
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Composant de géolocalisation pour mobile - utilise la géolocalisation native de Leaflet
const MobileLocationComponent = () => {
  const map = useMap();

  useEffect(() => {
    const mobile = window.innerWidth <= 768 || "ontouchstart" in window;

    if (mobile && navigator.geolocation) {
      // Localiser l'utilisateur automatiquement sur mobile avec le style natif de Leaflet
      map.locate({
        setView: false, // Ne pas centrer automatiquement
        maxZoom: 16,
        timeout: 10000,
        maximumAge: 60000,
        enableHighAccuracy: true,
      });

      // Gérer la géolocalisation réussie - laisser Leaflet gérer l'affichage
      const onLocationFound = (e: L.LocationEvent) => {
        // Utiliser le cercle de géolocalisation natif de Leaflet (rond bleu)
        L.circleMarker([e.latlng.lat, e.latlng.lng], {
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.8,
          radius: 8,
          weight: 2,
        })
          .addTo(map)
          .bindPopup("Votre position actuelle");
      };

      // Gérer les erreurs de géolocalisation
      const onLocationError = (e: L.ErrorEvent) => {
        console.log("Géolocalisation échouée:", e.message);
        // Ne pas afficher d'alerte sur mobile, juste log silencieux
      };

      map.on("locationfound", onLocationFound);
      map.on("locationerror", onLocationError);

      // Cleanup
      return () => {
        map.off("locationfound", onLocationFound);
        map.off("locationerror", onLocationError);
      };
    }
  }, [map]);

  return null;
};

export default function DirectMap({
  establishments,
  hoveredEstablishmentId,
  onMarkerClick,
  center,
  zoom = 6,
  availabilityData,
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
  if (!mounted || typeof window === "undefined") {
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

  // Configuration mobile-friendly
  const mobile =
    typeof window !== "undefined" &&
    (window.innerWidth <= 768 || "ontouchstart" in window);

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg"
      // Configuration optimisée pour mobile
      touchZoom={true}
      doubleClickZoom={true}
      scrollWheelZoom={mobile ? false : true} // Désactiver scroll zoom sur mobile
      boxZoom={false}
      keyboard={false}
      dragging={true}
      zoomControl={true}
      attributionControl={true}
      // Options spécifiques mobile
      {...(mobile && {
        maxZoom: 18,
        minZoom: 6,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
      })}
    >
      <MapUpdater center={center} zoom={zoom} />
      <MobileLocationComponent />
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
          availabilityData={availabilityData}
        />
      ))}
    </MapContainer>
  );
}
