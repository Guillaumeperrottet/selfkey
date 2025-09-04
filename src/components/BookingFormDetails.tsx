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
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { toastUtils } from "@/lib/toast-utils";
import { calculateStayDuration } from "@/lib/availability";
import { useFormConfig } from "@/hooks/useFormConfig";
import { calculateTouristTax } from "@/lib/fee-calculator";

interface Room {
  id: string;
  name: string;
  price: number;
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

interface BookingFormDetailsProps {
  hotelSlug: string;
  establishmentName: string;
  selectedRoom: Room;
  checkInDate: string;
  checkOutDate: string;
  hasDog?: boolean;
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

  // États pour les options de prix
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [selectedPricingOptions, setSelectedPricingOptions] = useState<
    Record<string, string | string[]>
  >(initialData?.selectedPricingOptions || {});
  const [pricingOptionsTotal, setPricingOptionsTotal] = useState(0);

  // États pour la taxe de séjour
  const [touristTaxEnabled, setTouristTaxEnabled] = useState(true);
  const [touristTaxAmount, setTouristTaxAmount] = useState(3.0);
  const [touristTaxTotal, setTouristTaxTotal] = useState(0);

  const [bookingInProgress, setBookingInProgress] = useState(false);

  const duration = calculateStayDuration(
    new Date(checkInDate),
    new Date(checkOutDate)
  );

  // Charger les options de prix
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
                defaultSelections[option.id] = [defaultValue.id];
              } else {
                defaultSelections[option.id] = defaultValue.id;
              }
            }
          });
          console.log("DEBUG: Default selections:", defaultSelections);

          // Fusionner avec les données initiales si disponibles
          setSelectedPricingOptions((prev) => ({
            ...defaultSelections,
            ...prev,
          }));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des options de prix:", error);
      }
    };

    loadPricingOptions();
  }, [hotelSlug]);

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

  // Calculer le total des options de prix
  useEffect(() => {
    let total = 0;
    pricingOptions.forEach((option) => {
      const selectedValue = selectedPricingOptions[option.id];
      if (selectedValue) {
        if (Array.isArray(selectedValue)) {
          selectedValue.forEach((valueId) => {
            const value = option.values.find((v) => v.id === valueId);
            if (value) {
              total += value.priceModifier;
            }
          });
        } else {
          const value = option.values.find((v) => v.id === selectedValue);
          if (value) {
            total += value.priceModifier;
          }
        }
      }
    });
    setPricingOptionsTotal(total);
  }, [selectedPricingOptions, pricingOptions]);

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

    // Validation des options de prix obligatoires
    const missingRequiredOptions = pricingOptions
      .filter((option) => option.isRequired && option.isActive)
      .filter((option) => {
        const selected = selectedPricingOptions[option.id];
        return (
          !selected ||
          (Array.isArray(selected) && selected.length === 0) ||
          (!Array.isArray(selected) && selected === "")
        );
      });

    if (missingFields.length > 0 || adults < 1) {
      toastUtils.error("Please fill in all required fields");
      return;
    }

    if (missingRequiredOptions.length > 0) {
      toastUtils.error(
        `Please complete the required options: ${missingRequiredOptions.map((o) => o.name).join(", ")}`
      );
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
        clientBirthDate: clientBirthDate?.toISOString().split("T")[0] || "",
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

  const totalPrice =
    selectedRoom.price * duration + pricingOptionsTotal + touristTaxTotal;

  return (
    <Card className="max-w-4xl mx-auto border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-medium text-gray-900">
              Complete Your Booking
            </CardTitle>
          </div>
          <Button
            variant="outline"
            onClick={onBack}
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            ← Change Room
          </Button>
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
                Adults (16+) and children (16-)
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

          {/* Section options de prix */}
          {pricingOptions.length > 0 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Additional Options
                </h4>
                <p className="text-sm text-gray-600">Enhance your experience</p>
              </div>

              {/* Afficher les options valides */}
              {pricingOptions.filter(
                (option) => option.isActive && option.values?.length > 0
              ).length > 0 ? (
                <div className="space-y-4">
                  {pricingOptions
                    .filter(
                      (option) => option.isActive && option.values?.length > 0
                    )
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((option) => (
                      <div
                        key={option.id}
                        className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {option.name}
                            {option.isRequired && (
                              <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded-full">
                                Obligatoire
                              </span>
                            )}
                          </Label>
                          {/* Indicateur du type d'option */}
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                            {option.type === "select" && "Menu déroulant"}
                            {option.type === "radio" && "Choix unique"}
                            {option.type === "checkbox" && "Choix multiple"}
                          </span>
                        </div>

                        {option.type === "select" && (
                          <Select
                            value={
                              (selectedPricingOptions[option.id] as string) ||
                              (option.isRequired ? "" : "__none__")
                            }
                            onValueChange={(value) =>
                              handlePricingOptionChange(
                                option.id,
                                value === "__none__" ? "" : value
                              )
                            }
                          >
                            <SelectTrigger className="h-12 bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500">
                              <SelectValue placeholder="Sélectionnez une option..." />
                            </SelectTrigger>
                            <SelectContent>
                              {!option.isRequired && (
                                <SelectItem value="__none__">
                                  <span className="text-gray-500">Options</span>
                                </SelectItem>
                              )}
                              {option.values
                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                .map((value) => (
                                  <SelectItem key={value.id} value={value.id}>
                                    <div className="flex justify-between w-full items-center">
                                      <span>{value.label}</span>
                                      {value.priceModifier !== 0 && (
                                        <span className="ml-2 text-gray-600 font-medium">
                                          {value.priceModifier > 0 ? "+" : ""}
                                          {value.priceModifier} CHF
                                        </span>
                                      )}
                                    </div>
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
                                  className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                                  onClick={() => {
                                    const currentValues =
                                      (selectedPricingOptions[
                                        option.id
                                      ] as string[]) || [];
                                    const isChecked = currentValues.includes(
                                      value.id
                                    );
                                    const newValues = isChecked
                                      ? currentValues.filter(
                                          (v) => v !== value.id
                                        )
                                      : [...currentValues, value.id];

                                    if (
                                      newValues.length === 0 &&
                                      option.isRequired
                                    ) {
                                      return;
                                    }

                                    handlePricingOptionChange(
                                      option.id,
                                      newValues
                                    );
                                  }}
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

                                      if (
                                        newValues.length === 0 &&
                                        option.isRequired
                                      ) {
                                        return;
                                      }

                                      handlePricingOptionChange(
                                        option.id,
                                        newValues
                                      );
                                    }}
                                    className="h-5 w-5"
                                  />
                                  <Label
                                    htmlFor={`${option.id}-${value.id}`}
                                    className="flex-1 cursor-pointer flex justify-between items-center"
                                  >
                                    <span className="text-sm font-medium text-gray-800">
                                      {value.label}
                                    </span>
                                    {value.priceModifier !== 0 && (
                                      <span
                                        className={`font-semibold text-sm ${
                                          value.priceModifier > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {value.priceModifier > 0 ? "+" : ""}
                                        {value.priceModifier} CHF
                                      </span>
                                    )}
                                  </Label>
                                </div>
                              ))}
                          </div>
                        )}

                        {option.type === "radio" && (
                          <div className="space-y-2">
                            {!option.isRequired && (
                              <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer">
                                <input
                                  type="radio"
                                  id={`${option.id}-none`}
                                  name={`radio-${option.id}`}
                                  value="__none__"
                                  checked={
                                    !selectedPricingOptions[option.id] ||
                                    selectedPricingOptions[option.id] === ""
                                  }
                                  onChange={() =>
                                    handlePricingOptionChange(option.id, "")
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <Label
                                  htmlFor={`${option.id}-none`}
                                  className="flex-1 cursor-pointer flex justify-between items-center"
                                >
                                  <span className="text-sm font-medium text-gray-600">
                                    Aucune option
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    +0 CHF
                                  </span>
                                </Label>
                              </div>
                            )}
                            {option.values
                              .sort((a, b) => a.displayOrder - b.displayOrder)
                              .map((value) => (
                                <div
                                  key={value.id}
                                  className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                                  onClick={() =>
                                    handlePricingOptionChange(
                                      option.id,
                                      value.id
                                    )
                                  }
                                >
                                  <input
                                    type="radio"
                                    id={`${option.id}-${value.id}`}
                                    name={`radio-${option.id}`}
                                    value={value.id}
                                    checked={
                                      selectedPricingOptions[option.id] ===
                                      value.id
                                    }
                                    onChange={() =>
                                      handlePricingOptionChange(
                                        option.id,
                                        value.id
                                      )
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  <Label
                                    htmlFor={`${option.id}-${value.id}`}
                                    className="flex-1 cursor-pointer flex justify-between items-center"
                                  >
                                    <span className="text-sm font-medium text-gray-800">
                                      {value.label}
                                    </span>
                                    {value.priceModifier !== 0 && (
                                      <span
                                        className={`font-semibold text-sm ${
                                          value.priceModifier > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {value.priceModifier > 0 ? "+" : ""}
                                        {value.priceModifier} CHF
                                      </span>
                                    )}
                                  </Label>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm">
                    Aucune option supplémentaire disponible pour le moment.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Récapitulatif final */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* En-tête avec informations de réservation */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">
                    {selectedRoom.name}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {new Date(checkInDate).toLocaleDateString("fr-CH", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    →{" "}
                    {new Date(checkOutDate).toLocaleDateString("fr-CH", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {duration} night{duration > 1 ? "s" : ""} •{" "}
                    {adults + children} guest{adults + children > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Détail des prix */}
            <div className="p-4 space-y-3">
              <h5 className="font-medium text-gray-900 mb-3">Price</h5>

              {/* Prix de base */}
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  {selectedRoom.price} CHF × {duration} night
                  {duration > 1 ? "s" : ""}
                </span>
                <span className="font-medium text-gray-900">
                  {selectedRoom.price * duration} CHF
                </span>
              </div>

              {/* Options supplémentaires */}
              {pricingOptionsTotal !== 0 && (
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-700 font-medium">
                      Additional options
                    </span>
                  </div>
                  {/* Détail des options sélectionnées */}
                  <div className="ml-4 space-y-1">
                    {pricingOptions
                      .filter((option) => {
                        const selected = selectedPricingOptions[option.id];
                        return (
                          selected &&
                          ((Array.isArray(selected) && selected.length > 0) ||
                            (!Array.isArray(selected) && selected !== ""))
                        );
                      })
                      .map((option) => {
                        const selected = selectedPricingOptions[option.id];
                        const selectedValues = Array.isArray(selected)
                          ? option.values.filter((v) => selected.includes(v.id))
                          : option.values.filter((v) => v.id === selected);

                        return selectedValues.map((value) => (
                          <div
                            key={`${option.id}-${value.id}`}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-600">
                              • {value.label}
                            </span>
                            <span
                              className={`${value.priceModifier > 0 ? "text-green-600" : value.priceModifier < 0 ? "text-red-600" : "text-gray-500"}`}
                            >
                              {value.priceModifier > 0 ? "+" : ""}
                              {value.priceModifier} CHF
                            </span>
                          </div>
                        ));
                      })}
                  </div>
                </div>
              )}

              {/* Taxe de séjour */}
              {touristTaxEnabled && touristTaxTotal > 0 && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-700">Tourist tax</span>
                    <div className="text-xs text-gray-500">
                      {adults} adult{adults > 1 ? "s" : ""} • {duration} night
                      {duration > 1 ? "s" : ""}
                    </div>
                  </div>
                  <span className="font-medium text-gray-900">
                    +{touristTaxTotal.toFixed(2)} CHF
                  </span>
                </div>
              )}
            </div>

            {/* Total final */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg text-gray-900">
                  Total
                </span>
                <span className="font-bold text-2xl text-gray-900">
                  {totalPrice.toFixed(2)} CHF
                </span>
              </div>
            </div>

            {/* Bouton de confirmation */}
            <div className="p-4">
              {/* Validation des options obligatoires */}
              {(() => {
                const missingRequiredOptions = pricingOptions
                  .filter((option) => option.isRequired && option.isActive)
                  .filter((option) => {
                    const selected = selectedPricingOptions[option.id];
                    return (
                      !selected ||
                      (Array.isArray(selected) && selected.length === 0) ||
                      (!Array.isArray(selected) && selected === "")
                    );
                  });

                return (
                  missingRequiredOptions.length > 0 && (
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-800">
                        <span className="text-sm font-medium">
                          ⚠️ Options obligatoires manquantes :
                        </span>
                      </div>
                      <ul className="mt-1 ml-4 text-sm text-amber-700">
                        {missingRequiredOptions.map((option) => (
                          <li key={option.id}>• {option.name}</li>
                        ))}
                      </ul>
                    </div>
                  )
                );
              })()}

              <Button
                onClick={handleConfirmBooking}
                disabled={bookingInProgress}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                {bookingInProgress ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Complete Booking"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
