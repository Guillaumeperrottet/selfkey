"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface TwintDiagnosticProps {
  paymentIntentId?: string;
  bookingId?: string;
}

interface DiagnosticResult {
  paymentIntent: object | null;
  booking: object | null;
  issues: string[];
  recommendations: string[];
}

export function TwintDiagnostic({
  paymentIntentId,
  bookingId,
}: TwintDiagnosticProps) {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const runDiagnostic = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/diagnostics/twint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, bookingId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du diagnostic");
      }

      const result = await response.json();
      setDiagnostic(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Diagnostic TWINT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDiagnostic} disabled={loading}>
            {loading ? "Analyse en cours..." : "Lancer le diagnostic"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {diagnostic && (
          <div className="space-y-4">
            {/* Résumé des problèmes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {diagnostic.issues.length === 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    Problèmes détectés ({diagnostic.issues.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {diagnostic.issues.length === 0 ? (
                    <p className="text-sm text-green-600">
                      Aucun problème détecté
                    </p>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {diagnostic.issues.map((issue, index) => (
                        <li key={index} className="text-red-600">
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Recommandations ({diagnostic.recommendations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    {diagnostic.recommendations.map((rec, index) => (
                      <li key={index} className="text-yellow-600">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Détails du PaymentIntent */}
            {diagnostic.paymentIntent && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">PaymentIntent</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(diagnostic.paymentIntent, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Détails de la réservation */}
            {diagnostic.booking && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Réservation</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(diagnostic.booking, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
