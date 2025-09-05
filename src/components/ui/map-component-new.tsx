"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

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

export default function MapComponent() {
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
        spotsToShow.length > 0
          ? [spotsToShow[0].latitude, spotsToShow[0].longitude]
          : [46.8182, 7.1619]
      }
      zoom={10}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {spotsToShow.map((spot) => (
        <Marker key={spot.id} position={[spot.latitude, spot.longitude]}>
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold text-[#9EA173]">{spot.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{spot.description}</p>
              <p className="text-xs text-gray-500 mb-1">{spot.location}</p>
              <p className="font-bold text-[#A8B17A]">{spot.price}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
