"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface Booking {
  id: string;
  hotelSlug: string;
  roomId: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  clientBirthDate: Date;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  clientCountry: string;
  clientIdNumber: string;
  amount: number;
  currency: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
}

interface Establishment {
  id: string;
  name: string;
  slug: string;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
  commissionRate: number;
  fixedFee: number;
  createdAt: Date;
}

interface Room {
  id: string;
  name: string;
  price: number;
}

interface PaymentFormProps {
  booking: Booking;
  establishment: Establishment;
  room: Room;
}

// Composant interne pour le formulaire Stripe avec support TWINT
function CheckoutForm({ booking }: Pick<PaymentFormProps, "booking">) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    // Créer le PaymentIntent avec support TWINT
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: booking.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création du PaymentIntent");
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
        console.log("💳 PaymentIntent créé:", { clientSecret });
      } catch (error) {
        console.error("Erreur PaymentIntent:", error);
        setError("Erreur lors de l'initialisation du paiement");
      }
    };

    createPaymentIntent();
  }, [booking.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Utiliser confirmPayment pour supporter TWINT et cartes
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/${booking.hotelSlug}/payment-return?booking=${booking.id}`,
            payment_method_data: {
              billing_details: {
                name: `${booking.clientFirstName} ${booking.clientLastName}`,
                email: booking.clientEmail,
                phone: booking.clientPhone,
              },
            },
          },
          redirect: "if_required", // Éviter les redirections inutiles pour les cartes
        }
      );

      if (stripeError) {
        setError(stripeError.message || "Erreur de paiement");
        setIsLoading(false);
      } else if (paymentIntent?.status === "succeeded") {
        // Paiement réussi immédiatement (cartes)
        await fetch("/api/booking/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: booking.id,
            paymentIntentId: paymentIntent.id,
          }),
        });

        router.push(`/${booking.hotelSlug}/success?booking=${booking.id}`);
      } else if (paymentIntent?.status === "processing") {
        // Paiement TWINT en cours - redirection automatique gérée par Stripe
        console.log("Paiement TWINT en cours...");
      } else if (paymentIntent?.status === "requires_action") {
        // Redirection déjà effectuée par Stripe
        console.log("Redirection effectuée pour TWINT");
      }
    } catch (error) {
      console.error("Erreur confirmation paiement:", error);
      setError("Erreur lors du traitement du paiement");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Informations de paiement
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {clientSecret && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choisissez votre méthode de paiement
            </label>
            {/* Debug info en mode développement */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-2 text-xs">
                🔧 Mode test - PaymentIntent: {clientSecret.split("_")[1]}...
              </div>
            )}
            <div className="border border-gray-300 rounded-md p-3">
              <PaymentElement
                options={{
                  layout: "tabs",
                  wallets: {
                    applePay: "auto",
                    googlePay: "auto",
                  },
                  fields: {
                    billingDetails: {
                      name: "never",
                      email: "never",
                      phone: "never",
                      address: "never",
                    },
                  },
                }}
                onReady={() => {
                  console.log("💳 PaymentElement prêt");
                }}
                onChange={(event) => {
                  console.log("💳 PaymentElement changement:", event);
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-700">
            🔒 Paiement sécurisé par Stripe. Vos données bancaires sont
            protégées.
          </p>
          <p className="text-sm text-blue-700 mt-1">
            💳 Cartes acceptées • 🇨🇭 TWINT • 📱 Apple Pay • 💳 Google Pay
          </p>
        </div>

        <button
          type="submit"
          disabled={!stripe || isLoading || !clientSecret}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading
            ? "Traitement du paiement..."
            : `Payer ${booking.amount} ${booking.currency}`}
        </button>
      </form>
    </div>
  );
}

// Composant principal avec Elements provider
export function PaymentFormMultiple(props: PaymentFormProps) {
  const [stripePromise] = useState(() =>
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "")
  );

  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#2563eb",
            colorBackground: "#ffffff",
            colorText: "#1f2937",
            colorDanger: "#dc2626",
            fontFamily: "system-ui, sans-serif",
            spacingUnit: "4px",
            borderRadius: "8px",
          },
        },
      }}
    >
      <CheckoutForm booking={props.booking} />
    </Elements>
  );
}
