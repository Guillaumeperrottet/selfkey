"use client";

import InteractiveMap from "@/components/ui/interactive-map";
import EnhancedSearchBar from "@/components/ui/enhanced-search-bar";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, ShowerHead, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AvailabilityBadge } from "@/components/ui/availability-badge";
import { VanLoading } from "@/components/ui/van-loading";
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
  distance?: number; // Distance en km pour les recherches de proximité
}

// Composant interne qui utilise useSearchParams
function MapPageContent() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState<
    Establishment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredEstablishment, setHoveredEstablishment] = useState<
    string | null
  >(null);
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [showingNearbyEstablishments, setShowingNearbyEstablishments] =
    useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    fetchEstablishments();

    // Détection mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    filterEstablishments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [establishments, searchQuery]);

  // Debug log pour les établissements filtrés
  useEffect(() => {
    console.log(
      "MapPage - filteredEstablishments changed:",
      filteredEstablishments.length,
      filteredEstablishments
    );
  }, [filteredEstablishments]);

  const fetchEstablishments = async () => {
    try {
      const response = await fetch("/api/public/map/establishments");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Convertir les données de la base pour matcher l'interface Establishment
          const convertedEstablishments: Establishment[] =
            result.establishments.map(
              (est: {
                id: string;
                slug: string;
                name: string;
                location: string;
                latitude: number;
                longitude: number;
                price?: string;
                type?: string;
                description: string;
                image?: string;
              }) => ({
                id: est.id,
                slug: est.slug,
                name: est.name,
                location: est.location,
                latitude: est.latitude,
                longitude: est.longitude,
                price: est.price || "Sur demande",
                type: est.type || "camping",
                amenities: ["wifi", "douche"], // À adapter selon vos données
                description: est.description,
                image: est.image || "/selfcamp_logo.png", // Image par défaut
                rating: 4.5, // À adapter selon vos données
                reviews: 0, // À adapter selon vos données
                address: est.location,
              })
            );

          setEstablishments(convertedEstablishments);
          setFilteredEstablishments(convertedEstablishments);
          console.log(
            `${convertedEstablishments.length} établissements chargés depuis la base de données`
          );
          console.log(
            "Établissements avec coordonnées:",
            convertedEstablishments.map((est) => ({
              name: est.name,
              lat: est.latitude,
              lng: est.longitude,
            }))
          );
        } else {
          console.error("Erreur dans la réponse API:", result.error);
        }
      } else {
        console.error("Erreur lors du chargement des établissements");
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour calculer la distance entre deux points (formule haversine)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterEstablishments = () => {
    let filtered = [...establishments];
    setShowingNearbyEstablishments(false); // Reset par défaut

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

      // Si aucun résultat et qu'on a des coordonnées de recherche,
      // afficher les établissements les plus proches
      if (filtered.length === 0 && mapCenter) {
        console.log(
          "Aucun résultat pour la recherche, affichage des établissements les plus proches"
        );
        setShowingNearbyEstablishments(true);

        // Calculer les distances et trier par proximité
        const establishmentsWithDistance = establishments.map(
          (establishment) => ({
            ...establishment,
            distance: calculateDistance(
              mapCenter.lat,
              mapCenter.lng,
              establishment.latitude,
              establishment.longitude
            ),
          })
        );

        // Trier par distance et prendre les 5 plus proches
        filtered = establishmentsWithDistance
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5);
      }
    }

    setFilteredEstablishments(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <VanLoading message="Découverte des spots de camping..." size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#212215] flex overflow-hidden relative">
      {/* Left Sidebar - Masquée sur mobile */}
      <div
        className={`
        ${isMobile ? "hidden" : "w-96"} 
        bg-white border-r flex flex-col relative
      `}
      >
        {/* Header */}
        <div className="p-4 border-b bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
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
            </div>
            <a
              href="https://selfcamp.ch"
              className="hover:opacity-80 transition-opacity"
            >
              <h1 className="text-xl font-bold text-[#9EA173] cursor-pointer">
                SelfCamp
              </h1>
            </a>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {searchQuery ? (
                  showingNearbyEstablishments ? (
                    <>
                      <span className="font-medium">
                        {filteredEstablishments.length}
                      </span>{" "}
                      établissement
                      {filteredEstablishments.length !== 1 ? "s" : ""} les plus
                      proches de{" "}
                      <span className="font-medium text-gray-800">
                        &ldquo;{searchQuery}&rdquo;
                      </span>
                    </>
                  ) : (
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
                  )
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
                className={`cursor-pointer transition-all duration-300 p-0 overflow-hidden ${
                  hoveredEstablishment === spot.id
                    ? "shadow-lg scale-[1.02] border-blue-300"
                    : "hover:shadow-md"
                }`}
                onMouseEnter={() => setHoveredEstablishment(spot.id)}
                onMouseLeave={() => setHoveredEstablishment(null)}
                onClick={() => centerMapOnEstablishment(spot)}
              >
                <div className="relative h-32 bg-gray-200 overflow-hidden">
                  <Image
                    src={spot.image}
                    alt={spot.name}
                    width={320}
                    height={128}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
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
                    {showingNearbyEstablishments && spot.distance && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {spot.distance.toFixed(1)} km
                      </span>
                    )}
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
      <div
        className={`
        ${isMobile ? "w-full" : "flex-1"} 
        h-full relative
      `}
      >
        <InteractiveMap
          establishments={establishments} // Afficher TOUS les établissements sur la carte
          fullHeight
          showTitle={false}
          hoveredEstablishmentId={hoveredEstablishment}
          onMarkerClick={scrollToEstablishment}
          center={mapCenter}
          zoom={mapZoom}
          availabilityData={availabilityData}
        />

        {/* Barre de recherche flottante au centre en haut - responsive */}
        <div
          className="search-bar-overlay absolute left-1/2 transform -translate-x-1/2 w-full max-w-xs md:max-w-md lg:max-w-lg px-6"
          style={{
            zIndex: 1000,
            top: "max(env(safe-area-inset-top, 0px) + 32px, 48px)",
          }}
        >
          <div
            className="search-bar-container bg-white rounded-lg shadow-xl border-2"
            style={{ zIndex: 1001 }}
          >
            <EnhancedSearchBar
              value={searchQuery}
              onChange={(query: string) => {
                setSearchQuery(query);
                // Fonction de recherche inline
                if (query.trim() === "") {
                  setFilteredEstablishments(establishments);
                  setShowingNearbyEstablishments(false);
                  return;
                }

                let filtered = establishments.filter(
                  (establishment) =>
                    establishment.name
                      .toLowerCase()
                      .includes(query.toLowerCase()) ||
                    establishment.location
                      .toLowerCase()
                      .includes(query.toLowerCase()) ||
                    establishment.description
                      .toLowerCase()
                      .includes(query.toLowerCase())
                );

                if (filtered.length === 0 && mapCenter) {
                  // Si pas de résultats, afficher les établissements les plus proches
                  setShowingNearbyEstablishments(true);
                  const establishmentsWithDistance = establishments.map(
                    (establishment) => ({
                      ...establishment,
                      distance: calculateDistance(
                        mapCenter.lat,
                        mapCenter.lng,
                        establishment.latitude,
                        establishment.longitude
                      ),
                    })
                  );
                  filtered = establishmentsWithDistance
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, 5);
                } else {
                  setShowingNearbyEstablishments(false);
                }

                setFilteredEstablishments(filtered);
              }}
              onLocationSelect={(location) => {
                setMapCenter({ lat: location.lat, lng: location.lng });
                setMapZoom(location.name === "Ma position" ? 15 : 12);
              }}
              onEstablishmentSelect={(establishment) => {
                centerMapOnEstablishment({
                  ...establishment,
                  price: "",
                  type: "",
                  amenities: [],
                  description: "",
                  image: "",
                  rating: 0,
                  reviews: 0,
                  slug: establishment.id,
                  address: establishment.location,
                });
              }}
              placeholder="Rechercher par nom, ville, description..."
            />
          </div>
        </div>

        {/* Bouton flottant pour retourner à l'accueil sur mobile */}
        {isMobile && (
          <Link href="/">
            <button
              className="mobile-toggle-btn"
              style={{
                bottom: `max(env(safe-area-inset-bottom, 0px) + 24px, 24px)`,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 12h18M12 3l-9 9 9 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
        )}
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded z-50">
          Establishments: {filteredEstablishments.length} | Loading:{" "}
          {loading.toString()}
        </div>
      )}
    </div>
  );
}

// Composant principal avec Suspense boundary
export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <VanLoading message="Chargement de la carte..." size="lg" />
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
