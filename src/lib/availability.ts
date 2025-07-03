import { prisma } from "./prisma";

export interface AvailableRoom {
  id: string;
  name: string;
  price: number;
  available: number;
}

export interface BookingDateRange {
  checkInDate: Date;
  checkOutDate: Date;
}

export interface AvailabilityCheck {
  isAvailable: boolean;
  conflictingBookings?: Array<{
    id: string;
    checkInDate: Date;
    checkOutDate: Date;
    clientName: string;
  }>;
}

/**
 * Vérifie si une chambre est disponible pour une période donnée
 */
export async function checkRoomAvailability(
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date,
  excludeBookingId?: string
): Promise<AvailabilityCheck> {
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      roomId,
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      OR: [
        // Cas 1: La nouvelle réservation commence pendant une réservation existante
        {
          AND: [
            { checkInDate: { lte: checkInDate } },
            { checkOutDate: { gt: checkInDate } },
          ],
        },
        // Cas 2: La nouvelle réservation se termine pendant une réservation existante
        {
          AND: [
            { checkInDate: { lt: checkOutDate } },
            { checkOutDate: { gte: checkOutDate } },
          ],
        },
        // Cas 3: La nouvelle réservation englobe complètement une réservation existante
        {
          AND: [
            { checkInDate: { gte: checkInDate } },
            { checkOutDate: { lte: checkOutDate } },
          ],
        },
        // Cas 4: Une réservation existante englobe complètement la nouvelle réservation
        {
          AND: [
            { checkInDate: { lte: checkInDate } },
            { checkOutDate: { gte: checkOutDate } },
          ],
        },
      ],
    },
    select: {
      id: true,
      checkInDate: true,
      checkOutDate: true,
      clientName: true,
    },
  });

  return {
    isAvailable: conflictingBookings.length === 0,
    conflictingBookings:
      conflictingBookings.length > 0 ? conflictingBookings : undefined,
  };
}

/**
 * Calcule la durée de séjour en jours
 */
export function calculateStayDuration(
  checkInDate: Date,
  checkOutDate: Date
): number {
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * Valide les dates de réservation
 */
export function validateBookingDates(
  checkInDate: Date,
  checkOutDate: Date,
  maxBookingDays: number
): { isValid: boolean; error?: string } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Vérifier que la date d'arrivée n'est pas dans le passé
  if (checkInDate < now) {
    return {
      isValid: false,
      error: "La date d'arrivée ne peut pas être dans le passé",
    };
  }

  // Vérifier que la date de départ est après la date d'arrivée
  if (checkOutDate <= checkInDate) {
    return {
      isValid: false,
      error: "La date de départ doit être après la date d'arrivée",
    };
  }

  // Vérifier la durée maximale
  const duration = calculateStayDuration(checkInDate, checkOutDate);
  if (duration > maxBookingDays) {
    return {
      isValid: false,
      error: `La durée de séjour ne peut pas dépasser ${maxBookingDays} jour${maxBookingDays > 1 ? "s" : ""}`,
    };
  }

  return { isValid: true };
}

/**
 * Récupère les chambres disponibles pour une période donnée
 */
export async function getAvailableRooms(
  hotelSlug: string,
  checkInDate?: Date,
  checkOutDate?: Date
): Promise<AvailableRoom[]> {
  // Si pas de dates spécifiées, utiliser la logique actuelle (aujourd'hui)
  if (!checkInDate || !checkOutDate) {
    return getAvailableRoomsToday(hotelSlug);
  }

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

  // Vérifier la disponibilité pour chaque chambre
  const availableRooms: AvailableRoom[] = [];

  for (const room of rooms) {
    const availability = await checkRoomAvailability(
      room.id,
      checkInDate,
      checkOutDate
    );

    availableRooms.push({
      id: room.id,
      name: room.name,
      price: room.price,
      available: availability.isAvailable ? 1 : 0,
    });
  }

  return availableRooms;
}

/**
 * Version legacy pour la compatibilité - chambres disponibles aujourd'hui
 */
async function getAvailableRoomsToday(
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
    available: bookedRoomIds.includes(room.id) ? 0 : 1,
  }));
}
