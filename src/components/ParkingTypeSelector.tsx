"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Moon, Sun, Clock } from "lucide-react";

interface ParkingTypeSelectorProps {
  onSelect: (type: "night" | "day") => void;
  establishmentName: string;
  isNightBookingClosed?: boolean;
  cutoffTime?: string;
  reopenTime?: string;
}

export function ParkingTypeSelector({
  onSelect,
  establishmentName,
  isNightBookingClosed = false,
  cutoffTime,
  reopenTime,
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
          <p className="text-gray-600">Choose your booking type</p>
        </div>

        {/* Sélection du type de parking */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Parking Jour */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Sun className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Parking Jour / Day Parking
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 mb-4">
                Stationnement / daily parking
              </p>

              <Button
                onClick={() => handleSelect("day")}
                className="w-full mt-6
                "
                size="lg"
              >
                Continue
              </Button>
            </CardContent>
          </Card>

          {/* Parking Nuit */}
          <Card
            className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${
              isNightBookingClosed
                ? "opacity-60 border-gray-300"
                : "hover:border-blue-500"
            }`}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Moon className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Parking Nuit / Night Parking
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 mb-4">
                Réservation pour la nuit / Overnight booking
              </p>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <span>
                    Des contrôles sont effectués / Controls are performed
                  </span>
                </div>
              </div>

              {isNightBookingClosed && (
                <Alert className="border-red-200 bg-red-50 mb-4">
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="text-red-800 text-sm">
                    Réservations fermées depuis {cutoffTime}. Réouverture à{" "}
                    {reopenTime}.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={() => handleSelect("night")}
                className="w-full mt-6"
                size="lg"
                disabled={isNightBookingClosed}
              >
                {isNightBookingClosed ? "Fermé / Closed" : "Continue"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
