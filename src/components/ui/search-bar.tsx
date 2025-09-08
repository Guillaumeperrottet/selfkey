"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Map, Navigation, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
}

const RECENT_SEARCHES_KEY = "selfcamp_recent_searches";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const router = useRouter();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  const searchEstablishments = useCallback(async (query: string) => {
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
        const results: SearchSuggestion[] = await response.json();
        setSuggestions(results);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Gérer la saisie avec debounce
  const handleInputChange = (value: string) => {
    setSearchValue(value);

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
      // Sauvegarder dans l'historique
      saveRecentSearch({
        title: suggestion.title,
        subtitle: suggestion.subtitle || undefined,
        coordinates: suggestion.coordinates,
      });

      // Rediriger vers la map avec coordonnées géographiques
      const params = new URLSearchParams({
        search: suggestion.title,
        lat: suggestion.coordinates.lat.toString(),
        lng: suggestion.coordinates.lng.toString(),
        zoom: "12",
      });
      router.push(`/map?${params.toString()}`);
    } else if (suggestion.type === "recent") {
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

  const getIcon = (iconType: string, suggestionType?: string) => {
    switch (iconType) {
      case "map":
        return <Map className="w-5 h-5 text-vintage-teal" />;
      case "location":
        // Différencier les établissements des lieux géographiques
        if (suggestionType === "establishment") {
          return <Navigation className="w-5 h-5 text-vintage-yellow" />;
        } else {
          return <Map className="w-5 h-5 text-vintage-teal" />;
        }
      case "recent":
        return <Search className="w-5 h-5 text-gray-400" />;
      default:
        return <Search className="w-5 h-5 text-vintage-teal" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Search Input */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Rechercher un emplacement, ville, camping..."
            className="w-full pl-12 pr-12 py-4 text-lg border-2 border-vintage-gray rounded-xl focus:outline-none focus:border-vintage-teal transition-colors bg-white shadow-lg"
          />

          {/* Clear button */}
          {searchValue && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 hover:rounded-r-xl transition-colors"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}

          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <div className="animate-spin h-4 w-4 border-2 border-vintage-teal border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-vintage-gray-light z-50 max-h-96 overflow-y-auto">
          {/* Use the map suggestion */}
          <Link
            href="/map"
            className="flex items-center gap-4 p-4 hover:bg-vintage-gray-light/70 hover:shadow-sm transition-all duration-200 ease-in-out border-b border-vintage-gray-light cursor-pointer group"
          >
            <div className="w-10 h-10 bg-vintage-teal/10 rounded-lg flex items-center justify-center group-hover:bg-vintage-teal/20 transition-colors duration-200">
              <Map className="w-5 h-5 text-vintage-teal" />
            </div>
            <div>
              <div className="font-medium text-vintage-black group-hover:text-vintage-teal transition-colors duration-200">
                Voir la carte
              </div>
              <div className="text-sm text-gray-600">
                Explorer tous les emplacements disponibles
              </div>
            </div>
          </Link>

          {/* Search suggestions */}
          {suggestions.length > 0 && (
            <>
              {!searchValue.trim() && recentSearches.length > 0 && (
                <div className="px-4 py-3 text-sm font-medium text-gray-500 bg-vintage-gray-light/50">
                  Recherches récentes
                </div>
              )}
              {searchValue.trim() && (
                <div className="px-4 py-3 text-sm font-medium text-gray-500 bg-vintage-gray-light/50">
                  Résultats de recherche
                </div>
              )}

              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className="w-full flex items-center gap-4 p-4 hover:bg-vintage-gray-light/70 hover:shadow-sm transition-all duration-200 ease-in-out text-left cursor-pointer group transform hover:translate-x-1"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="w-10 h-10 bg-vintage-gray/20 rounded-lg flex items-center justify-center group-hover:bg-vintage-gray/30 group-hover:scale-105 transition-all duration-200">
                    {getIcon(suggestion.icon, suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-vintage-black group-hover:text-vintage-teal transition-colors duration-200">
                      {suggestion.title}
                    </div>
                    {suggestion.subtitle && (
                      <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                        {suggestion.subtitle}
                      </div>
                    )}
                  </div>
                </button>
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
