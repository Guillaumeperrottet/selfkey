"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr, enUS, de } from "date-fns/locale";
import { useBookingTranslation } from "@/hooks/useBookingTranslation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, AlertTriangle, CalendarIcon } from "lucide-react";
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
  bookingWindowStartDate?: Date | string | null;
  bookingWindowEndDate?: Date | string | null;
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
  const { t, locale } = useBookingTranslation();
  const today = new Date().toISOString().split("T")[0];

  // Sélectionner la locale date-fns selon la langue
  const dateLocale = locale === "fr" ? fr : locale === "de" ? de : enUS;

  const [checkInDate, setCheckInDate] = useState(initialCheckInDate || today);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOutDate || "");
  const [hasDog, setHasDog] = useState(initialHasDog || false);
  const [loading, setLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCheckInCalendarOpen, setIsCheckInCalendarOpen] = useState(false);

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
          toastUtils.error(t.dates.optionRequired(option.name));
          return;
        }
      }
    }

    if (!checkOutDate) {
      toastUtils.error(t.dates.pleaseSelectCheckout);
      return;
    }

    if (checkInDate >= checkOutDate) {
      toastUtils.error(t.dates.checkoutAfterCheckin);
      return;
    }

    // Vérifier que la date d'arrivée n'est pas dans le passé
    if (new Date(checkInDate) < new Date(today)) {
      toastUtils.error(t.dates.checkinNotPast);
      return;
    }

    // Pour les établissements qui n'autorisent pas les réservations futures,
    // vérifier que la date d'arrivée est bien aujourd'hui
    if (!establishment.allowFutureBookings && checkInDate !== today) {
      toastUtils.error(t.dates.checkinMustBeToday);
      return;
    }

    // Vérifier la durée maximale
    const validation = validateBookingDates(
      new Date(checkInDate),
      new Date(checkOutDate),
      establishment.maxBookingDays
    );

    if (!validation.isValid) {
      toastUtils.error(validation.error || t.dates.invalidDates);
      return;
    }

    setLoading(true);

    try {
      // Simuler une petite validation
      await new Promise((resolve) => setTimeout(resolve, 300));

      onDatesConfirmed(
        checkInDate,
        checkOutDate,
        hasDog,
        selectedPricingOptions
      );
    } catch {
      toastUtils.error(t.dates.dateValidationError);
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
          <h3 className="text-lg font-semibold">{t.dates.loadingOptions}</h3>
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
                  <SelectValue placeholder={t.dates.selectOption} />
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
          {t.dates.stayDates}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerte heure limite */}
        {cutoffResult.isAfterCutoff && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-base font-medium text-red-800">
                {t.dates.bookingsClosed}
              </p>
              <p className="text-base text-red-700">{cutoffResult.message}</p>
              {cutoffResult.nextAvailableTime && (
                <p className="text-sm text-red-600">
                  {t.dates.nextOpening}{" "}
                  {formatTimeForDisplay(cutoffResult.nextAvailableTime)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Message période de réservation */}
        {establishment.bookingWindowStartDate &&
          establishment.bookingWindowEndDate && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span>
                {t.dates.bookingsAvailableFrom}{" "}
                <span className="font-medium text-gray-700">
                  {new Date(
                    establishment.bookingWindowStartDate
                  ).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>{" "}
                {t.dates.to}{" "}
                <span className="font-medium text-gray-700">
                  {new Date(
                    establishment.bookingWindowEndDate
                  ).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
          )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="checkIn"
              className="text-base md:text-lg font-medium"
            >
              {t.dates.checkIn}
            </Label>
            <Popover
              open={isCheckInCalendarOpen}
              onOpenChange={setIsCheckInCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal h-12 text-base mt-1 ${
                    !establishment.allowFutureBookings
                      ? "bg-gray-50 cursor-not-allowed opacity-60"
                      : ""
                  }`}
                  disabled={!establishment.allowFutureBookings}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(new Date(checkInDate), "EEEE dd MMMM yyyy", {
                    locale: dateLocale,
                  })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={new Date(checkInDate)}
                  onSelect={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      const newDate = `${year}-${month}-${day}`;
                      handleCheckInChange(newDate);
                      setIsCheckInCalendarOpen(false);
                    }
                  }}
                  disabled={(date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    const dateStr = `${year}-${month}-${day}`;

                    // Désactiver les dates dans le passé
                    if (dateStr < today) return true;

                    // Vérifier la période de réservation si définie
                    if (
                      establishment.bookingWindowStartDate &&
                      establishment.bookingWindowEndDate
                    ) {
                      const windowStart = new Date(
                        establishment.bookingWindowStartDate
                      );
                      const windowEnd = new Date(
                        establishment.bookingWindowEndDate
                      );
                      windowStart.setHours(0, 0, 0, 0);
                      windowEnd.setHours(23, 59, 59, 999);

                      const checkDate = new Date(dateStr + "T00:00:00");

                      // Désactiver les dates hors de la période
                      if (checkDate < windowStart || checkDate > windowEnd) {
                        return true;
                      }
                    }

                    // Vérifier les restrictions futures
                    if (establishment.allowFutureBookings) {
                      const maxFutureDate = new Date();
                      maxFutureDate.setFullYear(
                        maxFutureDate.getFullYear() + 1
                      );
                      const futureYear = maxFutureDate.getFullYear();
                      const futureMonth = String(
                        maxFutureDate.getMonth() + 1
                      ).padStart(2, "0");
                      const futureDay = String(
                        maxFutureDate.getDate()
                      ).padStart(2, "0");
                      const maxFutureDateStr = `${futureYear}-${futureMonth}-${futureDay}`;
                      if (dateStr > maxFutureDateStr) return true;
                    } else {
                      // Si pas de réservations futures et pas de période définie, limiter à quelques mois
                      if (
                        !establishment.bookingWindowStartDate &&
                        !establishment.bookingWindowEndDate
                      ) {
                        const maxDate = new Date();
                        maxDate.setMonth(maxDate.getMonth() + 6);
                        const limitYear = maxDate.getFullYear();
                        const limitMonth = String(
                          maxDate.getMonth() + 1
                        ).padStart(2, "0");
                        const limitDay = String(maxDate.getDate()).padStart(
                          2,
                          "0"
                        );
                        const maxDateStr = `${limitYear}-${limitMonth}-${limitDay}`;
                        if (dateStr > maxDateStr) return true;
                      }
                    }

                    return false;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label
              htmlFor="checkOut"
              className="text-base md:text-lg font-medium"
            >
              {t.dates.checkOut}
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-12 text-base mt-1"
                  disabled={!checkInDate}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOutDate ? (
                    format(new Date(checkOutDate), "EEEE dd MMMM yyyy", {
                      locale: dateLocale,
                    })
                  ) : (
                    <span>{t.dates.selectCheckOut}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={checkOutDate ? new Date(checkOutDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      // Utiliser une méthode qui évite les problèmes de fuseau horaire
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      setCheckOutDate(`${year}-${month}-${day}`);
                      // Fermer le calendrier après sélection
                      setIsCalendarOpen(false);
                    }
                  }}
                  disabled={(date) => {
                    // Utiliser la même méthode pour éviter les problèmes de fuseau horaire
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    const dateStr = `${year}-${month}-${day}`;

                    // Vérifier la période de réservation si définie
                    if (
                      establishment.bookingWindowStartDate &&
                      establishment.bookingWindowEndDate
                    ) {
                      const windowStart = new Date(
                        establishment.bookingWindowStartDate
                      );
                      const windowEnd = new Date(
                        establishment.bookingWindowEndDate
                      );
                      windowStart.setHours(0, 0, 0, 0);
                      windowEnd.setHours(23, 59, 59, 999);

                      const checkDate = new Date(dateStr + "T00:00:00");

                      // Désactiver les dates hors de la période (avant le début OU après la fin)
                      if (checkDate < windowStart || checkDate > windowEnd) {
                        return true;
                      }
                    }

                    // Calculer la date minimum (lendemain du check-in)
                    const checkIn = new Date(checkInDate + "T00:00:00");
                    const minCheckOut = new Date(checkIn);
                    minCheckOut.setDate(minCheckOut.getDate() + 1);
                    const minYear = minCheckOut.getFullYear();
                    const minMonth = String(
                      minCheckOut.getMonth() + 1
                    ).padStart(2, "0");
                    const minDay = String(minCheckOut.getDate()).padStart(
                      2,
                      "0"
                    );
                    const minCheckOutStr = `${minYear}-${minMonth}-${minDay}`;

                    // Calculer la date maximum
                    const maxCheckOut = new Date(checkIn);
                    maxCheckOut.setDate(
                      maxCheckOut.getDate() + establishment.maxBookingDays
                    );
                    const maxYear = maxCheckOut.getFullYear();
                    const maxMonth = String(
                      maxCheckOut.getMonth() + 1
                    ).padStart(2, "0");
                    const maxDay = String(maxCheckOut.getDate()).padStart(
                      2,
                      "0"
                    );
                    const maxCheckOutStr = `${maxYear}-${maxMonth}-${maxDay}`;

                    // Vérifier si la date est avant le minimum autorisé (utiliser les strings)
                    if (dateStr < minCheckOutStr) return true;

                    // Vérifier si la date dépasse la limite de jours (utiliser les strings)
                    if (dateStr > maxCheckOutStr) return true;

                    // Vérifier les restrictions futures si applicable
                    if (establishment.allowFutureBookings) {
                      const maxFutureDate = new Date();
                      maxFutureDate.setFullYear(
                        maxFutureDate.getFullYear() + 1
                      );
                      const futureYear = maxFutureDate.getFullYear();
                      const futureMonth = String(
                        maxFutureDate.getMonth() + 1
                      ).padStart(2, "0");
                      const futureDay = String(
                        maxFutureDate.getDate()
                      ).padStart(2, "0");
                      const maxFutureDateStr = `${futureYear}-${futureMonth}-${futureDay}`;
                      if (dateStr > maxFutureDateStr) return true;
                    } else {
                      // Si pas de réservations futures, limiter à quelques mois
                      const maxDate = new Date();
                      maxDate.setMonth(maxDate.getMonth() + 6);
                      const limitYear = maxDate.getFullYear();
                      const limitMonth = String(
                        maxDate.getMonth() + 1
                      ).padStart(2, "0");
                      const limitDay = String(maxDate.getDate()).padStart(
                        2,
                        "0"
                      );
                      const maxDateStr = `${limitYear}-${limitMonth}-${limitDay}`;
                      if (dateStr > maxDateStr) return true;
                    }

                    return false;
                  }}
                  modifiers={{
                    checkInDay: new Date(checkInDate + "T00:00:00"),
                  }}
                  modifiersStyles={{
                    checkInDay: {
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      fontWeight: "bold",
                      border: "2px solid #3b82f6",
                    },
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

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
              🐕 {t.dates.dogOption}
            </label>
          </div>
        )}

        {/* Options de prix */}
        {renderPricingOptions()}

        {duration > 0 && (
          <div className="flex items-center gap-2 text-base md:text-lg text-gray-700">
            <Clock className="h-5 w-5" />
            <span>{t.dates.nights(duration)}</span>
          </div>
        )}

        <Button
          onClick={handleSearch}
          disabled={loading || !checkOutDate || cutoffResult.isAfterCutoff}
          className="w-full text-base md:text-lg h-12 md:h-14"
          size="lg"
        >
          {cutoffResult.isAfterCutoff
            ? t.dates.bookingsClosed
            : loading
              ? t.dates.validating
              : t.dates.search}
        </Button>
      </CardContent>
    </Card>
  );
}
