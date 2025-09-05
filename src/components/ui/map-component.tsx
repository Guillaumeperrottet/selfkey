"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// Données d'exemple d'emplacements
const parkingSpots = [
  {
    id: "1",
    name: "Le Pied Total",
    lat: 46.8182,
    lng: 7.1619,
    price: 25,
    type: "camping",
    description: "Magnificent bucolic square between garden and forest",
  },
  {
    id: "2",
    name: "Pont-en-Ogoz",
    lat: 46.8089,
    lng: 7.15,
    price: 22,
    type: "parking",
    description: "Free parking with a splendid view over the mountains",
  },
  {
    id: "3",
    name: "Camping des Rives",
    lat: 46.825,
    lng: 7.17,
    price: 30,
    type: "premium",
    description: "Premium camping with all amenities",
  },
];

export default function MapComponent() {
  return (
    <MapContainer
      center={[46.8182, 7.1619]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {parkingSpots.map((spot) => (
        <Marker key={spot.id} position={[spot.lat, spot.lng]}>
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold text-[#9EA173]">{spot.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{spot.description}</p>
              <p className="font-bold text-[#A8B17A]">{spot.price} CHF/nuit</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
