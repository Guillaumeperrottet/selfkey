"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toastUtils } from "@/lib/toast-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Edit,
  Shield,
  FileText,
  ChevronRight,
  Clock,
  Car,
  ArrowLeft,
} from "lucide-react";

interface BookingData {
  id: string;
  hotelSlug: string;
  roomId: string;
  room: {
    id: string;
    name: string;
    price: number;
  };
  establishment: {
    name: string;
    slug: string;
  };
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  clientBirthDate: string;
  clientBirthPlace: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  clientCountry: string;
  clientIdNumber: string;
  clientVehicleNumber: string;
  checkInDate: string;
  checkOutDate: string;
  amount: number;
  currency: string;
  selectedPricingOptions: Record<string, string | string[]>;
  pricingOptionsTotal: number;
  touristTaxTotal?: number;
  touristTaxPerPersonPerNight?: number;
  guests: number;
  adults: number;
  children: number;
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
  values: PricingOptionValue[];
}

interface BookingSummaryProps {
  bookingId: string;
}

export function BookingSummary({ bookingId }: BookingSummaryProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [touristTaxSettings, setTouristTaxSettings] = useState<{
    enabled: boolean;
    amount: number;
    total: number;
  }>({ enabled: false, amount: 0, total: 0 });

  // États pour les frais SelfKey
  const [platformFees, setPlatformFees] = useState<{
    fixedFee: number;
    commission: number;
    total: number;
  }>({ fixedFee: 0, commission: 0, total: 0 });

  // État pour masquer les frais de plateforme
  const [hidePlatformFees, setHidePlatformFees] = useState<boolean>(false);

  // Liste des pays avec codes ISO
  const countries = [
    { name: "Suisse", code: "CH" },
    { name: "France", code: "FR" },
    { name: "Allemagne", code: "DE" },
    { name: "Italie", code: "IT" },
    { name: "Autriche", code: "AT" },
    { name: "Espagne", code: "ES" },
    { name: "Belgique", code: "BE" },
    { name: "Pays-Bas", code: "NL" },
    { name: "Luxembourg", code: "LU" },
    { name: "Portugal", code: "PT" },
    { name: "Royaume-Uni", code: "GB" },
    { name: "États-Unis", code: "US" },
  ];

  // États pour les conditions générales
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // États pour la modification des informations
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Nettoyer les toasts persistants au montage du composant
  useEffect(() => {
    toastUtils.dismissAll();
  }, []);

  // Charger les paramètres de l'établissement
  useEffect(() => {
    if (booking) {
      const loadEstablishmentSettings = async () => {
        try {
          const settingsResponse = await fetch(
            `/api/establishments/${booking.hotelSlug}/settings`
          );
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
            setHidePlatformFees(settingsData.hidePlatformFees || false);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des paramètres:", error);
        }
      };
      loadEstablishmentSettings();
    }
  }, [booking]);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        // Vérifier si c'est une réservation temporaire (commence par "temp_")
        if (bookingId.startsWith("temp_")) {
          // Charger depuis sessionStorage
          const bookingData = sessionStorage.getItem(`booking_${bookingId}`);
          if (!bookingData) {
            throw new Error("Données de réservation non trouvées");
          }

          const data = JSON.parse(bookingData);
          // Ajouter l'ID temporaire
          data.id = bookingId;
          setBooking(data);

          // Charger les pricing options
          const pricingResponse = await fetch(
            `/api/establishments/${data.hotelSlug}/pricing-options`
          );
          if (pricingResponse.ok) {
            const pricingData = await pricingResponse.json();
            setPricingOptions(pricingData.pricingOptions || []);
          }

          // Charger les paramètres de taxe de séjour
          const touristTaxResponse = await fetch(
            `/api/establishments/${data.hotelSlug}/tourist-tax-settings`
          );
          if (touristTaxResponse.ok) {
            const touristTaxData = await touristTaxResponse.json();
            const duration = Math.ceil(
              (new Date(data.checkOutDate).getTime() -
                new Date(data.checkInDate).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const taxTotal = touristTaxData.touristTaxEnabled
              ? data.adults * duration * touristTaxData.touristTaxAmount
              : 0;

            setTouristTaxSettings({
              enabled: touristTaxData.touristTaxEnabled,
              amount: touristTaxData.touristTaxAmount,
              total: taxTotal,
            });
          }

          // Charger les frais de plateforme SelfKey
          const platformFeesResponse = await fetch(
            `/api/establishments/${data.hotelSlug}/fees`
          );
          if (platformFeesResponse.ok) {
            const platformFeesData = await platformFeesResponse.json();
            const subtotal = data.amount; // Utiliser le montant total pour calculer la commission
            const commission =
              subtotal * (platformFeesData.commissionRate / 100);
            const totalPlatformFees = platformFeesData.fixedFee + commission;

            setPlatformFees({
              fixedFee: platformFeesData.fixedFee,
              commission: commission,
              total: totalPlatformFees,
            });
          }

          // Initialiser les valeurs d'édition
          setEditValues({
            clientFirstName: data.clientFirstName,
            clientLastName: data.clientLastName,
            clientEmail: data.clientEmail,
            clientPhone: data.clientPhone,
            clientBirthPlace: data.clientBirthPlace,
            clientAddress: data.clientAddress,
            clientPostalCode: data.clientPostalCode,
            clientCity: data.clientCity,
            clientCountry: data.clientCountry,
            clientIdNumber: data.clientIdNumber,
            clientVehicleNumber: data.clientVehicleNumber,
          });
        } else {
          // Charger depuis la base de données (réservation existante)
          const response = await fetch(`/api/bookings/${bookingId}`);
          if (!response.ok) {
            throw new Error("Réservation non trouvée");
          }
          const data = await response.json();
          setBooking(data);

          // Charger les pricing options
          const pricingResponse = await fetch(
            `/api/establishments/${data.hotelSlug}/pricing-options`
          );
          if (pricingResponse.ok) {
            const pricingData = await pricingResponse.json();
            setPricingOptions(pricingData.pricingOptions || []);
          }

          // Charger les paramètres de taxe de séjour
          const touristTaxResponse = await fetch(
            `/api/establishments/${data.hotelSlug}/tourist-tax-settings`
          );
          if (touristTaxResponse.ok) {
            const touristTaxData = await touristTaxResponse.json();
            const duration = Math.ceil(
              (new Date(data.checkOutDate).getTime() -
                new Date(data.checkInDate).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const taxTotal = touristTaxData.touristTaxEnabled
              ? data.adults * duration * touristTaxData.touristTaxAmount
              : 0;

            setTouristTaxSettings({
              enabled: touristTaxData.touristTaxEnabled,
              amount: touristTaxData.touristTaxAmount,
              total: taxTotal,
            });
          }

          // Charger les frais de plateforme SelfKey
          const platformFeesResponse = await fetch(
            `/api/establishments/${data.hotelSlug}/fees`
          );
          if (platformFeesResponse.ok) {
            const platformFeesData = await platformFeesResponse.json();
            const subtotal = data.amount; // Utiliser le montant total pour calculer la commission
            const commission =
              subtotal * (platformFeesData.commissionRate / 100);
            const totalPlatformFees = platformFeesData.fixedFee + commission;

            setPlatformFees({
              fixedFee: platformFeesData.fixedFee,
              commission: commission,
              total: totalPlatformFees,
            });
          }

          // Initialiser les valeurs d'édition
          setEditValues({
            clientFirstName: data.clientFirstName,
            clientLastName: data.clientLastName,
            clientEmail: data.clientEmail,
            clientPhone: data.clientPhone,
            clientBirthPlace: data.clientBirthPlace,
            clientAddress: data.clientAddress,
            clientPostalCode: data.clientPostalCode,
            clientCity: data.clientCity,
            clientCountry: data.clientCountry,
            clientIdNumber: data.clientIdNumber,
            clientVehicleNumber: data.clientVehicleNumber,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const handleEditField = (field: string) => {
    setEditingField(field);
  };

  const handleGoBack = () => {
    // Rediriger vers la page de réservation en conservant l'état
    if (booking) {
      router.push(`/${booking.hotelSlug}`);
    } else {
      router.back();
    }
  };

  const handleSaveField = async (field: string) => {
    try {
      // Si c'est une réservation temporaire, mettre à jour le sessionStorage
      if (bookingId.startsWith("temp_")) {
        if (booking) {
          const updatedBooking = { ...booking, [field]: editValues[field] };
          sessionStorage.setItem(
            `booking_${bookingId}`,
            JSON.stringify(updatedBooking)
          );
          setBooking(updatedBooking as BookingData);
          setEditingField(null);
        }
        return;
      }

      // Si c'est une vraie réservation, utiliser l'API
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: editValues[field],
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification");
      }

      // Mettre à jour les données locales
      setBooking((prev) =>
        prev ? { ...prev, [field]: editValues[field] } : null
      );
      setEditingField(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de modification");
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    // Restaurer les valeurs originales
    if (booking) {
      setEditValues({
        clientFirstName: booking.clientFirstName,
        clientLastName: booking.clientLastName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        clientBirthPlace: booking.clientBirthPlace,
        clientAddress: booking.clientAddress,
        clientPostalCode: booking.clientPostalCode,
        clientCity: booking.clientCity,
        clientCountry: booking.clientCountry,
        clientIdNumber: booking.clientIdNumber,
        clientVehicleNumber: booking.clientVehicleNumber,
      });
    }
  };

  const handleProceedToPayment = async () => {
    if (!acceptedTerms) {
      setError("Veuillez accepter les conditions générales pour continuer");
      return;
    }

    setProcessingPayment(true);
    try {
      // Si c'est une réservation temporaire, il faut la créer maintenant
      if (bookingId.startsWith("temp_") && booking) {
        const response = await fetch(
          `/api/establishments/${booking.hotelSlug}/bookings`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              roomId: booking.roomId,
              checkInDate: booking.checkInDate,
              checkOutDate: booking.checkOutDate,
              adults: booking.adults,
              children: booking.children,
              clientFirstName: booking.clientFirstName,
              clientLastName: booking.clientLastName,
              clientEmail: booking.clientEmail,
              clientPhone: booking.clientPhone,
              clientBirthDate: booking.clientBirthDate,
              clientBirthPlace: booking.clientBirthPlace,
              clientAddress: booking.clientAddress,
              clientPostalCode: booking.clientPostalCode,
              clientCity: booking.clientCity,
              clientCountry: booking.clientCountry,
              clientIdNumber: booking.clientIdNumber,
              clientVehicleNumber: booking.clientVehicleNumber,
              expectedPrice: booking.amount,
              selectedPricingOptions: booking.selectedPricingOptions,
              pricingOptionsTotal: booking.pricingOptionsTotal,
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

        // Nettoyer le sessionStorage
        sessionStorage.removeItem(`booking_${bookingId}`);

        // Rediriger vers la page de paiement avec le paymentIntentId
        const paymentUrl = `/${booking.hotelSlug}/payment?booking=${data.paymentIntentId}`;
        if (data.clientSecret) {
          // Stocker les données dans un format spécifique pour les réservations classiques
          const paymentData = {
            clientSecret: data.clientSecret,
            bookingType: "classic_booking",
            // Données complètes pour affichage détaillé
            clientFirstName: booking.clientFirstName,
            clientLastName: booking.clientLastName,
            clientEmail: booking.clientEmail,
            clientPhone: booking.clientPhone,
            clientAddress: booking.clientAddress,
            clientPostalCode: booking.clientPostalCode,
            clientCity: booking.clientCity,
            clientCountry: booking.clientCountry,
            clientVehicleNumber: booking.clientVehicleNumber || "Non renseigné",
            selectedDuration: `${duration} nuit${duration > 1 ? "s" : ""}`,
            amount: booking.amount + platformFees.total, // Montant final avec frais de plateforme
            currency: booking.currency,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            adults: booking.adults,
            children: booking.children,
            room: booking.room,
            establishment: booking.establishment,
            selectedPricingOptions: booking.selectedPricingOptions,
            pricingOptionsTotal: booking.pricingOptionsTotal,
            touristTaxTotal: booking.touristTaxTotal,
            touristTaxPerPersonPerNight: booking.touristTaxPerPersonPerNight,
            // Ajouter les frais de plateforme
            platformFees: {
              fixedFee: platformFees.fixedFee,
              commission: platformFees.commission,
              total: platformFees.total,
            },
            // Métadonnées supplémentaires
            paymentIntentId: data.paymentIntentId,
            hotelSlug: booking.hotelSlug,
          };

          sessionStorage.setItem(
            `payment_${data.paymentIntentId}`,
            JSON.stringify(paymentData)
          );
        }
        router.push(paymentUrl);
      } else {
        // Si c'est déjà une vraie réservation, rediriger directement
        router.push(`/${booking?.hotelSlug}/payment?booking=${bookingId}`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du processus de paiement"
      );
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement de votre réservation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!booking) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertDescription>Réservation non trouvée</AlertDescription>
      </Alert>
    );
  }

  const duration = Math.ceil(
    (new Date(booking.checkOutDate).getTime() -
      new Date(booking.checkInDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getOptionDisplayName = (
    optionId: string,
    valueId: string | string[]
  ): string => {
    const option = pricingOptions.find((opt) => opt.id === optionId);
    if (!option)
      return `${optionId}: ${Array.isArray(valueId) ? valueId.join(", ") : valueId}`;

    if (Array.isArray(valueId)) {
      const valueNames = valueId.map((id) => {
        const value = option.values.find((val) => val.id === id);
        return value ? value.label : id;
      });
      return `${option.name}: ${valueNames.join(", ")}`;
    } else {
      const value = option.values.find((val) => val.id === valueId);
      return `${option.name}: ${value ? value.label : valueId}`;
    }
  };

  const EditableField = ({
    field,
    label,
    value,
    type = "text",
    icon: Icon,
  }: {
    field: string;
    label: string;
    value: string;
    type?: string;
    icon: React.ElementType;
  }) => (
    <div className="flex items-center justify-between p-1 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-700">{label}</div>
          {editingField === field ? (
            <div className="flex items-center gap-0.5 mt-0.5">
              {field === "clientCountry" ? (
                <Select
                  value={editValues[field] || ""}
                  onValueChange={(value) =>
                    setEditValues((prev) => ({
                      ...prev,
                      [field]: value,
                    }))
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Sélectionnez un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={type}
                  value={editValues[field] || ""}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  className="h-8 text-sm"
                />
              )}
              <Button
                size="sm"
                onClick={() => handleSaveField(field)}
                className="h-8 px-2 text-sm"
              >
                ✓
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                className="h-8 px-2 text-sm"
              >
                ✕
              </Button>
            </div>
          ) : (
            <div className="text-sm text-gray-900 truncate">{value}</div>
          )}
        </div>
      </div>
      {editingField !== field && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleEditField(field)}
          className="h-6 w-6 p-0 flex-shrink-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 space-y-2 pb-3">
      {/* Étapes de réservation - version ultra-compacte */}
      <div className="flex items-center justify-center gap-1 py-1">
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <span className="text-xs text-gray-600 font-medium hidden md:inline">
            Dates & Options
          </span>
        </div>
        <div className="w-3 h-0.5 bg-gray-300"></div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <span className="text-xs text-gray-600 font-medium hidden md:inline">
            Rooms
          </span>
        </div>
        <div className="w-3 h-0.5 bg-gray-300"></div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">3</span>
          </div>
          <span className="text-xs text-gray-800 font-medium hidden md:inline">
            Details
          </span>
        </div>
      </div>

      {/* En-tête - ultra compact */}
      <div className="text-center">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Booking Summary
            </h1>
            <p className="text-base text-gray-600">
              Check your information before payment
            </p>
          </div>
          <div className="w-20"></div> {/* Spacer pour équilibrer */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        {/* Booking Details */}
        <div className="lg:col-span-2 space-y-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Stay Information */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Calendar className="h-5 w-5" />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {/* Check-in et Check-out en une seule ligne plus visible */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Check-in
                        </div>
                        <div className="text-base font-semibold text-gray-900">
                          {formatDate(booking.checkInDate)}
                        </div>
                      </div>
                    </div>

                    <div className="text-2xl text-gray-400 mx-4">→</div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Check-out
                        </div>
                        <div className="text-base font-semibold text-gray-900">
                          {formatDate(booking.checkOutDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Établissement et place plus visible */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">
                        Établissement
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {booking.establishment.name}
                      </div>
                      <div className="text-base text-gray-700 font-medium">
                        Place: {booking.room.name}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-base px-3 py-1 bg-gray-100 text-gray-800 border-gray-300"
                    >
                      {duration} night{duration > 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {/* Invités intégrés dans la même carte */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
                      <User className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Adults
                        </div>
                        <div className="text-base font-semibold text-gray-900">
                          {booking.adults}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
                      <User className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Children
                        </div>
                        <div className="text-base font-semibold text-gray-900">
                          {booking.children}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information - Optimized Layout */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <User className="h-5 w-5" />
                Your Information
                <Badge variant="outline" className="ml-auto text-sm">
                  Editable
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Personal Information - Optimized Grid Layout */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
                  <EditableField
                    field="clientFirstName"
                    label="First Name"
                    value={booking.clientFirstName}
                    icon={User}
                  />
                  <EditableField
                    field="clientLastName"
                    label="Last Name"
                    value={booking.clientLastName}
                    icon={User}
                  />
                  <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-lg">
                    <Calendar className="h-3 w-3 text-gray-600" />
                    <div>
                      <div className="text-xs font-medium text-gray-600">
                        Birth Date
                      </div>
                      <div className="text-xs text-gray-900">
                        {formatDate(booking.clientBirthDate)}
                      </div>
                    </div>
                  </div>
                  <EditableField
                    field="clientBirthPlace"
                    label="Birth Place"
                    value={booking.clientBirthPlace}
                    icon={MapPin}
                  />
                </div>
              </div>

              {/* Contact - Layout compact */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">
                  Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <EditableField
                    field="clientEmail"
                    label="Email"
                    value={booking.clientEmail}
                    type="email"
                    icon={Mail}
                  />
                  <EditableField
                    field="clientPhone"
                    label="Phone"
                    value={booking.clientPhone}
                    type="tel"
                    icon={Phone}
                  />
                </div>
              </div>

              {/* Address - Inline Layout */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">
                  Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
                  <EditableField
                    field="clientAddress"
                    label="Address"
                    value={booking.clientAddress}
                    icon={MapPin}
                  />
                  <EditableField
                    field="clientPostalCode"
                    label="Postal Code"
                    value={booking.clientPostalCode}
                    icon={MapPin}
                  />
                  <EditableField
                    field="clientCity"
                    label="City"
                    value={booking.clientCity}
                    icon={MapPin}
                  />
                  <EditableField
                    field="clientCountry"
                    label="Country"
                    value={booking.clientCountry}
                    icon={MapPin}
                  />
                </div>
              </div>

              {/* Documents and Vehicle */}
              <div>
                <h4 className="font-medium text-xs text-gray-700 mb-1">
                  Documents & Vehicle
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <EditableField
                    field="clientIdNumber"
                    label="ID Number"
                    value={booking.clientIdNumber}
                    icon={FileText}
                  />
                  <EditableField
                    field="clientVehicleNumber"
                    label="License Plate"
                    value={booking.clientVehicleNumber}
                    icon={Car}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Summary - Optimized */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-4">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                Reservation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-base text-gray-600">
                    {booking.room.name} ({duration} night
                    {duration > 1 ? "s" : ""})
                  </span>
                  {booking.room.price > 0 && (
                    <span className="text-base md:text-lg font-medium">
                      {booking.room.price * duration} {booking.currency}
                    </span>
                  )}
                </div>

                {/* Pricing options - same style as room line */}
                {booking.selectedPricingOptions &&
                  Object.keys(booking.selectedPricingOptions).length > 0 && (
                    <>
                      {Object.entries(booking.selectedPricingOptions).map(
                        ([key, value]) => {
                          // Trouver le prix de cette option
                          const option = pricingOptions.find(
                            (opt) => opt.id === key
                          );
                          let optionPrice = 0;

                          if (option) {
                            if (Array.isArray(value)) {
                              optionPrice = value.reduce((total, valueId) => {
                                const optionValue = option.values.find(
                                  (val) => val.id === valueId
                                );
                                return (
                                  total +
                                  (optionValue ? optionValue.priceModifier : 0)
                                );
                              }, 0);
                            } else {
                              const optionValue = option.values.find(
                                (val) => val.id === value
                              );
                              optionPrice = optionValue
                                ? optionValue.priceModifier
                                : 0;
                            }
                          }

                          return (
                            <div
                              key={key}
                              className="flex justify-between items-center"
                            >
                              <span className="text-base text-gray-600">
                                {getOptionDisplayName(key, value)}
                              </span>
                              {optionPrice > 0 && (
                                <span className="text-base md:text-lg font-medium">
                                  {optionPrice} {booking.currency}
                                </span>
                              )}
                            </div>
                          );
                        }
                      )}
                    </>
                  )}

                {/* Tourist Tax */}
                {touristTaxSettings.enabled && touristTaxSettings.total > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-600">Tourist tax</span>
                    <span className="text-base md:text-lg font-medium">
                      {touristTaxSettings.total.toFixed(2)} {booking.currency}
                    </span>
                  </div>
                )}

                {/* Platform Fees - SelfKey */}
                {!hidePlatformFees && platformFees.total > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-600">
                      Frais Plateforme
                    </span>
                    <span className="text-base md:text-lg font-medium">
                      {platformFees.total.toFixed(2)} {booking.currency}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {(booking.amount + platformFees.total).toFixed(2)}{" "}
                  {booking.currency}
                </span>
              </div>

              {/* TVA incluse */}
              <div className="flex justify-start">
                <span className="text-sm text-gray-500">
                  (TVA 8.1%{" "}
                  {(
                    ((booking.amount +
                      platformFees.total -
                      (touristTaxSettings.enabled
                        ? touristTaxSettings.total
                        : 0)) *
                      8.1) /
                    100
                  ).toFixed(2)}{" "}
                  {booking.currency} compris)
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-base text-gray-600">
                  <Shield className="h-5 w-5" />
                  <span>Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center gap-2 text-base text-gray-600">
                  <CreditCard className="h-5 w-5" />
                  <span>Visa, Mastercard, TWINT</span>
                </div>
              </div>

              <Separator />

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) =>
                      setAcceptedTerms(checked === true)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="terms"
                      className="text-base cursor-pointer leading-relaxed"
                    >
                      I accept the{" "}
                      <Dialog>
                        <DialogTrigger asChild>
                          <span className="text-gray-700 hover:underline cursor-pointer">
                            terms and conditions
                          </span>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Terms and Conditions</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 text-sm">
                            <div>
                              <h4 className="font-medium mb-2">1. Booking</h4>
                              <p>
                                The booking is confirmed after full payment of
                                the stay. No booking is guaranteed without
                                payment.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">2. Payment</h4>
                              <p>
                                Payment is made online securely via Stripe. All
                                transactions are protected by SSL encryption.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">
                                3. Check-in and check-out
                              </h4>
                              <p>
                                Check-in is from 3:00 PM and check-out before
                                11:00 AM, unless otherwise agreed.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">
                                4. Responsibility
                              </h4>
                              <p>
                                The establishment declines any responsabilité en
                                cas de vol, perte ou dommage aux biens
                                personnels.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">
                                5. Cancellation
                              </h4>
                              <p>
                                Free cancellation up to 24h before arrival. Late
                                cancellation: 50% of the amount will be
                                retained.
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </Label>
                  </div>
                </div>

                {!acceptedTerms && (
                  <Alert className="py-2">
                    <AlertDescription className="text-sm">
                      You must accept the terms and conditions to proceed with
                      payment.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                onClick={handleProceedToPayment}
                disabled={!acceptedTerms || processingPayment}
                className="w-full text-base md:text-lg"
                size="lg"
              >
                {processingPayment ? (
                  "Redirecting..."
                ) : (
                  <>
                    Proceed to Payment
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
