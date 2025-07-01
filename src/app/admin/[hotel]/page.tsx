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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header simplifié */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {establishment.name}
              </h1>
              <p className="text-gray-600">Administration</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{new Date().toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
        </header>

        {/* Grid layout pour organiser les sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Stripe */}
          <div className="lg:col-span-3">
            <StripeOnboarding
              hotelSlug={hotel}
              hotelName={establishment.name}
            />
          </div>

          {/* Commission info - si présente */}
          {(establishment.commissionRate > 0 || establishment.fixedFee > 0) && (
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Commission</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {establishment.commissionRate > 0 &&
                    `${establishment.commissionRate}% du montant`}
                  {establishment.commissionRate > 0 &&
                    establishment.fixedFee > 0 &&
                    " + "}
                  {establishment.fixedFee > 0 &&
                    `${establishment.fixedFee} CHF par transaction`}
                </p>
              </div>
            </div>
          )}

          {/* Gestion des chambres */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="font-medium text-gray-900">Chambres</h2>
              </div>
              <div className="p-4">
                <RoomManagement hotelSlug={hotel} currency="CHF" />
              </div>
            </div>
          </div>

          {/* Dashboard ou état */}
          <div className="lg:col-span-1">
            {finalIsStripeConfigured && dbRooms.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="font-medium text-gray-900">
                    Aujourd&apos;hui
                  </h2>
                </div>
                <div className="p-4">
                  <AdminDashboard
                    establishment={establishment}
                    rooms={roomsWithInventory}
                    bookings={todayBookings}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">
                    {!finalIsStripeConfigured ? "⚠️" : "🏨"}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {!finalIsStripeConfigured
                    ? "Configuration requise"
                    : "Première chambre"}
                </h3>
                <p className="text-sm text-gray-500">
                  {!finalIsStripeConfigured
                    ? "Configurez Stripe pour accepter les paiements"
                    : "Ajoutez votre première chambre pour commencer"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
