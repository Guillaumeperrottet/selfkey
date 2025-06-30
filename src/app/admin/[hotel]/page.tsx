import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/AdminDashboard";
import { StripeOnboarding } from "@/components/StripeOnboarding";
import { RoomManagement } from "@/components/RoomManagement";

interface Props {
  params: Promise<{ hotel: string }>;
}

export default async function AdminPage({ params }: Props) {
  const { hotel } = await params;

  // Récupérer ou créer l'établissement
  let establishment = await prisma.establishment.findUnique({
    where: { slug: hotel },
  });

  if (!establishment) {
    // Créer l'établissement avec des valeurs par défaut
    establishment = await prisma.establishment.create({
      data: {
        slug: hotel,
        name: hotel.charAt(0).toUpperCase() + hotel.slice(1).replace(/-/g, " "),
      },
    });
  }

  // Récupérer les chambres depuis la base de données
  const dbRooms = await prisma.room.findMany({
    where: {
      hotelSlug: hotel,
      isActive: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Récupérer les réservations du jour
  const todayBookings = await prisma.booking.findMany({
    where: {
      hotelSlug: hotel,
      bookingDate: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      room: true, // Inclure les détails de la chambre
    },
    orderBy: {
      bookingDate: "desc",
    },
  });

  // Dans le système simplifié, chaque chambre a une disponibilité de 1
  // On calcule les chambres disponibles en soustrayant les réservations
  const bookedRoomIds = todayBookings.map((booking) => booking.roomId);

  const roomsWithInventory = dbRooms.map((room) => ({
    id: room.id,
    name: room.name,
    price: room.price,
    inventory: bookedRoomIds.includes(room.id) ? 0 : 1, // 0 si réservée, 1 si disponible
    isActive: room.isActive,
  }));

  // Si on a un stripeAccountId mais pas encore marqué comme onboarded,
  // vérifier le statut réel auprès de Stripe
  if (establishment.stripeAccountId && !establishment.stripeOnboarded) {
    try {
      const { getAccountStatus } = await import("@/lib/stripe-connect");
      const accountStatus = await getAccountStatus(
        establishment.stripeAccountId
      );

      if (accountStatus.chargesEnabled && accountStatus.detailsSubmitted) {
        // Mettre à jour le statut dans la base de données
        await prisma.establishment.update({
          where: { slug: hotel },
          data: { stripeOnboarded: true },
        });
        establishment.stripeOnboarded = true;
      }
    } catch (error) {
      console.error("Erreur vérification statut Stripe:", error);
    }
  }

  const finalIsStripeConfigured =
    establishment.stripeAccountId && establishment.stripeOnboarded;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Admin - {establishment.name}
          </h1>
          <p className="text-gray-600">
            Gestion des chambres, inventaire et configuration des paiements
          </p>
        </div>

        {/* Configuration Stripe */}
        <div className="mb-8">
          <StripeOnboarding hotelSlug={hotel} hotelName={establishment.name} />
        </div>

        {/* Affichage commission si configurée */}
        {(establishment.commissionRate > 0 || establishment.fixedFee > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-1">
              Commission plateforme
            </h3>
            <p className="text-blue-700 text-sm">
              {establishment.commissionRate > 0 &&
                `${establishment.commissionRate}% du montant`}
              {establishment.commissionRate > 0 &&
                establishment.fixedFee > 0 &&
                " + "}
              {establishment.fixedFee > 0 &&
                `${establishment.fixedFee} CHF par transaction`}
            </p>
          </div>
        )}

        {/* Gestion des chambres */}
        <div className="mb-8">
          <RoomManagement hotelSlug={hotel} currency="CHF" />
        </div>

        {/* Dashboard inventaire et réservations */}
        {finalIsStripeConfigured && dbRooms.length > 0 ? (
          <AdminDashboard
            establishment={establishment}
            rooms={roomsWithInventory}
            bookings={todayBookings}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">
              {!finalIsStripeConfigured ? "⚠️" : "🏨"}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {!finalIsStripeConfigured
                ? "Configuration Stripe requise"
                : "Ajoutez vos premières chambres"}
            </h2>
            <p className="text-gray-600">
              {!finalIsStripeConfigured
                ? "Veuillez d'abord configurer votre compte Stripe pour accepter les paiements."
                : "Créez vos types de chambres pour commencer à accepter des réservations."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
