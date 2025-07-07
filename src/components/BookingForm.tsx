"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, CalendarDays, Clock, Info } from "lucide-react";
import {
  calculateStayDuration,
  validateBookingDates,
} from "@/lib/availability";
import { BookingSteps } from "./BookingSteps";

interface Room {
  id: string;
  name: string;
  price: number;
}

interface Establishment {
  name: string;
  maxBookingDays: number;
  allowFutureBookings: boolean;
}

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
  type: "select" | "checkbox" | "radio";
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
  values: PricingOptionValue[];
}

interface BookingFormProps {
  hotelSlug: string;
  establishment: Establishment;
}

export function BookingForm({ hotelSlug, establishment }: BookingFormProps) {
  const router = useRouter();

  // Date minimale : aujourd'hui
  const today = new Date().toISOString().split("T")[0];

  const [checkInDate, setCheckInDate] = useState(today); // Date d'arrivée
  const [checkOutDate, setCheckOutDate] = useState("");
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  // Informations client détaillées
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientBirthDate, setClientBirthDate] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPostalCode, setClientPostalCode] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientCountry, setClientCountry] = useState("Suisse");
  const [clientIdNumber, setClientIdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // États pour les options de prix
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [selectedPricingOptions, setSelectedPricingOptions] = useState<
    Record<string, string | string[]>
  >({});
  const [pricingOptionsTotal, setPricingOptionsTotal] = useState(0);

  // Date maximale : dépend de la configuration de l'établissement
  const maxDate = new Date();
  if (establishment.allowFutureBookings) {
    // Pour les réservations futures : limiter à 1 an ou selon maxBookingDays depuis la date d'arrivée
    const maxFromCheckIn = new Date(checkInDate);
    maxFromCheckIn.setDate(
      maxFromCheckIn.getDate() + establishment.maxBookingDays
    );

    const maxOneYear = new Date();
    maxOneYear.setFullYear(maxOneYear.getFullYear() + 1);

    // Prendre la plus petite des deux dates
    maxDate.setTime(Math.min(maxFromCheckIn.getTime(), maxOneYear.getTime()));
  } else {
    // Si les réservations futures ne sont pas autorisées, limiter selon maxBookingDays (en nuits)
    // La date de départ maximale = aujourd'hui + maxBookingDays nuits
    maxDate.setDate(maxDate.getDate() + establishment.maxBookingDays);
  }
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const handleSearchRooms = async () => {
    if (!checkOutDate) {
      setError("Veuillez sélectionner la date de départ");
      return;
    }

    if (checkInDate >= checkOutDate) {
      setError("La date de départ doit être après la date d'arrivée");
      return;
    }

    // Vérifier que la date d'arrivée n'est pas dans le passé
    if (new Date(checkInDate) < new Date(today)) {
      setError("La date d'arrivée ne peut pas être dans le passé");
      return;
    }

    // Pour les établissements qui n'autorisent pas les réservations futures,
    // vérifier que la date d'arrivée est bien aujourd'hui
    if (!establishment.allowFutureBookings && checkInDate !== today) {
      setError(
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
      setError(validation.error || "Dates invalides");
      return;
    }

    setLoading(true);
    setError("");
    setSelectedRoom(null);

    try {
      const response = await fetch(
        `/api/establishments/${hotelSlug}/availability?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche des chambres disponibles");
      }
      const data = await response.json();
      console.log("DEBUG: API response:", data);
      setAvailableRooms(data.availableRooms || []);
      setSearchPerformed(true);

      // Afficher le message informatif si aucune chambre n'est disponible
      if (data.message) {
        console.log("DEBUG: Setting error message:", data.message);
        setError(data.message);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la recherche des chambres"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  const handlePricingOptionChange = (
    optionId: string,
    value: string | string[]
  ) => {
    setSelectedPricingOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }));
  };

  const handleConfirmBooking = async () => {
    // Validation des champs obligatoires
    if (!selectedRoom) {
      setError("Veuillez sélectionner une chambre");
      return;
    }

    if (
      !clientFirstName.trim() ||
      !clientLastName.trim() ||
      !clientEmail.trim() ||
      !clientPhone.trim() ||
      !clientBirthDate ||
      !clientAddress.trim() ||
      !clientPostalCode.trim() ||
      !clientCity.trim() ||
      !clientCountry.trim() ||
      !clientIdNumber.trim()
    ) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      setError("Veuillez saisir une adresse email valide");
      return;
    }

    setBookingInProgress(true);
    setError("");

    try {
      const duration = calculateStayDuration(
        new Date(checkInDate),
        new Date(checkOutDate)
      );
      const totalPrice = selectedRoom.price * duration + pricingOptionsTotal;

      const response = await fetch(
        `/api/establishments/${hotelSlug}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: selectedRoom.id,
            checkInDate,
            checkOutDate,
            clientFirstName: clientFirstName.trim(),
            clientLastName: clientLastName.trim(),
            clientEmail: clientEmail.trim(),
            clientPhone: clientPhone.trim(),
            clientBirthDate,
            clientAddress: clientAddress.trim(),
            clientPostalCode: clientPostalCode.trim(),
            clientCity: clientCity.trim(),
            clientCountry: clientCountry.trim(),
            clientIdNumber: clientIdNumber.trim(),
            expectedPrice: totalPrice,
            selectedPricingOptions,
            pricingOptionsTotal,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création de la réservation"
        );
      }

      const data = await response.json();

      // Rediriger vers la page de résumé
      router.push(`/${hotelSlug}/summary?booking=${data.bookingId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de la réservation"
      );
    } finally {
      setBookingInProgress(false);
    }
  };

  const duration =
    checkInDate && checkOutDate
      ? calculateStayDuration(new Date(checkInDate), new Date(checkOutDate))
      : 0;

  // Charger les options de prix depuis l'API
  useEffect(() => {
    const loadPricingOptions = async () => {
      try {
        console.log("DEBUG: Loading pricing options for hotel:", hotelSlug);
        const response = await fetch(
          `/api/establishments/${hotelSlug}/pricing-options`
        );
        console.log("DEBUG: Response status:", response.ok);
        if (response.ok) {
          const data = await response.json();
          console.log("DEBUG: Pricing options received:", data.pricingOptions);
          setPricingOptions(data.pricingOptions || []);

          // Initialiser les valeurs par défaut
          const defaultSelections: Record<string, string | string[]> = {};
          data.pricingOptions?.forEach((option: PricingOption) => {
            const defaultValue = option.values.find((v) => v.isDefault);
            if (defaultValue) {
              if (option.type === "checkbox") {
                // Pour les checkboxes, seulement pré-sélectionner si l'option est obligatoire
                // ou si explicitement demandé par l'utilisateur
                if (option.isRequired) {
                  defaultSelections[option.id] = [defaultValue.id];
                } else {
                  // Pour les options non-obligatoires, on peut laisser vide par défaut
                  // mais on peut quand même pré-sélectionner si c'est marqué comme défaut
                  defaultSelections[option.id] = [defaultValue.id];
                }
              } else {
                defaultSelections[option.id] = defaultValue.id;
              }
            }
          });
          console.log("DEBUG: Default selections:", defaultSelections);
          setSelectedPricingOptions(defaultSelections);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des options de prix:", error);
      }
    };

    loadPricingOptions();
  }, [hotelSlug]);

  // Calculer le total des options de prix
  useEffect(() => {
    let total = 0;
    pricingOptions.forEach((option) => {
      const selectedValue = selectedPricingOptions[option.id];
      if (selectedValue) {
        if (Array.isArray(selectedValue)) {
          // Pour les checkboxes
          selectedValue.forEach((valueId) => {
            const value = option.values.find((v) => v.id === valueId);
            if (value) {
              total += value.priceModifier;
            }
          });
        } else {
          // Pour select et radio
          const value = option.values.find((v) => v.id === selectedValue);
          if (value) {
            total += value.priceModifier;
          }
        }
      }
    });
    setPricingOptionsTotal(total);
  }, [selectedPricingOptions, pricingOptions]);

  // Réinitialiser la date de départ si elle devient invalide après changement de date d'arrivée
  useEffect(() => {
    if (checkOutDate && checkInDate >= checkOutDate) {
      setCheckOutDate("");
    }
  }, [checkInDate, checkOutDate]);

  return (
    <div className="space-y-6">
      {/* Étapes de réservation */}
      <BookingSteps currentStep={1} />

      {/* Sélection des dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dates de séjour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkIn">Date d&apos;arrivée</Label>
              <Input
                id="checkIn"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                readOnly={!establishment.allowFutureBookings}
                className={`mt-1 ${!establishment.allowFutureBookings ? "bg-gray-50" : ""}`}
                title={
                  establishment.allowFutureBookings
                    ? "Sélectionnez votre date d'arrivée"
                    : "La date d'arrivée est fixée à aujourd'hui"
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
              <p className="text-xs text-gray-500 mt-1">
                {establishment.allowFutureBookings
                  ? "Choisissez votre date d'arrivée"
                  : "Arrivée fixée à aujourd'hui"}
              </p>
            </div>
            <div>
              <Label htmlFor="checkOut">Date de départ</Label>
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
                max={maxDateStr}
                className="mt-1"
              />
            </div>
          </div>

          {duration > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                Durée du séjour : {duration} nuit{duration > 1 ? "s" : ""}
              </span>
            </div>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {establishment.allowFutureBookings ? (
                <>
                  Vous pouvez réserver jusqu&apos;à 1 an à l&apos;avance. Durée
                  maximale de séjour : {establishment.maxBookingDays} nuit
                  {establishment.maxBookingDays > 1 ? "s" : ""}.
                </>
              ) : (
                <>
                  Les réservations dans le futur ne sont pas autorisées.
                  L&apos;arrivée est fixée à aujourd&apos;hui, durée maximale :{" "}
                  {establishment.maxBookingDays} nuit
                  {establishment.maxBookingDays > 1 ? "s" : ""}.
                </>
              )}
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleSearchRooms}
            disabled={loading || !checkOutDate}
            className="w-full"
          >
            {loading
              ? "Recherche en cours..."
              : "Rechercher les chambres disponibles"}
          </Button>
        </CardContent>
      </Card>

      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Liste des chambres disponibles */}
      {searchPerformed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Chambres disponibles
              {duration > 0 && (
                <Badge variant="secondary">
                  {duration} nuit{duration > 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableRooms.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">😔</div>
                <p className="text-gray-600">
                  Aucune chambre disponible pour ces dates
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableRooms.map((room) => {
                  const totalPrice = room.price * duration;
                  const isSelected = selectedRoom?.id === room.id;

                  return (
                    <div
                      key={room.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleRoomSelect(room)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{room.name}</h3>
                          <p className="text-sm text-gray-600">
                            {room.price} CHF / nuit
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {totalPrice} CHF
                          </div>
                          <div className="text-sm text-gray-600">total</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informations du client */}
      {selectedRoom && (
        <Card>
          <CardHeader>
            <CardTitle>Informations du client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientLastName">Nom *</Label>
                <Input
                  id="clientLastName"
                  type="text"
                  value={clientLastName}
                  onChange={(e) => setClientLastName(e.target.value)}
                  placeholder="Nom de famille"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientFirstName">Prénom *</Label>
                <Input
                  id="clientFirstName"
                  type="text"
                  value={clientFirstName}
                  onChange={(e) => setClientFirstName(e.target.value)}
                  placeholder="Prénom"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* Date de naissance */}
            <div>
              <Label htmlFor="clientBirthDate">Date de naissance *</Label>
              <Input
                id="clientBirthDate"
                type="date"
                value={clientBirthDate}
                onChange={(e) => setClientBirthDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            {/* Adresse */}
            <div>
              <Label htmlFor="clientAddress">Adresse *</Label>
              <Input
                id="clientAddress"
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Rue et numéro"
                className="mt-1"
                required
              />
            </div>

            {/* Code postal et Localité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPostalCode">Code postal *</Label>
                <Input
                  id="clientPostalCode"
                  type="text"
                  value={clientPostalCode}
                  onChange={(e) => setClientPostalCode(e.target.value)}
                  placeholder="1234"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientCity">Localité *</Label>
                <Input
                  id="clientCity"
                  type="text"
                  value={clientCity}
                  onChange={(e) => setClientCity(e.target.value)}
                  placeholder="Ville"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* Pays */}
            <div>
              <Label htmlFor="clientCountry">Pays *</Label>
              <Input
                id="clientCountry"
                type="text"
                value={clientCountry}
                onChange={(e) => setClientCountry(e.target.value)}
                placeholder="Pays"
                className="mt-1"
                required
              />
            </div>

            {/* N° de permis ou carte d'identité */}
            <div>
              <Label htmlFor="clientIdNumber">
                N° de permis ou de carte d&apos;identité *
              </Label>
              <Input
                id="clientIdNumber"
                type="text"
                value={clientIdNumber}
                onChange={(e) => setClientIdNumber(e.target.value)}
                placeholder="Numéro d'identification"
                className="mt-1"
                required
              />
            </div>

            {/* Email et Téléphone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Téléphone mobile *</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+41 79 123 45 67"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* Options de prix personnalisées */}
            {(() => {
              console.log("DEBUG: All pricing options:", pricingOptions);
              console.log(
                "DEBUG: Active pricing options:",
                pricingOptions.filter((option) => option.isActive)
              );
              return null;
            })()}
            {pricingOptions.filter((option) => option.isActive).length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-lg mb-3">
                  Options supplémentaires
                </h4>
                {pricingOptions
                  .filter((option) => option.isActive)
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((option) => (
                    <div key={option.id} className="space-y-2">
                      <Label className="text-sm font-medium">
                        {option.name}
                        {option.isRequired && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>

                      {option.type === "select" && (
                        <Select
                          value={
                            (selectedPricingOptions[option.id] as string) || ""
                          }
                          onValueChange={(value) =>
                            handlePricingOptionChange(option.id, value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choisir une option" />
                          </SelectTrigger>
                          <SelectContent>
                            {option.values
                              .sort((a, b) => a.displayOrder - b.displayOrder)
                              .map((value) => (
                                <SelectItem key={value.id} value={value.id}>
                                  <span className="flex justify-between w-full">
                                    <span>{value.label}</span>
                                    <span className="ml-2">
                                      {value.priceModifier !== 0 &&
                                        `${value.priceModifier > 0 ? "+" : ""}${value.priceModifier} CHF`}
                                    </span>
                                  </span>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}

                      {option.type === "checkbox" && (
                        <div className="space-y-2">
                          {option.values
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((value) => (
                              <div
                                key={value.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`${option.id}-${value.id}`}
                                  checked={
                                    Array.isArray(
                                      selectedPricingOptions[option.id]
                                    ) &&
                                    (
                                      selectedPricingOptions[
                                        option.id
                                      ] as string[]
                                    ).includes(value.id)
                                  }
                                  onCheckedChange={(checked) => {
                                    const currentValues =
                                      (selectedPricingOptions[
                                        option.id
                                      ] as string[]) || [];
                                    const newValues = checked
                                      ? [...currentValues, value.id]
                                      : currentValues.filter(
                                          (v) => v !== value.id
                                        );

                                    // Pour les options non obligatoires, permettre un tableau vide
                                    // Pour les options obligatoires, garder au moins une valeur
                                    if (
                                      newValues.length === 0 &&
                                      option.isRequired
                                    ) {
                                      // Ne pas permettre de tout décocher si l'option est obligatoire
                                      return;
                                    }

                                    handlePricingOptionChange(
                                      option.id,
                                      newValues
                                    );
                                  }}
                                />
                                <Label
                                  htmlFor={`${option.id}-${value.id}`}
                                  className="text-sm font-normal flex-1 cursor-pointer"
                                >
                                  <span className="flex justify-between">
                                    <span>{value.label}</span>
                                    <span className="ml-2">
                                      {value.priceModifier !== 0 &&
                                        `${value.priceModifier > 0 ? "+" : ""}${value.priceModifier} CHF`}
                                    </span>
                                  </span>
                                </Label>
                              </div>
                            ))}
                        </div>
                      )}

                      {option.type === "radio" && (
                        <div className="space-y-2">
                          {option.values
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((value) => (
                              <div
                                key={value.id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  id={`${option.id}-${value.id}`}
                                  name={option.id}
                                  value={value.id}
                                  checked={
                                    selectedPricingOptions[option.id] ===
                                    value.id
                                  }
                                  onChange={(e) =>
                                    handlePricingOptionChange(
                                      option.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                />
                                <Label
                                  htmlFor={`${option.id}-${value.id}`}
                                  className="text-sm font-normal flex-1 cursor-pointer"
                                >
                                  <span className="flex justify-between">
                                    <span>{value.label}</span>
                                    <span className="ml-2">
                                      {value.priceModifier !== 0 &&
                                        `${value.priceModifier > 0 ? "+" : ""}${value.priceModifier} CHF`}
                                    </span>
                                  </span>
                                </Label>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-medium">{selectedRoom.name}</h4>
                  <p className="text-sm text-gray-600">
                    Du {new Date(checkInDate).toLocaleDateString()} au{" "}
                    {new Date(checkOutDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">
                      {duration} nuit{duration > 1 ? "s" : ""} ×{" "}
                      {selectedRoom.price} CHF
                    </div>
                    {pricingOptionsTotal > 0 && (
                      <div className="text-sm text-gray-600">
                        Options: +{pricingOptionsTotal} CHF
                      </div>
                    )}
                    <div className="font-semibold text-xl">
                      {selectedRoom.price * duration + pricingOptionsTotal} CHF
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConfirmBooking}
                disabled={bookingInProgress}
                className="w-full"
                size="lg"
              >
                {bookingInProgress
                  ? "Création de la réservation..."
                  : "Continuer vers le résumé"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
