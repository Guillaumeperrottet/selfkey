import { BookingSummary } from "@/components/booking/BookingSummary";
import { Suspense } from "react";

interface Props {
  params: Promise<{ hotel: string }>;
  searchParams: Promise<{ booking?: string }>;
}

export default async function BookingSummaryPage({ searchParams }: Props) {
  const { booking } = await searchParams;

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Réservation non trouvée
          </h1>
          <p className="text-gray-600">
            Aucune réservation n&apos;a été trouvée avec cet identifiant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Chargement de votre réservation...</p>
            </div>
          </div>
        }
      >
        <BookingSummary bookingId={booking} />
      </Suspense>
    </div>
  );
}
