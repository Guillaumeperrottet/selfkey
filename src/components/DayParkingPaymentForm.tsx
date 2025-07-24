"use client";

import { useState, useEffect } from "react";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DayParkingPaymentFormProps {
  paymentIntentId: string;
  hotelSlug: string;
}

interface BookingData {
  clientFirstName: string;
  clientLastName: string;
  clientVehicleNumber: string;
  selectedDuration: string;
  amount: number;
  clientSecret: string;
}

// Composant interne qui utilise Stripe (mode production uniquement)
function StripePaymentFormContent({
  paymentIntentId,
  hotelSlug,
  bookingData,
}: DayParkingPaymentFormProps & { bookingData: BookingData }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/${hotelSlug}/success?paymentIntent=${paymentIntentId}&type=day_parking`,
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }
    } catch (err) {
      console.error("Erreur de paiement:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finaliser votre paiement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Résumé de la réservation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Résumé de votre parking jour</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Client :</span>
              <span>
                {bookingData.clientFirstName} {bookingData.clientLastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Durée :</span>
              <span>{bookingData.selectedDuration}</span>
            </div>
            <div className="flex justify-between">
              <span>Véhicule :</span>
              <span>{bookingData.clientVehicleNumber}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total :</span>
              <span>{bookingData.amount} CHF</span>
            </div>
          </div>
        </div>

        {/* Formulaire de paiement */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <PaymentElement />
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={!stripe || !elements || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading
              ? "Traitement en cours..."
              : `Payer ${bookingData.amount} CHF`}
          </Button>
        </form>

        <div className="text-xs text-gray-500 text-center">
          <p>Paiement sécurisé par Stripe</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour le mode développement (sans Stripe)
function DevPaymentFormContent({
  paymentIntentId,
  hotelSlug,
  bookingData,
}: DayParkingPaymentFormProps & { bookingData: BookingData }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log("🧪 Mode développement : simulation du paiement");
    setIsLoading(true);

    // Simuler un délai de traitement
    setTimeout(() => {
      window.location.href = `${window.location.origin}/${hotelSlug}/success?paymentIntent=${paymentIntentId}&type=day_parking&dev=true`;
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finaliser votre paiement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Résumé de la réservation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Résumé de votre parking jour</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Client :</span>
              <span>
                {bookingData.clientFirstName} {bookingData.clientLastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Durée :</span>
              <span>{bookingData.selectedDuration}</span>
            </div>
            <div className="flex justify-between">
              <span>Véhicule :</span>
              <span>{bookingData.clientVehicleNumber}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total :</span>
              <span>{bookingData.amount} CHF</span>
            </div>
          </div>
        </div>

        {/* Formulaire de paiement simulé */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-yellow-600 font-medium">
                🧪 Mode Développement
              </span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              Le paiement sera simulé pour éviter les erreurs Stripe en
              développement.
            </p>
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-medium text-gray-700">
                Simulation de carte :
              </p>
              <p className="text-xs text-gray-500 mt-1">
                **** **** **** 4242 • 12/25 • CVC 123
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading
              ? "Traitement en cours..."
              : `Simuler le paiement ${bookingData.amount} CHF`}
          </Button>
        </form>

        <div className="text-xs text-gray-500 text-center">
          <p>Paiement simulé en mode développement</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant principal qui gère Stripe Elements
export function DayParkingPaymentForm({
  paymentIntentId,
  hotelSlug,
}: DayParkingPaymentFormProps) {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsInitializing(true);

        // Récupérer les données de réservation depuis sessionStorage
        const storageKey = `payment_${paymentIntentId}`;
        const storedData = sessionStorage.getItem(storageKey);

        console.log("🔍 Debug info:", {
          paymentIntentId,
          storageKey,
          storedData: storedData ? "Found" : "Not found",
          sessionStorageKeys: Object.keys(sessionStorage),
        });

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log("📊 Parsed data:", parsedData);
          setBookingData(parsedData);

          // Si ce n'est pas en mode dev, initialiser Stripe
          if (!parsedData.clientSecret.includes("_dev_")) {
            console.log("🔑 Initializing Stripe for production...");

            // Récupérer la clé publique Stripe
            const stripeResponse = await fetch("/api/stripe/public-key");
            if (!stripeResponse.ok) {
              throw new Error(
                "Erreur lors de la récupération de la clé publique"
              );
            }

            const { publishableKey } = await stripeResponse.json();
            console.log(
              "🔑 Clé publique Stripe récupérée:",
              publishableKey.substring(0, 12) + "..."
            );

            const stripe = loadStripe(publishableKey);
            setStripePromise(stripe);
          }
        }
      } catch (error) {
        console.error("❌ Error initializing payment:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializePayment();
  }, [paymentIntentId]);

  if (isInitializing) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">Initialisation du paiement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!bookingData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">
            Chargement des informations de paiement...
          </p>
          <details className="mt-4">
            <summary className="text-sm cursor-pointer text-gray-500">
              Debug info
            </summary>
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
              PaymentIntent ID: {paymentIntentId}
              {"\n"}Storage keys: {Object.keys(sessionStorage).join(", ")}
            </pre>
          </details>
        </CardContent>
      </Card>
    );
  }

  if (!bookingData.clientSecret) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">
            Erreur: Informations de paiement manquantes
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Client secret manquant dans les données de réservation
          </p>
          <details className="mt-4">
            <summary className="text-sm cursor-pointer">Debug info</summary>
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
              {JSON.stringify(bookingData, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    );
  }

  // Mode développement : pas besoin de Stripe Elements
  if (bookingData.clientSecret.includes("_dev_")) {
    return (
      <DevPaymentFormContent
        paymentIntentId={paymentIntentId}
        hotelSlug={hotelSlug}
        bookingData={bookingData}
      />
    );
  }

  // Mode production : avec Stripe Elements
  if (!stripePromise) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-2">
              Erreur de configuration Stripe
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Impossible de charger Stripe. Veuillez réessayer.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: bookingData.clientSecret,
      }}
    >
      <StripePaymentFormContent
        paymentIntentId={paymentIntentId}
        hotelSlug={hotelSlug}
        bookingData={bookingData}
      />
    </Elements>
  );
}
