"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Shield,
  Euro,
  Car,
  ArrowLeft,
} from "lucide-react";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Initialiser Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface ClassicBookingData {
  clientSecret: string;
  bookingType: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  clientVehicleNumber: string;
  selectedDuration: string;
  amount: number;
  currency: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  room: {
    id: string;
    name: string;
    price: number;
  };
  establishment: {
    name: string;
    slug: string;
  };
  selectedPricingOptions: Record<string, string | string[]>;
  pricingOptionsTotal: number;
  paymentIntentId: string;
  hotelSlug: string;
}

interface ClassicBookingPaymentFormProps {
  paymentIntentId: string;
  hotelSlug: string;
}

// Composant interne qui utilise Stripe
function StripePaymentFormContent({
  paymentIntentId,
  hotelSlug,
}: ClassicBookingPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Erreur lors de la soumission");
        setIsProcessing(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/${hotelSlug}/success?payment=${paymentIntentId}`,
        },
      });

      if (confirmError) {
        setError(confirmError.message || "Erreur lors du paiement");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Une erreur inattendue s'est produite");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Traitement..." : "Payer maintenant"}
      </Button>
    </form>
  );
}

export function ClassicBookingPaymentForm({
  paymentIntentId,
  hotelSlug,
}: ClassicBookingPaymentFormProps) {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<ClassicBookingData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookingData = () => {
      try {
        const storedData = sessionStorage.getItem(`payment_${paymentIntentId}`);
        if (!storedData) {
          throw new Error("Données de paiement non trouvées");
        }

        const data = JSON.parse(storedData) as ClassicBookingData;

        // Si c'est un parking jour, rediriger vers DayParkingPaymentForm
        if (!data.bookingType || data.bookingType === "day_parking") {
          // Rediriger vers la page avec le bon type
          router.push(
            `/${hotelSlug}/payment?paymentIntent=${paymentIntentId}&type=day_parking`
          );
          return;
        }

        // Vérifier que c'est bien une réservation classique
        if (data.bookingType !== "classic_booking") {
          throw new Error("Type de réservation incorrect");
        }

        setBookingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, [paymentIntentId, hotelSlug, router]);

  const handleGoBack = () => {
    router.push(`/${hotelSlug}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement du paiement...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertDescription>
          {error || "Données de réservation introuvables"}
        </AlertDescription>
      </Alert>
    );
  }

  const duration = Math.ceil(
    (new Date(bookingData.checkOutDate).getTime() -
      new Date(bookingData.checkInDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#2563eb",
      colorBackground: "#ffffff",
      colorText: "#1f2937",
      colorDanger: "#dc2626",
      fontFamily: "Inter, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px",
    },
  };

  const options = {
    clientSecret: bookingData.clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Finaliser votre réservation
              </h1>
              <p className="text-gray-600">
                Paiement sécurisé par Stripe • Cartes • TWINT • Apple Pay
              </p>
            </div>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire de paiement */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informations de paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={options}>
                  <StripePaymentFormContent
                    paymentIntentId={paymentIntentId}
                    hotelSlug={hotelSlug}
                  />
                </Elements>
              </CardContent>
            </Card>
          </div>

          {/* Résumé détaillé de la réservation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Euro className="h-5 w-5" />
                  Résumé de votre réservation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Détails du séjour */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {bookingData.establishment.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Chambre: {bookingData.room.name}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {duration} nuit{duration > 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Arrivée
                        </div>
                        <div className="text-sm text-gray-900">
                          {formatDate(bookingData.checkInDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Départ
                        </div>
                        <div className="text-sm text-gray-900">
                          {formatDate(bookingData.checkOutDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invités */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">Invités</div>
                      <div className="text-sm text-gray-600">
                        {bookingData.adults} adulte
                        {bookingData.adults > 1 ? "s" : ""}
                        {bookingData.children > 0 &&
                          `, ${bookingData.children} enfant${bookingData.children > 1 ? "s" : ""}`}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Informations client */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">
                    Informations client
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>
                        {bookingData.clientFirstName}{" "}
                        {bookingData.clientLastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{bookingData.clientEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{bookingData.clientPhone}</span>
                    </div>
                    {bookingData.clientVehicleNumber !== "Non renseigné" && (
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span>{bookingData.clientVehicleNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Récapitulatif des prix */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Chambre ({duration} nuit{duration > 1 ? "s" : ""})
                    </span>
                    <span className="font-medium">
                      {bookingData.room.price * duration} {bookingData.currency}
                    </span>
                  </div>

                  {/* Options de pricing */}
                  {bookingData.pricingOptionsTotal > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Options supplémentaires
                        </span>
                        <span className="font-medium">
                          +{bookingData.pricingOptionsTotal}{" "}
                          {bookingData.currency}
                        </span>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {bookingData.amount} {bookingData.currency}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Sécurité */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4" />
                    <span>Visa, Mastercard, TWINT</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
