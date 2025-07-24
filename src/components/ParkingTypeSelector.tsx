"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Moon, Sun, Car } from "lucide-react";

interface ParkingTypeSelectorProps {
  onSelect: (type: "night" | "day") => void;
  establishmentName: string;
}

export function ParkingTypeSelector({
  onSelect,
  establishmentName,
}: ParkingTypeSelectorProps) {
  const handleSelect = (type: "night" | "day") => {
    onSelect(type);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {establishmentName}
          </h1>
          <p className="text-gray-600">Choisissez votre type de réservation</p>
        </div>

        {/* Sélection du type de parking */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Parking Nuit */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Moon className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Parking Nuit
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 mb-4">
                Réservation traditionnelle avec sélection de dates
                d&apos;arrivée et de départ
              </p>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Séjour de plusieurs nuits</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Car className="w-4 h-4" />
                  <span>Parking inclus pendant le séjour</span>
                </div>
              </div>

              <Button
                onClick={() => handleSelect("night")}
                className="w-full mt-6"
                size="lg"
              >
                Continuer avec Parking Nuit
              </Button>
            </CardContent>
          </Card>

          {/* Parking Jour */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Sun className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Parking Jour
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 mb-4">
                Stationnement temporaire avec tarifs à l&apos;heure ou à la
                journée
              </p>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Durées flexibles (1h à journée complète)</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Car className="w-4 h-4" />
                  <span>Idéal pour visites courtes</span>
                </div>
              </div>

              <Button
                onClick={() => handleSelect("day")}
                className="w-full mt-6"
                variant="outline"
                size="lg"
              >
                Continuer avec Parking Jour
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Information supplémentaire */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Vous pourrez modifier votre choix à l&apos;étape suivante si
            nécessaire
          </p>
        </div>
      </div>
    </div>
  );
}
