"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Car,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface BookingData {
  id: string;
  vehicleNumber: string;
  currentDuration: string;
  startTime: string;
  endTime: string;
  establishmentName: string;
  hotelSlug: string;
}

export default function ExtendParkingPage() {
  const params = useParams();
  const token = params.token as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Options d'extension
  const extensionOptions = [
    { hours: 1, label: "1 heure", price: "5.00 CHF" },
    { hours: 2, label: "2 heures", price: "10.00 CHF" },
    { hours: 4, label: "4 heures", price: "15.00 CHF" },
    { hours: 8, label: "Journée (+8h)", price: "25.00 CHF" },
  ];

  useEffect(() => {
    loadBookingData();
  }, [token]);

  const loadBookingData = async () => {
    try {
      const response = await fetch(`/api/extend-parking/${token}`);
      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
      } else {
        setError(data.error || "Réservation non trouvée");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleExtension = async (hours: number) => {
    if (!booking) return;

    setExtending(true);
    try {
      const response = await fetch(`/api/extend-parking/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extensionHours: hours }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toastUtils.success(`Parking étendu de ${hours}h avec succès !`);

        // Mettre à jour les données localement
        const newEndTime = new Date(data.newEndTime);
        setBooking((prev) =>
          prev ? { ...prev, endTime: data.newEndTime } : null
        );
      } else {
        toastUtils.error(data.error || "Erreur lors de l'extension");
      }
    } catch (err) {
      toastUtils.error("Erreur de connexion");
    } finally {
      setExtending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Chargement...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Extension réussie !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-700">
                Votre parking a été étendu avec succès.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Nouvelle heure de fin :{" "}
                <strong>
                  {booking
                    ? new Date(booking.endTime).toLocaleString("fr-FR")
                    : ""}
                </strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentEndTime = booking ? new Date(booking.endTime) : null;
  const isExpired = currentEndTime ? currentEndTime < new Date() : false;
  const timeRemaining = currentEndTime
    ? Math.max(
        0,
        Math.ceil(
          (currentEndTime.getTime() - new Date().getTime()) / (1000 * 60)
        )
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Étendre votre parking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-600" />
                <span className="font-medium">{booking?.vehicleNumber}</span>
                <Badge variant={isExpired ? "destructive" : "default"}>
                  {isExpired ? "Expiré" : `${timeRemaining} min restantes`}
                </Badge>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  <strong>Établissement :</strong> {booking?.establishmentName}
                </p>
                <p>
                  <strong>Fin actuelle :</strong>{" "}
                  {currentEndTime?.toLocaleString("fr-FR")}
                </p>
                <p>
                  <strong>Durée actuelle :</strong> {booking?.currentDuration}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Options d'extension */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Choisir une extension
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {extensionOptions.map((option) => (
                <Button
                  key={option.hours}
                  onClick={() => handleExtension(option.hours)}
                  disabled={extending}
                  variant="outline"
                  className="h-auto p-4 justify-between"
                >
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500">
                      Nouveau total :{" "}
                      {currentEndTime &&
                        new Date(
                          currentEndTime.getTime() +
                            option.hours * 60 * 60 * 1000
                        ).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-blue-600">
                      {option.price}
                    </div>
                    {extending && (
                      <Loader2 className="h-4 w-4 animate-spin mt-1" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          Extension sécurisée • Paiement par Stripe
        </div>
      </div>
    </div>
  );
}
