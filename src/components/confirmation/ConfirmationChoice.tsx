"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConfirmationChoiceProps {
  bookingId: string;
  hotelSlug: string;
}

interface ConfirmationOptions {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
}

export function ConfirmationChoice({
  bookingId,
  hotelSlug,
}: ConfirmationChoiceProps) {
  const router = useRouter();
  const [options, setOptions] = useState<ConfirmationOptions>({
    emailEnabled: false,
    whatsappEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await fetch(
          `/api/establishments/${hotelSlug}/confirmation-options`
        );
        if (response.ok) {
          const data = await response.json();
          setOptions({
            emailEnabled: data.confirmationEmailEnabled || false,
            whatsappEnabled: data.confirmationWhatsappEnabled || false,
          });
        }
      } catch {
        setError("Erreur lors du chargement des options");
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [hotelSlug]);

  const handleConfirmation = async (method: "email" | "whatsapp") => {
    setSending(true);
    setError("");

    try {
      const response = await fetch(
        `/api/bookings/${bookingId}/send-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ method }),
        }
      );

      if (response.ok) {
        setSuccess(true);
        // Rediriger vers une page de confirmation après 2 secondes
        setTimeout(() => {
          router.push(`/${hotelSlug}/confirmation-sent`);
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'envoi de la confirmation");
      }
    } catch {
      setError("Erreur lors de l'envoi de la confirmation");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Confirmation envoyée !
          </h3>
          <p className="text-sm text-gray-600 text-center">
            Vous allez recevoir votre confirmation dans quelques instants.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Si aucune option n'est disponible, rediriger directement
  if (!options.emailEnabled && !options.whatsappEnabled) {
    router.push(`/${hotelSlug}/booking-complete`);
    return null;
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Choisissez votre mode de confirmation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <p className="text-sm text-gray-600 text-center mb-6">
          Votre réservation a été confirmée avec succès. Comment souhaitez-vous
          recevoir vos informations d&apos;accès ?
        </p>

        <div className="space-y-3">
          {options.emailEnabled && (
            <Button
              onClick={() => handleConfirmation("email")}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 h-12"
              variant="outline"
            >
              <Mail className="h-5 w-5" />
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Recevoir par Email"
              )}
            </Button>
          )}

          {options.whatsappEnabled && (
            <Button
              onClick={() => handleConfirmation("whatsapp")}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 h-12"
              variant="outline"
            >
              <MessageSquare className="h-5 w-5" />
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Recevoir par WhatsApp"
              )}
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Vous recevrez vos codes d&apos;accès et toutes les informations
          nécessaires pour votre séjour.
        </p>
      </CardContent>
    </Card>
  );
}
