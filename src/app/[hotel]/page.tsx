import { notFound } from "next/navigation";
import { CheckinForm } from "@/components/CheckinForm";
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
            <p className="text-gray-600">Check-in tardif</p>
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

  // Récupérer les chambres disponibles (non réservées aujourd'hui)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Récupérer les IDs des chambres déjà réservées aujourd'hui
  const bookedRoomIds = await prisma.booking
    .findMany({
      where: {
        hotelSlug: hotel,
        bookingDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        stripePaymentIntentId: {
          not: null, // Seulement les réservations confirmées
        },
      },
      select: {
        roomId: true,
      },
    })
    .then((bookings) => bookings.map((b) => b.roomId));

  // Récupérer seulement les chambres disponibles (non réservées)
  const availableRooms = await prisma.room.findMany({
    where: {
      hotelSlug: hotel,
      isActive: true,
      id: {
        notIn: bookedRoomIds, // Exclure les chambres déjà réservées
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {establishment.name}
          </h1>
          <p className="text-gray-600">
            Check-in tardif - Sélectionnez votre chambre
          </p>
        </div>

        {/* Contenu principal */}
        {availableRooms.length > 0 ? (
          <CheckinForm
            hotelSlug={hotel}
            hotelConfig={{
              name: establishment.name,
              currency: "CHF",
              rooms: [],
              logo: "",
              colors: { primary: "#000" },
              contact: { email: "", phone: "" },
              stripe_key: "",
              stripe_account_id: "",
            }}
            availableRooms={availableRooms}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Aucune chambre disponible
            </h2>
            <p className="text-gray-600 mb-6">
              Désolé, toutes nos chambres sont occupées pour ce soir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
