"use client";

import { useBookingTranslation } from "@/hooks/useBookingTranslation";

export function BookingNotFound() {
  const { t } = useBookingTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t.summary.bookingNotFound}
        </h1>
        <p className="text-gray-600">{t.summary.errorLoading}</p>
      </div>
    </div>
  );
}
