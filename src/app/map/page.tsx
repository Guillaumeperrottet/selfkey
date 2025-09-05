"use client";

import InteractiveMap from "@/components/ui/interactive-map";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  ShowerHead,
  X,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvailabilityBadge } from "@/components/ui/availability-badge";
import { useAvailability } from "@/hooks/useAvailability";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Establishment {
  id: string;
  slug: string;
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
  address?: string; // Optionnel
}

// Composant interne qui utilise useSearchParams
function MapPageContent() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState<
    Establishment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [hoveredEstablishment, setHoveredEstablishment] = useState<
    string | null
  >(null);
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [isSearchingInArea, setIsSearchingInArea] = useState(false);
  const [currentMapBounds, setCurrentMapBounds] = useState<{
    center: { lat: number; lng: number };
    zoom: number;
  } | null>(null);

  // Gérer les paramètres URL pour les recherches depuis la homepage
  const searchParams = useSearchParams();

  useEffect(() => {
    // Récupérer la recherche depuis l'URL
    const urlSearch = searchParams.get("search");
    const urlEstablishment = searchParams.get("establishment");
    const urlLat = searchParams.get("lat");
    const urlLng = searchParams.get("lng");
    const urlZoom = searchParams.get("zoom");

    if (urlSearch) {
      setSearchQuery(urlSearch);
    }

    // Si des coordonnées géographiques sont fournies, centrer la carte
    if (urlLat && urlLng) {
      const lat = parseFloat(urlLat);
      const lng = parseFloat(urlLng);
      const zoom = urlZoom ? parseInt(urlZoom) : 12;

      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({ lat, lng });
        setMapZoom(zoom);
      }
    }

    // Si un établissement spécifique est demandé, on peut le mettre en évidence
    if (urlEstablishment && establishments.length > 0) {
      const targetEstablishment = establishments.find(
        (est) => est.slug === urlEstablishment
      );
      if (targetEstablishment) {
        // Scroll vers l'établissement après un délai pour laisser le temps au rendu
        setTimeout(() => {
          scrollToEstablishment(targetEstablishment.id);
        }, 1000);
      }
    }
  }, [searchParams, establishments]);

  // Récupérer les slugs des établissements pour la disponibilité
  const establishmentSlugs = useMemo(
    () => establishments.map((est) => est.slug),
    [establishments]
  );

  // Hook pour récupérer la disponibilité en temps réel
  const { availabilityData, loading: availabilityLoading } =
    useAvailability(establishmentSlugs);

  // Fonction pour scroller vers une carte d'établissement
  const scrollToEstablishment = (establishmentId: string) => {
    const element = document.getElementById(
      `establishment-card-${establishmentId}`
    );
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      // Optionnel : mettre en surbrillance temporaire la carte
      setHoveredEstablishment(establishmentId);
      setTimeout(() => setHoveredEstablishment(null), 2000);
    }
  };

  // Fonction pour ouvrir Google Maps avec les coordonnées
  const openGoogleMaps = (
    latitude: number,
    longitude: number,
    name: string
  ) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, "_blank");
  };

  // Fonction pour centrer la carte sur un établissement
  const centerMapOnEstablishment = (establishment: Establishment) => {
    console.log(
      "Centrage sur:",
      establishment.name,
      establishment.latitude,
      establishment.longitude
    );
    setMapCenter({ lat: establishment.latitude, lng: establishment.longitude });
    setMapZoom(15); // Zoom plus proche pour voir l'établissement

    // Mettre en surbrillance temporaire l'établissement
    setHoveredEstablishment(establishment.id);
    setTimeout(() => setHoveredEstablishment(null), 2000);
  };

  // Fonction pour rechercher dans la zone visible de la carte
  const searchInArea = async () => {
    if (!currentMapBounds) {
      console.log("Aucune limite de carte disponible");
      return;
    }

    setIsSearchingInArea(true);
    try {
      const response = await fetch(
        `/api/public/establishments/search-in-area?lat=${currentMapBounds.center.lat}&lng=${currentMapBounds.center.lng}&radius=20`
      );

      if (response.ok) {
        const nearbyEstablishments = await response.json();
        console.log(
          "Établissements trouvés dans la zone:",
          nearbyEstablishments
        );

        // Convertir les données pour matcher l'interface Establishment
        const convertedEstablishments: Establishment[] =
          nearbyEstablishments.map(
            (est: {
              id: string;
              slug: string;
              name: string;
              city: string | null;
              country: string | null;
              latitude: number;
              longitude: number;
              mapDescription: string | null;
              mapImage: string | null;
              address: string | null;
            }) => ({
              id: est.id,
              slug: est.slug,
              name: est.name,
              location: `${est.city || ""}, ${est.country || ""}`,
              latitude: est.latitude,
              longitude: est.longitude,
              price: "À partir de 25€/nuit", // Prix par défaut
              type: "Camping",
              amenities: ["Wi-Fi", "Sanitaires"],
              description: est.mapDescription || est.name,
              image: est.mapImage || "/placeholder-establishment.jpg",
              rating: 4.5,
              reviews: 12,
              address: est.address,
            })
          );

        setFilteredEstablishments(convertedEstablishments);
        setSearchQuery("Résultats dans cette zone");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche dans la zone:", error);
    } finally {
      setIsSearchingInArea(false);
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, []);

  useEffect(() => {
    filterEstablishments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [establishments, searchQuery, selectedAmenities, priceRange]);

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

  const filterEstablishments = () => {
    let filtered = [...establishments];

    // Filtre par recherche amélioré
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((establishment) => {
        // Recherche dans le nom
        const nameMatch = establishment.name?.toLowerCase().includes(query);

        // Recherche dans la localisation (ville, pays)
        const locationMatch = establishment.location
          ?.toLowerCase()
          .includes(query);

        // Recherche dans la description
        const descriptionMatch = establishment.description
          ?.toLowerCase()
          .includes(query);

        // Recherche dans l'adresse si disponible
        const addressMatch = establishment.address
          ?.toLowerCase()
          .includes(query);

        // Recherche par type d'établissement
        const typeMatch = establishment.type?.toLowerCase().includes(query);

        return (
          nameMatch ||
          locationMatch ||
          descriptionMatch ||
          addressMatch ||
          typeMatch
        );
      });
    }

    // Filtre par équipements
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter((establishment) =>
        selectedAmenities.every(
          (amenity) => establishment.amenities?.includes(amenity) || false
        )
      );
    }

    // Filtre par prix (désactivé temporairement car le champ price n'existe pas encore)
    // filtered = filtered.filter((establishment) => {
    //   if (!establishment.price) return true; // Inclure les établissements sans prix
    //   const price = parseFloat(establishment.price.replace(/[^\d.]/g, ""));
    //   return price >= priceRange[0] && price <= priceRange[1];
    // });

    setFilteredEstablishments(filtered);
  };

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
    { key: "shower", label: "Douches", icon: ShowerHead },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#212215] flex items-center justify-center">
        <div className="text-white">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#212215] flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-96 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white flex-shrink-0">
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
              placeholder="Rechercher par nom, ville, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
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

          {/* Search in Area Button */}
          <Button
            variant="outline"
            onClick={searchInArea}
            disabled={isSearchingInArea || !currentMapBounds}
            className="w-full flex items-center gap-2 text-vintage-teal border-vintage-teal hover:bg-vintage-teal hover:text-white disabled:opacity-50"
          >
            <MapPin className="h-4 w-4" />
            {isSearchingInArea ? "Recherche..." : "Rechercher dans cette zone"}
          </Button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4 flex-shrink-0">
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {searchQuery ? (
                  <>
                    <span className="font-medium">
                      {filteredEstablishments.length}
                    </span>{" "}
                    résultat
                    {filteredEstablishments.length !== 1 ? "s" : ""} pour{" "}
                    <span className="font-medium text-gray-800">
                      &ldquo;{searchQuery}&rdquo;
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">
                      {filteredEstablishments.length}
                    </span>{" "}
                    emplacement
                    {filteredEstablishments.length !== 1 ? "s" : ""} disponible
                    {filteredEstablishments.length !== 1 ? "s" : ""}
                  </>
                )}
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="text-xs"
                >
                  Effacer
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredEstablishments.map((spot) => (
              <Card
                key={spot.id}
                id={`establishment-card-${spot.id}`}
                className={`cursor-pointer transition-all duration-300 ${
                  hoveredEstablishment === spot.id
                    ? "shadow-lg scale-[1.02] border-blue-300"
                    : "hover:shadow-md"
                }`}
                onMouseEnter={() => setHoveredEstablishment(spot.id)}
                onMouseLeave={() => setHoveredEstablishment(null)}
                onClick={() => centerMapOnEstablishment(spot)}
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
                  {/* Badge de disponibilité */}
                  <div className="absolute top-2 left-2">
                    {availabilityData[spot.slug] ? (
                      <AvailabilityBadge
                        availableRooms={
                          availabilityData[spot.slug].availableRooms
                        }
                        totalRooms={availabilityData[spot.slug].totalRooms}
                        status={availabilityData[spot.slug].status}
                        nextAvailable={
                          availabilityData[spot.slug].nextAvailable
                        }
                      />
                    ) : (
                      <AvailabilityBadge
                        availableRooms={0}
                        totalRooms={0}
                        status="available"
                        loading={availabilityLoading}
                      />
                    )}
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{spot.name}</h3>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{spot.location}</span>
                  </div>

                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                    {spot.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {spot.amenities.includes("shower") && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <ShowerHead className="w-3 h-3" />
                          <span>Douche</span>
                        </div>
                      )}
                    </div>

                    {/* Bouton GPS */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openGoogleMaps(
                          spot.latitude,
                          spot.longitude,
                          spot.name
                        );
                      }}
                      className="flex items-center gap-1 text-xs px-2 py-1 h-7 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Navigation className="w-3 h-3" />
                      GPS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Map Container */}
      <div className="flex-1 h-full">
        <InteractiveMap
          fullHeight
          showTitle={false}
          hoveredEstablishmentId={hoveredEstablishment}
          onMarkerClick={scrollToEstablishment}
          center={mapCenter}
          zoom={mapZoom}
          onMapMove={setCurrentMapBounds}
        />
      </div>
    </div>
  );
}

// Composant principal avec Suspense boundary
export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-vintage-gray-light">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-vintage-teal border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-vintage-black">Chargement de la carte...</p>
          </div>
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
