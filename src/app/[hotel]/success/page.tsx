import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getHotelConfig } from "@/lib/hotel-config";

interface Props {
  params: { hotel: string };
  searchParams: { booking?: string };
}

export default async function SuccessPage({ params, searchParams }: Props) {
  const { hotel } = params;
  const { booking: bookingId } = searchParams;

  if (!bookingId) {
    notFound();
  }

  const config = await getHotelConfig(hotel);
  if (!config) {
    notFound();
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (
    !booking ||
    booking.hotelSlug !== hotel ||
    !booking.stripePaymentIntentId
  ) {
    notFound();
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
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Réservation confirmée !
          </h1>
          <p className="text-gray-600">
            Votre paiement a été traité avec succès
          </p>
        </div>

        {/* Détails de la réservation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Détails de votre réservation
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Hôtel :</span>
              <span className="font-medium">{config.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Chambre :</span>
              <span className="font-medium">{room.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Numéro de chambre :</span>
              <span className="font-medium text-lg">{room.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Client :</span>
              <span className="font-medium">{booking.clientName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Date :</span>
              <span className="font-medium">
                {booking.bookingDate.toLocaleDateString("fr-CH", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between py-2 text-lg font-semibold">
              <span>Montant payé :</span>
              <span className="text-green-600">
                {booking.amount} {booking.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Prochaines étapes
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>
              • Rendez-vous directement à votre chambre{" "}
              <strong>#{room.id}</strong>
            </p>
            <p>
              • Un email de confirmation a été envoyé à {booking.clientEmail}
            </p>
            <p>
              • Conservez cette page ou votre email comme preuve de réservation
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Besoin d&apos;aide ?
          </h3>
          <div className="space-y-2 text-gray-600">
            <p>
              <strong>Email :</strong> {config.contact.email}
            </p>
            <p>
              <strong>Téléphone :</strong> {config.contact.phone}
            </p>
          </div>
        </div>

        {/* Bouton retour */}
        <div className="text-center mt-8">
          <button
            onClick={() => (window.location.href = `/${hotel}`)}
            style={{ backgroundColor: config.colors.primary }}
            className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Nouvelle réservation
          </button>
        </div>
      </div>
    </div>
  );
}
