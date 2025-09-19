"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Info,
  AlertTriangle,
  CalendarIcon,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";
import {
  validateBookingDates,
  calculateStayDuration,
} from "@/lib/availability";
import { checkCutoffTime, formatTimeForDisplay } from "@/lib/time-utils";

interface PricingOptionValue {
  id: string;
  label: string;
  priceModifier: number;
  isDefault: boolean;
  displayOrder: number;
}

interface PricingOption {
  id: string;
  name: string;
  description: string | null;
  type: "select" | "radio" | "checkbox";
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
  values: PricingOptionValue[];
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

interface DateSelectorProps {
  hotelSlug: string;
  establishment: Establishment;
  onDatesConfirmed: (
    checkInDate: string,
    checkOutDate: string,
    hasDog?: boolean,
    selectedPricingOptions?: Record<string, string | string[]>
  ) => void;
  initialCheckInDate?: string;
  initialCheckOutDate?: string;
  initialHasDog?: boolean;
  initialPricingOptions?: Record<string, string | string[]>;
}

export function DateSelector({
  hotelSlug,
  establishment,
  onDatesConfirmed,
  initialCheckInDate,
  initialCheckOutDate,
  initialHasDog,
  initialPricingOptions = {},
}: DateSelectorProps) {
  const today = new Date().toISOString().split("T")[0];

  const [checkInDate, setCheckInDate] = useState(initialCheckInDate || today);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOutDate || "");
  const [hasDog, setHasDog] = useState(initialHasDog || false);
  const [loading, setLoading] = useState(false);

  // États pour les options de prix
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [selectedPricingOptions, setSelectedPricingOptions] = useState<
    Record<string, string | string[]>
  >(initialPricingOptions);
  const [pricingOptionsLoading, setPricingOptionsLoading] = useState(true);

  // Charger les options de prix
  useEffect(() => {
    if (!hotelSlug) return;

    const fetchPricingOptions = async () => {
      try {
        setPricingOptionsLoading(true);
        const response = await fetch(
          `/api/establishments/${hotelSlug}/pricing-options`
        );
        if (response.ok) {
          const data = await response.json();
          // L'API retourne { pricingOptions: [...] }
          const options = data.pricingOptions;
          // S'assurer que les options sont un tableau
          if (Array.isArray(options)) {
            console.log(
              "DEBUG: Options de prix chargées:",
              options.length,
              options
            );
            setPricingOptions(options);
          } else {
            console.warn(
              "Les options de prix ne sont pas un tableau:",
              options
            );
            setPricingOptions([]);
          }
        } else {
          console.warn(
            "Erreur lors du chargement des options de prix:",
            response.status
          );
          setPricingOptions([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des options de prix:", error);
      } finally {
        setPricingOptionsLoading(false);
      }
    };

    fetchPricingOptions();
  }, [hotelSlug]);

  // Gestionnaire pour les changements d'options de prix
  const handlePricingOptionChange = (
    optionKey: string,
    value: string | string[]
  ) => {
    setSelectedPricingOptions((prev) => ({
      ...prev,
      [optionKey]: value,
    }));
  };

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

    // Valider les options de prix obligatoires
    for (const option of pricingOptions) {
      if (option.isRequired) {
        const selectedValue = selectedPricingOptions[option.id];

        if (
          !selectedValue ||
          (Array.isArray(selectedValue) && selectedValue.length === 0) ||
          (typeof selectedValue === "string" && selectedValue.trim() === "")
        ) {
          toastUtils.error(`L'option "${option.name}" est obligatoire`);
          return;
        }
      }
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

      onDatesConfirmed(
        checkInDate,
        checkOutDate,
        hasDog,
        selectedPricingOptions
      );
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

  // Fonction pour rendre les options de prix sans afficher les prix
  const renderPricingOptions = () => {
    if (pricingOptionsLoading) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Chargement des options...</h3>
        </div>
      );
    }

    if (!Array.isArray(pricingOptions) || pricingOptions.length === 0) {
      return null;
    }

    console.log(
      "DEBUG: Rendu des options de prix:",
      pricingOptions.length,
      pricingOptions
    );

    return (
      <div className="space-y-4 mb-6">
        {pricingOptions.map((option) => (
          <div key={option.id} className="space-y-2">
            <label className="text-base md:text-lg font-medium">
              {option.name}
              {option.isRequired && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>

            {option.type === "select" && (
              <Select
                value={(selectedPricingOptions[option.id] as string) || ""}
                onValueChange={(value) =>
                  handlePricingOptionChange(option.id, value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une option" />
                </SelectTrigger>
                <SelectContent>
                  {option.values.map((optionValue) => (
                    <SelectItem key={optionValue.id} value={optionValue.id}>
                      {optionValue.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {option.type === "radio" && (
              <div className="space-y-3">
                {option.values.map((optionValue) => (
                  <div
                    key={optionValue.id}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="radio"
                      id={`${option.id}-${optionValue.id}`}
                      name={option.id}
                      value={optionValue.id}
                      checked={
                        selectedPricingOptions[option.id] === optionValue.id
                      }
                      onChange={(e) =>
                        handlePricingOptionChange(option.id, e.target.value)
                      }
                      className="w-5 h-5"
                    />
                    <label
                      htmlFor={`${option.id}-${optionValue.id}`}
                      className="text-base md:text-lg font-medium cursor-pointer"
                    >
                      {optionValue.label}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {option.type === "checkbox" && (
              <div className="space-y-3">
                {option.values.map((optionValue) => (
                  <div
                    key={optionValue.id}
                    className="flex items-center space-x-3"
                  >
                    <Checkbox
                      id={`${option.id}-${optionValue.id}`}
                      checked={
                        Array.isArray(selectedPricingOptions[option.id])
                          ? (
                              selectedPricingOptions[option.id] as string[]
                            ).includes(optionValue.id)
                          : false
                      }
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(
                          selectedPricingOptions[option.id]
                        )
                          ? (selectedPricingOptions[option.id] as string[])
                          : [];

                        let newValues: string[];
                        if (checked) {
                          newValues = [...currentValues, optionValue.id];
                        } else {
                          newValues = currentValues.filter(
                            (v) => v !== optionValue.id
                          );
                        }

                        handlePricingOptionChange(option.id, newValues);
                      }}
                    />
                    <label
                      htmlFor={`${option.id}-${optionValue.id}`}
                      className="text-sm"
                    >
                      {optionValue.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Calendar className="h-6 w-6" />
          Dates de séjour / Stay Dates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerte heure limite */}
        {cutoffResult.isAfterCutoff && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-base font-medium text-red-800">
                Réservations fermées / Bookings Closed
              </p>
              <p className="text-base text-red-700">{cutoffResult.message}</p>
              {cutoffResult.nextAvailableTime && (
                <p className="text-sm text-red-600">
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
                <p className="text-base font-medium text-blue-800">
                  Réservations ouvertes jusqu&apos;à {establishment.cutoffTime}{" "}
                  / Bookings open until {establishment.cutoffTime}
                </p>
                <p className="text-sm text-blue-600">{cutoffResult.message}</p>
              </div>
            </div>
          )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="checkIn"
              className="text-base md:text-lg font-medium"
            >
              Check-in Date
            </Label>
            <Input
              id="checkIn"
              type="date"
              value={checkInDate}
              onChange={(e) => handleCheckInChange(e.target.value)}
              disabled={!establishment.allowFutureBookings}
              className={`mt-1 h-12 text-base ${
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
            <Label
              htmlFor="checkOut"
              className="text-base md:text-lg font-medium"
            >
              Check-out Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-12 text-base mt-1"
                  disabled={!checkInDate}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOutDate ? (
                    format(new Date(checkOutDate), "EEEE dd MMMM yyyy", {
                      locale: fr,
                    })
                  ) : (
                    <span>Sélectionnez une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={checkOutDate ? new Date(checkOutDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setCheckOutDate(date.toISOString().split("T")[0]);
                    }
                  }}
                  disabled={(date) => {
                    if (!checkInDate) return true;

                    const checkIn = new Date(checkInDate);
                    const minCheckOut = new Date(checkIn);
                    minCheckOut.setDate(minCheckOut.getDate() + 1);

                    const maxCheckOut = new Date(checkIn);
                    maxCheckOut.setDate(
                      maxCheckOut.getDate() + establishment.maxBookingDays
                    );

                    // Vérifier si la date est avant le minimum
                    if (date < minCheckOut) return true;

                    // Vérifier si la date dépasse la limite de jours
                    if (date > maxCheckOut) return true;

                    // Vérifier les restrictions futures si applicable
                    if (establishment.allowFutureBookings) {
                      const maxFutureDate = new Date();
                      maxFutureDate.setFullYear(
                        maxFutureDate.getFullYear() + 1
                      );
                      if (date > maxFutureDate) return true;
                    } else {
                      // Si pas de réservations futures, limiter à quelques mois
                      const maxDate = new Date();
                      maxDate.setMonth(maxDate.getMonth() + 6);
                      if (date > maxDate) return true;
                    }

                    return false;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Option chien - seulement si activée pour l'établissement */}
        {/* Option chien - seulement si activée pour l'établissement */}
        {establishment.enableDogOption && (
          <div className="flex items-center space-x-3 mt-4">
            <input
              id="hasDog"
              type="checkbox"
              checked={hasDog}
              onChange={(e) => setHasDog(e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="hasDog"
              className="text-base md:text-lg font-medium text-gray-700 flex items-center cursor-pointer"
            >
              🐕 Avec chien / With dog
            </label>
          </div>
        )}

        {/* Options de prix */}
        {renderPricingOptions()}

        {duration > 0 && (
          <div className="flex items-center gap-2 text-base md:text-lg text-gray-700">
            <Clock className="h-5 w-5" />
            <span>
              Durée du séjour / Stay Duration : {duration} nuit
              {duration > 1 ? "s" : ""} / night{duration > 1 ? "s" : ""}
            </span>
          </div>
        )}

        <div className="flex gap-3 text-sm md:text-base text-gray-600 bg-gray-50 p-3 rounded-md">
          <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
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
          className="w-full text-base md:text-lg h-12 md:h-14"
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
