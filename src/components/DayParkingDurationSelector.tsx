"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

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
  labelEn: string;
  duration: string;
  price: number;
}

export function DayParkingDurationSelector({
  onSelect,
  establishmentName,
  tariffs,
}: DayParkingDurationSelectorProps) {
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  const durationOptions: DurationOption[] = [
    {
      id: "1h",
      label: "1 heure",
      labelEn: "1 hour",
      duration: "1h",
      price: tariffs.tarif1h,
    },
    {
      id: "2h",
      label: "2 heures",
      labelEn: "2 hours",
      duration: "2h",
      price: tariffs.tarif2h,
    },
    {
      id: "3h",
      label: "3 heures",
      labelEn: "3 hours",
      duration: "3h",
      price: tariffs.tarif3h,
    },
    {
      id: "4h",
      label: "4 heures",
      labelEn: "4 hours",
      duration: "4h",
      price: tariffs.tarif4h,
    },
    {
      id: "half_day",
      label: "Demi-journée",
      labelEn: "Half day",
      duration: "half_day",
      price: tariffs.tarifHalfDay,
    },
    {
      id: "full_day",
      label: "Journée complète",
      labelEn: "Full day",
      duration: "full_day",
      price: tariffs.tarifFullDay,
    },
  ];

  const handleSelect = (duration: string, price: number) => {
    setSelectedDuration(duration);
    onSelect(duration, price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header avec bouton retour */}
        <div className="flex items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Parking Jour - {establishmentName}
            </h1>
            <p className="text-gray-600">
              Choisissez la durée de votre stationnement / Choose your parking
              duration
            </p>
          </div>
        </div>

        {/* Information sur l'heure de début */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-2 text-blue-800">
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              Début du stationnement : Maintenant / Parking starts: Now
            </span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Votre temps de stationnement commence dès la confirmation du
            paiement
            <br />
            <em>Your parking time starts upon payment confirmation</em>
          </p>
        </div>

        {/* Sélecteur simple */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Sélectionnez votre durée / Select your duration
          </h2>

          <div className="space-y-3">
            {durationOptions.map((option) => (
              <div
                key={option.id}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                  selectedDuration === option.duration
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => handleSelect(option.duration, option.price)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        selectedDuration === option.duration
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedDuration === option.duration && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">
                        {option.label} / {option.labelEn}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-600">
                      {option.price.toFixed(2)} CHF
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton de continuation */}
          {selectedDuration && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">
                  Durée sélectionnée / Selected duration:
                </span>
                <span className="font-medium">
                  {
                    durationOptions.find(
                      (opt) => opt.duration === selectedDuration
                    )?.label
                  }{" "}
                  /{" "}
                  {
                    durationOptions.find(
                      (opt) => opt.duration === selectedDuration
                    )?.labelEn
                  }
                </span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-600">
                  Total à payer / Total to pay:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {durationOptions
                    .find((opt) => opt.duration === selectedDuration)
                    ?.price.toFixed(2)}{" "}
                  CHF
                </span>
              </div>
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
                Continuer vers le paiement / Continue to payment
              </Button>
            </div>
          )}
        </div>

        {/* Note informative */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Les tarifs incluent toutes les taxes. Aucun frais supplémentaire.
            <br />
            <em>Rates include all taxes. No additional fees.</em>
          </p>
        </div>
      </div>
    </div>
  );
}
