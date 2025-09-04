"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Info, AlertTriangle } from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";
import {
  validateBookingDates,
  calculateStayDuration,
} from "@/lib/availability";
import { checkCutoffTime, formatTimeForDisplay } from "@/lib/time-utils";

interface Establishment {
  name: string;
  maxBookingDays: number;
  allowFutureBookings: boolean;
  enableDogOption?: boolean;
  enableCutoffTime?: boolean;
  cutoffTime?: string;
  reopenTime?: string;
}

interface DateSelectorProps {
  establishment: Establishment;
  onDatesConfirmed: (
    checkInDate: string,
    checkOutDate: string,
    hasDog?: boolean
  ) => void;
  initialCheckInDate?: string;
  initialCheckOutDate?: string;
  initialHasDog?: boolean;
}

export function DateSelector({
  establishment,
  onDatesConfirmed,
  initialCheckInDate,
  initialCheckOutDate,
  initialHasDog,
}: DateSelectorProps) {
  const today = new Date().toISOString().split("T")[0];

  const [checkInDate, setCheckInDate] = useState(initialCheckInDate || today);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOutDate || "");
  const [hasDog, setHasDog] = useState(initialHasDog || false);
  const [loading, setLoading] = useState(false);

  const duration =
    checkInDate && checkOutDate
      ? calculateStayDuration(new Date(checkInDate), new Date(checkOutDate))
      : 0;

  // Vérifier l'heure limite
  const cutoffResult = checkCutoffTime(
    establishment.enableCutoffTime || false,
    establishment.cutoffTime || null,
    establishment.reopenTime || "00:00"
  );

  const handleSearch = async () => {
    // Vérifier l'heure limite en premier
    if (cutoffResult.isAfterCutoff) {
      toastUtils.error(cutoffResult.message);
      return;
    }

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

      onDatesConfirmed(checkInDate, checkOutDate, hasDog);
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
        {/* Alerte heure limite */}
        {cutoffResult.isAfterCutoff && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-800">
                Réservations fermées / Bookings Closed
              </p>
              <p className="text-sm text-red-700">{cutoffResult.message}</p>
              {cutoffResult.nextAvailableTime && (
                <p className="text-xs text-red-600">
                  Prochaine ouverture / Next opening:{" "}
                  {formatTimeForDisplay(cutoffResult.nextAvailableTime)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Info heure limite active */}
        {establishment.enableCutoffTime &&
          !cutoffResult.isAfterCutoff &&
          establishment.cutoffTime && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Réservations ouvertes jusqu&apos;à {establishment.cutoffTime}{" "}
                  / Bookings open until {establishment.cutoffTime}
                </p>
                <p className="text-xs text-blue-600">{cutoffResult.message}</p>
              </div>
            </div>
          )}

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

        {/* Option chien - seulement si activée pour l'établissement */}
        {establishment.enableDogOption && (
          <div className="flex items-center space-x-2 mt-4">
            <input
              id="hasDog"
              type="checkbox"
              checked={hasDog}
              onChange={(e) => setHasDog(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="hasDog" className="text-sm text-gray-600">
              🐕 Avec chien / With dog
            </Label>
          </div>
        )}

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
          disabled={loading || !checkOutDate || cutoffResult.isAfterCutoff}
          className="w-full"
          size="lg"
        >
          {cutoffResult.isAfterCutoff
            ? "Réservations fermées / Bookings Closed"
            : loading
              ? "Validation en cours... / Validating..."
              : "Rechercher disponibilité / Search Availability"}
        </Button>
      </CardContent>
    </Card>
  );
}
