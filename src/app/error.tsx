"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capturer l'erreur dans Sentry avec contexte
    Sentry.captureException(error, {
      tags: {
        error_boundary: "app",
      },
      contexts: {
        errorInfo: {
          digest: error.digest,
          message: error.message,
          name: error.name,
        },
      },
    });

    // Log l'erreur pour le monitoring local
    console.error("Error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
            <AlertTriangle className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Oups !
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Une erreur s&apos;est produite.
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Nous sommes désolés, quelque chose s&apos;est mal passé. Notre
            équipe a été notifiée et travaille à résoudre le problème.
          </p>

          {error.digest && (
            <p className="text-sm text-gray-500 dark:text-gray-500 font-mono">
              Code d&apos;erreur : {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Réessayer
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Retour à l&apos;accueil
          </Button>
        </div>

        <div className="pt-8 text-sm text-gray-500 dark:text-gray-500">
          <p>Si le problème persiste, contactez notre support technique.</p>
        </div>
      </div>
    </div>
  );
}
