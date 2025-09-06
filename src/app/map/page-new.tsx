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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";

interface Establishment {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  price: string;
  type: string;
  amenities: string[];
  description: string;
  image: string;
  rating: number;
  reviews: number;
}

export default function MapPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState<
    Establishment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);

  const fetchEstablishments = async () => {
    try {
      const response = await fetch("/api/public/establishments");
      if (response.ok) {
        const data = await response.json();
        setEstablishments(data);
        setFilteredEstablishments(data);
      } else {
        console.error("Erreur lors du chargement des établissements");
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEstablishments = useCallback(() => {
    let filtered = establishments;

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(
        (establishment) =>
          establishment.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          establishment.location
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par équipements
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter((establishment) =>
        selectedAmenities.every((amenity) =>
          establishment.amenities.includes(amenity)
        )
      );
    }

    // Filtre par prix
    filtered = filtered.filter((establishment) => {
      const price = parseFloat(establishment.price.replace(/[^\d.]/g, ""));
      return price >= priceRange[0] && price <= priceRange[1];
    });

    setFilteredEstablishments(filtered);
  }, [establishments, searchQuery, selectedAmenities, priceRange]);

  useEffect(() => {
    fetchEstablishments();
  }, []);

  useEffect(() => {
    filterEstablishments();
  }, [filterEstablishments]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedAmenities([]);
    setPriceRange([0, 100]);
    setShowFilters(false);
  };

  const availableAmenities = [
    { key: "wifi", label: "WiFi", icon: Wifi },
    { key: "shower", label: "Douches", icon: ShowerHead },
    { key: "parking", label: "Parking", icon: Car },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#212215] flex items-center justify-center">
        <div className="text-white">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212215] flex">
      {/* Left Sidebar */}
      <div className="w-96 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-[#9EA173]">SelfCamp</h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un emplacement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Button */}
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtres
            {(selectedAmenities.length > 0 || searchQuery) && (
              <Badge variant="secondary" className="ml-auto">
                {selectedAmenities.length + (searchQuery ? 1 : 0)}
              </Badge>
            )}
          </Button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div>
                <h3 className="font-medium mb-2">Équipements</h3>
                <div className="flex flex-wrap gap-2">
                  {availableAmenities.map((amenity) => (
                    <Button
                      key={amenity.key}
                      variant={
                        selectedAmenities.includes(amenity.key)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => toggleAmenity(amenity.key)}
                      className="flex items-center gap-1"
                    >
                      <amenity.icon className="h-3 w-3" />
                      {amenity.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Effacer
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredEstablishments.length} emplacement
              {filteredEstablishments.length !== 1 ? "s" : ""} trouvé
              {filteredEstablishments.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-4">
            {filteredEstablishments.map((spot) => (
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
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{spot.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{spot.rating}</span>
                      <span className="text-sm text-gray-500">
                        ({spot.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{spot.location}</span>
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
      </div>

      {/* Right Map Container */}
      <div className="flex-1">
        <InteractiveMap fullHeight showTitle={false} />
      </div>
    </div>
  );
}
