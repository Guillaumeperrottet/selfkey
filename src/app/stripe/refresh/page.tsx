"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StripeRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page admin après un court délai
    const timer = setTimeout(() => {
      const hotelSlug =
        localStorage.getItem("currentHotel") || "hotel-test-paradise";
      router.push(`/admin/${hotelSlug}`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-yellow-600 text-6xl mb-4">🔄</div>

        <h1 className="text-2xl font-bold text-yellow-800 mb-4">
          Mise à jour nécessaire
        </h1>

        <p className="text-yellow-700 mb-6">
          Il semble que certaines informations doivent être mises à jour ou que
          la session a expiré.
        </p>

        <div className="space-y-3">
          <div className="bg-yellow-100 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Session expirée ou informations manquantes
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600">Retour au dashboard...</p>

          <button
            onClick={() => {
              const hotelSlug =
                localStorage.getItem("currentHotel") || "hotel-test-paradise";
              router.push(`/admin/${hotelSlug}`);
            }}
            className="mt-4 bg-yellow-600 text-white py-2 px-6 rounded-md hover:bg-yellow-700 transition-colors"
          >
            Retourner au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
