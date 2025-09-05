"use client";

import InteractiveMap from "@/components/ui/interactive-map";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Star,
  Wifi,
  ShowerHead,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

// Données d'exemple pour les emplacements
const mockSpots = [
  {
    id: 1,
    name: "Le Pied Total",
    location: "Fribourg, Switzerland",
    rating: 4.8,
    reviews: 124,
    price: "25 CHF/nuit",
    image: "/background-selfcamp.jpg",
    amenities: ["wifi", "shower", "parking"],
    description:
      "Magnificent bucolic square between garden and forest, entirely surrounded by trees...",
  },
  {
    id: 2,
    name: "Pont-en-Ogoz",
    location: "Gruyère, Switzerland",
    rating: 4.5,
    reviews: 89,
    price: "22 CHF/nuit",
    image: "/background-selfcamp.jpg",
    amenities: ["parking", "wifi"],
    description:
      "Free parking with a splendid view over the mountains and lake...",
  },
  {
    id: 3,
    name: "Camping des Pins",
    location: "Valais, Switzerland",
    rating: 4.7,
    reviews: 156,
    price: "28 CHF/nuit",
    image: "/background-selfcamp.jpg",
    amenities: ["wifi", "shower", "parking"],
    description:
      "Peaceful camping spot surrounded by pine trees with modern facilities...",
  },
];

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("Fribourg, Switzerland");

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar */}
      <div className="w-96 flex flex-col border-r border-gray-200">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-vintage-teal hover:text-vintage-teal-dark transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </Link>
            <h1 className="text-lg font-bold text-vintage-black">SelfCamp</h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une destination..."
              className="pl-10 pr-4"
            />
          </div>

          {/* Filter Button */}
          <Button variant="outline" className="w-full mt-3 justify-start">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </header>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            {mockSpots.length} emplacements trouvés
          </div>

          {mockSpots.map((spot) => (
            <Card
              key={spot.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="relative h-32 bg-gray-200 rounded-t-lg overflow-hidden">
                <Image
                  src={spot.image}
                  alt={spot.name}
                  width={320}
                  height={128}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm font-medium">
                  {spot.price}
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{spot.name}</h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{spot.rating}</span>
                    <span className="text-gray-500">({spot.reviews})</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{spot.location}</span>
                </div>

                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {spot.description}
                </p>

                <div className="flex gap-2">
                  {spot.amenities.includes("wifi") && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Wifi className="w-3 h-3" />
                      <span>WiFi</span>
                    </div>
                  )}
                  {spot.amenities.includes("shower") && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <ShowerHead className="w-3 h-3" />
                      <span>Douche</span>
                    </div>
                  )}
                  {spot.amenities.includes("parking") && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Car className="w-3 h-3" />
                      <span>Parking</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Map Container */}
      <div className="flex-1">
        <InteractiveMap fullHeight showTitle={false} />
      </div>
    </div>
  );
}
