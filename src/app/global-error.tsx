"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capturer l'erreur critique dans Sentry
    Sentry.captureException(error, {
      level: "fatal",
      tags: {
        error_boundary: "global",
        critical: "true",
      },
      contexts: {
        errorInfo: {
          digest: error.digest,
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
      },
    });

    // Log l'erreur critique pour le monitoring local
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-6">
                <AlertTriangle className="h-16 w-16 text-red-600" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Erreur Critique
              </h1>
              <h2 className="text-2xl font-semibold text-gray-700">
                Une erreur système s&apos;est produite
              </h2>
              <p className="text-gray-600">
                Nous sommes sincèrement désolé. Une erreur critique s&apos;est
                produite. Veuillez réessayer ou contacter notre support si le
                problème persiste.
              </p>

              {error.digest && (
                <p className="text-sm text-gray-500 font-mono bg-gray-100 p-2 rounded">
                  Référence : {error.digest}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCcw className="h-4 w-4" />
                Réessayer
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Retour à l&apos;accueil
              </button>
            </div>

            <div className="pt-8 text-sm text-gray-500">
              <p>Support : contact@selfkey.io</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
