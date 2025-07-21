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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
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
                address: {
                  line1: booking.clientAddress,
                  postal_code: booking.clientPostalCode,
                  city: booking.clientCity,
                  state: "", // Pas de champ state dans notre schéma, valeur vide acceptable
                  country: booking.clientCountry,
                },
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Informations de paiement
          </h2>
          <p className="text-sm text-gray-600">
            Sélectionnez votre méthode de paiement préférée
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {stripe && elements && (
          <div>
            {/* Debug info en mode développement */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium text-blue-800">
                    Mode test actif
                  </span>
                </div>
                <p className="text-blue-700 mt-1">
                  Paiement initialisé pour la réservation {booking.id}
                </p>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <PaymentElement
                options={{
                  layout: "tabs",
                  paymentMethodOrder: [
                    "card",
                    "apple_pay",
                    "google_pay",
                    "twint",
                  ],
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
                  if (event.complete) {
                    setError(""); // Effacer les erreurs quand le formulaire est complet
                  }
                }}
              />
            </div>
          </div>
        )}

        {(!stripe || !elements) && (
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-800 font-medium">
                Erreur de paiement
              </p>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Informations de sécurité */}
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">
                Paiement 100% sécurisé
              </p>
              <p className="text-sm text-green-700 mt-1">
                Vos données bancaires sont protégées par un cryptage SSL de
                niveau bancaire
              </p>
            </div>
          </div>
        </div>

        {/* Méthodes de paiement acceptées */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm font-medium text-blue-800 mb-2">
            Méthodes de paiement acceptées
          </p>
          <div className="flex items-center gap-3 text-sm text-blue-700">
            <span>• Cartes bancaires</span>
            <span>• Twint</span>
            <span>• Apple Pay*</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Traitement du paiement...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Payer {booking.amount} {booking.currency}
                </span>
              </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
}

// Composant principal avec Elements provider
export function PaymentFormMultiple(props: PaymentFormProps) {
  const [stripePromise, setStripePromise] = useState<ReturnType<
    typeof loadStripe
  > | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer la clé publique Stripe et le clientSecret
    const initializePayment = async () => {
      try {
        setIsLoading(true);

        // 1. Récupérer la clé publique Stripe
        const stripeResponse = await fetch("/api/stripe/public-key");
        if (!stripeResponse.ok) {
          throw new Error("Erreur lors de la récupération de la clé publique");
        }

        const { publishableKey } = await stripeResponse.json();
        console.log(
          "🔑 Clé publique Stripe récupérée:",
          publishableKey.substring(0, 12) + "..."
        );

        setStripePromise(loadStripe(publishableKey));

        // 2. Récupérer le clientSecret
        // Vérifier d'abord si on a un clientSecret dans le sessionStorage
        const storedClientSecret = sessionStorage.getItem(
          `payment_${props.booking.id}`
        );
        if (storedClientSecret) {
          setClientSecret(storedClientSecret);
          console.log("💳 PaymentIntent récupéré depuis sessionStorage:", {
            clientSecret: storedClientSecret,
          });
          // Nettoyer le sessionStorage après utilisation
          sessionStorage.removeItem(`payment_${props.booking.id}`);
        } else {
          // Sinon, récupérer ou créer un PaymentIntent via l'API
          const paymentResponse = await fetch(
            `/api/bookings/${props.booking.id}/payment-intent`
          );
          if (!paymentResponse.ok) {
            throw new Error("Erreur lors de la récupération du PaymentIntent");
          }

          const paymentData = await paymentResponse.json();
          setClientSecret(paymentData.clientSecret);
          console.log("💳 PaymentIntent récupéré depuis API:", {
            clientSecret: paymentData.clientSecret,
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation du paiement:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [props.booking.id]);

  if (!stripePromise || !clientSecret || isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Initialisation du paiement...</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: clientSecret,
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
