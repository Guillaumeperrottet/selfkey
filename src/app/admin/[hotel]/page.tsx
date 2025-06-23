import { notFound } from "next/navigation";
import { getHotelConfig } from "@/lib/hotel-config";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/AdminDashboard";
import { StripeOnboarding } from "@/components/StripeOnboarding";
import { RoomManagement } from "@/components/RoomManagement";

interface Props {
  params: { hotel: string };
}

export default async function AdminPage({ params }: Props) {
  const { hotel } = params;

  const config = await getHotelConfig(hotel);
  if (!config) {
    notFound();
  }

  // Récupérer ou créer l'établissement
  let establishment = await prisma.establishment.findUnique({
    where: { slug: hotel },
  });

  if (!establishment) {
    establishment = await prisma.establishment.create({
      data: {
        slug: hotel,
        name: config.name,
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

  // Récupérer l'inventaire actuel
  const inventory = await prisma.dailyInventory.findMany({
    where: {
      hotelSlug: hotel,
      date: today,
    },
  });

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

  const inventoryMap = Object.fromEntries(
    inventory.map((i) => [i.roomId, i.quantity])
  );

  const roomsWithInventory = dbRooms.map((room) => ({
    id: room.id,
    name: room.name,
    price: room.price,
    inventory: inventoryMap[room.id] || 0,
  }));

  const isStripeConfigured =
    establishment.stripeAccountId && establishment.stripeOnboarded;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
            Dashboard Admin - {config.name}
          </h1>
          <p className="text-gray-600">
            Gestion des chambres, inventaire et configuration des paiements
          </p>
        </div>

        {/* Configuration Stripe */}
        <div className="mb-8">
          <StripeOnboarding hotelSlug={hotel} hotelName={config.name} />
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
          <RoomManagement hotelSlug={hotel} currency={config.currency} />
        </div>

        {/* Dashboard inventaire et réservations */}
        {isStripeConfigured && dbRooms.length > 0 ? (
          <AdminDashboard
            hotelSlug={hotel}
            hotelConfig={config}
            rooms={roomsWithInventory}
            bookings={todayBookings}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">
              {!isStripeConfigured ? "⚠️" : "🏨"}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {!isStripeConfigured
                ? "Configuration Stripe requise"
                : "Ajoutez vos premières chambres"}
            </h2>
            <p className="text-gray-600">
              {!isStripeConfigured
                ? "Veuillez d'abord configurer votre compte Stripe pour accepter les paiements."
                : "Créez vos types de chambres pour commencer à accepter des réservations."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
