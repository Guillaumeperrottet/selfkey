"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  hotelSlug: string;
  stripeAccountId?: string;
}

/**
 * Dashboard intégré utilisant les composants embarqués Stripe
 * Selon la doc Connect pour "dashboard built using Stripe API and embedded components"
 */
export function EmbeddedStripeDashboard({ hotelSlug, stripeAccountId }: Props) {
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotelSlug,
          accountId: stripeAccountId,
        }),
      });

      const data = await response.json();

      if (data.dashboardUrl) {
        setDashboardUrl(data.dashboardUrl);
      } else {
        setError(data.error || "Erreur lors du chargement du dashboard");
      }
    } catch {
      setError("Erreur réseau lors du chargement du dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [hotelSlug, stripeAccountId]);

  useEffect(() => {
    if (stripeAccountId) {
      loadDashboard();
    }
  }, [stripeAccountId, loadDashboard]);

  if (!stripeAccountId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          Configurez d&apos;abord votre compte Stripe pour accéder au dashboard.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center text-red-800">
          <div className="text-red-600 text-xl mr-3">⚠️</div>
          <div>
            <h3 className="font-semibold">Erreur dashboard</h3>
            <p>{error}</p>
            <button
              onClick={loadDashboard}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Dashboard des paiements
        </h3>
        <p className="text-sm text-gray-600">
          Gérez vos paiements, virements et paramètres de compte
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Liens rapides selon les composants embarqués recommandés */}
        <div className="grid grid-cols-2 gap-4">
          <a
            href={`${dashboardUrl}#/payments`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div className="font-medium text-blue-900">💳 Paiements</div>
            <div className="text-sm text-blue-700">
              Voir tous les paiements reçus
            </div>
          </a>

          <a
            href={`${dashboardUrl}#/payouts`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div className="font-medium text-green-900">💰 Virements</div>
            <div className="text-sm text-green-700">Gérer vos virements</div>
          </a>

          <a
            href={`${dashboardUrl}#/disputes`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <div className="font-medium text-orange-900">⚖️ Litiges</div>
            <div className="text-sm text-orange-700">Répondre aux litiges</div>
          </a>

          <a
            href={`${dashboardUrl}#/account`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="font-medium text-purple-900">⚙️ Paramètres</div>
            <div className="text-sm text-purple-700">Paramètres du compte</div>
          </a>
        </div>

        {/* Lien vers le dashboard complet */}
        <div className="pt-4 border-t border-gray-200">
          <a
            href={dashboardUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
          >
            Ouvrir le dashboard complet Stripe
          </a>
        </div>
      </div>
    </div>
  );
}
