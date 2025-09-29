"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toastUtils } from "@/lib/toast-utils";
import { calculateStayDuration } from "@/lib/availability";
import { useFormConfig } from "@/hooks/useFormConfig";
import { calculateTouristTax } from "@/lib/fee-calculator";
import {
  calculatePricingOptionsTotal,
  fetchPricingOptions,
  type PricingOption,
} from "@/lib/pricing-options-calculator";
import { CompactBookingCart } from "@/components/CompactBookingCart";

interface Room {
  id: string;
  name: string;
  price: number;
}

interface BookingFormDetailsProps {
  hotelSlug: string;
  establishmentName: string;
  selectedRoom: Room;
  checkInDate: string;
  checkOutDate: string;
  hasDog?: boolean;
  selectedPricingOptions?: Record<string, string | string[]>;
  onBack: () => void;
  initialData?: {
    adults?: number;
    children?: number;
    clientFirstName?: string;
    clientLastName?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientBirthDate?: string;
    clientAddress?: string;
    clientPostalCode?: string;
    clientCity?: string;
    clientCountry?: string;
    clientBirthPlace?: string;
    clientIdNumber?: string;
    clientVehicleNumber?: string;
    selectedPricingOptions?: Record<string, string | string[]>;
    hasDog?: boolean;
  };
}

export function BookingFormDetails({
  hotelSlug,
  establishmentName,
  selectedRoom,
  checkInDate,
  checkOutDate,
  hasDog,
  selectedPricingOptions: initialSelectedPricingOptions,
  onBack,
  initialData,
}: BookingFormDetailsProps) {
  const router = useRouter();
  const { isFieldEnabled, isFieldRequired } = useFormConfig(hotelSlug);

  // États pour les invités
  const [adults, setAdults] = useState(initialData?.adults || 1);
  const [children, setChildren] = useState(initialData?.children || 0);

  // États pour les informations client
  const [clientFirstName, setClientFirstName] = useState(
    initialData?.clientFirstName || ""
  );
  const [clientLastName, setClientLastName] = useState(
    initialData?.clientLastName || ""
  );
  const [clientEmail, setClientEmail] = useState(
    initialData?.clientEmail || ""
  );
  const [clientPhone, setClientPhone] = useState(
    initialData?.clientPhone || ""
  );

  // États pour les champs détaillés du client
  const [clientBirthDate, setClientBirthDate] = useState(
    initialData?.clientBirthDate
      ? new Date(initialData.clientBirthDate)
      : undefined
  );
  const [clientAddress, setClientAddress] = useState(
    initialData?.clientAddress || ""
  );
  const [clientPostalCode, setClientPostalCode] = useState(
    initialData?.clientPostalCode || ""
  );
  const [clientCity, setClientCity] = useState(initialData?.clientCity || "");
  const [clientCountry, setClientCountry] = useState(
    initialData?.clientCountry || "Suisse"
  );
  const [clientBirthPlace, setClientBirthPlace] = useState(
    initialData?.clientBirthPlace || ""
  );
  const [clientIdNumber, setClientIdNumber] = useState(
    initialData?.clientIdNumber || ""
  );
  const [clientVehicleNumber, setClientVehicleNumber] = useState(
    initialData?.clientVehicleNumber || ""
  );

  // États pour la taxe de séjour
  const [touristTaxEnabled, setTouristTaxEnabled] = useState(true);
  const [touristTaxAmount, setTouristTaxAmount] = useState(3.0);
  const [touristTaxTotal, setTouristTaxTotal] = useState(0);

  // États pour les options de prix
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [pricingOptionsTotal, setPricingOptionsTotal] = useState(0);

  const [bookingInProgress, setBookingInProgress] = useState(false);

  const duration = calculateStayDuration(
    new Date(checkInDate),
    new Date(checkOutDate)
  );

  // Scroll vers le haut au montage du composant
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Charger les paramètres de taxe de séjour
  useEffect(() => {
    const loadTouristTaxSettings = async () => {
      try {
        const response = await fetch(
          `/api/establishments/${hotelSlug}/tourist-tax-settings`
        );
        const settings = await response.json();

        if (response.ok) {
          setTouristTaxEnabled(settings.touristTaxEnabled);
          setTouristTaxAmount(settings.touristTaxAmount);
        } else {
          console.error(
            "Erreur récupération paramètres taxe de séjour:",
            settings.error
          );
          setTouristTaxEnabled(true);
          setTouristTaxAmount(3.0);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des paramètres de taxe de séjour:",
          error
        );
        setTouristTaxEnabled(true);
        setTouristTaxAmount(3.0);
      }
    };

    loadTouristTaxSettings();
  }, [hotelSlug]);

  // Calculer la taxe de séjour (uniquement pour les adultes)
  useEffect(() => {
    const taxCalculation = calculateTouristTax(
      adults, // Seulement les adultes (16+)
      duration, // Nombre de nuits
      touristTaxAmount,
      touristTaxEnabled
    );
    setTouristTaxTotal(taxCalculation.totalTax);
  }, [adults, duration, touristTaxEnabled, touristTaxAmount]);

  // Charger les options de prix
  useEffect(() => {
    const loadPricingOptions = async () => {
      try {
        const options = await fetchPricingOptions(hotelSlug);
        setPricingOptions(options);
      } catch (error) {
        console.error("Erreur lors du chargement des options de prix:", error);
      }
    };

    loadPricingOptions();
  }, [hotelSlug]);

  // Calculer le total des options de prix sélectionnées
  useEffect(() => {
    if (initialSelectedPricingOptions && pricingOptions.length > 0) {
      const total = calculatePricingOptionsTotal(
        initialSelectedPricingOptions,
        pricingOptions
      );
      setPricingOptionsTotal(total);
    } else {
      setPricingOptionsTotal(0);
    }
  }, [initialSelectedPricingOptions, pricingOptions]);

  const handleConfirmBooking = async () => {
    // Validation des champs obligatoires
    const requiredFieldsValidation = [
      {
        value: clientFirstName.trim(),
        field: "clientFirstName",
        name: "First name",
      },
      {
        value: clientLastName.trim(),
        field: "clientLastName",
        name: "Last name",
      },
      { value: clientEmail.trim(), field: "clientEmail", name: "Email" },
      { value: clientPhone.trim(), field: "clientPhone", name: "Phone" },
    ];

    // Ajouter les champs conditionnels s'ils sont requis ET activés
    if (
      isFieldEnabled("clientBirthDate") &&
      isFieldRequired("clientBirthDate")
    ) {
      requiredFieldsValidation.push({
        value: clientBirthDate ? "valid" : "",
        field: "clientBirthDate",
        name: "Date of birth",
      });
    }
    if (
      isFieldEnabled("clientBirthPlace") &&
      isFieldRequired("clientBirthPlace")
    ) {
      requiredFieldsValidation.push({
        value: clientBirthPlace.trim(),
        field: "clientBirthPlace",
        name: "Place of birth",
      });
    }
    if (isFieldEnabled("clientAddress") && isFieldRequired("clientAddress")) {
      requiredFieldsValidation.push({
        value: clientAddress.trim(),
        field: "clientAddress",
        name: "Address",
      });
    }
    if (
      isFieldEnabled("clientPostalCode") &&
      isFieldRequired("clientPostalCode")
    ) {
      requiredFieldsValidation.push({
        value: clientPostalCode.trim(),
        field: "clientPostalCode",
        name: "Postal code",
      });
    }
    if (isFieldEnabled("clientCity") && isFieldRequired("clientCity")) {
      requiredFieldsValidation.push({
        value: clientCity.trim(),
        field: "clientCity",
        name: "City",
      });
    }
    if (isFieldEnabled("clientCountry") && isFieldRequired("clientCountry")) {
      requiredFieldsValidation.push({
        value: clientCountry.trim(),
        field: "clientCountry",
        name: "Country",
      });
    }
    if (isFieldEnabled("clientIdNumber") && isFieldRequired("clientIdNumber")) {
      requiredFieldsValidation.push({
        value: clientIdNumber.trim(),
        field: "clientIdNumber",
        name: "ID number",
      });
    }
    if (
      isFieldEnabled("clientVehicleNumber") &&
      isFieldRequired("clientVehicleNumber")
    ) {
      requiredFieldsValidation.push({
        value: clientVehicleNumber.trim(),
        field: "clientVehicleNumber",
        name: "License plate",
      });
    }

    // Vérifier que tous les champs obligatoires sont remplis
    const missingFields = requiredFieldsValidation.filter(
      (field) => !field.value
    );

    if (missingFields.length > 0 || adults < 1) {
      toastUtils.error("Please fill in all required fields");
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      toastUtils.error("Please enter a valid email address");
      return;
    }

    setBookingInProgress(true);
    const loadingToast = toastUtils.loading("Creating your booking...");

    try {
      const totalPrice =
        selectedRoom.price * duration + pricingOptionsTotal + touristTaxTotal;

      const bookingData = {
        hotelSlug,
        roomId: selectedRoom.id,
        room: selectedRoom,
        establishment: { name: establishmentName, slug: hotelSlug },
        checkInDate,
        checkOutDate,
        adults,
        children,
        clientFirstName: clientFirstName.trim(),
        clientLastName: clientLastName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        clientBirthDate: clientBirthDate
          ? `${clientBirthDate.getFullYear()}-${String(clientBirthDate.getMonth() + 1).padStart(2, "0")}-${String(clientBirthDate.getDate()).padStart(2, "0")}`
          : "",
        clientBirthPlace: clientBirthPlace.trim(),
        clientAddress: clientAddress.trim(),
        clientPostalCode: clientPostalCode.trim(),
        clientCity: clientCity.trim(),
        clientCountry: clientCountry.trim(),
        clientIdNumber: clientIdNumber.trim(),
        clientVehicleNumber: clientVehicleNumber.trim(),
        amount: totalPrice,
        currency: "CHF",
        selectedPricingOptions: initialSelectedPricingOptions || {},
        pricingOptionsTotal,
        touristTaxTotal,
        touristTaxPerPersonPerNight: touristTaxAmount,
        guests: adults + children,
        hasDog: hasDog || initialData?.hasDog || false,
      };

      const tempBookingId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(
        `booking_${tempBookingId}`,
        JSON.stringify(bookingData)
      );

      toastUtils.dismiss(loadingToast);
      router.push(`/${hotelSlug}/summary?booking=${tempBookingId}`);
    } catch (err) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error(
        err instanceof Error ? err.message : "Error creating booking"
      );
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            ← Place
          </Button>
          <div className="flex-1 text-center">
            <CardTitle className="text-xl font-medium text-gray-900">
              Contact details
            </CardTitle>
          </div>
          <CompactBookingCart
            room={selectedRoom}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            selectedPricingOptions={initialSelectedPricingOptions || {}}
            pricingOptions={pricingOptions}
            touristTaxTotal={touristTaxTotal}
          />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-8">
          {/* Section invités */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                Guest Information
              </h4>
              <p className="text-sm text-gray-600">
                Adults (16+) and children (15-)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="adults"
                  className="text-sm font-medium text-gray-700"
                >
                  Adults *
                </Label>
                <Select
                  value={adults.toString()}
                  onValueChange={(value) => setAdults(parseInt(value))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} adult{num > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isFieldEnabled("children") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="children"
                    className="text-sm font-medium text-gray-700"
                  >
                    Children
                  </Label>
                  <Select
                    value={children.toString()}
                    onValueChange={(value) => setChildren(parseInt(value))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} child{num > 1 ? "ren" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Information taxe de séjour discrète */}
            {touristTaxEnabled && (
              <div className="text-xs text-gray-500 mt-2">
                ℹ️ Tourist tax: {touristTaxAmount.toFixed(2)} CHF per adult per
                night (applied at checkout)
              </div>
            )}
          </div>

          {/* Section informations personnelles */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                Personal Information
              </h4>
              <p className="text-sm text-gray-600">
                Required for your booking confirmation
              </p>
            </div>

            <div className="space-y-4">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="clientLastName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Last Name *
                  </Label>
                  <Input
                    id="clientLastName"
                    type="text"
                    value={clientLastName}
                    onChange={(e) => setClientLastName(e.target.value)}
                    placeholder="Your last name"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="clientFirstName"
                    className="text-sm font-medium text-gray-700"
                  >
                    First Name *
                  </Label>
                  <Input
                    id="clientFirstName"
                    type="text"
                    value={clientFirstName}
                    onChange={(e) => setClientFirstName(e.target.value)}
                    placeholder="Your first name"
                    className="h-10"
                    required
                  />
                </div>
              </div>

              {/* Email et Téléphone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="clientEmail"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="clientPhone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+41 79 123 45 67"
                    className="h-10"
                    required
                  />
                </div>
              </div>

              {/* Champs conditionnels - Date et lieu de naissance */}
              {(isFieldEnabled("clientBirthDate") ||
                isFieldEnabled("clientBirthPlace")) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isFieldEnabled("clientBirthDate") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="clientBirthDate"
                        className="text-sm font-medium text-gray-700"
                      >
                        Date of Birth{" "}
                        {isFieldRequired("clientBirthDate") ? "*" : ""}
                      </Label>
                      <DatePicker
                        date={clientBirthDate}
                        onDateChange={setClientBirthDate}
                        placeholder="Select your birth date"
                        className="w-full"
                      />
                    </div>
                  )}
                  {isFieldEnabled("clientBirthPlace") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="clientBirthPlace"
                        className="text-sm font-medium text-gray-700"
                      >
                        Place of Birth{" "}
                        {isFieldRequired("clientBirthPlace") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientBirthPlace"
                        type="text"
                        value={clientBirthPlace}
                        onChange={(e) => setClientBirthPlace(e.target.value)}
                        placeholder="City, Country"
                        className="h-10"
                        required={isFieldRequired("clientBirthPlace")}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Adresse complète */}
              {isFieldEnabled("clientAddress") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="clientAddress"
                    className="text-sm font-medium text-gray-700"
                  >
                    Address {isFieldRequired("clientAddress") ? "*" : ""}
                  </Label>
                  <Input
                    id="clientAddress"
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Street and number"
                    className="h-10"
                    required={isFieldRequired("clientAddress")}
                  />
                </div>
              )}

              {/* Code postal, Localité et Pays */}
              {(isFieldEnabled("clientPostalCode") ||
                isFieldEnabled("clientCity") ||
                isFieldEnabled("clientCountry")) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isFieldEnabled("clientPostalCode") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="clientPostalCode"
                        className="text-sm font-medium text-gray-700"
                      >
                        Postal Code{" "}
                        {isFieldRequired("clientPostalCode") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientPostalCode"
                        type="text"
                        value={clientPostalCode}
                        onChange={(e) => setClientPostalCode(e.target.value)}
                        placeholder="1234"
                        className="h-10"
                        required={isFieldRequired("clientPostalCode")}
                      />
                    </div>
                  )}
                  {isFieldEnabled("clientCity") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="clientCity"
                        className="text-sm font-medium text-gray-700"
                      >
                        City {isFieldRequired("clientCity") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientCity"
                        type="text"
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        placeholder="Your city"
                        className="h-10"
                        required={isFieldRequired("clientCity")}
                      />
                    </div>
                  )}
                  {isFieldEnabled("clientCountry") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="clientCountry"
                        className="text-sm font-medium text-gray-700"
                      >
                        Country {isFieldRequired("clientCountry") ? "*" : ""}
                      </Label>
                      <Select
                        value={clientCountry}
                        onValueChange={(value) => setClientCountry(value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="Suisse">Switzerland</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Allemagne">Germany</SelectItem>
                          <SelectItem value="Italie">Italy</SelectItem>
                          <SelectItem value="Autriche">Austria</SelectItem>
                          <SelectItem value="Belgique">Belgium</SelectItem>
                          <SelectItem value="Pays-Bas">Netherlands</SelectItem>
                          <SelectItem value="Espagne">Spain</SelectItem>
                          <SelectItem value="Portugal">Portugal</SelectItem>
                          <SelectItem value="Royaume-Uni">
                            United Kingdom
                          </SelectItem>
                          <SelectItem value="États-Unis">
                            United States
                          </SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* Documents et véhicule */}
              {(isFieldEnabled("clientIdNumber") ||
                isFieldEnabled("clientVehicleNumber")) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isFieldEnabled("clientIdNumber") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="clientIdNumber"
                        className="text-sm font-medium text-gray-700"
                      >
                        ID or License Number{" "}
                        {isFieldRequired("clientIdNumber") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientIdNumber"
                        type="text"
                        value={clientIdNumber}
                        onChange={(e) => setClientIdNumber(e.target.value)}
                        placeholder="ID Number"
                        className="h-10"
                        required={isFieldRequired("clientIdNumber")}
                      />
                    </div>
                  )}
                  {isFieldEnabled("clientVehicleNumber") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="clientVehicleNumber"
                        className="text-sm font-medium text-gray-700"
                      >
                        License Plate{" "}
                        {isFieldRequired("clientVehicleNumber") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientVehicleNumber"
                        type="text"
                        value={clientVehicleNumber}
                        onChange={(e) => setClientVehicleNumber(e.target.value)}
                        placeholder="FR 123456"
                        className="h-10"
                        required={isFieldRequired("clientVehicleNumber")}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Boutons de navigation */}
          <div className="flex gap-4 pt-6">
            <Button variant="outline" onClick={onBack} className="flex-1">
              ← Back
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={bookingInProgress}
              className="flex-1"
            >
              {bookingInProgress ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                "Next / Suivant →"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
