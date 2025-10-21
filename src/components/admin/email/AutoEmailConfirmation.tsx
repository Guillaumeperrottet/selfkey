"use client";

import { useEffect, useState } from "react";

interface AutoEmailConfirmationProps {
  bookingId: string;
}

export function AutoEmailConfirmation({
  bookingId,
}: AutoEmailConfirmationProps) {
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadySent, setAlreadySent] = useState(false);

  useEffect(() => {
    const sendConfirmationEmail = async () => {
      try {
        console.log("🔄 Vérification du statut d'envoi pour:", bookingId);

        // 1. Vérifier d'abord si l'email a déjà été envoyé
        const checkResponse = await fetch(`/api/bookings/${bookingId}`);
        if (!checkResponse.ok) {
          throw new Error("Impossible de vérifier le statut de la réservation");
        }

        const bookingData = await checkResponse.json();

        if (bookingData.confirmationSent) {
          console.log("ℹ️ Email de confirmation déjà envoyé précédemment");
          setAlreadySent(true);
          setIsLoading(false);
          return;
        }

        console.log("📧 Envoi de l'email de confirmation pour:", bookingId);

        // 2. Envoyer l'email si pas encore envoyé
        const response = await fetch(
          `/api/bookings/${bookingId}/send-confirmation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              method: "email",
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de l'envoi de l'email"
          );
        }

        const result = await response.json();
        console.log("✅ Email de confirmation envoyé:", result);
        setEmailSent(true);
      } catch (err) {
        console.error(
          "❌ Erreur lors de l'envoi de l'email de confirmation:",
          err
        );
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    // Éviter les appels multiples en vérifiant les états
    if (bookingId && !emailSent && !error && !alreadySent && isLoading) {
      sendConfirmationEmail();
    }
  }, [bookingId, emailSent, error, alreadySent, isLoading]);

  // Composant invisible, juste pour déclencher l'envoi
  if (isLoading) {
    console.log(
      "⏳ Vérification et envoi de l'email de confirmation en cours..."
    );
  }

  if (alreadySent) {
    console.log("ℹ️ Email de confirmation déjà envoyé pour cette réservation");
  }

  if (error) {
    console.error("❌ Erreur d'envoi d'email:", error);
  }

  if (emailSent) {
    console.log("✅ Email de confirmation envoyé avec succès !");
  }

  return null; // Composant invisible
}
