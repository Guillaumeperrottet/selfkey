"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface SendInvoiceLinkProps {
  bookingId: string;
  clientEmail: string;
  clientName: string;
  bookingNumber?: number; // Optionnel car pas utilisé pour l'instant
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function SendInvoiceLink({
  bookingId,
  clientEmail,
  clientName,
  variant = "outline",
  size = "sm",
  className = "",
}: SendInvoiceLinkProps) {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendLink = async () => {
    try {
      setIsSending(true);

      const response = await fetch("/api/send-invoice-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          clientEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi");
      }

      setSent(true);
      toast.success("Lien de facture envoyé avec succès", {
        description: `Email envoyé à ${clientEmail}`,
      });

      // Reset l'état "sent" après 3 secondes
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error("Erreur envoi lien facture:", error);
      toast.error("Erreur lors de l'envoi", {
        description: error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={`flex items-center gap-2 ${className}`}
      >
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span className="text-green-600">Envoyé</span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSendLink}
      disabled={isSending}
      className={`flex items-center gap-2 ${className}`}
      title={`Envoyer le lien de facture à ${clientName} (${clientEmail})`}
    >
      {isSending ? (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      ) : (
        <Mail className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">
        {isSending ? "Envoi..." : "Envoyer facture"}
      </span>
    </Button>
  );
}
