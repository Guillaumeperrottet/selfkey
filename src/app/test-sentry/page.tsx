"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  captureError,
  captureBookingError,
  capturePaymentError,
  captureApiError,
  addBreadcrumb,
} from "@/lib/monitoring/sentry";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function TestSentryPage() {
  const [status, setStatus] = useState<{
    type: "success" | "error" | "loading" | null;
    message: string;
  }>({ type: null, message: "" });

  const testSimpleError = () => {
    setStatus({ type: "loading", message: "Envoi de l'erreur..." });

    try {
      // Ajouter un breadcrumb avant l'erreur
      addBreadcrumb("User clicked test button", "test", {
        testType: "simple_error",
      });

      // Provoquer une erreur
      throw new Error("🧪 Test Sentry - Erreur simple intentionnelle");
    } catch (error) {
      captureError(error, {
        extra: {
          testContext: "Page de test Sentry",
          timestamp: new Date().toISOString(),
          testType: "simple_error",
        },
      });

      setStatus({
        type: "success",
        message: "✅ Erreur simple envoyée à Sentry !",
      });
    }
  };

  const testBookingError = () => {
    setStatus({
      type: "loading",
      message: "Envoi de l'erreur de réservation...",
    });

    try {
      addBreadcrumb("User clicked booking test", "test", {
        testType: "booking_error",
      });

      throw new Error("🧪 Test Sentry - Erreur de réservation");
    } catch (error) {
      captureBookingError(
        error,
        {
          id: "test_booking_123",
          bookingNumber: 99999,
          amount: 150.0,
          currency: "CHF",
          type: "night",
        },
        {
          user: {
            id: "test_user_123",
            email: "test@selfkey.ch",
            name: "Test User",
          },
          establishment: {
            slug: "test-hotel",
            name: "Test Hotel",
          },
        }
      );

      setStatus({
        type: "success",
        message: "✅ Erreur de réservation envoyée à Sentry !",
      });
    }
  };

  const testPaymentError = () => {
    setStatus({ type: "loading", message: "Envoi de l'erreur de paiement..." });

    try {
      addBreadcrumb("User clicked payment test", "test", {
        testType: "payment_error",
      });

      throw new Error("🧪 Test Sentry - Erreur de paiement Stripe");
    } catch (error) {
      capturePaymentError(
        error,
        {
          paymentIntentId: "pi_test_123abc",
          amount: 150.0,
          currency: "CHF",
          status: "failed",
          errorCode: "card_declined",
          errorMessage: "Card was declined",
        },
        {
          user: {
            id: "test_user_123",
            email: "test@selfkey.ch",
            name: "Test User",
          },
          establishment: {
            slug: "test-hotel",
            name: "Test Hotel",
          },
          booking: {
            id: "test_booking_123",
            bookingNumber: 99999,
          },
        }
      );

      setStatus({
        type: "success",
        message: "✅ Erreur de paiement envoyée à Sentry !",
      });
    }
  };

  const testApiError = async () => {
    setStatus({ type: "loading", message: "Envoi de l'erreur API..." });

    try {
      addBreadcrumb("User clicked API test", "test", { testType: "api_error" });

      throw new Error("🧪 Test Sentry - Erreur API");
    } catch (error) {
      captureApiError(
        error,
        {
          endpoint: "/api/test-sentry",
          method: "POST",
          statusCode: 500,
          requestBody: { test: true },
          responseBody: { error: "Internal Server Error" },
        },
        {
          user: {
            id: "test_user_123",
            email: "test@selfkey.ch",
          },
        }
      );

      setStatus({
        type: "success",
        message: "✅ Erreur API envoyée à Sentry !",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔍 Test Sentry
          </h1>
          <p className="text-gray-600">
            Testez la capture d&apos;erreurs avec différents contextes
          </p>
        </div>

        {/* Status */}
        {status.type && (
          <Card
            className={
              status.type === "success"
                ? "border-green-500 bg-green-50"
                : status.type === "error"
                  ? "border-red-500 bg-red-50"
                  : "border-blue-500 bg-blue-50"
            }
          >
            <CardContent className="flex items-center gap-3 pt-6">
              {status.type === "loading" && (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              )}
              {status.type === "success" && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              {status.type === "error" && (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <p
                className={
                  status.type === "success"
                    ? "text-green-700"
                    : status.type === "error"
                      ? "text-red-700"
                      : "text-blue-700"
                }
              >
                {status.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tests Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Test 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔴</span>
                Erreur Simple
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Envoie une erreur basique avec contexte minimal pour tester la
                configuration de base.
              </p>
              <Button onClick={testSimpleError} className="w-full">
                Tester
              </Button>
            </CardContent>
          </Card>

          {/* Test 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📋</span>
                Erreur de Réservation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Envoie une erreur avec contexte de réservation (booking ID,
                montant, établissement).
              </p>
              <Button onClick={testBookingError} className="w-full">
                Tester
              </Button>
            </CardContent>
          </Card>

          {/* Test 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>💳</span>
                Erreur de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Envoie une erreur Stripe avec PaymentIntent, code d&apos;erreur
                et contexte complet.
              </p>
              <Button onClick={testPaymentError} className="w-full">
                Tester
              </Button>
            </CardContent>
          </Card>

          {/* Test 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔌</span>
                Erreur API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Envoie une erreur API avec endpoint, méthode, status code et
                body.
              </p>
              <Button onClick={testApiError} className="w-full">
                Tester
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-900">
              📚 Comment vérifier dans Sentry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Allez sur{" "}
                <a
                  href="https://perrottet.sentry.io/issues/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  votre dashboard Sentry
                </a>
              </li>
              <li>
                Sélectionnez le projet <strong>selfkey</strong>
              </li>
              <li>
                Vous devriez voir les erreurs de test apparaître (peut prendre
                quelques secondes)
              </li>
              <li>
                Cliquez sur une erreur pour voir le détail complet : stack
                trace, contexte, breadcrumbs
              </li>
              <li>
                Vérifiez que les tags sont présents (error_type, user.email,
                establishment_slug, etc.)
              </li>
            </ol>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="text-amber-800 font-medium">
                ⚠️ Note : En mode développement, les erreurs sont loggées dans
                la console mais peuvent ne pas être envoyées à Sentry selon
                votre configuration.
              </p>
              <p className="text-amber-700 text-xs mt-1">
                Pour tester l&apos;envoi réel, modifiez temporairement
                sentry.client.config.ts ou déployez en staging/production.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
