"use client";

import { useBookingTranslation } from "@/hooks/useBookingTranslation";

export function LoadingFallback() {
  const { t } = useBookingTranslation();

  return (
    <div className="flex justify-center items-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>{t.summary.loadingBooking}</p>
      </div>
    </div>
  );
}
