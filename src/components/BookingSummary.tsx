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
} from "lucide-react";
import { BookingSteps } from "./BookingSteps";

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
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  clientCountry: string;
  clientIdNumber: string;
  checkInDate: string;
  checkOutDate: string;
  amount: number;
  currency: string;
  selectedPricingOptions: Record<string, string | string[]>;
  pricingOptionsTotal: number;
  guests: number;
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

  // États pour les conditions générales
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // États pour la modification des informations
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error("Réservation non trouvée");
        }
        const data = await response.json();
        setBooking(data);

        // Initialiser les valeurs d'édition
        setEditValues({
          clientFirstName: data.clientFirstName,
          clientLastName: data.clientLastName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          clientAddress: data.clientAddress,
          clientPostalCode: data.clientPostalCode,
          clientCity: data.clientCity,
          clientCountry: data.clientCountry,
          clientIdNumber: data.clientIdNumber,
        });
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

  const handleSaveField = async (field: string) => {
    try {
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
        clientAddress: booking.clientAddress,
        clientPostalCode: booking.clientPostalCode,
        clientCity: booking.clientCity,
        clientCountry: booking.clientCountry,
        clientIdNumber: booking.clientIdNumber,
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
      // Rediriger vers la page de paiement
      router.push(`/${booking?.hotelSlug}/payment?booking=${bookingId}`);
    } catch {
      setError("Erreur lors du processus de paiement");
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
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-gray-500" />
        <div>
          <div className="text-sm font-medium text-gray-700">{label}</div>
          {editingField === field ? (
            <div className="flex items-center gap-2 mt-1">
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
              <Button
                size="sm"
                onClick={() => handleSaveField(field)}
                className="h-8 px-2"
              >
                ✓
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                className="h-8 px-2"
              >
                ✕
              </Button>
            </div>
          ) : (
            <div className="text-sm text-gray-900">{value}</div>
          )}
        </div>
      </div>
      {editingField !== field && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleEditField(field)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Étapes de réservation */}
      <BookingSteps currentStep={2} />

      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Résumé de votre réservation
        </h1>
        <p className="text-gray-600">
          Vérifiez vos informations avant de procéder au paiement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Détails de la réservation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations du séjour */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Détails du séjour
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      Arrivée
                    </div>
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.checkInDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      Départ
                    </div>
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.checkOutDate)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-blue-700">
                    Établissement
                  </div>
                  <div className="text-sm text-blue-900">
                    {booking.establishment.name}
                  </div>
                  <div className="text-sm text-blue-700">
                    Chambre: {booking.room.name}
                  </div>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {duration} nuit{duration > 1 ? "s" : ""}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Informations du client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Vos informations
                <Badge variant="outline" className="ml-auto">
                  Modifiables
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

              <EditableField
                field="clientAddress"
                label="Adresse"
                value={booking.clientAddress}
                icon={MapPin}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

              <EditableField
                field="clientIdNumber"
                label="N° d'identification"
                value={booking.clientIdNumber}
                icon={FileText}
              />
            </CardContent>
          </Card>
        </div>

        {/* Récapitulatif des prix */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Récapitulatif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Chambre ({duration} nuit{duration > 1 ? "s" : ""})
                  </span>
                  <span className="text-sm font-medium">
                    {booking.room.price * duration} {booking.currency}
                  </span>
                </div>

                {booking.pricingOptionsTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Options supplémentaires
                    </span>
                    <span className="text-sm font-medium">
                      +{booking.pricingOptionsTotal} {booking.currency}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  {booking.amount} {booking.currency}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Cartes acceptées: Visa, Mastercard, TWINT</span>
                </div>
              </div>

              <Separator />

              {/* Conditions générales */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) =>
                      setAcceptedTerms(checked === true)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      J&apos;accepte les{" "}
                      <Dialog>
                        <DialogTrigger asChild>
                          <span className="text-blue-600 hover:underline cursor-pointer">
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
                  <Alert>
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
