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
  roomId: string | null; // Optionnel pour le parking jour
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
  room: Room | null; // Peut être null pour le parking jour
}

// Fonction utilitaire pour convertir le nom du pays en code ISO 3166-1 alpha-2
const getCountryCode = (countryName: string): string => {
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
    Espagne: "ES",
    Spain: "ES",
    Belgique: "BE",
    Belgium: "BE",
    "Pays-Bas": "NL",
    Netherlands: "NL",
    Luxembourg: "LU",
    Portugal: "PT",
    "Royaume-Uni": "GB",
    "United Kingdom": "GB",
    "États-Unis": "US",
    "United States": "US",
  };

  const code = countryMap[countryName] || countryName.toUpperCase();
  console.log(`🌍 Conversion pays: "${countryName}" -> "${code}"`);
  return code;
};

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
      // Obtenir les données du PaymentElement pour détecter le type de paiement
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Erreur de validation du formulaire");
        setIsLoading(false);
        return;
      }

      // Log des données avant confirmation
      console.log("🔍 PAYMENT DEBUG - Données avant confirmation:", {
        bookingId: booking.id,
        amount: booking.amount,
        currency: booking.currency,
        clientCountry: booking.clientCountry,
        clientEmail: booking.clientEmail,
        returnUrl: `${window.location.origin}/${booking.hotelSlug}/payment-return?booking=${booking.id}`,
      });

      // Validation spécifique pour TWINT
      if (booking.currency.toLowerCase() !== "chf") {
        console.warn(
          "⚠️ TWINT requiert CHF comme devise, reçu:",
          booking.currency
        );
      }

      // Préparer les billing_details complets pour TWINT
      const billingDetails = {
        name: `${booking.clientFirstName} ${booking.clientLastName}`,
        email: booking.clientEmail,
        phone: booking.clientPhone,
        address: {
          line1: booking.clientAddress,
          line2: "",
          postal_code: booking.clientPostalCode,
          city: booking.clientCity,
          state: "",
          country: getCountryCode(booking.clientCountry),
        },
      };

      console.log("🔍 TWINT BILLING DETAILS:", billingDetails);

      // Vérifier si on peut obtenir le type de paiement sélectionné
      const paymentElement = elements.getElement("payment");
      if (paymentElement) {
        console.log(
          "💳 PaymentElement trouvé, tentative de récupération du type de paiement"
        );
      }

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
        const { error: stripeError, paymentIntent } =
          await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/${booking.hotelSlug}/payment-return?booking=${booking.id}`,
              payment_method: paymentMethod.id,
            },
            redirect: "if_required",
          });

        if (stripeError) {
          console.error("🚨 PAYMENT ERROR:", {
            type: stripeError.type,
            code: stripeError.code,
            message: stripeError.message,
            payment_intent: stripeError.payment_intent,
          });

          // Messages d'erreur spécifiques
          let errorMessage = stripeError.message || "Erreur de paiement";
          if (stripeError.code === "payment_method_provider_decline") {
            errorMessage =
              "Paiement refusé par le fournisseur. Vérifiez vos informations et réessayez.";
          }

          setError(errorMessage);
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
          // Paiement en cours - redirection automatique gérée par Stripe
          console.log("Paiement en cours...");
        } else if (paymentIntent?.status === "requires_action") {
          // Redirection déjà effectuée par Stripe
          console.log("Redirection effectuée");
        }
      } catch (apiError) {
        console.error("❌ Erreur API PaymentMethod:", apiError);
        setError("Erreur lors de la création du mode de paiement");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erreur confirmation paiement:", error);

      // Log détaillé pour le debug TWINT
      if (error && typeof error === "object" && "payment_intent" in error) {
        const errorObj = error as { payment_intent?: unknown };
        console.log("PaymentIntent error details:", errorObj.payment_intent);
      }

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
            Informations de paiement / Payment Information
          </h2>
          <p className="text-sm text-gray-600">
            Sélectionnez votre méthode de paiement préférée / Select your
            preferred payment method
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
                    Mode test actif / Test mode active
                  </span>
                </div>
                <p className="text-blue-700 mt-1">
                  Paiement initialisé pour la réservation {booking.id}
                  <br />
                  <em>Payment initialized for booking {booking.id}</em>
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
                      name: "auto", // Nécessaire pour TWINT
                      email: "auto", // Nécessaire pour TWINT
                      phone: "auto", // Nécessaire pour TWINT
                      address: {
                        line1: "auto", // Nécessaire pour TWINT
                        line2: "never",
                        city: "auto", // Nécessaire pour TWINT
                        state: "never",
                        postalCode: "auto", // Nécessaire pour TWINT
                        country: "auto", // Nécessaire pour TWINT
                      },
                    },
                  },
                  defaultValues: {
                    billingDetails: {
                      name: `${booking.clientFirstName} ${booking.clientLastName}`,
                      email: booking.clientEmail,
                      phone: booking.clientPhone,
                      address: {
                        line1: booking.clientAddress,
                        postal_code: booking.clientPostalCode,
                        city: booking.clientCity,
                        country: getCountryCode(booking.clientCountry),
                      },
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
                  // Log spécifique pour TWINT
                  if (event.value?.type === "twint") {
                    console.log(
                      "🔍 TWINT sélectionné, billing details required"
                    );
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
                Erreur de paiement / Payment Error
              </p>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

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
                <span>Traitement du paiement... / Processing payment...</span>
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
                  Payer {booking.amount} {booking.currency} / Pay{" "}
                  {booking.amount} {booking.currency}
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
