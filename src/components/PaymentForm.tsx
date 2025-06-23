"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { HotelConfig, Room } from "@/types/hotel";

interface Booking {
  id: string;
  hotelSlug: string;
  roomId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
}

interface PaymentFormProps {
  booking: Booking;
  hotelConfig: HotelConfig;
  room: Room;
}

// Composant interne pour le formulaire Stripe
function CheckoutForm({
  booking,
  hotelConfig,
}: Omit<PaymentFormProps, "room">) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    // Créer le PaymentIntent
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: booking.amount,
            currency: booking.currency,
            bookingId: booking.id,
          }),
        });

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch {
        setError("Erreur lors de l'initialisation du paiement");
      }
    };

    createPaymentIntent();
  }, [booking]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setError("");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Erreur avec l'élément de carte");
      setIsLoading(false);
      return;
    }

    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: booking.clientName,
            email: booking.clientEmail,
          },
        },
      });

    if (stripeError) {
      setError(stripeError.message || "Erreur de paiement");
      setIsLoading(false);
    } else if (paymentIntent.status === "succeeded") {
      // Mettre à jour la réservation avec le PaymentIntent ID
      await fetch("/api/booking/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          paymentIntentId: paymentIntent.id,
        }),
      });

      router.push(`/${booking.hotelSlug}/success?booking=${booking.id}`);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Informations de paiement
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Informations de carte
          </label>
          <div className="border border-gray-300 rounded-md p-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

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
        </div>

        <button
          type="submit"
          disabled={!stripe || isLoading || !clientSecret}
          style={{ backgroundColor: hotelConfig.colors.primary }}
          className="w-full py-3 px-4 text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
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
export function PaymentForm(props: PaymentFormProps) {
  const [stripePromise] = useState(() =>
    loadStripe(props.hotelConfig.stripe_key)
  );

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
