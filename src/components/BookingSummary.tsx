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
  Euro,
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

        // Rediriger vers la page de paiement avec le paymentIntentId comme identifiant temporaire
        const paymentUrl = `/${booking.hotelSlug}/payment?booking=${data.paymentIntentId}`;
        if (data.clientSecret) {
          // Stocker les données complètes pour le composant de paiement
          const paymentData = {
            clientSecret: data.clientSecret,
            paymentIntentId: data.paymentIntentId,
            // Données de la réservation pour affichage
            bookingData: {
              hotelSlug: booking.hotelSlug,
              clientFirstName: booking.clientFirstName,
              clientLastName: booking.clientLastName,
              clientEmail: booking.clientEmail,
              amount: booking.amount,
              checkInDate: booking.checkInDate,
              checkOutDate: booking.checkOutDate,
              guests: booking.guests,
              room: booking.room,
            },
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
        <Icon className="h-3 w-3 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-700">{label}</div>
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
                  <SelectTrigger className="h-5 text-xs">
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
                  className="h-5 text-xs"
                />
              )}
              <Button
                size="sm"
                onClick={() => handleSaveField(field)}
                className="h-5 px-0.5 text-xs"
              >
                ✓
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                className="h-5 px-0.5 text-xs"
              >
                ✕
              </Button>
            </div>
          ) : (
            <div className="text-xs text-gray-900 truncate">{value}</div>
          )}
        </div>
      </div>
      {editingField !== field && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleEditField(field)}
          className="h-4 w-4 p-0 flex-shrink-0"
        >
          <Edit className="h-3 w-3" />
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
            Réservation
          </span>
        </div>
        <div className="w-3 h-0.5 bg-gray-300"></div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">2</span>
          </div>
          <span className="text-xs text-gray-800 font-medium hidden md:inline">
            Résumé
          </span>
        </div>
        <div className="w-3 h-0.5 bg-gray-300"></div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">3</span>
          </div>
          <span className="text-xs text-gray-600 font-medium hidden md:inline">
            Paiement
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
            <span className="hidden sm:inline">Retour</span>
          </Button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">
              Résumé de votre réservation
            </h1>
            <p className="text-xs text-gray-600">
              Vérifiez vos informations avant de procéder au paiement
            </p>
          </div>
          <div className="w-20"></div> {/* Spacer pour équilibrer */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        {/* Détails de la réservation */}
        <div className="lg:col-span-2 space-y-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Informations du séjour */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Détails du séjour
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-lg">
                    <Clock className="h-3 w-3 text-gray-600" />
                    <div>
                      <div className="text-xs font-medium text-gray-700">
                        Arrivée
                      </div>
                      <div className="text-xs text-gray-900">
                        {formatDate(booking.checkInDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-lg">
                    <Clock className="h-3 w-3 text-gray-600" />
                    <div>
                      <div className="text-xs font-medium text-gray-700">
                        Départ
                      </div>
                      <div className="text-xs text-gray-900">
                        {formatDate(booking.checkOutDate)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-lg">
                  <MapPin className="h-3 w-3 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-700">
                      Établissement
                    </div>
                    <div className="text-sm text-gray-900">
                      {booking.establishment.name}
                    </div>
                    <div className="text-xs text-gray-700">
                      Chambre: {booking.room.name}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {duration} nuit{duration > 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Invités - Carte séparée pour plus de visibilité */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  Invités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="flex items-center gap-1 p-1.5 bg-gray-50 rounded-lg">
                    <User className="h-3 w-3 text-gray-600" />
                    <div>
                      <div className="text-xs font-medium text-gray-700">
                        Adultes
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {booking.adults}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 p-1.5 bg-gray-50 rounded-lg">
                    <User className="h-3 w-3 text-gray-600" />
                    <div>
                      <div className="text-xs font-medium text-gray-700">
                        Enfants
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {booking.children}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 p-1.5 bg-gray-100 rounded-lg">
                    <User className="h-3 w-3 text-gray-600" />
                    <div>
                      <div className="text-xs font-medium text-gray-700">
                        Total
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {booking.adults + booking.children}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informations du client - Layout optimisé */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                Vos informations
                <Badge variant="outline" className="ml-auto text-xs">
                  Modifiables
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Informations personnelles - Layout en grille optimisé */}
              <div>
                <h4 className="font-medium text-xs text-gray-700 mb-1">
                  Informations personnelles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
                  <EditableField
                    field="clientFirstName"
                    label="Prénom"
                    value={booking.clientFirstName}
                    icon={User}
                  />
                  <EditableField
                    field="clientLastName"
                    label="Nom"
                    value={booking.clientLastName}
                    icon={User}
                  />
                  <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-lg">
                    <Calendar className="h-3 w-3 text-gray-600" />
                    <div>
                      <div className="text-xs font-medium text-gray-600">
                        Date de naissance
                      </div>
                      <div className="text-xs text-gray-900">
                        {formatDate(booking.clientBirthDate)}
                      </div>
                    </div>
                  </div>
                  <EditableField
                    field="clientBirthPlace"
                    label="Lieu de naissance"
                    value={booking.clientBirthPlace}
                    icon={MapPin}
                  />
                </div>
              </div>

              {/* Contact - Layout compact */}
              <div>
                <h4 className="font-medium text-xs text-gray-700 mb-1">
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
                    label="Téléphone"
                    value={booking.clientPhone}
                    type="tel"
                    icon={Phone}
                  />
                </div>
              </div>

              {/* Adresse - Layout en ligne */}
              <div>
                <h4 className="font-medium text-xs text-gray-700 mb-1">
                  Adresse
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
                  <EditableField
                    field="clientAddress"
                    label="Adresse"
                    value={booking.clientAddress}
                    icon={MapPin}
                  />
                  <EditableField
                    field="clientPostalCode"
                    label="Code postal"
                    value={booking.clientPostalCode}
                    icon={MapPin}
                  />
                  <EditableField
                    field="clientCity"
                    label="Ville"
                    value={booking.clientCity}
                    icon={MapPin}
                  />
                  <EditableField
                    field="clientCountry"
                    label="Pays"
                    value={booking.clientCountry}
                    icon={MapPin}
                  />
                </div>
              </div>

              {/* Documents et véhicule */}
              <div>
                <h4 className="font-medium text-xs text-gray-700 mb-1">
                  Documents et véhicule
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <EditableField
                    field="clientIdNumber"
                    label="N° d'identification"
                    value={booking.clientIdNumber}
                    icon={FileText}
                  />
                  <EditableField
                    field="clientVehicleNumber"
                    label="N° d'immatriculation"
                    value={booking.clientVehicleNumber}
                    icon={Car}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Récapitulatif des prix - Optimisé */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-4">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Euro className="h-5 w-5" />
                Récapitulatif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Chambre ({duration} nuit{duration > 1 ? "s" : ""})
                  </span>
                  <span className="text-base font-medium">
                    {booking.room.price * duration} {booking.currency}
                  </span>
                </div>

                {/* Options de pricing - affichage simple */}
                {booking.pricingOptionsTotal > 0 && (
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700 font-medium">
                        Options supplémentaires
                      </span>
                      <span className="text-base font-medium text-gray-800">
                        +{booking.pricingOptionsTotal} {booking.currency}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {Object.entries(booking.selectedPricingOptions).map(
                        ([key, value]) => (
                          <div key={key} className="text-sm text-gray-600">
                            {getOptionDisplayName(key, value)}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-base font-semibold">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  {booking.amount} {booking.currency}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Visa, Mastercard, TWINT</span>
                </div>
              </div>

              <Separator />

              {/* Conditions générales */}
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
                      className="text-sm cursor-pointer leading-relaxed"
                    >
                      J&apos;accepte les{" "}
                      <Dialog>
                        <DialogTrigger asChild>
                          <span className="text-gray-700 hover:underline cursor-pointer">
                            conditions générales de vente
                          </span>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Conditions générales de vente
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 text-sm">
                            <div>
                              <h4 className="font-medium mb-2">
                                1. Réservation
                              </h4>
                              <p>
                                La réservation est confirmée après paiement
                                intégral du séjour. Aucune réservation
                                n&apos;est garantie sans paiement.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">2. Paiement</h4>
                              <p>
                                Le paiement s&apos;effectue en ligne de manière
                                sécurisée via Stripe. Toutes les transactions
                                sont protégées par un cryptage SSL.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">
                                3. Arrivée et départ
                              </h4>
                              <p>
                                L&apos;arrivée se fait à partir de 15h00 et le
                                départ avant 11h00, sauf accord particulier.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">
                                4. Responsabilité
                              </h4>
                              <p>
                                L&apos;établissement décline toute
                                responsabilité en cas de vol, perte ou dommage
                                aux biens personnels.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">
                                5. Annulation
                              </h4>
                              <p>
                                Annulation gratuite jusqu&apos;à 24h avant
                                l&apos;arrivée. Annulation tardive : 50% du
                                montant sera retenu.
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
                      Vous devez accepter les conditions générales pour procéder
                      au paiement.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                onClick={handleProceedToPayment}
                disabled={!acceptedTerms || processingPayment}
                className="w-full"
                size="lg"
              >
                {processingPayment ? (
                  "Redirection..."
                ) : (
                  <>
                    Procéder au paiement
                    <ChevronRight className="h-4 w-4 ml-2" />
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
