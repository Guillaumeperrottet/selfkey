import { BookingSummary } from "@/components/booking/BookingSummary";
import { BookingNotFound } from "@/components/booking/BookingNotFound";
import { LoadingFallback } from "@/components/booking/LoadingFallback";
import { Suspense } from "react";

interface Props {
  params: Promise<{ hotel: string }>;
  searchParams: Promise<{ booking?: string }>;
}

export default async function BookingSummaryPage({ searchParams }: Props) {
  const { booking } = await searchParams;

  if (!booking) {
    return <BookingNotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingFallback />}>
        <BookingSummary bookingId={booking} />
      </Suspense>
    </div>
  );
}
