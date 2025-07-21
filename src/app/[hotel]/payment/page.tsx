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

  // Si déjà payé avec succès, rediriger vers succès
  if (booking.paymentStatus === "succeeded") {
    redirect(`/${hotel}/success?booking=${bookingId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Étapes de réservation */}
        <BookingSteps currentStep={3} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Finaliser votre réservation
          </h1>
          <p className="text-gray-600">
            Paiement sécurisé par Stripe • Cartes • TWINT • Apple Pay
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire de paiement */}
          <div className="lg:col-span-2">
            <PaymentFormMultiple
              booking={booking}
              establishment={establishment}
              room={booking.room}
            />
          </div>

          {/* Résumé de la réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Résumé de votre réservation
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hôtel :</span>
                  <span className="font-medium">{establishment.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Place :</span>
                  <span className="font-medium">{booking.room.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client :</span>
                  <span className="font-medium">{`${booking.clientFirstName} ${booking.clientLastName}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email :</span>
                  <span className="font-medium text-sm">
                    {booking.clientEmail}
                  </span>
                </div>
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total :</span>
                    <span>
                      {booking.amount} {booking.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
