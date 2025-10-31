"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Map, Navigation, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSelfcampTranslation } from "@/hooks/useSelfcampTranslation";

interface Establishment {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  address?: string;
  mapTitle?: string;
  mapDescription?: string;
}

interface RecentSearch {
  title: string;
  subtitle?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface SearchSuggestion {
  id: string;
  type: "establishment" | "location" | "map" | "recent";
  title: string;
  subtitle?: string | null;
  icon: "location" | "map" | "recent";
  establishment?: Establishment;
  coordinates?: {
    lat: number;
    lng: number;
  };
  zoomLevel?: number; // Niveau de zoom suggéré
}

const RECENT_SEARCHES_KEY = "selfcamp_recent_searches";

// Fonction pour calculer la distance entre deux points (formule Haversine)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const router = useRouter();
  const { trackSearch, trackHomepage } = useAnalytics();
  const { t } = useSelfcampTranslation();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Récupérer la position de l'utilisateur au montage
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Géolocalisation non disponible:", error.message);
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Charger les recherches récentes au montage
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore les erreurs de parsing
      }
    }
  }, []);

  // Sauvegarder une recherche récente
  const saveRecentSearch = useCallback((search: RecentSearch) => {
    setRecentSearches((prev) => {
      const updated = [
        search,
        ...prev.filter((item) => item.title !== search.title),
      ].slice(0, 5);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Fonction de recherche avec debounce
  const searchEstablishments = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/public/establishments/search?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          let results: SearchSuggestion[] = await response.json();

          // Si on a la position de l'utilisateur, trier par proximité
          if (userLocation) {
            results = results
              .map((suggestion) => {
                if (suggestion.coordinates) {
                  const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    suggestion.coordinates.lat,
                    suggestion.coordinates.lng
                  );
                  return { ...suggestion, distance };
                }
                return { ...suggestion, distance: Infinity };
              })
              .sort(
                (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
              );
          }

          setSuggestions(results);
        }
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [userLocation]
  );

  // Gérer la saisie avec debounce
  const handleInputChange = (value: string) => {
    setSearchValue(value);

    // Track search initiation
    if (value.trim().length > 0) {
      trackSearch.initiated(value, "homepage");
    }

    // Annuler la recherche précédente
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Lancer une nouvelle recherche après 300ms
    searchTimeoutRef.current = setTimeout(() => {
      searchEstablishments(value);
    }, 300);
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (!searchValue.trim() && recentSearches.length > 0) {
      // Afficher les recherches récentes
      const recentSuggestions: SearchSuggestion[] = recentSearches.map(
        (search, index) => ({
          id: `recent-${index}`,
          type: "recent",
          title: search.title,
          subtitle: search.subtitle || "Recherche récente",
          icon: "recent",
          coordinates: search.coordinates,
        })
      );
      setSuggestions(recentSuggestions);
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "establishment" && suggestion.establishment) {
      // Track suggestion click
      trackSearch.suggestionClicked(suggestion.title);
      trackHomepage.searchUsed(suggestion.title);

      // Sauvegarder dans l'historique
      saveRecentSearch({
        title: suggestion.title,
        subtitle: suggestion.subtitle || undefined,
      });

      // Rediriger vers la map avec recherche pré-filtrée sur l'établissement
      const params = new URLSearchParams({
        search: suggestion.title,
        establishment: suggestion.establishment.slug,
      });
      router.push(`/map?${params.toString()}`);
    } else if (suggestion.type === "location" && suggestion.coordinates) {
      // Track location search
      trackSearch.suggestionClicked(suggestion.title);
      trackHomepage.searchUsed(suggestion.title);

      // Sauvegarder dans l'historique
      saveRecentSearch({
        title: suggestion.title,
        subtitle: suggestion.subtitle || undefined,
        coordinates: suggestion.coordinates,
      });

      // Rediriger vers la map avec coordonnées géographiques et zoom adapté
      const zoom = suggestion.zoomLevel || 12;
      const params = new URLSearchParams({
        search: suggestion.title,
        lat: suggestion.coordinates.lat.toString(),
        lng: suggestion.coordinates.lng.toString(),
        zoom: zoom.toString(),
      });
      router.push(`/map?${params.toString()}`);
    } else if (suggestion.type === "recent") {
      // Track recent search click
      trackSearch.suggestionClicked(suggestion.title);

      // Pour les recherches récentes, utiliser directement les coordonnées si disponibles
      if (suggestion.coordinates) {
        const params = new URLSearchParams({
          search: suggestion.title,
          lat: suggestion.coordinates.lat.toString(),
          lng: suggestion.coordinates.lng.toString(),
          zoom: "12",
        });
        router.push(`/map?${params.toString()}`);
      } else {
        // Sinon, relancer une recherche
        setSearchValue(suggestion.title);
        searchEstablishments(suggestion.title);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      saveRecentSearch({
        title: searchValue.trim(),
      });
      router.push(`/map?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setSuggestions([]);
    setIsOpen(false);
  };

  const removeRecentSearch = (searchToRemove: RecentSearch) => {
    setRecentSearches((prev) => {
      const updated = prev.filter(
        (item) => item.title !== searchToRemove.title
      );
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));

      // Mettre à jour les suggestions si on affiche les recherches récentes
      if (!searchValue.trim()) {
        const updatedSuggestions: SearchSuggestion[] = updated.map(
          (search, index) => ({
            id: `recent-${index}`,
            type: "recent",
            title: search.title,
            subtitle: search.subtitle || "Recherche récente",
            icon: "recent",
            coordinates: search.coordinates,
          })
        );
        setSuggestions(updatedSuggestions);
      }

      return updated;
    });
  };

  const getIcon = (iconType: string, suggestionType?: string) => {
    switch (iconType) {
      case "map":
        return <Map className="w-5 h-5 text-[#84994F]" />;
      case "location":
        // Différencier les établissements des lieux géographiques
        if (suggestionType === "establishment") {
          return <Navigation className="w-5 h-5 text-[#84994F]" />;
        } else {
          return <Map className="w-5 h-5 text-[#84994F]" />;
        }
      case "recent":
        return <Search className="w-5 h-5 text-gray-400" />;
      default:
        return <Search className="w-5 h-5 text-[#84994F]" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Search Input */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={t.hero.searchPlaceholder}
            className="w-full pl-10 pr-10 py-3 md:pl-12 md:pr-12 md:py-4 text-base md:text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#84994F] transition-colors shadow-lg bg-white"
          />

          {/* Clear button */}
          {searchValue && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center hover:bg-gray-100 hover:rounded-r-xl transition-colors"
            >
              <X className="h-4 w-4 md:h-5 md:w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}

          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center pointer-events-none">
              <div className="animate-spin h-4 w-4 border-2 border-[#84994F] border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-300 z-50 max-h-96 overflow-y-auto">
          {/* Use the map suggestion */}
          <Link
            href="/map"
            className="flex items-center gap-4 p-4 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 ease-in-out border-b border-gray-200 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-[#84994F]/10 rounded-lg flex items-center justify-center group-hover:bg-[#84994F]/20 transition-colors duration-200">
              <Map className="w-5 h-5 text-[#84994F]" />
            </div>
            <div>
              <div className="font-medium text-gray-900 group-hover:text-[#84994F] transition-colors duration-200">
                {t.search.seeMap}
              </div>
              <div className="text-sm text-gray-600">{t.search.exploreAll}</div>
            </div>
          </Link>

          {/* Search suggestions */}
          {suggestions.length > 0 && (
            <>
              {!searchValue.trim() && recentSearches.length > 0 && (
                <div className="px-4 py-3 text-sm font-medium text-gray-500 bg-gray-50">
                  {t.search.recentSearches}
                </div>
              )}
              {searchValue.trim() && (
                <div className="px-4 py-3 text-sm font-medium text-gray-500 bg-gray-50">
                  Résultats de recherche
                </div>
              )}

              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 ease-in-out group"
                >
                  <button
                    className="flex items-center gap-4 flex-1 text-left cursor-pointer transform hover:translate-x-1 transition-transform duration-200"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#84994F]/20 group-hover:scale-105 transition-all duration-200">
                      {getIcon(suggestion.icon, suggestion.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-[#84994F] transition-colors duration-200">
                        {suggestion.title}
                      </div>
                      {suggestion.subtitle && (
                        <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Bouton supprimer pour les recherches récentes */}
                  {suggestion.type === "recent" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const recentSearch = recentSearches.find(
                          (s) => s.title === suggestion.title
                        );
                        if (recentSearch) {
                          removeRecentSearch(recentSearch);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-all duration-200"
                      title="Supprimer de l'historique"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </>
          )}

          {/* No results */}
          {searchValue.trim() && suggestions.length === 0 && !isLoading && (
            <div className="p-4 text-center text-gray-500">
              Aucun résultat trouvé pour &ldquo;{searchValue}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
