"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Shield, ArrowLeft } from "lucide-react";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";

// Pas d'initialisation globale - on le fera dynamiquement

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
  touristTaxTotal?: number;
  touristTaxPerPersonPerNight?: number;
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

      // Récupérer les données de réservation depuis sessionStorage
      const storedData = sessionStorage.getItem(`payment_${paymentIntentId}`);
      if (!storedData) {
        setError("Données de réservation manquantes");
        setIsProcessing(false);
        return;
      }

      const bookingData = JSON.parse(storedData);

      // Fonction helper pour obtenir le code pays ISO à 2 lettres
      const getCountryCode = (country: string): string => {
        const countryMap: { [key: string]: string } = {
          Suisse: "CH",
          Switzerland: "CH",
          France: "FR",
          Allemagne: "DE",
          Germany: "DE",
          Italie: "IT",
          Italy: "IT",
          Autriche: "AT",
          Austria: "AT",
        };
        return countryMap[country] || "CH"; // Default to CH if not found
      };

      // Préparer les billing_details complets pour TWINT
      const billingDetails = {
        name: `${bookingData.clientFirstName} ${bookingData.clientLastName}`,
        email: bookingData.clientEmail,
        phone: bookingData.clientPhone,
        address: {
          line1: bookingData.clientAddress || "",
          line2: "",
          postal_code: bookingData.clientPostalCode || "",
          city: bookingData.clientCity || "",
          state: "",
          country: getCountryCode(bookingData.clientCountry || "Suisse"),
        },
      };

      console.log("🔍 TWINT BILLING DETAILS:", billingDetails);

      // APPROCHE DIRECTE: Créer le PaymentMethod via l'API Stripe directement
      console.log("🔍 Création PaymentMethod TWINT directement via API");

      try {
        const response = await fetch("/api/stripe/create-payment-method", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "twint",
            billing_details: billingDetails,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création du PaymentMethod");
        }

        const { paymentMethod } = await response.json();

        console.log("✅ PaymentMethod TWINT créé via API:", {
          id: paymentMethod.id,
          type: paymentMethod.type,
          billing_details: paymentMethod.billing_details,
        });

        // Maintenant, utiliser ce PaymentMethod pour confirmer
        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/${hotelSlug}/success?paymentIntent=${paymentIntentId}&type=classic_booking`,
            payment_method: paymentMethod.id,
          },
          redirect: "if_required",
        });

        if (confirmError) {
          console.error("🚨 PAYMENT ERROR:", {
            type: confirmError.type,
            code: confirmError.code,
            message: confirmError.message,
            payment_intent: confirmError.payment_intent,
          });

          // Messages d'erreur spécifiques
          let errorMessage = confirmError.message || "Erreur de paiement";
          if (confirmError.code === "payment_method_provider_decline") {
            errorMessage =
              "Paiement refusé par le fournisseur. Vérifiez vos informations et réessayez.";
          }

          setError(errorMessage);
          setIsProcessing(false);
        }
      } catch (apiError) {
        console.error("❌ Erreur API PaymentMethod:", apiError);
        setError("Erreur lors de la création du mode de paiement");
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
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const loadBookingData = async () => {
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

  // Initialisation dynamique de Stripe (comme DayParkingPaymentForm)
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsInitializing(true);

        // Récupérer la clé publique Stripe depuis l'API
        const stripeResponse = await fetch("/api/stripe/public-key");
        if (stripeResponse.ok) {
          const { publishableKey } = await stripeResponse.json();
          console.log(
            "🔑 Clé publique Stripe récupérée:",
            publishableKey.substring(0, 12) + "..."
          );

          const stripe = loadStripe(publishableKey);
          setStripePromise(stripe);
        }
      } catch (error) {
        console.error("❌ Error initializing payment:", error);
        setError("Erreur d'initialisation du paiement");
      } finally {
        setIsInitializing(false);
      }
    };

    initializePayment();
  }, [paymentIntentId]);

  const handleGoBack = () => {
    router.push(`/${hotelSlug}`);
  };

  if (loading || isInitializing) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>
            {isInitializing
              ? "Initialisation du paiement..."
              : "Chargement du paiement..."}
          </p>
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

  // Vérifier que Stripe est disponible
  if (!stripePromise) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertDescription>
          Erreur de configuration du paiement. Veuillez réessayer plus tard.
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header simplifié */}
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Finalize réservation
              </h1>
              <p className="text-gray-600">
                Paiement secure with Stripe • Cartes • TWINT • Apple Pay
              </p>
            </div>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>

        {/* Résumé simple avec juste l'essentiel */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg text-gray-900">
                    {bookingData.establishment.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Place: {bookingData.room.name} • {duration} night
                    {duration > 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {bookingData.amount.toFixed(2)} {bookingData.currency}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulaire de paiement centré */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informations of paiement
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

        {/* Informations de sécurité en bas */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Paiement 100% sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Visa, Mastercard, Apple Pay, TWINT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
