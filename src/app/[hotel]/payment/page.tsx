import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getHotelConfig } from "@/lib/hotel-config";
import { PaymentForm } from "@/components/PaymentForm";

interface Props {
  params: { hotel: string };
  searchParams: { booking?: string };
}

export default async function PaymentPage({ params, searchParams }: Props) {
  const { hotel } = params;
  const { booking: bookingId } = searchParams;

  if (!bookingId) {
    redirect(`/${hotel}`);
  }

  const config = await getHotelConfig(hotel);
  if (!config) {
    notFound();
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.hotelSlug !== hotel) {
    notFound();
  }

  // Si déjà payé, rediriger vers succès
  if (booking.stripePaymentIntentId) {
    redirect(`/${hotel}/success?booking=${bookingId}`);
  }

  const room = config.rooms.find((r) => r.id === booking.roomId);
  if (!room) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          {config.logo && (
            <img
              src={config.logo}
              alt={config.name}
              className="h-16 mx-auto mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finaliser votre réservation
          </h1>
          <p className="text-gray-600">Paiement sécurisé par Stripe</p>
        </div>

        {/* Résumé de la réservation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Résumé de votre réservation
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Hôtel :</span>
              <span className="font-medium">{config.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Chambre :</span>
              <span className="font-medium">
                {room.name} (N° {room.id})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Client :</span>
              <span className="font-medium">{booking.clientName}</span>
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
        <PaymentForm booking={booking} hotelConfig={config} room={room} />
      </div>
    </div>
  );
}
