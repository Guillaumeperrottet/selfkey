"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StripeSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page admin après un délai
    const timer = setTimeout(() => {
      // Essayer de récupérer l'hôtel depuis l'URL ou le localStorage
      const hotelSlug =
        localStorage.getItem("currentHotel") || "hotel-test-paradise";
      router.push(`/admin/${hotelSlug}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-600 text-6xl mb-4">✅</div>

        <h1 className="text-2xl font-bold text-green-800 mb-4">
          Configuration réussie !
        </h1>

        <p className="text-green-700 mb-6">
          Votre compte Stripe Connect a été configuré avec succès. Vous pouvez
          maintenant recevoir des paiements directement.
        </p>

        <div className="space-y-3">
          <div className="bg-green-100 rounded-lg p-3">
            <p className="text-sm text-green-800">🎉 Paiements activés</p>
          </div>

          <div className="bg-green-100 rounded-lg p-3">
            <p className="text-sm text-green-800">
              💰 Virements automatiques configurés
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Redirection automatique dans quelques secondes...
          </p>

          <button
            onClick={() => {
              const hotelSlug =
                localStorage.getItem("currentHotel") || "hotel-test-paradise";
              router.push(`/admin/${hotelSlug}`);
            }}
            className="mt-4 bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
          >
            Aller au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
