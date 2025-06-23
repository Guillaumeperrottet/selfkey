"use client";

import { useState, useEffect } from "react";
import { StripeAccount } from "@/types/hotel";

interface Props {
  hotelSlug: string;
  hotelName: string;
}

export function StripeOnboarding({ hotelSlug }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<StripeAccount | null>(
    null
  );
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [email, setEmail] = useState("");
  const [setupError, setSetupError] = useState<string | null>(null);
  const [connectEnabled, setConnectEnabled] = useState(true);

  useEffect(() => {
    checkStripeStatus();
    checkConnectSetup();
  }, [hotelSlug]);

  const checkConnectSetup = async () => {
    try {
      const response = await fetch("/api/stripe/setup-check");
      const setup = await response.json();

      if (!setup.isSetup || !setup.connectEnabled) {
        setSetupError(setup.error);
        setConnectEnabled(false);
      }
    } catch (error) {
      console.error("Erreur vérification setup:", error);
    }
  };

  const checkStripeStatus = async () => {
    try {
      const response = await fetch(`/api/stripe/onboard?hotel=${hotelSlug}`);
      const data = await response.json();

      if (data.connected) {
        setAccountStatus(data.accountStatus);
        setNeedsOnboarding(data.needsOnboarding);
      } else {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error("Erreur vérification Stripe:", error);
    }
  };

  const startOnboarding = async () => {
    if (!email) {
      alert("Veuillez saisir votre email");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotelSlug,
          email,
          country: "CH",
          businessType: "individual",
        }),
      });

      const { onboardingUrl } = await response.json();

      if (onboardingUrl) {
        // Rediriger vers Stripe pour l'onboarding
        window.location.href = onboardingUrl;
      }
    } catch (error) {
      console.error("Erreur onboarding:", error);
      alert("Erreur lors de la configuration Stripe");
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher l'erreur de configuration Connect en premier
  if (!connectEnabled && setupError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="text-red-600 text-2xl mr-3">🚫</div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">
              Stripe Connect non configuré
            </h3>
            <p className="text-red-700">{setupError}</p>
          </div>
        </div>

        <div className="bg-red-100 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">
            Étapes pour configurer Stripe Connect :
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-red-700">
            <li>Connectez-vous à votre dashboard Stripe</li>
            <li>Allez dans Paramètres → Connect</li>
            <li>Activez Stripe Connect pour votre plateforme</li>
            <li>Configurez votre profil de plateforme</li>
          </ol>

          <a
            href="https://dashboard.stripe.com/settings/connect/platform-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Configurer Stripe Connect
          </a>
        </div>
      </div>
    );
  }

  if (accountStatus && !needsOnboarding) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-green-600 text-2xl mr-3">✅</div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              Compte Stripe configuré
            </h3>
            <p className="text-green-700">
              Les paiements sont dirigés vers votre compte :{" "}
              {accountStatus.email}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Paiements activés • Virements activés
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Configuration des paiements requise
        </h3>
        <p className="text-yellow-700 mb-4">
          Pour recevoir les paiements directement sur votre compte, vous devez
          configurer Stripe Connect.
        </p>
      </div>

      {needsOnboarding && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-yellow-800 mb-1"
            >
              Email pour votre compte Stripe
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="proprietaire@hotel.com"
              className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <button
            onClick={startOnboarding}
            disabled={isLoading || !email}
            className="w-full bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Configuration..." : "Configurer mon compte Stripe"}
          </button>

          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">Ce processus vous permettra de :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Recevoir les paiements directement</li>
              <li>Gérer vos remboursements</li>
              <li>Accéder à votre dashboard Stripe</li>
              <li>Contrôler vos virements</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
