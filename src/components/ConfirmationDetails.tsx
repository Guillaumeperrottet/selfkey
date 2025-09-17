"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Mail, Copy, Check } from "lucide-react";
import { isHtmlContent } from "@/lib/confirmation-template";

export function ConfirmationDetails({ bookingId }: { bookingId: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  const fetchConfirmationContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/bookings/${bookingId}/confirmation-content`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du contenu");
      }

      const data = await response.json();
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchConfirmationContent();
  }, [bookingId, fetchConfirmationContent]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && content) {
      const isHtml = isHtmlContent(content);

      const printContent = isHtml
        ? content
        : `
        <html>
          <head>
            <title>Confirmation de réservation</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="content">${content}</div>
          </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopy = async () => {
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error("Erreur lors de la copie");
      }
    }
  };

  const handleResendEmail = async () => {
    try {
      setEmailSending(true);

      const response = await fetch(
        `/api/bookings/${bookingId}/send-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ method: "email" }),
        }
      );

      if (response.ok) {
        // Afficher un message de succès
        alert("Email renvoyé avec succès !");
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'envoi de l'email");
      }
    } catch {
      alert("Erreur lors de l'envoi de l'email");
    } finally {
      setEmailSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Erreur lors du chargement : {error}</p>
        <Button onClick={fetchConfirmationContent} variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  const isHtml = isHtmlContent(content);

  return (
    <div className="space-y-6">
      {/* Contenu de la confirmation directement sans wrapper */}
      <div>
        {isHtml ? (
          <div
            className="confirmation-content"
            dangerouslySetInnerHTML={{ __html: content }}
            style={{
              fontFamily: "Arial, sans-serif",
              lineHeight: "1.6",
              color: "#333",
            }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-900">
            {content}
          </pre>
        )}
      </div>

      {/* Actions en bas */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        <Button
          onClick={handlePrint}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimer
        </Button>

        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              Copié !
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copier
            </>
          )}
        </Button>

        <Button
          onClick={handleResendEmail}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={emailSending}
        >
          <Mail className="h-4 w-4" />
          {emailSending ? "Envoi..." : "Renvoyer par email"}
        </Button>
      </div>

      {/* Note explicative */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Conseils :</strong>
        </p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1">
          <li>• Imprimez cette page pour avoir vos informations hors ligne</li>
          <li>• Prenez une capture d&apos;écran de ces détails</li>
          <li>• Notez votre code d&apos;accès quelque part de sûr</li>
        </ul>
      </div>
    </div>
  );
}
