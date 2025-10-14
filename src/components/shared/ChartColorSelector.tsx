"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Palette, RotateCcw, Check } from "lucide-react";

interface ChartColors {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

interface ChartColorSelectorProps {
  onColorsChange: (colors: ChartColors) => void;
  currentColors: ChartColors;
}

const DEFAULT_COLORS: ChartColors = {
  chart1: "#3b82f6", // blue
  chart2: "#10b981", // emerald
  chart3: "#f59e0b", // amber
  chart4: "#ef4444", // red
  chart5: "#8b5cf6", // violet
};

const PRESET_THEMES = [
  {
    name: "Défaut",
    colors: DEFAULT_COLORS,
  },
  {
    name: "Ocean",
    colors: {
      chart1: "#0ea5e9", // sky
      chart2: "#06b6d4", // cyan
      chart3: "#3b82f6", // blue
      chart4: "#6366f1", // indigo
      chart5: "#8b5cf6", // violet
    },
  },
  {
    name: "Nature",
    colors: {
      chart1: "#84cc16", // lime
      chart2: "#22c55e", // green
      chart3: "#10b981", // emerald
      chart4: "#14b8a6", // teal
      chart5: "#06b6d4", // cyan
    },
  },
  {
    name: "Sunset",
    colors: {
      chart1: "#f97316", // orange
      chart2: "#f59e0b", // amber
      chart3: "#eab308", // yellow
      chart4: "#ef4444", // red
      chart5: "#ec4899", // pink
    },
  },
  {
    name: "Professionnel",
    colors: {
      chart1: "#1f2937", // gray-800
      chart2: "#374151", // gray-700
      chart3: "#6b7280", // gray-500
      chart4: "#9ca3af", // gray-400
      chart5: "#d1d5db", // gray-300
    },
  },
];

export function ChartColorSelector({
  onColorsChange,
  currentColors,
}: ChartColorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Afficher le message "Sauvegardé" temporairement
  useEffect(() => {
    if (showSaved) {
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSaved]);

  const handleColorChange = (chartKey: keyof ChartColors, color: string) => {
    const newColors = { ...currentColors, [chartKey]: color };
    onColorsChange(newColors);
    setShowSaved(true);
  };

  const handlePresetChange = (preset: ChartColors) => {
    onColorsChange(preset);
    setShowSaved(true);
    setIsOpen(false);
  };

  const resetToDefault = () => {
    onColorsChange(DEFAULT_COLORS);
    setShowSaved(true);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {showSaved ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              Couleurs sauvegardées
            </>
          ) : (
            <>
              <Palette className="h-4 w-4" />
              Couleurs des graphiques
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Personnaliser les couleurs
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefault}
                className="h-8 px-2"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </CardTitle>
            <CardDescription className="text-xs">
              Choisissez les couleurs pour vos graphiques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Thèmes prédéfinis */}
            <div>
              <h4 className="text-sm font-medium mb-2">Thèmes prédéfinis</h4>
              <div className="grid grid-cols-1 gap-2">
                {PRESET_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => handlePresetChange(theme.colors)}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <span className="text-sm">{theme.name}</span>
                    <div className="flex gap-1">
                      {Object.values(theme.colors).map((color, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Couleurs individuelles */}
            <div>
              <h4 className="text-sm font-medium mb-2">
                Couleurs personnalisées
              </h4>
              <div className="space-y-2">
                {Object.entries(currentColors).map(([key, color]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm capitalize">
                        {key.replace("chart", "Couleur ")}
                      </span>
                    </div>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) =>
                        handleColorChange(
                          key as keyof ChartColors,
                          e.target.value
                        )
                      }
                      className="w-8 h-6 border border-border rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Aperçu */}
            <div>
              <h4 className="text-sm font-medium mb-2">Aperçu</h4>
              <div className="flex items-center gap-1 p-2 bg-muted rounded-md">
                {Object.values(currentColors).map((color, index) => (
                  <div
                    key={index}
                    className="flex-1 h-4 first:rounded-l-md last:rounded-r-md"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
