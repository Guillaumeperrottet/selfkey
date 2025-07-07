"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

export default function PaymentReturnPage({
  params,
}: {
  params: Promise<{ hotel: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string>("");
  const [hotelSlug, setHotelSlug] = useState<string>("");

  useEffect(() => {
    const initPage = async () => {
      const resolvedParams = await params;
      setHotelSlug(resolvedParams.hotel);
    };
    initPage();
  }, [params]);

  useEffect(() => {
    if (!hotelSlug) return;

    const handlePaymentReturn = async () => {
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ""
      );

      if (!stripe) {
        setError("Erreur de chargement Stripe");
        setStatus("error");
        return;
      }

      // Récupérer le PaymentIntent depuis l'URL
      const paymentIntentClientSecret = searchParams.get(
        "payment_intent_client_secret"
      );
      const bookingId = searchParams.get("booking");

      if (!paymentIntentClientSecret) {
        setError("Paramètres de paiement manquants");
        setStatus("error");
        return;
      }

      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(
          paymentIntentClientSecret
        );

        if (paymentIntent) {
          switch (paymentIntent.status) {
            case "succeeded":
              // Confirmer la réservation
              if (bookingId) {
                await fetch("/api/booking/confirm", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    bookingId,
                    paymentIntentId: paymentIntent.id,
                  }),
                });
              }

              setStatus("success");
              // Rediriger vers la page de succès
              setTimeout(() => {
                router.push(`/${hotelSlug}/success?booking=${bookingId}`);
              }, 2000);
              break;

            case "processing":
              // Attendre et vérifier à nouveau
              setTimeout(() => handlePaymentReturn(), 2000);
              break;

            case "requires_payment_method":
              setError("Paiement refusé ou annulé");
              setStatus("error");
              break;

            case "canceled":
              setError("Paiement annulé");
              setStatus("error");
              break;

            default:
              setError(`Statut de paiement inattendu: ${paymentIntent.status}`);
              setStatus("error");
          }
        }
      } catch (error) {
        console.error("Erreur vérification paiement:", error);
        setError("Erreur lors de la vérification du paiement");
        setStatus("error");
      }
    };

    handlePaymentReturn();
  }, [router, searchParams, hotelSlug]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vérification du paiement...
          </h2>
          <p className="text-gray-600">
            Veuillez patienter pendant que nous confirmons votre paiement.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            🇨🇭 TWINT • 💳 Carte • 📱 Paiement mobile
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            Paiement confirmé !
          </h2>
          <p className="text-green-700 mb-4">
            Votre réservation a été confirmée avec succès.
          </p>
          <p className="text-sm text-gray-600">
            Redirection vers la page de confirmation...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Erreur de paiement
          </h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() =>
                router.push(
                  `/${hotelSlug}/payment?booking=${searchParams.get("booking")}`
                )
              }
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Réessayer le paiement
            </button>
            <button
              onClick={() => router.push(`/${hotelSlug}`)}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
