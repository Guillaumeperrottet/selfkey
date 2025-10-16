"use client";

import InteractiveMap from "@/components/ui/interactive-map";
import EnhancedSearchBar from "@/components/ui/enhanced-search-bar";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ShowerHead, Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AvailabilityBadge } from "@/components/ui/availability-badge";
import { VanLoading } from "@/components/ui/van-loading";
import { useAvailability } from "@/hooks/useAvailability";
import { useAnalytics } from "@/hooks/useAnalytics";
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
  isPubliclyVisible?: boolean; // Page de présentation publique
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
  } | null>({ lat: 46.8182, lng: 7.1512 }); // Centré sur Fribourg par défaut
  const [mapZoom, setMapZoom] = useState<number>(9);
  const [isUserGeolocation, setIsUserGeolocation] = useState(false); // Nouveau état
  const [showingNearbyEstablishments, setShowingNearbyEstablishments] =
    useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<
    string | null
  >(null);

  // Analytics hook
  const { trackMap, trackSearch } = useAnalytics();

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
    name: string,
    slug: string
  ) => {
    // Track directions click
    trackMap.directionsClicked(slug, name);

    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, "_blank");
  };

  // Fonction pour centrer la carte sur un établissement
  const centerMapOnEstablishment = (establishment: Establishment) => {
    // Track map centering on establishment
    trackMap.establishmentSelected(establishment.slug, establishment.name);

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

    // Définir l'établissement sélectionné pour ouvrir son popup
    setSelectedEstablishmentId(establishment.id);
    // Réinitialiser après un court délai pour permettre une nouvelle sélection
    setTimeout(() => setSelectedEstablishmentId(null), 500);
  };

  useEffect(() => {
    fetchEstablishments();

    // Détection mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
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
                isPubliclyVisible?: boolean;
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
                isPubliclyVisible: est.isPubliclyVisible,
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

        // Track no results
        trackSearch.noResults(query);
      } else {
        // Track successful search
        trackSearch.completed(query, filtered.length);
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
    <div className="h-screen bg-[#212215] flex flex-col overflow-hidden">
      {/* Header fixe - visible uniquement sur mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-[2000]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo à gauche */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo_map.png"
                alt="SelfCamp Logo"
                width={50}
                height={50}
                className="hover:opacity-80 transition-opacity"
              />
            </Link>

            {/* Texte Selfcamp au centre */}
            <Link
              href="/"
              className="absolute left-1/2 transform -translate-x-1/2"
            >
              <h1 className="text-xl font-bold text-[#84994F] hover:text-[#84994F]/80 transition-colors">
                Selfcamp
              </h1>
            </Link>

            {/* Menu burger à droite */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex flex-col items-center justify-center w-10 h-10 space-y-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <span
                className={`block w-6 h-0.5 bg-[#84994F] transition-all duration-300 ${
                  isSidebarOpen ? "rotate-45 translate-y-2" : ""
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-[#84994F] transition-all duration-300 ${
                  isSidebarOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-[#84994F] transition-all duration-300 ${
                  isSidebarOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              ></span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar navigation simple et épurée */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-[2001] transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header simple avec couleur */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-[#84994F]">Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-[#84994F]/10 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-gray-600 hover:text-[#84994F]" />
            </button>
          </div>

          {/* Navigation links avec touches de couleur */}
          <nav className="flex-1 p-6 overflow-y-auto flex flex-col">
            <div className="space-y-3 mb-6">
              <Link
                href="/"
                onClick={() => setIsSidebarOpen(false)}
                className="block px-4 py-3.5 text-base font-medium text-gray-700 hover:text-[#84994F] bg-gray-50 hover:bg-[#84994F]/10 rounded-xl transition-all duration-200 border-l-4 border-l-[#84994F]/30 hover:border-l-[#84994F]"
              >
                Accueil
              </Link>
              <Link
                href="/about"
                onClick={() => setIsSidebarOpen(false)}
                className="block px-4 py-3.5 text-base font-medium text-gray-700 hover:text-[#84994F] bg-gray-50 hover:bg-[#84994F]/10 rounded-xl transition-all duration-200 border-l-4 border-l-[#84994F]/30 hover:border-l-[#84994F]"
              >
                À propos
              </Link>
              <Link
                href="/help"
                onClick={() => setIsSidebarOpen(false)}
                className="block px-4 py-3.5 text-base font-medium text-gray-700 hover:text-[#84994F] bg-gray-50 hover:bg-[#84994F]/10 rounded-xl transition-all duration-200 border-l-4 border-l-[#84994F]/30 hover:border-l-[#84994F]"
              >
                Contact
              </Link>
            </div>

            {/* Spacer pour pousser le contenu vers le bas */}
            <div className="flex-1"></div>

            {/* Slogan décalé */}
            <div className="mb-4">
              <div className="bg-white rounded-lg p-3 border border-[#84994F]/20">
                <div className="flex items-center gap-2">
                  <div className="text-lg">🚐</div>
                  <p className="text-xs text-gray-700 font-medium">
                    Trouvez votre spot, pas votre stress.
                  </p>
                </div>
              </div>
            </div>

            {/* Instagram */}
            <div className="mb-4">
              <a
                href="https://www.instagram.com/selfcamp_ch/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border-2 border-gray-200 hover:border-[#84994F]/30 rounded-lg px-3 py-2.5 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-800">
                        @selfcamp_ch
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Suivez-nous
                      </div>
                    </div>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </a>
            </div>

            {/* Logo SelfCamp */}
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="SelfCamp"
                width={50}
                height={50}
                className="opacity-30"
              />
            </div>
          </nav>

          {/* Footer avec badge couleur */}
          <div className="p-6 border-t border-gray-200">
            <div className="bg-[#84994F]/10 text-[#84994F] px-4 py-2.5 rounded-lg text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-[#84994F] rounded-full animate-pulse"></div>
                <p className="text-sm font-medium">Disponible 24H/24 - 7J/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay sombre quand la sidebar est ouverte - uniquement mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[2000] transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Conteneur principal */}
      <div
        className="flex-1 flex overflow-hidden"
        style={{ marginTop: isMobile ? "64px" : "0" }}
      >
        {/* Left Sidebar Desktop - visible uniquement sur desktop */}
        <div
          className={`
          ${isMobile ? "hidden" : "w-96"} 
          bg-white border-r flex flex-col relative
        `}
        >
          {/* Header Desktop */}
          <div className="p-4 border-b bg-white flex-shrink-0">
            <div className="flex items-center justify-center mb-4">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-2xl font-bold text-[#9EA173] cursor-pointer">
                  SelfCamp
                </h1>
              </Link>
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
                        {filteredEstablishments.length !== 1 ? "s" : ""} les
                        plus proches de{" "}
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
                        {filteredEstablishments.length !== 1
                          ? "s"
                          : ""} pour{" "}
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
                      {filteredEstablishments.length !== 1 ? "s" : ""}{" "}
                      disponible
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
                    {/* Image cliquable si la page de présentation est disponible */}
                    {spot.isPubliclyVisible ? (
                      <Link
                        href={`/establishment/${spot.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block w-full h-full"
                      >
                        <Image
                          src={spot.image}
                          alt={spot.name}
                          width={320}
                          height={128}
                          className="w-full h-full object-cover rounded-t-lg hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      </Link>
                    ) : (
                      <Image
                        src={spot.image}
                        alt={spot.name}
                        width={320}
                        height={128}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    )}
                    {/* Badge de disponibilité */}
                    <div className="absolute top-2 left-2 pointer-events-none">
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
                      <h3 className="font-semibold text-gray-900">
                        {spot.name}
                      </h3>
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

                    {/* Lien vers la page de présentation si disponible */}
                    {spot.isPubliclyVisible && (
                      <Link
                        href={`/establishment/${spot.slug}`}
                        className="text-xs text-[#84994F] hover:text-[#6d7d3f] hover:underline transition-colors mb-3 inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        En savoir plus →
                      </Link>
                    )}

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
                            spot.name,
                            spot.slug
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
            disableAutoGeolocation={!!mapCenter && !isUserGeolocation}
            selectedEstablishmentId={selectedEstablishmentId}
          />

          {/* Barre de recherche fixe au centre - style Park4night */}
          <div className="search-bar-overlay">
            <div
              className="search-bar-container bg-white rounded-lg shadow-xl border-2"
              style={{ zIndex: 1501 }}
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
                  // Utiliser le zoom suggéré s'il existe, sinon valeur par défaut
                  const zoom =
                    location.zoom ||
                    (location.name === "Ma position" ? 15 : 12);
                  setMapZoom(zoom);
                  // Marquer si c'est la géolocalisation de l'utilisateur
                  setIsUserGeolocation(location.name === "Ma position");
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
                placeholder="Rechercher un lieu, une ville, un emplacement..."
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
