"use client";

import { useState, useEffect, useCallback } from "react";
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

  const checkConnectSetup = useCallback(async () => {
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
  }, []);

  const checkStripeStatus = useCallback(async () => {
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
  }, [hotelSlug]);

  useEffect(() => {
    checkStripeStatus();
    checkConnectSetup();
  }, [checkStripeStatus, checkConnectSetup]);

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
      <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-6">
            <div className="rounded-full bg-gradient-to-r from-red-500 to-pink-500 p-3 mr-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-pink-700 bg-clip-text text-transparent">
                Stripe Connect non configuré
              </h3>
              <p className="text-red-600 font-medium">{setupError}</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-red-200">
            <h4 className="font-bold text-red-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Étapes pour configurer Stripe Connect :
            </h4>
            <ol className="list-decimal list-inside space-y-3 text-red-700">
              <li className="flex items-start">
                <span className="flex-1">
                  Connectez-vous à votre dashboard Stripe
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-1">Allez dans Paramètres → Connect</span>
              </li>
              <li className="flex items-start">
                <span className="flex-1">
                  Activez Stripe Connect pour votre plateforme
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-1">
                  Configurez votre profil de plateforme
                </span>
              </li>
            </ol>

            <a
              href="https://dashboard.stripe.com/settings/connect/platform-profile"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-6 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Configurer Stripe Connect
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (accountStatus && !needsOnboarding) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="flex items-center">
            <div className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 p-3 mr-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2">
                Compte Stripe configuré
              </h3>
              <p className="text-emerald-700 font-medium mb-2">
                Les paiements sont dirigés vers votre compte :{" "}
                <span className="font-bold">{accountStatus.email}</span>
              </p>
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-sm font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  Paiements activés
                </span>
                <span className="flex items-center text-sm font-semibold text-teal-600 bg-teal-100 px-3 py-1 rounded-full">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  Virements activés
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 shadow-lg">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 rounded-full -mr-16 -mt-16"></div>
      <div className="relative z-10">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 mr-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
              Configuration des paiements requise
            </h3>
          </div>
          <p className="text-amber-700 font-medium text-lg">
            Pour recevoir les paiements directement sur votre compte, vous devez
            configurer Stripe Connect.
          </p>
        </div>

        {needsOnboarding && (
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-amber-200">
              <label
                htmlFor="email"
                className="block text-lg font-bold text-amber-800 mb-3"
              >
                Email pour votre compte Stripe
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="proprietaire@hotel.com"
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg transition-all duration-200"
              />
            </div>

            <button
              onClick={startOnboarding}
              disabled={isLoading || !email}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 px-6 rounded-xl hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold text-lg flex items-center justify-center space-x-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                  <span>Configuration...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Configurer mon compte Stripe</span>
                </>
              )}
            </button>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-amber-200">
              <p className="font-bold text-amber-800 mb-3 text-lg">
                Ce processus vous permettra de :
              </p>
              <ul className="space-y-2">
                {[
                  { icon: "💰", text: "Recevoir les paiements directement" },
                  { icon: "🔄", text: "Gérer vos remboursements" },
                  { icon: "📊", text: "Accéder à votre dashboard Stripe" },
                  { icon: "🏦", text: "Contrôler vos virements" },
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center text-amber-700 font-medium"
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
