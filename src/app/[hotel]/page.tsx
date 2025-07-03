import { notFound } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{
    hotel: string;
  }>;
}

export default async function HotelPage({ params }: Props) {
  const { hotel } = await params;

  // Validation simple du slug
  if (!/^[a-z0-9-]+$/.test(hotel)) {
    notFound();
  }

  // Récupérer l'établissement depuis la base de données
  const establishment = await prisma.establishment.findUnique({
    where: { slug: hotel },
    select: {
      id: true,
      name: true,
      maxBookingDays: true,
    },
  });

  if (!establishment) {
    notFound();
  }

  // Vérifier qu'il y a des chambres configurées
  const roomCount = await prisma.room.count({
    where: {
      hotelSlug: hotel,
      isActive: true,
    },
  });

  if (roomCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {establishment.name}
            </h1>
            <p className="text-gray-600">Réservation en ligne</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🏨</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Configuration en cours
            </h2>
            <p className="text-gray-600 mb-6">
              L&apos;établissement configure actuellement ses chambres. Veuillez
              réessayer dans quelques instants.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {establishment.name}
          </h1>
          <p className="text-gray-600">Réservation en ligne</p>
        </div>

        {/* Nouveau formulaire de réservation avec dates */}
        <BookingForm
          hotelSlug={hotel}
          establishment={{
            name: establishment.name,
            maxBookingDays: establishment.maxBookingDays,
          }}
        />
      </div>
    </div>
  );
}
