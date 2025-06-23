import { prisma } from "./prisma";

export interface AvailableRoom {
  id: string;
  name: string;
  price: number;
  available: number;
}

export async function getAvailableRooms(
  hotelSlug: string
): Promise<AvailableRoom[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Récupérer les chambres actives de l'hôtel
  const rooms = await prisma.room.findMany({
    where: {
      hotelSlug,
      isActive: true,
    },
  });

  if (rooms.length === 0) {
    return [];
  }

  // Récupérer l'inventaire du jour
  const inventory = await prisma.dailyInventory.findMany({
    where: {
      hotelSlug,
      date: today,
      roomId: {
        in: rooms.map((r) => r.id),
      },
    },
  });

  // Compter les réservations du jour
  const bookings = await prisma.booking.groupBy({
    by: ["roomId"],
    where: {
      hotelSlug,
      roomId: {
        in: rooms.map((r) => r.id),
      },
      bookingDate: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      stripePaymentIntentId: {
        not: null, // Seulement les réservations payées
      },
    },
    _count: {
      id: true,
    },
  });

  const bookingCounts = Object.fromEntries(
    bookings.map((b) => [b.roomId, b._count.id])
  );

  const inventoryMap = Object.fromEntries(
    inventory.map((i) => [i.roomId, i.quantity])
  );

  return rooms
    .map((room) => ({
      id: room.id,
      name: room.name,
      price: room.price,
      available: Math.max(
        0,
        (inventoryMap[room.id] || 0) - (bookingCounts[room.id] || 0)
      ),
    }))
    .filter((room) => room.available > 0);
}

export async function updateInventory(
  hotelSlug: string,
  roomId: string,
  quantity: number
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Vérifier que la chambre existe et appartient à l'hôtel
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      hotelSlug,
      isActive: true,
    },
  });

  if (!room) {
    throw new Error("Chambre non trouvée");
  }

  await prisma.dailyInventory.upsert({
    where: {
      hotelSlug_roomId_date: {
        hotelSlug,
        roomId,
        date: today,
      },
    },
    update: {
      quantity,
    },
    create: {
      hotelSlug,
      roomId,
      date: today,
      quantity,
    },
  });
}

export async function resetInventoryForTomorrow(
  hotelSlug: string
): Promise<void> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  await prisma.dailyInventory.deleteMany({
    where: {
      hotelSlug,
      date: tomorrow,
    },
  });
}
