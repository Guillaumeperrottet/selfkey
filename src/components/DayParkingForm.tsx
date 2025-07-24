"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Clock,
  User,
  Mail,
  Phone,
  Car,
  Calendar,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface DayParkingFormProps {
  onBack: () => void;
  hotelSlug: string;
  establishmentName: string;
  selectedDuration: string;
  selectedPrice: number;
}

export function DayParkingForm({
  onBack,
  hotelSlug,
  establishmentName,
  selectedDuration,
  selectedPrice,
}: DayParkingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Informations client simplifiées pour parking jour
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientVehicleNumber, setClientVehicleNumber] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState(true);

  const getDurationLabel = (duration: string) => {
    const labels = {
      "1h": "1 heure",
      "2h": "2 heures",
      "3h": "3 heures",
      "4h": "4 heures",
      half_day: "Demi-journée (6h)",
      full_day: "Journée complète (12h)",
    };
    return labels[duration as keyof typeof labels] || duration;
  };

  const calculateEndTime = (duration: string) => {
    const now = new Date();
    const hours = {
      "1h": 1,
      "2h": 2,
      "3h": 3,
      "4h": 4,
      half_day: 6,
      full_day: 12,
    };

    const endTime = new Date(
      now.getTime() +
        (hours[duration as keyof typeof hours] || 1) * 60 * 60 * 1000
    );
    return endTime.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs obligatoires
    if (
      !clientFirstName.trim() ||
      !clientLastName.trim() ||
      !clientEmail.trim() ||
      !clientPhone.trim() ||
      !clientVehicleNumber.trim()
    ) {
      toastUtils.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      toastUtils.error("Veuillez saisir une adresse email valide");
      return;
    }

    setLoading(true);
    const loadingToast = toastUtils.loading(
      "Création de votre réservation parking jour..."
    );

    try {
      // Calculer les heures de début et fin
      const now = new Date();
      const hours = {
        "1h": 1,
        "2h": 2,
        "3h": 3,
        "4h": 4,
        half_day: 6,
        full_day: 12,
      };
      const endTime = new Date(
        now.getTime() +
          (hours[selectedDuration as keyof typeof hours] || 1) * 60 * 60 * 1000
      );

      const response = await fetch(
        `/api/establishments/${hotelSlug}/day-parking-bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Informations client essentielles
            clientFirstName: clientFirstName.trim(),
            clientLastName: clientLastName.trim(),
            clientEmail: clientEmail.trim(),
            clientPhone: clientPhone.trim(),
            clientVehicleNumber: clientVehicleNumber.trim(),
            emailConfirmation,
            // Informations parking jour
            bookingType: "day",
            dayParkingDuration: selectedDuration,
            dayParkingStartTime: now.toISOString(),
            dayParkingEndTime: endTime.toISOString(),
            amount: selectedPrice,
            // Informations par défaut (requises par le schéma)
            clientBirthDate: "1990-01-01", // Date par défaut pour parking jour
            clientAddress: "Non requis pour parking jour",
            clientPostalCode: "0000",
            clientCity: "Non requis",
            clientCountry: "Suisse",
            clientIdNumber: "Non requis pour parking jour",
            adults: 1,
            children: 0,
          }),
        }
      );

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        const data = await response.json();

        // Sauvegarder les informations dans sessionStorage
        const bookingData = {
          bookingId: data.booking.id,
          clientFirstName,
          clientLastName,
          clientEmail,
          clientPhone,
          clientVehicleNumber,
          selectedDuration,
          selectedPrice,
          startTime: now.toISOString(),
          endTime: endTime.toISOString(),
        };

        const storageKey = `day_parking_temp_${hotelSlug}_${data.booking.id}`;
        sessionStorage.setItem(storageKey, JSON.stringify(bookingData));

        toastUtils.success("Réservation créée avec succès !");

        // Rediriger vers le paiement
        router.push(
          `/${hotelSlug}/payment?booking=${data.booking.id}&type=day`
        );
      } else {
        const errorData = await response.json();
        toastUtils.error(
          errorData.error || "Erreur lors de la création de la réservation"
        );
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la création de la réservation");
      console.error("Error creating day parking booking:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header avec bouton retour */}
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Réservation Parking Jour
            </h1>
            <p className="text-gray-600">{establishmentName}</p>
          </div>
        </div>

        {/* Résumé de la sélection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              Détails de votre réservation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Durée :</span>
              <Badge variant="secondary">
                {getDurationLabel(selectedDuration)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Début :</span>
              <span className="font-medium">Maintenant</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fin :</span>
              <span className="font-medium">
                {calculateEndTime(selectedDuration)}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold border-t pt-3">
              <span>Total :</span>
              <span className="text-blue-600">
                {selectedPrice.toFixed(2)} CHF
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire client */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Vos informations
            </CardTitle>
            <p className="text-sm text-gray-600">
              Informations nécessaires pour votre réservation parking jour
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom et prénom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={clientFirstName}
                    onChange={(e) => setClientFirstName(e.target.value)}
                    required
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={clientLastName}
                    onChange={(e) => setClientLastName(e.target.value)}
                    required
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              {/* Email et téléphone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    required
                    placeholder="+41 79 123 45 67"
                  />
                </div>
              </div>

              {/* Numéro de véhicule */}
              <div className="space-y-2">
                <Label htmlFor="vehicle">
                  <Car className="w-4 h-4 inline mr-1" />
                  Plaque d&apos;immatriculation{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="vehicle"
                  type="text"
                  value={clientVehicleNumber}
                  onChange={(e) => setClientVehicleNumber(e.target.value)}
                  required
                  placeholder="VD 123456"
                />
                <p className="text-xs text-gray-500">
                  Obligatoire pour le contrôle du parking
                </p>
              </div>

              {/* Confirmation par email */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailConfirmation"
                  checked={emailConfirmation}
                  onCheckedChange={(checked) =>
                    setEmailConfirmation(checked === true)
                  }
                />
                <Label htmlFor="emailConfirmation" className="text-sm">
                  Recevoir la confirmation par email
                </Label>
              </div>

              {/* Information importante */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 mb-1">
                      Important à retenir :
                    </p>
                    <p className="text-blue-700">
                      Votre temps de stationnement commence dès la confirmation
                      du paiement. Vous recevrez vos informations d&apos;accès
                      par email immédiatement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Création en cours..." : "Procéder au paiement"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
