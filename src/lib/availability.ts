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

  // Récupérer les IDs des chambres déjà réservées aujourd'hui
  const bookedRoomIds = await prisma.booking
    .findMany({
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
          not: null, // Seulement les réservations confirmées
        },
      },
      select: {
        roomId: true,
      },
    })
    .then((bookings) => bookings.map((b) => b.roomId));

  // Calculer la disponibilité pour chaque chambre
  return rooms.map((room) => ({
    id: room.id,
    name: room.name,
    price: room.price,
    available: bookedRoomIds.includes(room.id) ? 0 : 1, // 0 si réservée, 1 si disponible
  }));
}

/**
 * Vérifier la disponibilité d'une chambre spécifique
 */
export async function isRoomAvailable(
  hotelSlug: string,
  roomId: string,
  date: Date = new Date()
): Promise<boolean> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Vérifier que la chambre existe et est active
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      hotelSlug,
      isActive: true,
    },
  });

  if (!room) {
    return false;
  }

  // Vérifier s'il y a une réservation confirmée pour cette chambre ce jour
  const existingBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      hotelSlug,
      bookingDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      stripePaymentIntentId: {
        not: null,
      },
    },
  });

  return !existingBooking;
}
