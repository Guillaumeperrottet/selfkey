"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toastUtils } from "@/lib/toast-utils";
import { useFormConfig } from "@/hooks/useFormConfig";

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
  // Informations invités
  const [adults, setAdults] = useState(1); // Nombre d'adultes (16 ans et +)
  const [children, setChildren] = useState(0); // Nombre d'enfants (moins de 16 ans)
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
  const [clientBirthPlace, setClientBirthPlace] = useState("");
  const [clientIdNumber, setClientIdNumber] = useState("");
  const [clientVehicleNumber, setClientVehicleNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // États pour les options de prix
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [selectedPricingOptions, setSelectedPricingOptions] = useState<
    Record<string, string | string[]>
  >({});
  const [pricingOptionsTotal, setPricingOptionsTotal] = useState(0);

  // Configuration du formulaire personnalisable
  const { isFieldEnabled, isFieldRequired } = useFormConfig(hotelSlug);

  const handleSearchRooms = async () => {
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
    setSelectedRoom(null);

    const loadingToast = toastUtils.loading("Recherche de disponibilités...");

    try {
      const response = await fetch(
        `/api/establishments/${hotelSlug}/availability?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
      );

      toastUtils.dismiss(loadingToast);

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche des chambres disponibles");
      }
      const data = await response.json();
      console.log("DEBUG: API response:", data);
      setAvailableRooms(data.availableRooms || []);
      setSearchPerformed(true);

      // Afficher le message informatif si aucune chambre n'est disponible
      if (data.message) {
        console.log("DEBUG: Setting info message:", data.message);
        toastUtils.info(data.message);
      }
    } catch (err) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error(
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
      toastUtils.error("Veuillez sélectionner une chambre");
      return;
    }

    // Validation des champs obligatoires basée sur la configuration
    const requiredFieldsValidation = [
      {
        value: clientFirstName.trim(),
        field: "clientFirstName",
        name: "Prénom",
      },
      { value: clientLastName.trim(), field: "clientLastName", name: "Nom" },
      { value: clientEmail.trim(), field: "clientEmail", name: "Email" },
      { value: clientPhone.trim(), field: "clientPhone", name: "Téléphone" },
    ];

    // Ajouter les champs conditionnels s'ils sont requis ET activés
    if (
      isFieldEnabled("clientBirthDate") &&
      isFieldRequired("clientBirthDate")
    ) {
      requiredFieldsValidation.push({
        value: clientBirthDate,
        field: "clientBirthDate",
        name: "Date de naissance",
      });
    }
    if (
      isFieldEnabled("clientBirthPlace") &&
      isFieldRequired("clientBirthPlace")
    ) {
      requiredFieldsValidation.push({
        value: clientBirthPlace.trim(),
        field: "clientBirthPlace",
        name: "Lieu de naissance",
      });
    }
    if (isFieldEnabled("clientAddress") && isFieldRequired("clientAddress")) {
      requiredFieldsValidation.push({
        value: clientAddress.trim(),
        field: "clientAddress",
        name: "Adresse",
      });
    }
    if (
      isFieldEnabled("clientPostalCode") &&
      isFieldRequired("clientPostalCode")
    ) {
      requiredFieldsValidation.push({
        value: clientPostalCode.trim(),
        field: "clientPostalCode",
        name: "Code postal",
      });
    }
    if (isFieldEnabled("clientCity") && isFieldRequired("clientCity")) {
      requiredFieldsValidation.push({
        value: clientCity.trim(),
        field: "clientCity",
        name: "Localité",
      });
    }
    if (isFieldEnabled("clientCountry") && isFieldRequired("clientCountry")) {
      requiredFieldsValidation.push({
        value: clientCountry.trim(),
        field: "clientCountry",
        name: "Pays",
      });
    }
    if (isFieldEnabled("clientIdNumber") && isFieldRequired("clientIdNumber")) {
      requiredFieldsValidation.push({
        value: clientIdNumber.trim(),
        field: "clientIdNumber",
        name: "N° d'identification",
      });
    }
    if (
      isFieldEnabled("clientVehicleNumber") &&
      isFieldRequired("clientVehicleNumber")
    ) {
      requiredFieldsValidation.push({
        value: clientVehicleNumber.trim(),
        field: "clientVehicleNumber",
        name: "N° d'immatriculation",
      });
    }

    // Vérifier que tous les champs obligatoires sont remplis
    const missingFields = requiredFieldsValidation.filter(
      (field) => !field.value
    );
    if (missingFields.length > 0 || adults < 1) {
      toastUtils.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      toastUtils.error("Veuillez saisir une adresse email valide");
      return;
    }

    setBookingInProgress(true);

    const loadingToast = toastUtils.loading("Création de la réservation...");

    try {
      const duration = calculateStayDuration(
        new Date(checkInDate),
        new Date(checkOutDate)
      );
      const totalPrice = selectedRoom.price * duration + pricingOptionsTotal;

      // Stocker les données de réservation temporairement dans sessionStorage
      const bookingData = {
        hotelSlug,
        roomId: selectedRoom.id,
        room: selectedRoom,
        establishment: { name: establishment.name, slug: hotelSlug },
        checkInDate,
        checkOutDate,
        adults,
        children,
        clientFirstName: clientFirstName.trim(),
        clientLastName: clientLastName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        clientBirthDate,
        clientBirthPlace: clientBirthPlace.trim(),
        clientAddress: clientAddress.trim(),
        clientPostalCode: clientPostalCode.trim(),
        clientCity: clientCity.trim(),
        clientCountry: clientCountry.trim(),
        clientIdNumber: clientIdNumber.trim(),
        clientVehicleNumber: clientVehicleNumber.trim(),
        amount: totalPrice,
        currency: "CHF",
        selectedPricingOptions,
        pricingOptionsTotal,
        guests: adults + children,
      };

      // Générer un ID temporaire pour la session
      const tempBookingId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Stocker dans sessionStorage
      sessionStorage.setItem(
        `booking_${tempBookingId}`,
        JSON.stringify(bookingData)
      );

      // Rediriger vers la page de résumé avec l'ID temporaire
      toastUtils.dismiss(loadingToast);
      router.push(`/${hotelSlug}/summary?booking=${tempBookingId}`);
    } catch (err) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error(
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

  // Récupérer les données du sessionStorage si l'utilisateur revient du résumé
  useEffect(() => {
    const loadSavedData = () => {
      try {
        // Chercher toutes les clés de réservation temporaire dans sessionStorage
        const keys = Object.keys(sessionStorage);
        const bookingKey = keys.find((key) =>
          key.startsWith(`booking_temp_${hotelSlug}_`)
        );

        if (bookingKey) {
          const savedBookingData = sessionStorage.getItem(bookingKey);
          if (savedBookingData) {
            const data = JSON.parse(savedBookingData);

            // Pré-remplir tous les champs du formulaire
            setCheckInDate(data.checkInDate || today);
            setCheckOutDate(data.checkOutDate || "");
            setAdults(data.adults || 1);
            setChildren(data.children || 0);
            setClientFirstName(data.clientFirstName || "");
            setClientLastName(data.clientLastName || "");
            setClientEmail(data.clientEmail || "");
            setClientPhone(data.clientPhone || "");
            setClientBirthDate(data.clientBirthDate || "");
            setClientBirthPlace(data.clientBirthPlace || "");
            setClientAddress(data.clientAddress || "");
            setClientPostalCode(data.clientPostalCode || "");
            setClientCity(data.clientCity || "");
            setClientCountry(data.clientCountry || "Suisse");
            setClientIdNumber(data.clientIdNumber || "");
            setClientVehicleNumber(data.clientVehicleNumber || "");

            // Restaurer les options de pricing sélectionnées
            if (data.selectedPricingOptions) {
              setSelectedPricingOptions(data.selectedPricingOptions);
            }

            // Si une chambre était sélectionnée, la restaurer
            if (data.room) {
              setSelectedRoom(data.room);
            }

            // Si des dates étaient définies, rechercher automatiquement les chambres
            if (data.checkInDate && data.checkOutDate) {
              setSearchPerformed(true);
              // Déclencher la recherche de chambres avec un délai
              setTimeout(async () => {
                try {
                  const response = await fetch(
                    `/api/establishments/${hotelSlug}/availability?checkInDate=${data.checkInDate}&checkOutDate=${data.checkOutDate}`
                  );
                  if (response.ok) {
                    const roomData = await response.json();
                    setAvailableRooms(roomData.availableRooms || []);
                  }
                } catch (error) {
                  console.error(
                    "Erreur lors de la recherche automatique:",
                    error
                  );
                }
              }, 100);
            }

            console.log(
              "DEBUG: Données du formulaire restaurées depuis sessionStorage"
            );
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
  }, [hotelSlug, today]); // Déclencher uniquement au montage du composant

  return (
    <div className="space-y-6">
      {/* Étapes de réservation */}
      <BookingSteps currentStep={1} />

      {/* Sélection des dates */}
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
                onChange={(e) => setCheckInDate(e.target.value)}
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
                  // Calculer la date de départ maximum basée sur maxBookingDays
                  const maxCheckOut = new Date(checkInDate);
                  maxCheckOut.setDate(
                    maxCheckOut.getDate() + establishment.maxBookingDays
                  );

                  // Si les réservations futures sont autorisées, limiter aussi à 1 an
                  if (establishment.allowFutureBookings) {
                    const oneYearFromToday = new Date();
                    oneYearFromToday.setFullYear(
                      oneYearFromToday.getFullYear() + 1
                    );

                    // Prendre la plus petite des deux dates
                    const finalMaxDate =
                      maxCheckOut.getTime() < oneYearFromToday.getTime()
                        ? maxCheckOut
                        : oneYearFromToday;

                    return finalMaxDate.toISOString().split("T")[0];
                  } else {
                    // Si pas de réservations futures, juste limiter par maxBookingDays
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

          <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
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
            onClick={handleSearchRooms}
            disabled={loading || !checkOutDate}
            className="w-full"
          >
            {loading
              ? "Recherche en cours... / Searching..."
              : "Rechercher les places disponibles / Search Available Rooms"}
          </Button>
        </CardContent>
      </Card>

      {/* Liste des chambres disponibles */}
      {searchPerformed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Chambres disponibles / Available Rooms
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
                  <br />
                  <em>No rooms available for these dates</em>
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

      {/* Formulaire de réservation unifié */}
      {selectedRoom && (
        <Card>
          <CardHeader>
            <CardTitle>
              Informations de réservation / Booking Information
            </CardTitle>
            <p className="text-sm text-gray-600">
              Veuillez remplir tous les champs obligatoires pour votre
              réservation / Please fill in all required fields for your booking
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Résumé de la sélection */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                Résumé de votre réservation / Booking Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Chambre / Room :</strong> {selectedRoom.name}
                  </p>
                  <p>
                    <strong>Durée / Duration :</strong> {duration} nuit
                    {duration > 1 ? "s" : ""} / night{duration > 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Du / From :</strong>{" "}
                    {new Date(checkInDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Au / To :</strong>{" "}
                    {new Date(checkOutDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Nombre d'invités */}
            <div>
              <h4 className="font-medium text-lg mb-3">
                Nombre de personnes / Number of Guests
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Adultes : 16 ans et plus • Enfants : moins de 16 ans
                <br />
                <em>Adults: 16 years and older • Children: under 16 years</em>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adults">
                    Nombre d&apos;adultes / Adults *
                  </Label>
                  <Select
                    value={adults.toString()}
                    onValueChange={(value) => setAdults(parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} adulte{num > 1 ? "s" : ""} / {num} adult
                          {num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isFieldEnabled("children") && (
                  <div>
                    <Label htmlFor="children">
                      Nombre d&apos;enfants / Children
                    </Label>
                    <Select
                      value={children.toString()}
                      onValueChange={(value) => setChildren(parseInt(value))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} enfant{num > 1 ? "s" : ""} / {num} child
                            {num > 1 ? "ren" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Informations personnelles */}
            <div>
              <h4 className="font-medium text-lg mb-3">Personal Information</h4>

              {/* Nom et Prénom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="clientLastName">Last Name *</Label>
                  <Input
                    id="clientLastName"
                    type="text"
                    value={clientLastName}
                    onChange={(e) => setClientLastName(e.target.value)}
                    placeholder="Last name"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientFirstName">First Name *</Label>
                  <Input
                    id="clientFirstName"
                    type="text"
                    value={clientFirstName}
                    onChange={(e) => setClientFirstName(e.target.value)}
                    placeholder="First name"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              {/* Date et lieu de naissance */}
              {(isFieldEnabled("clientBirthDate") ||
                isFieldEnabled("clientBirthPlace")) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {isFieldEnabled("clientBirthDate") && (
                    <div>
                      <Label htmlFor="clientBirthDate">
                        Date de naissance / Date of Birth{" "}
                        {isFieldRequired("clientBirthDate") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientBirthDate"
                        type="date"
                        value={clientBirthDate}
                        onChange={(e) => setClientBirthDate(e.target.value)}
                        className="mt-1"
                        required={isFieldRequired("clientBirthDate")}
                      />
                    </div>
                  )}
                  {isFieldEnabled("clientBirthPlace") && (
                    <div>
                      <Label htmlFor="clientBirthPlace">
                        Lieu de naissance / Place of Birth{" "}
                        {isFieldRequired("clientBirthPlace") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientBirthPlace"
                        type="text"
                        value={clientBirthPlace}
                        onChange={(e) => setClientBirthPlace(e.target.value)}
                        placeholder="Ville, Pays / City, Country"
                        className="mt-1"
                        required={isFieldRequired("clientBirthPlace")}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Email et Téléphone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="clientEmail">Email *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Mobile Phone *</Label>
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

              {/* Adresse complète */}
              {isFieldEnabled("clientAddress") && (
                <div className="mb-4">
                  <Label htmlFor="clientAddress">
                    Address {isFieldRequired("clientAddress") ? "*" : ""}
                  </Label>
                  <Input
                    id="clientAddress"
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Rue et numéro / Street and number"
                    className="mt-1"
                    required={isFieldRequired("clientAddress")}
                  />
                </div>
              )}

              {/* Code postal, Localité et Pays */}
              {(isFieldEnabled("clientPostalCode") ||
                isFieldEnabled("clientCity") ||
                isFieldEnabled("clientCountry")) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {isFieldEnabled("clientPostalCode") && (
                    <div>
                      <Label htmlFor="clientPostalCode">
                        Postal Code{" "}
                        {isFieldRequired("clientPostalCode") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientPostalCode"
                        type="text"
                        value={clientPostalCode}
                        onChange={(e) => setClientPostalCode(e.target.value)}
                        placeholder="1234"
                        className="mt-1"
                        required={isFieldRequired("clientPostalCode")}
                      />
                    </div>
                  )}
                  {isFieldEnabled("clientCity") && (
                    <div>
                      <Label htmlFor="clientCity">
                        Localité / City{" "}
                        {isFieldRequired("clientCity") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientCity"
                        type="text"
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        placeholder="Ville / City"
                        className="mt-1"
                        required={isFieldRequired("clientCity")}
                      />
                    </div>
                  )}
                  {isFieldEnabled("clientCountry") && (
                    <div>
                      <Label htmlFor="clientCountry">
                        Country {isFieldRequired("clientCountry") ? "*" : ""}
                      </Label>
                      <Select
                        value={clientCountry}
                        onValueChange={(value) => setClientCountry(value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionner un pays / Select a country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Afghanistan">
                            Afghanistan
                          </SelectItem>
                          <SelectItem value="Afrique du Sud">
                            Afrique du Sud
                          </SelectItem>
                          <SelectItem value="Albanie">Albanie</SelectItem>
                          <SelectItem value="Algérie">Algérie</SelectItem>
                          <SelectItem value="Allemagne">Allemagne</SelectItem>
                          <SelectItem value="Andorre">Andorre</SelectItem>
                          <SelectItem value="Angola">Angola</SelectItem>
                          <SelectItem value="Antigua-et-Barbuda">
                            Antigua-et-Barbuda
                          </SelectItem>
                          <SelectItem value="Arabie saoudite">
                            Arabie saoudite
                          </SelectItem>
                          <SelectItem value="Argentine">Argentine</SelectItem>
                          <SelectItem value="Arménie">Arménie</SelectItem>
                          <SelectItem value="Australie">Australie</SelectItem>
                          <SelectItem value="Autriche">Autriche</SelectItem>
                          <SelectItem value="Azerbaïdjan">
                            Azerbaïdjan
                          </SelectItem>
                          <SelectItem value="Bahamas">Bahamas</SelectItem>
                          <SelectItem value="Bahreïn">Bahreïn</SelectItem>
                          <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                          <SelectItem value="Barbade">Barbade</SelectItem>
                          <SelectItem value="Belgique">Belgique</SelectItem>
                          <SelectItem value="Belize">Belize</SelectItem>
                          <SelectItem value="Bénin">Bénin</SelectItem>
                          <SelectItem value="Bhoutan">Bhoutan</SelectItem>
                          <SelectItem value="Biélorussie">
                            Biélorussie
                          </SelectItem>
                          <SelectItem value="Birmanie">Birmanie</SelectItem>
                          <SelectItem value="Bolivie">Bolivie</SelectItem>
                          <SelectItem value="Bosnie-Herzégovine">
                            Bosnie-Herzégovine
                          </SelectItem>
                          <SelectItem value="Botswana">Botswana</SelectItem>
                          <SelectItem value="Brésil">Brésil</SelectItem>
                          <SelectItem value="Brunei">Brunei</SelectItem>
                          <SelectItem value="Bulgarie">Bulgarie</SelectItem>
                          <SelectItem value="Burkina Faso">
                            Burkina Faso
                          </SelectItem>
                          <SelectItem value="Burundi">Burundi</SelectItem>
                          <SelectItem value="Cambodge">Cambodge</SelectItem>
                          <SelectItem value="Cameroun">Cameroun</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Cap-Vert">Cap-Vert</SelectItem>
                          <SelectItem value="Chili">Chili</SelectItem>
                          <SelectItem value="Chine">Chine</SelectItem>
                          <SelectItem value="Chypre">Chypre</SelectItem>
                          <SelectItem value="Colombie">Colombie</SelectItem>
                          <SelectItem value="Comores">Comores</SelectItem>
                          <SelectItem value="Congo">Congo</SelectItem>
                          <SelectItem value="Congo démocratique">
                            Congo démocratique
                          </SelectItem>
                          <SelectItem value="Corée du Nord">
                            Corée du Nord
                          </SelectItem>
                          <SelectItem value="Corée du Sud">
                            Corée du Sud
                          </SelectItem>
                          <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                          <SelectItem value="Côte d'Ivoire">
                            Côte d&apos;Ivoire
                          </SelectItem>
                          <SelectItem value="Croatie">Croatie</SelectItem>
                          <SelectItem value="Cuba">Cuba</SelectItem>
                          <SelectItem value="Danemark">Danemark</SelectItem>
                          <SelectItem value="Djibouti">Djibouti</SelectItem>
                          <SelectItem value="Dominique">Dominique</SelectItem>
                          <SelectItem value="Égypte">Égypte</SelectItem>
                          <SelectItem value="Émirats arabes unis">
                            Émirats arabes unis
                          </SelectItem>
                          <SelectItem value="Équateur">Équateur</SelectItem>
                          <SelectItem value="Érythrée">Érythrée</SelectItem>
                          <SelectItem value="Espagne">Espagne</SelectItem>
                          <SelectItem value="Estonie">Estonie</SelectItem>
                          <SelectItem value="États-Unis">États-Unis</SelectItem>
                          <SelectItem value="Éthiopie">Éthiopie</SelectItem>
                          <SelectItem value="Fidji">Fidji</SelectItem>
                          <SelectItem value="Finlande">Finlande</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Gabon">Gabon</SelectItem>
                          <SelectItem value="Gambie">Gambie</SelectItem>
                          <SelectItem value="Géorgie">Géorgie</SelectItem>
                          <SelectItem value="Ghana">Ghana</SelectItem>
                          <SelectItem value="Grèce">Grèce</SelectItem>
                          <SelectItem value="Grenade">Grenade</SelectItem>
                          <SelectItem value="Guatemala">Guatemala</SelectItem>
                          <SelectItem value="Guinée">Guinée</SelectItem>
                          <SelectItem value="Guinée-Bissau">
                            Guinée-Bissau
                          </SelectItem>
                          <SelectItem value="Guinée équatoriale">
                            Guinée équatoriale
                          </SelectItem>
                          <SelectItem value="Guyana">Guyana</SelectItem>
                          <SelectItem value="Haïti">Haïti</SelectItem>
                          <SelectItem value="Honduras">Honduras</SelectItem>
                          <SelectItem value="Hongrie">Hongrie</SelectItem>
                          <SelectItem value="Îles Marshall">
                            Îles Marshall
                          </SelectItem>
                          <SelectItem value="Îles Salomon">
                            Îles Salomon
                          </SelectItem>
                          <SelectItem value="Inde">Inde</SelectItem>
                          <SelectItem value="Indonésie">Indonésie</SelectItem>
                          <SelectItem value="Irak">Irak</SelectItem>
                          <SelectItem value="Iran">Iran</SelectItem>
                          <SelectItem value="Irlande">Irlande</SelectItem>
                          <SelectItem value="Islande">Islande</SelectItem>
                          <SelectItem value="Israël">Israël</SelectItem>
                          <SelectItem value="Italie">Italie</SelectItem>
                          <SelectItem value="Jamaïque">Jamaïque</SelectItem>
                          <SelectItem value="Japon">Japon</SelectItem>
                          <SelectItem value="Jordanie">Jordanie</SelectItem>
                          <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="Kirghizistan">
                            Kirghizistan
                          </SelectItem>
                          <SelectItem value="Kiribati">Kiribati</SelectItem>
                          <SelectItem value="Koweït">Koweït</SelectItem>
                          <SelectItem value="Laos">Laos</SelectItem>
                          <SelectItem value="Lesotho">Lesotho</SelectItem>
                          <SelectItem value="Lettonie">Lettonie</SelectItem>
                          <SelectItem value="Liban">Liban</SelectItem>
                          <SelectItem value="Liberia">Liberia</SelectItem>
                          <SelectItem value="Libye">Libye</SelectItem>
                          <SelectItem value="Liechtenstein">
                            Liechtenstein
                          </SelectItem>
                          <SelectItem value="Lituanie">Lituanie</SelectItem>
                          <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                          <SelectItem value="Macédoine du Nord">
                            Macédoine du Nord
                          </SelectItem>
                          <SelectItem value="Madagascar">Madagascar</SelectItem>
                          <SelectItem value="Malaisie">Malaisie</SelectItem>
                          <SelectItem value="Malawi">Malawi</SelectItem>
                          <SelectItem value="Maldives">Maldives</SelectItem>
                          <SelectItem value="Mali">Mali</SelectItem>
                          <SelectItem value="Malte">Malte</SelectItem>
                          <SelectItem value="Maroc">Maroc</SelectItem>
                          <SelectItem value="Maurice">Maurice</SelectItem>
                          <SelectItem value="Mauritanie">Mauritanie</SelectItem>
                          <SelectItem value="Mexique">Mexique</SelectItem>
                          <SelectItem value="Micronésie">Micronésie</SelectItem>
                          <SelectItem value="Moldavie">Moldavie</SelectItem>
                          <SelectItem value="Monaco">Monaco</SelectItem>
                          <SelectItem value="Mongolie">Mongolie</SelectItem>
                          <SelectItem value="Monténégro">Monténégro</SelectItem>
                          <SelectItem value="Mozambique">Mozambique</SelectItem>
                          <SelectItem value="Namibie">Namibie</SelectItem>
                          <SelectItem value="Nauru">Nauru</SelectItem>
                          <SelectItem value="Népal">Népal</SelectItem>
                          <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                          <SelectItem value="Niger">Niger</SelectItem>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="Norvège">Norvège</SelectItem>
                          <SelectItem value="Nouvelle-Zélande">
                            Nouvelle-Zélande
                          </SelectItem>
                          <SelectItem value="Oman">Oman</SelectItem>
                          <SelectItem value="Ouganda">Ouganda</SelectItem>
                          <SelectItem value="Ouzbékistan">
                            Ouzbékistan
                          </SelectItem>
                          <SelectItem value="Pakistan">Pakistan</SelectItem>
                          <SelectItem value="Palaos">Palaos</SelectItem>
                          <SelectItem value="Palestine">Palestine</SelectItem>
                          <SelectItem value="Panama">Panama</SelectItem>
                          <SelectItem value="Papouasie-Nouvelle-Guinée">
                            Papouasie-Nouvelle-Guinée
                          </SelectItem>
                          <SelectItem value="Paraguay">Paraguay</SelectItem>
                          <SelectItem value="Pays-Bas">Pays-Bas</SelectItem>
                          <SelectItem value="Pérou">Pérou</SelectItem>
                          <SelectItem value="Philippines">
                            Philippines
                          </SelectItem>
                          <SelectItem value="Pologne">Pologne</SelectItem>
                          <SelectItem value="Portugal">Portugal</SelectItem>
                          <SelectItem value="Qatar">Qatar</SelectItem>
                          <SelectItem value="République centrafricaine">
                            République centrafricaine
                          </SelectItem>
                          <SelectItem value="République dominicaine">
                            République dominicaine
                          </SelectItem>
                          <SelectItem value="République tchèque">
                            République tchèque
                          </SelectItem>
                          <SelectItem value="Roumanie">Roumanie</SelectItem>
                          <SelectItem value="Royaume-Uni">
                            Royaume-Uni
                          </SelectItem>
                          <SelectItem value="Russie">Russie</SelectItem>
                          <SelectItem value="Rwanda">Rwanda</SelectItem>
                          <SelectItem value="Saint-Christophe-et-Niévès">
                            Saint-Christophe-et-Niévès
                          </SelectItem>
                          <SelectItem value="Sainte-Lucie">
                            Sainte-Lucie
                          </SelectItem>
                          <SelectItem value="Saint-Marin">
                            Saint-Marin
                          </SelectItem>
                          <SelectItem value="Saint-Vincent-et-les-Grenadines">
                            Saint-Vincent-et-les-Grenadines
                          </SelectItem>
                          <SelectItem value="Salvador">Salvador</SelectItem>
                          <SelectItem value="Samoa">Samoa</SelectItem>
                          <SelectItem value="São Tomé-et-Principe">
                            São Tomé-et-Principe
                          </SelectItem>
                          <SelectItem value="Sénégal">Sénégal</SelectItem>
                          <SelectItem value="Serbie">Serbie</SelectItem>
                          <SelectItem value="Seychelles">Seychelles</SelectItem>
                          <SelectItem value="Sierra Leone">
                            Sierra Leone
                          </SelectItem>
                          <SelectItem value="Singapour">Singapour</SelectItem>
                          <SelectItem value="Slovaquie">Slovaquie</SelectItem>
                          <SelectItem value="Slovénie">Slovénie</SelectItem>
                          <SelectItem value="Somalie">Somalie</SelectItem>
                          <SelectItem value="Soudan">Soudan</SelectItem>
                          <SelectItem value="Soudan du Sud">
                            Soudan du Sud
                          </SelectItem>
                          <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                          <SelectItem value="Suède">Suède</SelectItem>
                          <SelectItem value="Suisse">Suisse</SelectItem>
                          <SelectItem value="Suriname">Suriname</SelectItem>
                          <SelectItem value="Syrie">Syrie</SelectItem>
                          <SelectItem value="Tadjikistan">
                            Tadjikistan
                          </SelectItem>
                          <SelectItem value="Tanzanie">Tanzanie</SelectItem>
                          <SelectItem value="Tchad">Tchad</SelectItem>
                          <SelectItem value="Thaïlande">Thaïlande</SelectItem>
                          <SelectItem value="Timor oriental">
                            Timor oriental
                          </SelectItem>
                          <SelectItem value="Togo">Togo</SelectItem>
                          <SelectItem value="Tonga">Tonga</SelectItem>
                          <SelectItem value="Trinité-et-Tobago">
                            Trinité-et-Tobago
                          </SelectItem>
                          <SelectItem value="Tunisie">Tunisie</SelectItem>
                          <SelectItem value="Turkménistan">
                            Turkménistan
                          </SelectItem>
                          <SelectItem value="Turquie">Turquie</SelectItem>
                          <SelectItem value="Tuvalu">Tuvalu</SelectItem>
                          <SelectItem value="Ukraine">Ukraine</SelectItem>
                          <SelectItem value="Uruguay">Uruguay</SelectItem>
                          <SelectItem value="Vanuatu">Vanuatu</SelectItem>
                          <SelectItem value="Vatican">Vatican</SelectItem>
                          <SelectItem value="Venezuela">Venezuela</SelectItem>
                          <SelectItem value="Viêt Nam">Viêt Nam</SelectItem>
                          <SelectItem value="Yémen">Yémen</SelectItem>
                          <SelectItem value="Zambie">Zambie</SelectItem>
                          <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* Documents et véhicule */}
              {(isFieldEnabled("clientIdNumber") ||
                isFieldEnabled("clientVehicleNumber")) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {isFieldEnabled("clientIdNumber") && (
                    <div>
                      <Label htmlFor="clientIdNumber">
                        N° de permis ou de carte d&apos;identité / ID or License
                        Number {isFieldRequired("clientIdNumber") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientIdNumber"
                        type="text"
                        value={clientIdNumber}
                        onChange={(e) => setClientIdNumber(e.target.value)}
                        placeholder="Numéro d'identification / ID Number"
                        className="mt-1"
                        required={isFieldRequired("clientIdNumber")}
                      />
                    </div>
                  )}
                  {isFieldEnabled("clientVehicleNumber") && (
                    <div>
                      <Label htmlFor="clientVehicleNumber">
                        N° d&apos;immatriculation du véhicule / License Plate{" "}
                        {isFieldRequired("clientVehicleNumber") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientVehicleNumber"
                        type="text"
                        value={clientVehicleNumber}
                        onChange={(e) => setClientVehicleNumber(e.target.value)}
                        placeholder="Ex: FR 123456 / e.g.: FR 123456"
                        className="mt-1"
                        required={isFieldRequired("clientVehicleNumber")}
                      />
                    </div>
                  )}
                </div>
              )}
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
                  ? "Création de la réservation... / Creating booking..."
                  : "Continuer vers le résumé / Continue to Summary"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
