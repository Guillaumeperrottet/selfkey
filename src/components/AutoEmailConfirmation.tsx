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

  useEffect(() => {
    const sendConfirmationEmail = async () => {
      try {
        console.log(
          "🔄 Tentative d'envoi d'email de confirmation pour:",
          bookingId
        );

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

    if (bookingId) {
      sendConfirmationEmail();
    }
  }, [bookingId]);

  // Composant invisible, juste pour déclencher l'envoi
  if (isLoading) {
    console.log("⏳ Envoi de l'email de confirmation en cours...");
  }

  if (error) {
    console.error("❌ Erreur d'envoi d'email:", error);
  }

  if (emailSent) {
    console.log("✅ Email de confirmation envoyé avec succès !");
  }

  return null; // Composant invisible
}
