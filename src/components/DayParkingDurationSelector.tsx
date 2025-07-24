"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft } from "lucide-react";

interface DayParkingDurationSelectorProps {
  onSelect: (duration: string, price: number) => void;
  onBack: () => void;
  establishmentName: string;
  tariffs: {
    tarif1h: number;
    tarif2h: number;
    tarif3h: number;
    tarif4h: number;
    tarifHalfDay: number;
    tarifFullDay: number;
  };
}

interface DurationOption {
  id: string;
  label: string;
  duration: string;
  price: number;
  description: string;
  popular?: boolean;
}

export function DayParkingDurationSelector({
  onSelect,
  onBack,
  establishmentName,
  tariffs,
}: DayParkingDurationSelectorProps) {
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  const durationOptions: DurationOption[] = [
    {
      id: "1h",
      label: "1 heure",
      duration: "1h",
      price: tariffs.tarif1h,
      description: "Parfait pour une visite rapide",
    },
    {
      id: "2h",
      label: "2 heures",
      duration: "2h",
      price: tariffs.tarif2h,
      description: "Idéal pour un rendez-vous",
    },
    {
      id: "3h",
      label: "3 heures",
      duration: "3h",
      price: tariffs.tarif3h,
      description: "Pour une matinée ou après-midi",
    },
    {
      id: "4h",
      label: "4 heures",
      duration: "4h",
      price: tariffs.tarif4h,
      description: "Demi-journée de travail",
    },
    {
      id: "half_day",
      label: "Demi-journée",
      duration: "half_day",
      price: tariffs.tarifHalfDay,
      description: "6 heures de stationnement",
      popular: true,
    },
    {
      id: "full_day",
      label: "Journée complète",
      duration: "full_day",
      price: tariffs.tarifFullDay,
      description: "12 heures de stationnement",
      popular: true,
    },
  ];

  const handleSelect = (duration: string, price: number) => {
    setSelectedDuration(duration);
    onSelect(duration, price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header avec bouton retour */}
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Parking Jour - {establishmentName}
            </h1>
            <p className="text-gray-600">
              Choisissez la durée de votre stationnement
            </p>
          </div>
        </div>

        {/* Information sur l'heure de début */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-800">
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              Début du stationnement : Maintenant
            </span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Votre temps de stationnement commence dès la confirmation du
            paiement
          </p>
        </div>

        {/* Grille des options de durée */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {durationOptions.map((option) => (
            <Card
              key={option.id}
              className={`cursor-pointer hover:shadow-lg transition-all border-2 relative ${
                selectedDuration === option.duration
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => handleSelect(option.duration, option.price)}
            >
              {option.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white px-3 py-1">
                    Populaire
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-gray-900">
                  {option.label}
                </CardTitle>
                <div className="text-2xl font-bold text-blue-600">
                  {option.price.toFixed(2)} CHF
                </div>
              </CardHeader>

              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  {option.description}
                </p>

                <Button
                  className={`w-full ${
                    selectedDuration === option.duration
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-blue-600 hover:text-white"
                  }`}
                  variant={
                    selectedDuration === option.duration ? "default" : "outline"
                  }
                >
                  {selectedDuration === option.duration
                    ? "Sélectionné"
                    : "Choisir"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bouton de continuation */}
        {selectedDuration && (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg p-6 shadow-md max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Durée sélectionnée
              </h3>
              <p className="text-gray-600 mb-4">
                {
                  durationOptions.find(
                    (opt) => opt.duration === selectedDuration
                  )?.label
                }
              </p>
              <p className="text-2xl font-bold text-blue-600 mb-4">
                {durationOptions
                  .find((opt) => opt.duration === selectedDuration)
                  ?.price.toFixed(2)}{" "}
                CHF
              </p>
              <Button
                onClick={() => {
                  const option = durationOptions.find(
                    (opt) => opt.duration === selectedDuration
                  );
                  if (option) {
                    handleSelect(option.duration, option.price);
                  }
                }}
                size="lg"
                className="w-full"
              >
                Continuer vers le paiement
              </Button>
            </div>
          </div>
        )}

        {/* Note informative */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Les tarifs incluent toutes les taxes. Aucun frais supplémentaire.
          </p>
        </div>
      </div>
    </div>
  );
}
