"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Info } from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";
import {
  validateBookingDates,
  calculateStayDuration,
} from "@/lib/availability";

interface Establishment {
  name: string;
  maxBookingDays: number;
  allowFutureBookings: boolean;
}

interface DateSelectorProps {
  establishment: Establishment;
  onDatesConfirmed: (checkInDate: string, checkOutDate: string) => void;
  initialCheckInDate?: string;
  initialCheckOutDate?: string;
}

export function DateSelector({
  establishment,
  onDatesConfirmed,
  initialCheckInDate,
  initialCheckOutDate,
}: DateSelectorProps) {
  const today = new Date().toISOString().split("T")[0];

  const [checkInDate, setCheckInDate] = useState(initialCheckInDate || today);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOutDate || "");
  const [loading, setLoading] = useState(false);

  const duration =
    checkInDate && checkOutDate
      ? calculateStayDuration(new Date(checkInDate), new Date(checkOutDate))
      : 0;

  const handleSearch = async () => {
    if (!checkOutDate) {
      toastUtils.error("Veuillez sélectionner la date de départ");
      return;
    }

    if (checkInDate >= checkOutDate) {
      toastUtils.error("La date de départ doit être après la date d'arrivée");
      return;
    }

    // Vérifier que la date d'arrivée n'est pas dans le passé
    if (new Date(checkInDate) < new Date(today)) {
      toastUtils.error("La date d'arrivée ne peut pas être dans le passé");
      return;
    }

    // Pour les établissements qui n'autorisent pas les réservations futures,
    // vérifier que la date d'arrivée est bien aujourd'hui
    if (!establishment.allowFutureBookings && checkInDate !== today) {
      toastUtils.error(
        "La date d'arrivée doit être aujourd'hui pour cet établissement"
      );
      return;
    }

    // Vérifier la durée maximale
    const validation = validateBookingDates(
      new Date(checkInDate),
      new Date(checkOutDate),
      establishment.maxBookingDays
    );

    if (!validation.isValid) {
      toastUtils.error(validation.error || "Dates invalides");
      return;
    }

    setLoading(true);
    const loadingToast = toastUtils.loading("Validation des dates...");

    try {
      // Simuler une petite validation
      await new Promise((resolve) => setTimeout(resolve, 300));

      toastUtils.dismiss(loadingToast);

      onDatesConfirmed(checkInDate, checkOutDate);
    } catch {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la validation des dates");
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser la date de départ si elle devient invalide
  const handleCheckInChange = (newCheckInDate: string) => {
    setCheckInDate(newCheckInDate);
    if (checkOutDate && newCheckInDate >= checkOutDate) {
      setCheckOutDate("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Dates de séjour / Stay Dates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="checkIn">Check-in Date</Label>
            <Input
              id="checkIn"
              type="date"
              value={checkInDate}
              onChange={(e) => handleCheckInChange(e.target.value)}
              disabled={!establishment.allowFutureBookings}
              className={`mt-1 ${
                !establishment.allowFutureBookings
                  ? "bg-gray-50 cursor-not-allowed opacity-60"
                  : ""
              }`}
              title={
                establishment.allowFutureBookings
                  ? "Sélectionnez votre date d'arrivée"
                  : "La date d'arrivée est fixée à aujourd'hui - les réservations futures ne sont pas autorisées"
              }
              min={today}
              max={
                establishment.allowFutureBookings
                  ? new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1)
                    )
                      .toISOString()
                      .split("T")[0]
                  : undefined
              }
            />
          </div>
          <div>
            <Label htmlFor="checkOut">Check-out Date</Label>
            <Input
              id="checkOut"
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={(() => {
                const minDate = new Date(checkInDate);
                minDate.setDate(minDate.getDate() + 1);
                return minDate.toISOString().split("T")[0];
              })()}
              max={(() => {
                const maxCheckOut = new Date(checkInDate);
                maxCheckOut.setDate(
                  maxCheckOut.getDate() + establishment.maxBookingDays
                );

                if (establishment.allowFutureBookings) {
                  const maxFutureDate = new Date();
                  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
                  return maxCheckOut > maxFutureDate
                    ? maxFutureDate.toISOString().split("T")[0]
                    : maxCheckOut.toISOString().split("T")[0];
                } else {
                  return maxCheckOut.toISOString().split("T")[0];
                }
              })()}
              className="mt-1"
              title={`Date de départ maximum : ${establishment.maxBookingDays} nuit${establishment.maxBookingDays > 1 ? "s" : ""} après l'arrivée`}
            />
          </div>
        </div>

        {duration > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              Durée du séjour / Stay Duration : {duration} nuit
              {duration > 1 ? "s" : ""} / night{duration > 1 ? "s" : ""}
            </span>
          </div>
        )}

        <div className="flex gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
          <Info className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            {establishment.allowFutureBookings ? (
              <>
                Vous pouvez réserver jusqu&apos;à 1 an à l&apos;avance. Durée
                maximale de séjour : {establishment.maxBookingDays} nuit
                {establishment.maxBookingDays > 1 ? "s" : ""}.
                <br />
                <em>
                  You can book up to 1 year in advance. Maximum stay:{" "}
                  {establishment.maxBookingDays} night
                  {establishment.maxBookingDays > 1 ? "s" : ""}.
                </em>
              </>
            ) : (
              <>
                Les réservations dans le futur ne sont pas autorisées. Durée
                maximale : {establishment.maxBookingDays} nuit
                {establishment.maxBookingDays > 1 ? "s" : ""}.
                <br />
                <em>
                  Future bookings are not allowed. Maximum stay:{" "}
                  {establishment.maxBookingDays} night
                  {establishment.maxBookingDays > 1 ? "s" : ""}.
                </em>
              </>
            )}
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={loading || !checkOutDate}
          className="w-full"
          size="lg"
        >
          {loading
            ? "Validation en cours... / Validating..."
            : "Rechercher disponibilité / Search Availability"}
        </Button>
      </CardContent>
    </Card>
  );
}
