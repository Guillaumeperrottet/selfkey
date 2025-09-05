"use client";

import { useState } from "react";
import { Search, Map, Navigation } from "lucide-react";
import Link from "next/link";

interface SearchSuggestion {
  id: string;
  type: "location" | "map" | "parking";
  title: string;
  subtitle?: string;
  icon: "location" | "map" | "parking";
}

const suggestions: SearchSuggestion[] = [
  {
    id: "use-map",
    type: "map",
    title: "Use the map",
    subtitle: "Explore all available spots",
    icon: "map",
  },
  {
    id: "gumefens",
    type: "location",
    title: "Gumefens, 1643, Switzerland",
    subtitle: "Last search",
    icon: "location",
  },
  {
    id: "fribourg",
    type: "parking",
    title: "(1700) Fribourg - 10 Chemin de Lorette",
    subtitle: "Parking spot",
    icon: "parking",
  },
];

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => setIsOpen(false), 200);
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "map":
        return <Map className="w-5 h-5 text-vintage-teal" />;
      case "location":
        return <Navigation className="w-5 h-5 text-vintage-yellow" />;
      case "parking":
        return (
          <div className="w-5 h-5 bg-vintage-orange rounded-full flex items-center justify-center text-white text-xs font-bold">
            P
          </div>
        );
      default:
        return <Search className="w-5 h-5 text-vintage-teal" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="City, country, address ..."
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-vintage-gray rounded-xl focus:outline-none focus:border-vintage-teal transition-colors bg-white shadow-lg"
        />
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-vintage-gray-light z-50">
          {/* Use the map suggestion */}
          <Link
            href="/map"
            className="flex items-center gap-4 p-4 hover:bg-vintage-gray-light transition-colors border-b border-vintage-gray-light"
          >
            <div className="w-10 h-10 bg-vintage-teal/10 rounded-lg flex items-center justify-center">
              <Map className="w-5 h-5 text-vintage-teal" />
            </div>
            <div>
              <div className="font-medium text-vintage-black">Use the map</div>
              <div className="text-sm text-gray-600">
                Explore all available spots
              </div>
            </div>
          </Link>

          {/* Last searches header */}
          <div className="px-4 py-3 text-sm font-medium text-gray-500 bg-vintage-gray-light/50">
            Last searches
          </div>

          {/* Search suggestions */}
          {suggestions.slice(1).map((suggestion) => (
            <button
              key={suggestion.id}
              className="w-full flex items-center gap-4 p-4 hover:bg-vintage-gray-light transition-colors text-left"
              onClick={() => {
                // Handle suggestion click
                if (suggestion.type === "location") {
                  // Redirect to map with location
                  window.location.href =
                    "/map?location=" + encodeURIComponent(suggestion.title);
                }
              }}
            >
              <div className="w-10 h-10 bg-vintage-gray/20 rounded-lg flex items-center justify-center">
                {getIcon(suggestion.icon)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-vintage-black">
                  {suggestion.title}
                </div>
                {suggestion.subtitle && (
                  <div className="text-sm text-gray-600">
                    {suggestion.subtitle}
                  </div>
                )}
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
