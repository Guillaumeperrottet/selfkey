"use client";

import { useState, useEffect } from "react";
import { BookingFormModern } from "@/components/BookingFormModern";
import { ParkingTypeSelector } from "@/components/ParkingTypeSelector";
import { DayParkingDurationSelector } from "@/components/DayParkingDurationSelector";
import { DayParkingForm } from "@/components/DayParkingForm";
import { ClosedPage } from "@/components/ClosedPage";
import { checkCutoffTime } from "@/lib/time-utils";

interface Establishment {
  name: string;
  maxBookingDays: number;
  allowFutureBookings: boolean;
  enableDayParking?: boolean;
  parkingOnlyMode?: boolean;
  enableDogOption?: boolean;
  enableCutoffTime?: boolean;
  cutoffTime?: string;
  reopenTime?: string;
}

interface DayParkingConfig {
  enableDayParking: boolean;
  tariffs?: {
    tarif1h: number;
    tarif2h: number;
    tarif3h: number;
    tarif4h: number;
    tarifHalfDay: number;
    tarifFullDay: number;
  };
}

interface HotelLandingProps {
  hotelSlug: string;
  establishment: Establishment;
}

type FlowStep = "choice" | "night_booking" | "day_duration" | "day_form";

export function HotelLanding({ hotelSlug, establishment }: HotelLandingProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>("choice");
  const [dayParkingConfig, setDayParkingConfig] =
    useState<DayParkingConfig | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Vérifier le cutoff time dès le début
  const cutoffResult =
    establishment.enableCutoffTime &&
    establishment.cutoffTime &&
    establishment.reopenTime
      ? checkCutoffTime(
          establishment.enableCutoffTime,
          establishment.cutoffTime,
          establishment.reopenTime
        )
      : { isAfterCutoff: false, nextAvailableTime: null, message: "" };

  const isClosed = cutoffResult.isAfterCutoff;

  // Charger la configuration du parking jour
  useEffect(() => {
    const loadDayParkingConfig = async () => {
      try {
        const response = await fetch(
          `/api/establishments/${hotelSlug}/day-parking-config`
        );
        if (response.ok) {
          const config = await response.json();
          setDayParkingConfig(config);

          // Si le parking jour n'est pas activé, aller directement au formulaire de réservation nuit
          if (!config.enableDayParking) {
            setCurrentStep("night_booking");
          }
        }
      } catch (error) {
        console.error("Error loading day parking config:", error);
        // En cas d'erreur, aller directement au formulaire de réservation nuit
        setCurrentStep("night_booking");
      } finally {
        setLoading(false);
      }
    };

    loadDayParkingConfig();
  }, [hotelSlug]);

  // Effet pour rediriger automatiquement vers le parking si le mode parking uniquement est activé
  useEffect(() => {
    if (establishment.parkingOnlyMode && currentStep === "choice" && !loading) {
      setCurrentStep("day_duration");
    }
  }, [establishment.parkingOnlyMode, currentStep, loading]);

  const handleParkingTypeSelect = (type: "night" | "day") => {
    if (type === "night") {
      setCurrentStep("night_booking");
    } else {
      setCurrentStep("day_duration");
    }
  };

  const handleDurationSelect = (duration: string, price: number) => {
    setSelectedDuration(duration);
    setSelectedPrice(price);
    setCurrentStep("day_form");
  };

  const handleBackToDuration = () => {
    setCurrentStep("day_duration");
  };

  // Si c'est fermé et qu'on n'a que les réservations nuit ou qu'on clique sur nuit, afficher la page fermée
  if (
    isClosed &&
    (!dayParkingConfig?.enableDayParking || currentStep === "night_booking")
  ) {
    return (
      <ClosedPage
        establishmentName={establishment.name}
        cutoffTime={establishment.cutoffTime!}
        reopenTime={establishment.reopenTime!}
        nextAvailableTime={cutoffResult.nextAvailableTime?.toLocaleString()}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {establishment.name}
            </h1>
            <p className="text-gray-600">Chargement...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Si le parking jour n'est pas activé, afficher directement le formulaire de réservation nuit
  if (!dayParkingConfig?.enableDayParking || currentStep === "night_booking") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {establishment.name}
            </h1>
            <p className="text-gray-600">Night</p>
          </div>

          <BookingFormModern
            hotelSlug={hotelSlug}
            establishment={establishment}
          />
        </div>
      </div>
    );
  }

  // Affichage selon l'étape du processus
  switch (currentStep) {
    case "choice":
      // Si le mode parking uniquement est activé, rediriger vers la sélection de durée
      if (establishment.parkingOnlyMode) {
        return (
          <DayParkingDurationSelector
            onSelect={handleDurationSelect}
            establishmentName={establishment.name}
            tariffs={dayParkingConfig.tariffs!}
          />
        );
      }

      return (
        <ParkingTypeSelector
          onSelect={handleParkingTypeSelect}
          establishmentName={establishment.name}
        />
      );

    case "day_duration":
      return (
        <DayParkingDurationSelector
          onSelect={handleDurationSelect}
          establishmentName={establishment.name}
          tariffs={dayParkingConfig.tariffs!}
        />
      );

    case "day_form":
      return (
        <DayParkingForm
          onBack={handleBackToDuration}
          hotelSlug={hotelSlug}
          establishmentName={establishment.name}
          selectedDuration={selectedDuration}
          selectedPrice={selectedPrice}
        />
      );

    default:
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Erreur</h1>
              <p className="text-gray-600">Une erreur s&apos;est produite</p>
            </div>
          </div>
        </div>
      );
  }
}
