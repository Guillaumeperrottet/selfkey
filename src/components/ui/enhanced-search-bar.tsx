"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, MapPin, Navigation, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  type: "establishment" | "location" | "recent";
  title: string;
  subtitle?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  establishment?: {
    id: string;
    name: string;
    location: string;
    latitude: number;
    longitude: number;
  };
}

interface Establishment {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
}

interface EnhancedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: {
    lat: number;
    lng: number;
    name: string;
  }) => void;
  onEstablishmentSelect?: (establishment: Establishment) => void;
  placeholder?: string;
}

export default function EnhancedSearchBar({
  value,
  onChange,
  onLocationSelect,
  onEstablishmentSelect,
  placeholder = "Rechercher par nom, ville, description...",
}: EnhancedSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger les recherches récentes
  useEffect(() => {
    const saved = localStorage.getItem("selfcamp_map_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore errors
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
      localStorage.setItem(
        "selfcamp_map_recent_searches",
        JSON.stringify(updated)
      );
      return updated;
    });
  }, []);

  // Fonction de recherche avec debounce
  const searchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Recherche à la fois des lieux et des établissements
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
  const handleInputChange = (newValue: string) => {
    onChange(newValue);

    // Annuler la recherche précédente
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Lancer une nouvelle recherche après 300ms
    searchTimeoutRef.current = setTimeout(() => {
      searchSuggestions(newValue);
    }, 300);
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (!value.trim() && recentSearches.length > 0) {
      // Afficher les recherches récentes
      const recentSuggestions: SearchSuggestion[] = recentSearches.map(
        (search, index) => ({
          id: `recent-${index}`,
          type: "recent",
          title: search.title,
          subtitle: search.subtitle || "Recherche récente",
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
    if (suggestion.type === "location" && suggestion.coordinates) {
      saveRecentSearch({
        title: suggestion.title,
        subtitle: suggestion.subtitle,
        coordinates: suggestion.coordinates,
      });
      onLocationSelect?.({
        lat: suggestion.coordinates.lat,
        lng: suggestion.coordinates.lng,
        name: suggestion.title,
      });
      onChange(suggestion.title);
    } else if (
      suggestion.type === "establishment" &&
      suggestion.establishment
    ) {
      saveRecentSearch({
        title: suggestion.title,
        subtitle: suggestion.subtitle,
      });
      onEstablishmentSelect?.(suggestion.establishment);
      onChange(suggestion.title);
    } else if (suggestion.type === "recent") {
      // Pour les recherches récentes, utiliser directement les coordonnées si disponibles
      if (suggestion.coordinates) {
        onLocationSelect?.({
          lat: suggestion.coordinates.lat,
          lng: suggestion.coordinates.lng,
          name: suggestion.title,
        });
      } else {
        // Sinon, relancer une recherche
        searchSuggestions(suggestion.title);
      }
      onChange(suggestion.title);
    }
    setIsOpen(false);
  };

  // Géolocalisation
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationSelect?.({
          lat: latitude,
          lng: longitude,
          name: "Ma position",
        });
        onChange("Ma position");
        setIsGeolocating(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        alert("Impossible d'obtenir votre position");
        setIsGeolocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const getIcon = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case "location":
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case "establishment":
        return <Navigation className="w-4 h-4 text-green-500" />;
      case "recent":
        return <Search className="w-4 h-4 text-gray-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />

        {/* Actions à droite */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Bouton géolocalisation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGeolocation}
            disabled={isGeolocating}
            className="h-7 w-7 p-0 hover:bg-blue-50"
            title="Ma position"
          >
            {isGeolocating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Navigation className="h-3 w-3 text-blue-500" />
            )}
          </Button>

          {/* Bouton effacer */}
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="h-7 w-7 p-0 hover:bg-gray-50"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
          {/* Recherches récentes */}
          {!value.trim() && recentSearches.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                Recherches récentes
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md text-left transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {getIcon(suggestion)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </div>
                    {suggestion.subtitle && (
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.subtitle}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions de recherche */}
          {value.trim() && suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                Suggestions
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md text-left transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {getIcon(suggestion)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </div>
                    {suggestion.subtitle && (
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.subtitle}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Aucun résultat */}
          {value.trim() && suggestions.length === 0 && !isLoading && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Aucun résultat trouvé pour &ldquo;{value}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
