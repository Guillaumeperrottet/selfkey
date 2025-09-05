"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import dynamique pour éviter les problèmes SSR avec Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Types pour les emplacements
interface ParkingSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  price: number;
  type: "camping" | "parking" | "premium";
  amenities: string[];
  available: boolean;
  image?: string;
  description: string;
}

// Données d'exemple d'emplacements de parking (basé sur la région de Berne/Fribourg)
const parkingSpots: ParkingSpot[] = [
  {
    id: "1",
    name: "Camping des Rives",
    lat: 46.8182,
    lng: 7.1619,
    price: 25,
    type: "camping",
    amenities: ["electricity", "water", "wifi", "toilets"],
    available: true,
    description: "Emplacement avec vue sur le lac, idéal pour les familles",
  },
  {
    id: "2",
    name: "Parking Montagne",
    lat: 46.8342,
    lng: 7.1892,
    price: 15,
    type: "parking",
    amenities: ["water", "toilets"],
    available: true,
    description: "Parking naturel en pleine montagne",
  },
  {
    id: "3",
    name: "Premium Lac Spot",
    lat: 46.8089,
    lng: 7.1456,
    price: 35,
    type: "premium",
    amenities: [
      "electricity",
      "water",
      "wifi",
      "toilets",
      "shower",
      "restaurant",
    ],
    available: false,
    description: "Emplacement premium avec tous les services",
  },
  {
    id: "4",
    name: "Forêt Tranquille",
    lat: 46.8256,
    lng: 7.1734,
    price: 20,
    type: "camping",
    amenities: ["water", "toilets", "wifi"],
    available: true,
    description: "Au cœur de la forêt, parfait pour se ressourcer",
  },
  {
    id: "5",
    name: "Vue Panoramique",
    lat: 46.8421,
    lng: 7.1567,
    price: 30,
    type: "premium",
    amenities: ["electricity", "water", "wifi", "toilets", "restaurant"],
    available: true,
    description: "Vue imprenable sur les Alpes suisses",
  },
];

// Composant pour la carte de l'emplacement
const SpotCard = ({ spot }: { spot: ParkingSpot }) => {
  const amenityIcons: Record<string, string> = {
    electricity: "⚡",
    water: "💧",
    wifi: "📶",
    toilets: "🚽",
    shower: "🚿",
    restaurant: "🍽️",
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-vintage-black">{spot.name}</h3>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            spot.available
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {spot.available ? "Disponible" : "Occupé"}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">{spot.description}</p>

      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-bold text-vintage-teal">
          {spot.price}€
        </span>
        <span className="text-sm text-gray-500">par nuit</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {spot.amenities.map((amenity) => (
          <span
            key={amenity}
            className="inline-flex items-center bg-vintage-gray px-2 py-1 rounded-full text-xs"
            title={amenity}
          >
            {amenityIcons[amenity]} {amenity}
          </span>
        ))}
      </div>

      {spot.available && (
        <button className="w-full bg-vintage-teal text-white py-2 rounded-lg font-medium hover:bg-vintage-teal-dark transition-colors">
          Réserver maintenant
        </button>
      )}
    </div>
  );
};

export default function InteractiveMap({
  fullHeight = false,
  showTitle = true,
}: {
  fullHeight?: boolean;
  showTitle?: boolean;
}) {
  const [isClient, setIsClient] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      const leaflet = await import("leaflet");
      setL(leaflet.default);
      setIsClient(true);
    };
    loadLeaflet();
  }, []);

  if (!isClient || !L) {
    return (
      <div className="w-full h-96 bg-vintage-gray-light rounded-lg flex items-center justify-center">
        <div className="text-vintage-teal">Chargement de la carte...</div>
      </div>
    );
  }

  // Créer une icône personnalisée pour chaque type
  const createCustomIcon = (type: string, available: boolean) => {
    let color = "";
    let emoji = "";

    switch (type) {
      case "camping":
        color = available ? "#2d5a5a" : "#9ca3af";
        emoji = "🏕️";
        break;
      case "parking":
        color = available ? "#f4d03f" : "#9ca3af";
        emoji = "🚐";
        break;
      case "premium":
        color = available ? "#e67e22" : "#9ca3af";
        emoji = "⭐";
        break;
      default:
        color = "#2d5a5a";
        emoji = "📍";
    }

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          font-size: 18px;
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          ${emoji}
        </div>
      `,
      className: "custom-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  return (
    <div className="w-full">
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-vintage-black mb-2">
            Trouvez votre emplacement{" "}
            <span className="text-gradient-vintage-primary">parfait</span>
          </h2>
          <p className="text-vintage-teal">
            Découvrez nos emplacements disponibles sur la carte interactive
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className={`relative ${fullHeight ? "h-full" : "h-96"}`}>
          <MapContainer
            center={[46.8182, 7.1619]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {parkingSpots.map((spot) => (
              <Marker
                key={spot.id}
                position={[spot.lat, spot.lng]}
                icon={createCustomIcon(spot.type, spot.available)}
                eventHandlers={{
                  mouseover: () => setSelectedSpot(spot),
                  mouseout: () => setSelectedSpot(null),
                  click: () => setSelectedSpot(spot),
                }}
              >
                <Popup>
                  <SpotCard spot={spot} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Légende */}
        <div className="p-4 bg-vintage-gray-light border-t">
          <h4 className="font-semibold text-vintage-black mb-2">Légende</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-vintage-teal rounded-full flex items-center justify-center text-white text-sm">
                🏕️
              </div>
              <span className="text-sm">Camping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-vintage-yellow rounded-full flex items-center justify-center text-white text-sm">
                🚐
              </div>
              <span className="text-sm">Parking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-vintage-orange rounded-full flex items-center justify-center text-white text-sm">
                ⭐
              </div>
              <span className="text-sm">Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carte flottante au hover */}
      {selectedSpot && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="animate-fade-in">
            <SpotCard spot={selectedSpot} />
          </div>
        </div>
      )}
    </div>
  );
}
