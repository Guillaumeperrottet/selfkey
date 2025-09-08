"use client";

import { useState, useEffect } from "react";
import { DateSelector } from "@/components/DateSelector";
import { RoomSelector } from "@/components/RoomSelector";
import { BookingFormDetails } from "@/components/BookingFormDetails";
import { BookingSteps } from "@/components/BookingSteps";

interface Room {
  id: string;
  name: string;
  price: number;
}

interface Establishment {
  name: string;
  maxBookingDays: number;
  allowFutureBookings: boolean;
  enableDogOption?: boolean;
  enableCutoffTime?: boolean;
  cutoffTime?: string;
  reopenTime?: string;
}

interface BookingFormModernProps {
  hotelSlug: string;
  establishment: Establishment;
}

type BookingStep = "dates" | "rooms" | "details";

export function BookingFormModern({
  hotelSlug,
  establishment,
}: BookingFormModernProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("dates");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [hasDog, setHasDog] = useState(false);
  const [selectedPricingOptions, setSelectedPricingOptions] = useState<
    Record<string, string | string[]>
  >({});
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Charger les données sauvegardées si l'utilisateur revient
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const keys = Object.keys(sessionStorage);
        const bookingKey = keys.find((key) => key.startsWith(`booking_temp_`));

        if (bookingKey) {
          const savedBookingData = sessionStorage.getItem(bookingKey);
          if (savedBookingData) {
            const data = JSON.parse(savedBookingData);

            if (data.hotelSlug === hotelSlug) {
              // Restaurer les données du formulaire
              if (data.checkInDate && data.checkOutDate) {
                setCheckInDate(data.checkInDate);
                setCheckOutDate(data.checkOutDate);

                // Si une chambre était sélectionnée, passer à la dernière étape
                if (data.room) {
                  setSelectedRoom(data.room);
                  setCurrentStep("details");
                } else if (data.selectedPricingOptions) {
                  setSelectedPricingOptions(data.selectedPricingOptions);
                  setCurrentStep("rooms");
                } else {
                  setCurrentStep("rooms");
                }
              }

              console.log(
                "DEBUG: Données du formulaire restaurées depuis sessionStorage"
              );
            }
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données sauvegardées:",
          error
        );
      }
    };

    loadSavedData();
  }, [hotelSlug]);

  const handleDatesConfirmed = (
    checkIn: string,
    checkOut: string,
    withDog?: boolean,
    pricingOptions?: Record<string, string | string[]>
  ) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
    setHasDog(withDog || false);
    setSelectedPricingOptions(pricingOptions || {});
    setCurrentStep("rooms");
  };

  const handleRoomSelected = (room: Room) => {
    setSelectedRoom(room);
    setCurrentStep("details");
  };

  const handleBackToDates = () => {
    setCurrentStep("dates");
    setSelectedPricingOptions({});
    setSelectedRoom(null);
  };

  const handleBackToRooms = () => {
    setCurrentStep("rooms");
    setSelectedRoom(null);
  };

  const getCurrentStepNumber = () => {
    switch (currentStep) {
      case "dates":
        return 1;
      case "rooms":
        return 2;
      case "details":
        return 3;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicateur d'étapes */}
      <BookingSteps currentStep={getCurrentStepNumber()} />

      {/* Contenu selon l'étape actuelle */}
      {currentStep === "dates" && (
        <DateSelector
          hotelSlug={hotelSlug}
          establishment={establishment}
          onDatesConfirmed={handleDatesConfirmed}
          initialCheckInDate={checkInDate}
          initialCheckOutDate={checkOutDate}
          initialHasDog={hasDog}
          initialPricingOptions={selectedPricingOptions}
        />
      )}

      {currentStep === "rooms" && checkInDate && checkOutDate && (
        <RoomSelector
          hotelSlug={hotelSlug}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          hasDog={hasDog}
          onRoomSelected={handleRoomSelected}
          onBack={handleBackToDates}
        />
      )}

      {currentStep === "details" &&
        selectedRoom &&
        checkInDate &&
        checkOutDate && (
          <BookingFormDetails
            hotelSlug={hotelSlug}
            establishmentName={establishment.name}
            selectedRoom={selectedRoom}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            hasDog={hasDog}
            selectedPricingOptions={selectedPricingOptions}
            onBack={handleBackToRooms}
          />
        )}
    </div>
  );
}
