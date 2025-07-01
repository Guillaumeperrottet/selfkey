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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header moderne avec gradient */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3">Dashboard Admin</h1>
            <h2 className="text-xl font-medium text-blue-100 mb-2">
              {establishment.name}
            </h2>
            <p className="text-blue-100/80 text-lg">
              Gestion des chambres, inventaire et configuration des paiements
            </p>
          </div>
          {/* Effet de particules/vague */}
          <div className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-indigo-400/30 rounded-full blur-sm"></div>
        </div>

        {/* Configuration Stripe avec design moderne */}
        <div className="mb-8">
          <StripeOnboarding hotelSlug={hotel} hotelName={establishment.name} />
        </div>

        {/* Affichage commission avec design moderne */}
        {(establishment.commissionRate > 0 || establishment.fixedFee > 0) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600">💳</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-900">
                Commission plateforme
              </h3>
            </div>
            <p className="text-blue-800 font-medium">
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

        {/* Gestion des chambres avec design moderne */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Gestion des chambres
              </h2>
            </div>
            <div className="p-6">
              <RoomManagement hotelSlug={hotel} currency="CHF" />
            </div>
          </div>
        </div>

        {/* Dashboard inventaire et réservations */}
        {finalIsStripeConfigured && dbRooms.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                Tableau de bord
              </h2>
            </div>
            <div className="p-6">
              <AdminDashboard
                establishment={establishment}
                rooms={roomsWithInventory}
                bookings={todayBookings}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="text-4xl">
                {!finalIsStripeConfigured ? "⚠️" : "🏨"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {!finalIsStripeConfigured
                ? "Configuration Stripe requise"
                : "Ajoutez vos premières chambres"}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
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
