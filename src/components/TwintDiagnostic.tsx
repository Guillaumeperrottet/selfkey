"use client";

import { useState } from "react";

interface TwintDiagnosticProps {
  booking: {
    id: string;
    clientEmail: string;
    clientFirstName: string;
    clientLastName: string;
    clientPhone: string;
    clientAddress: string;
    clientCity: string;
    clientPostalCode: string;
    clientCountry: string;
    amount: number;
    currency: string;
    hotelSlug: string;
  };
}

interface DiagnosticResult {
  error?: string;
  details?: string;
  paymentIntentId?: string;
  customerId?: string;
  status?: string;
  supportedMethods?: string[];
  customerDetails?: {
    country?: string;
  };
}

export function TwintDiagnostic({ booking }: TwintDiagnosticProps) {
  const [diagnosticResult, setDiagnosticResult] =
    useState<DiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostic = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/diagnostics/twint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          clientData: {
            email: booking.clientEmail,
            name: `${booking.clientFirstName} ${booking.clientLastName}`,
            phone: booking.clientPhone,
            address: {
              line1: booking.clientAddress,
              city: booking.clientCity,
              postal_code: booking.clientPostalCode,
              country: booking.clientCountry,
            },
          },
          amount: booking.amount,
          currency: booking.currency,
        }),
      });

      const result = await response.json();
      setDiagnosticResult(result);
    } catch (error) {
      console.error("Erreur diagnostic TWINT:", error);
      setDiagnosticResult({
        error: "Erreur lors du diagnostic",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-blue-900">Diagnostic TWINT</h3>
        <button
          onClick={runDiagnostic}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Diagnostic..." : "Tester TWINT"}
        </button>
      </div>

      {diagnosticResult && (
        <div className="space-y-2">
          <div className="text-xs">
            <strong>Résultat du diagnostic :</strong>
          </div>

          {diagnosticResult.error ? (
            <div className="bg-red-100 border border-red-300 rounded p-2">
              <div className="text-red-800 text-xs">
                <strong>Erreur :</strong> {diagnosticResult.error}
              </div>
              {diagnosticResult.details && (
                <div className="text-red-700 text-xs mt-1">
                  {diagnosticResult.details}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-100 border border-green-300 rounded p-2">
              <div className="text-green-800 text-xs space-y-1">
                <div>
                  ✅ <strong>PaymentIntent ID :</strong>{" "}
                  {diagnosticResult.paymentIntentId}
                </div>
                <div>
                  ✅ <strong>Customer ID :</strong>{" "}
                  {diagnosticResult.customerId}
                </div>
                <div>
                  ✅ <strong>Statut :</strong> {diagnosticResult.status}
                </div>
                <div>
                  ✅ <strong>Méthodes supportées :</strong>{" "}
                  {diagnosticResult.supportedMethods?.join(", ")}
                </div>
                {diagnosticResult.customerDetails && (
                  <div>
                    ✅ <strong>Adresse client :</strong>{" "}
                    {diagnosticResult.customerDetails.country}
                  </div>
                )}
              </div>
            </div>
          )}

          <details className="text-xs">
            <summary className="cursor-pointer text-blue-800 hover:text-blue-900">
              Voir les détails techniques
            </summary>
            <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(diagnosticResult, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
