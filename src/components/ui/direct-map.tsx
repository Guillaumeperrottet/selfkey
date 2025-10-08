"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MapPin } from "lucide-react";
import { VanLoading } from "@/components/ui/van-loading";
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
          border: 2px solid #84994F;
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
          border: 3px solid #84994F;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(132, 153, 79, 0.3);
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
  isPubliclyVisible?: boolean;
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
  disableAutoGeolocation?: boolean;
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
        closeButton={false}
        autoClose={false}
        autoPan={true}
        // Configuration mobile-friendly pour les popups
        maxWidth={mobile ? 320 : 300}
        minWidth={mobile ? 300 : 200}
        className="mobile-popup"
      >
        <div className={`${mobile ? "overflow-hidden" : "p-3"}`}>
          {/* Image de l'établissement */}
          {establishment.image && (
            <div className={`${mobile ? "mb-3 -mx-3 -mt-3" : "mb-3"}`}>
              <Image
                src={establishment.image}
                alt={establishment.name}
                width={320}
                height={mobile ? 100 : 96}
                className={`w-full ${mobile ? "h-[100px]" : "h-24 rounded-lg"} object-cover`}
                onError={(e) => {
                  // Image de fallback si l'image principale ne charge pas
                  e.currentTarget.src = "/selfcamp_logo.png";
                }}
              />
            </div>
          )}
          <div className={`${mobile ? "px-3 pb-2" : ""}`}>
            {/* Titre - cliquable si page publique disponible */}
            {establishment.isPubliclyVisible ? (
              <a
                href={`/establishment/${establishment.slug}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={`font-bold text-gray-900 hover:text-[#84994F] transition-colors cursor-pointer block ${mobile ? "text-base mb-2 leading-tight" : "text-lg mb-3 leading-tight"}`}
              >
                {establishment.name}
                <span className="inline-block ml-1 text-[#84994F]">→</span>
              </a>
            ) : (
              <h3
                className={`font-bold text-gray-900 ${mobile ? "text-base mb-2 leading-tight" : "text-lg mb-3 leading-tight"}`}
              >
                {establishment.name}
              </h3>
            )}

            {/* Informations de disponibilité - design simplifié */}
            <div
              className={`flex items-center ${mobile ? "gap-1.5 mb-2.5" : "gap-2 mb-3"}`}
            >
              <div
                className={`inline-flex items-center ${mobile ? "gap-1 px-2 py-1 text-xs" : "gap-2 px-3 py-1.5 text-sm"} rounded-lg font-medium ${
                  availabilityInfo.text.includes("26/26") ||
                  availabilityInfo.text.includes("28/28")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : availabilityInfo.text.includes("Complet")
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-[#84994F]/10 text-[#84994F] border border-[#84994F]/20"
                }`}
              >
                <span
                  className={`${mobile ? "w-1.5 h-1.5" : "w-2 h-2"} rounded-full bg-current`}
                ></span>
                <span>{availabilityInfo.text}</span>
              </div>
            </div>

            <div
              className={`flex items-center ${mobile ? "gap-1.5 text-xs mb-2.5" : "gap-2 text-sm mb-3"} text-gray-600`}
            >
              <MapPin className={`${mobile ? "w-3 h-3" : "w-4 h-4"}`} />
              <span>{establishment.location}</span>
            </div>

            <p
              className={`${mobile ? "text-xs mb-2.5 leading-relaxed" : "text-sm mb-4 leading-relaxed"} text-gray-700`}
            >
              {establishment.description}
            </p>

            {/* Note sur la réservation */}
            <div
              className={`${mobile ? "text-xs mb-3 px-2 py-1.5 gap-1.5" : "text-sm mb-4 px-3 py-2 gap-2"} flex items-center text-[#84994F] bg-[#84994F]/5 rounded-lg`}
            >
              <div
                className={`${mobile ? "w-3 h-3 text-[10px]" : "w-4 h-4 text-xs"} rounded-full bg-[#84994F]/20 flex items-center justify-center`}
              >
                <span>ℹ️</span>
              </div>
              <span>Réservation en ligne disponible</span>
            </div>
            {/* Boutons d'action - design moderne et simple */}
            <div className={`flex ${mobile ? "gap-2.5" : "gap-3"} w-full`}>
              {/* Bouton GPS */}
              <button
                onClick={openGoogleMaps}
                className={`flex-1 ${mobile ? "px-3 py-2.5 text-sm" : "px-4 py-2.5 text-sm"} bg-white border-2 border-[#84994F] text-[#84994F] rounded-lg font-semibold hover:bg-[#84994F] hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer`}
              >
                <span className={`${mobile ? "text-base" : "text-base"}`}>
                  🧭
                </span>
                <span>GPS</span>
              </button>

              {/* Bouton réserver */}
              <button
                onClick={openBookingPage}
                className={`flex-1 ${mobile ? "px-3 py-2.5 text-sm" : "px-4 py-2.5 text-sm"} bg-[#84994F] text-white rounded-lg font-semibold hover:bg-[#84994F]/90 transition-all duration-200 cursor-pointer`}
              >
                Réserver
              </button>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

interface TaggedLayer extends L.Layer {
  _myTag?: string;
}

// Composant de géolocalisation pour mobile - utilise la géolocalisation native de Leaflet
const MobileLocationComponent = ({
  disabled = false,
}: {
  disabled?: boolean;
}) => {
  const map = useMap();

  useEffect(() => {
    // Ne pas activer la géolocalisation si elle est désactivée
    if (disabled) {
      console.log("Géolocalisation automatique désactivée");
      return;
    }

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

      // Gérer la géolocalisation réussie - marqueur style pin de localisation
      const onLocationFound = (e: L.LocationEvent) => {
        console.log("Position trouvée:", e.latlng, "Précision:", e.accuracy);

        // Créer un icône de pin de localisation classique (rouge)
        const locationPinIcon = L.divIcon({
          html: `
            <div style="
              width: 32px;
              height: 40px;
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
            ">
              <!-- Pin principal -->
              <div style="
                position: relative;
                width: 28px;
                height: 28px;
                background: #EF4444;
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 3px 10px rgba(239, 68, 68, 0.4);
              ">
                <!-- Point intérieur blanc -->
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 8px;
                  height: 8px;
                  background: white;
                  border-radius: 50%;
                "></div>
              </div>
              
              <!-- Ombre portée -->
              <div style="
                position: absolute;
                bottom: -2px;
                left: 50%;
                transform: translateX(-50%);
                width: 16px;
                height: 6px;
                background: rgba(0,0,0,0.3);
                border-radius: 50%;
                filter: blur(3px);
              "></div>
            </div>
          `,
          className: "user-location-pin",
          iconSize: [32, 40],
          iconAnchor: [16, 36],
          popupAnchor: [0, -40],
        });

        // Supprimer les anciens marqueurs de position si ils existent
        map.eachLayer((layer) => {
          const taggedLayer = layer as TaggedLayer;
          if (taggedLayer._myTag === "userPosition") {
            map.removeLayer(layer);
          }
        });

        // Ajouter le marqueur de localisation
        const userMarker = L.marker([e.latlng.lat, e.latlng.lng], {
          icon: locationPinIcon,
        }).addTo(map);

        // Marquer ce layer comme position utilisateur
        (userMarker as TaggedLayer)._myTag = "userPosition";

        // Ajouter un cercle de précision discret
        const accuracyCircle = L.circle([e.latlng.lat, e.latlng.lng], {
          color: "#EF4444",
          fillColor: "#EF4444",
          fillOpacity: 0.08,
          radius: e.accuracy,
          weight: 1,
          opacity: 0.3,
        }).addTo(map);

        // Marquer ce layer aussi
        (accuracyCircle as TaggedLayer)._myTag = "userPosition";

        // Popup simple et clair
        userMarker.bindPopup(`
          <div style="text-align: center; padding: 10px; font-family: system-ui, sans-serif; min-width: 180px;">
            <div style="font-weight: 600; color: #EF4444; margin-bottom: 6px; font-size: 15px;">
              📍 Votre position
            </div>
            <div style="font-size: 13px; color: #666; margin-bottom: 4px;">
              Vous êtes ici avec votre camping-car
            </div>
            <div style="font-size: 11px; color: #999;">
              Précision: ~${Math.round(e.accuracy)}m
            </div>
          </div>
        `);

        // Centrer la carte sur la position avec une animation douce
        map.setView([e.latlng.lat, e.latlng.lng], Math.max(map.getZoom(), 15), {
          animate: true,
          duration: 1.0,
        });

        console.log("Marqueur camping-car ajouté avec succès");
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
  }, [map, disabled]);

  return null;
};

export default function DirectMap({
  establishments,
  hoveredEstablishmentId,
  onMarkerClick,
  center,
  zoom = 6,
  availabilityData,
  disableAutoGeolocation = false,
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
      <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-lg">
        <VanLoading message="Initialisation de la carte..." size="md" />
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
      <MobileLocationComponent disabled={disableAutoGeolocation} />
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
