import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PaymentFormMultiple } from "@/components/PaymentFormMultiple";
import { BookingSteps } from "@/components/BookingSteps";

interface Props {
  params: Promise<{ hotel: string }>;
  searchParams: Promise<{ booking?: string }>;
}

export default async function PaymentPage({ params, searchParams }: Props) {
  const { hotel } = await params;
  const { booking: bookingId } = await searchParams;

  if (!bookingId) {
    redirect(`/${hotel}`);
  }

  // Récupérer l'établissement depuis la base de données
  const establishment = await prisma.establishment.findUnique({
    where: { slug: hotel },
  });

  if (!establishment) {
    notFound();
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: true,
    },
  });

  if (!booking || booking.hotelSlug !== hotel) {
    notFound();
  }

  // Si déjà payé, rediriger vers succès
  if (booking.stripePaymentIntentId) {
    redirect(`/${hotel}/success?booking=${bookingId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Étapes de réservation */}
        <BookingSteps currentStep={3} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finaliser votre réservation
          </h1>
          <p className="text-gray-600">
            Paiement sécurisé par Stripe • Cartes • TWINT • Apple Pay
          </p>
        </div>

        {/* Résumé de la réservation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Résumé de votre réservation
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Hôtel :</span>
              <span className="font-medium">{establishment.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Place :</span>
              <span className="font-medium">{booking.room.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Client :</span>
              <span className="font-medium">{`${booking.clientFirstName} ${booking.clientLastName}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Email :</span>
              <span className="font-medium">{booking.clientEmail}</span>
            </div>
            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total :</span>
                <span>
                  {booking.amount} {booking.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de paiement */}
        <PaymentFormMultiple
          booking={booking}
          establishment={establishment}
          room={booking.room}
        />
      </div>
    </div>
  );
}
