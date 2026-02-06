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
import { BirthDateSelector } from "@/components/ui/birth-date-selector";
import { toastUtils } from "@/lib/toast-utils";
import { calculateStayDuration } from "@/lib/availability";
import { useFormConfig } from "@/hooks/useFormConfig";
import { calculateTouristTax } from "@/lib/fee-calculator";
import {
  calculatePricingOptionsTotal,
  fetchPricingOptions,
  type PricingOption,
} from "@/lib/pricing-options-calculator";
import { enrichPricingOptions } from "@/lib/booking/pricing-options";
import { CompactBookingCart } from "@/components/booking/CompactBookingCart";
import { useBookingTranslation } from "@/hooks/useBookingTranslation";

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
    clientIdType?: string;
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
  const { t, locale } = useBookingTranslation();

  // États pour les invités
  const [adults, setAdults] = useState(initialData?.adults || 1);
  const [children, setChildren] = useState(initialData?.children || 0);

  // États pour les informations client
  const [clientFirstName, setClientFirstName] = useState(
    initialData?.clientFirstName || "",
  );
  const [clientLastName, setClientLastName] = useState(
    initialData?.clientLastName || "",
  );
  const [clientEmail, setClientEmail] = useState(
    initialData?.clientEmail || "",
  );
  const [clientPhone, setClientPhone] = useState(
    initialData?.clientPhone || "",
  );

  // États pour les champs détaillés du client
  const [clientBirthDate, setClientBirthDate] = useState(
    initialData?.clientBirthDate
      ? new Date(initialData.clientBirthDate)
      : undefined,
  );
  const [clientAddress, setClientAddress] = useState(
    initialData?.clientAddress || "",
  );
  const [clientPostalCode, setClientPostalCode] = useState(
    initialData?.clientPostalCode || "",
  );
  const [clientCity, setClientCity] = useState(initialData?.clientCity || "");
  const [clientCountry, setClientCountry] = useState(
    initialData?.clientCountry || "Suisse",
  );
  const [clientBirthPlace, setClientBirthPlace] = useState(
    initialData?.clientBirthPlace || "",
  );
  const [clientIdNumber, setClientIdNumber] = useState(
    initialData?.clientIdNumber || "",
  );
  const [clientIdType, setClientIdType] = useState(
    initialData?.clientIdType || "Carte d'identité",
  );
  const [clientVehicleNumber, setClientVehicleNumber] = useState(
    initialData?.clientVehicleNumber || "",
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
    new Date(checkOutDate),
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
          `/api/establishments/${hotelSlug}/tourist-tax-settings`,
        );
        const settings = await response.json();

        if (response.ok) {
          setTouristTaxEnabled(settings.touristTaxEnabled);
          setTouristTaxAmount(settings.touristTaxAmount);
        } else {
          console.error(
            "Erreur récupération paramètres taxe de séjour:",
            settings.error,
          );
          setTouristTaxEnabled(true);
          setTouristTaxAmount(3.0);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des paramètres de taxe de séjour:",
          error,
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
      touristTaxEnabled,
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
      const duration = calculateStayDuration(
        new Date(checkInDate),
        new Date(checkOutDate),
      );
      const total = calculatePricingOptionsTotal(
        initialSelectedPricingOptions,
        pricingOptions,
        duration,
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
      (field) => !field.value,
    );

    if (missingFields.length > 0 || adults < 1) {
      toastUtils.error(t.validation.requiredFields);
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      toastUtils.error(t.validation.invalidEmail);
      return;
    }

    setBookingInProgress(true);
    const loadingToast = toastUtils.loading(t.messages.creatingBooking);

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
        clientIdType: clientIdType,
        clientVehicleNumber: clientVehicleNumber.trim(),
        amount: totalPrice,
        currency: "CHF",
        selectedPricingOptions: enrichPricingOptions(
          initialSelectedPricingOptions || {},
          pricingOptions,
          duration,
        ),
        pricingOptionsTotal,
        touristTaxTotal,
        touristTaxPerPersonPerNight: touristTaxAmount,
        guests: adults + children,
        hasDog: hasDog || initialData?.hasDog || false,
        bookingLocale: locale, // Langue choisie par l'utilisateur
      };

      const tempBookingId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(
        `booking_${tempBookingId}`,
        JSON.stringify(bookingData),
      );

      toastUtils.dismiss(loadingToast);
      router.push(`/${hotelSlug}/summary?booking=${tempBookingId}`);
    } catch (err) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error(err instanceof Error ? err.message : t.messages.error);
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
            {t.navigation.back}
          </Button>
          <div className="flex-1 text-center">
            <CardTitle className="text-xl font-medium text-gray-900">
              {t.form.contactDetails}
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
                {t.form.guestInfo}
              </h4>
              <p className="text-sm text-gray-600">
                {t.form.guestInfoDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="adults"
                  className="text-sm font-medium text-gray-700"
                >
                  {t.form.adults} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={adults.toString()}
                  onValueChange={(value) => setAdults(parseInt(value))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}{" "}
                        {num > 1 ? t.form.adults.toLowerCase() : t.form.adult}
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
                    {t.form.children}
                  </Label>
                  <Select
                    value={children.toString()}
                    onValueChange={(value) => setChildren(parseInt(value))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}{" "}
                          {num > 1
                            ? t.form.children.toLowerCase()
                            : t.form.child}
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
                {t.form.touristTaxInfo(touristTaxAmount.toFixed(2))}
              </div>
            )}
          </div>

          {/* Section informations personnelles */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {t.form.personalInfo}
              </h4>
              <p className="text-sm text-gray-600">
                {t.form.personalInfoDescription}
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
                    {t.form.lastName} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clientLastName"
                    type="text"
                    value={clientLastName}
                    onChange={(e) => setClientLastName(e.target.value)}
                    placeholder={t.form.lastNamePlaceholder}
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="clientFirstName"
                    className="text-sm font-medium text-gray-700"
                  >
                    {t.form.firstName} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clientFirstName"
                    type="text"
                    value={clientFirstName}
                    onChange={(e) => setClientFirstName(e.target.value)}
                    placeholder={t.form.firstName}
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
                    {t.form.email} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder={t.form.email}
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="clientPhone"
                    className="text-sm font-medium text-gray-700"
                  >
                    {t.form.phone} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder={t.form.phonePlaceholder}
                    className="h-10"
                    required
                  />
                </div>
              </div>

              {/* Champs conditionnels - Date et lieu de naissance */}
              {(isFieldEnabled("clientBirthDate") ||
                isFieldEnabled("clientBirthPlace")) && (
                <div className="grid grid-cols-1 gap-4">
                  {isFieldEnabled("clientBirthDate") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="clientBirthDate"
                        className="text-sm font-medium text-gray-700"
                      >
                        {t.form.birthDate}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <BirthDateSelector
                        date={clientBirthDate}
                        onDateChange={setClientBirthDate}
                        dayPlaceholder={
                          locale === "fr"
                            ? "Jour"
                            : locale === "de"
                              ? "Tag"
                              : "Day"
                        }
                        monthPlaceholder={
                          locale === "fr"
                            ? "Mois"
                            : locale === "de"
                              ? "Monat"
                              : "Month"
                        }
                        yearPlaceholder={
                          locale === "fr"
                            ? "Année"
                            : locale === "de"
                              ? "Jahr"
                              : "Year"
                        }
                      />
                    </div>
                  )}
                  {isFieldEnabled("clientBirthPlace") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="clientBirthPlace"
                        className="text-sm font-medium text-gray-700"
                      >
                        {t.form.birthPlace}{" "}
                        {isFieldRequired("clientBirthPlace") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientBirthPlace"
                        type="text"
                        value={clientBirthPlace}
                        onChange={(e) => setClientBirthPlace(e.target.value)}
                        placeholder={t.form.birthPlacePlaceholder}
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
                    {t.form.address}{" "}
                    {isFieldRequired("clientAddress") ? "*" : ""}
                  </Label>
                  <Input
                    id="clientAddress"
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder={t.form.address}
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
                        {t.form.postalCode}{" "}
                        {isFieldRequired("clientPostalCode") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientPostalCode"
                        type="text"
                        value={clientPostalCode}
                        onChange={(e) => setClientPostalCode(e.target.value)}
                        placeholder={t.form.postalCode}
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
                        {t.form.city} {isFieldRequired("clientCity") ? "*" : ""}
                      </Label>
                      <Input
                        id="clientCity"
                        type="text"
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        placeholder={t.form.city}
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
                        {t.form.country}{" "}
                        {isFieldRequired("clientCountry") ? "*" : ""}
                      </Label>
                      <Select
                        value={clientCountry}
                        onValueChange={(value) => setClientCountry(value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={t.form.country} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="Suisse">
                            {t.form.switzerland}
                          </SelectItem>
                          <SelectItem value="France">
                            {t.form.france}
                          </SelectItem>
                          <SelectItem value="Allemagne">
                            {t.form.germany}
                          </SelectItem>
                          <SelectItem value="Italie">{t.form.italy}</SelectItem>
                          <SelectItem value="Autriche">Austria</SelectItem>
                          <SelectItem value="Belgique">Belgium</SelectItem>
                          <SelectItem value="Pays-Bas">Netherlands</SelectItem>
                          <SelectItem value="Espagne">Spain</SelectItem>
                          <SelectItem value="Portugal">Portugal</SelectItem>
                          <SelectItem value="République Tchèque">
                            Czech Republic
                          </SelectItem>
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
                    <>
                      <div className="space-y-2">
                        <Label
                          htmlFor="clientIdType"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t.form.idType}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={clientIdType}
                          onValueChange={setClientIdType}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder={t.form.idType} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Carte d'identité">
                              {t.form.idCard}
                            </SelectItem>
                            <SelectItem value="Passeport">
                              {t.form.passport}
                            </SelectItem>
                            <SelectItem value="Permis de conduire">
                              {t.form.drivingLicense}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="clientIdNumber"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t.form.idNumber}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="clientIdNumber"
                          type="text"
                          value={clientIdNumber}
                          onChange={(e) => setClientIdNumber(e.target.value)}
                          placeholder={t.form.idNumberPlaceholder}
                          className="h-10"
                          required={isFieldRequired("clientIdNumber")}
                        />
                      </div>
                    </>
                  )}
                  {isFieldEnabled("clientVehicleNumber") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="clientVehicleNumber"
                        className="text-sm font-medium text-gray-700"
                      >
                        {t.form.vehicleNumber}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="clientVehicleNumber"
                        type="text"
                        value={clientVehicleNumber}
                        onChange={(e) => setClientVehicleNumber(e.target.value)}
                        placeholder={t.form.vehicleNumberPlaceholder}
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
              {t.navigation.back}
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={bookingInProgress}
              className="flex-1"
            >
              {bookingInProgress ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t.messages.loading}
                </div>
              ) : (
                t.navigation.continue + " →"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
