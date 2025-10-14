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
    clientFirstName: string;
    clientLastName: string;
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
      paymentStatus: "succeeded", // Seulement les réservations payées
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
      clientFirstName: true,
      clientLastName: true,
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
  checkOutDate?: Date,
  hasDog?: boolean
): Promise<AvailableRoom[]> {
  // Si pas de dates spécifiées, utiliser la logique actuelle (aujourd'hui)
  if (!checkInDate || !checkOutDate) {
    return getAvailableRoomsToday(hotelSlug, hasDog);
  }

  // Vérifier si l'établissement a l'option chien activée
  const establishment = await prisma.establishment.findUnique({
    where: { slug: hotelSlug },
    select: { enableDogOption: true },
  });

  // Préparer les filtres pour les chambres
  const roomFilters: {
    hotelSlug: string;
    isActive: boolean;
    allowDogs?: boolean;
  } = {
    hotelSlug,
    isActive: true,
  };

  // Si l'option chien est activée dans l'établissement, filtrer selon le choix du client
  if (establishment?.enableDogOption) {
    console.log("DEBUG: Dog option is enabled for establishment");
    if (hasDog === true) {
      // Client avec chien : montrer seulement les chambres qui acceptent les chiens
      roomFilters.allowDogs = true;
      console.log(
        "DEBUG: Client has dog - filtering for rooms that allow dogs"
      );
    } else if (hasDog === false) {
      // Client sans chien : montrer seulement les chambres qui n'acceptent PAS les chiens
      roomFilters.allowDogs = false;
      console.log(
        "DEBUG: Client has NO dog - filtering for rooms that do NOT allow dogs"
      );
    }
    // Si hasDog est undefined, on ne filtre pas (affiche toutes les chambres)
  } else {
    console.log("DEBUG: Dog option is NOT enabled for establishment");
  }

  console.log("DEBUG: Room filters applied:", roomFilters);

  // Récupérer les chambres actives de l'hôtel avec les filtres appropriés
  const rooms = await prisma.room.findMany({
    where: roomFilters,
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

    // Ne retourner que les chambres disponibles
    if (availability.isAvailable) {
      availableRooms.push({
        id: room.id,
        name: room.name,
        price: room.price,
        available: 1,
      });
    }
  }

  return availableRooms;
}

/**
 * Version legacy pour la compatibilité - chambres disponibles aujourd'hui
 */
async function getAvailableRoomsToday(
  hotelSlug: string,
  hasDog?: boolean
): Promise<AvailableRoom[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Vérifier si l'établissement a l'option chien activée
  const establishment = await prisma.establishment.findUnique({
    where: { slug: hotelSlug },
    select: { enableDogOption: true },
  });

  // Préparer les filtres pour les chambres
  const roomFilters: {
    hotelSlug: string;
    isActive: boolean;
    allowDogs?: boolean;
  } = {
    hotelSlug,
    isActive: true,
  };

  // Si l'option chien est activée dans l'établissement, filtrer selon le choix du client
  if (establishment?.enableDogOption) {
    if (hasDog === true) {
      // Client avec chien : montrer seulement les chambres qui acceptent les chiens
      roomFilters.allowDogs = true;
    } else if (hasDog === false) {
      // Client sans chien : montrer seulement les chambres qui n'acceptent PAS les chiens
      roomFilters.allowDogs = false;
    }
    // Si hasDog est undefined, on ne filtre pas (affiche toutes les chambres)
  }

  // Récupérer les chambres actives de l'hôtel avec les filtres appropriés
  const rooms = await prisma.room.findMany({
    where: roomFilters,
  });

  if (rooms.length === 0) {
    return [];
  }

  // Récupérer les IDs des chambres déjà réservées aujourd'hui (avec paiement confirmé)
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
        paymentStatus: "succeeded", // Seulement les réservations payées
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

/**
 * Obtient l'heure actuelle avec le fuseau horaire correct
 */
export function getCurrentDateTime(): Date {
  return new Date();
}

/**
 * Vérifie si une chambre est actuellement disponible en tenant compte
 * de l'heure de checkout configurable
 */
export async function isRoomCurrentlyAvailable(
  roomId: string,
  hotelSlug: string
): Promise<boolean> {
  const now = getCurrentDateTime();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Récupérer les paramètres de l'établissement pour l'heure de checkout
  const establishment = await prisma.establishment.findFirst({
    where: { slug: hotelSlug },
    select: { checkoutTime: true },
  });

  const checkoutTime = establishment?.checkoutTime || "12:00";
  const [checkoutHour, checkoutMinute] = checkoutTime.split(":").map(Number);

  // Récupérer les réservations qui pourraient affecter la disponibilité aujourd'hui
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      roomId,
      hotelSlug,
      OR: [
        // Réservations qui arrivent aujourd'hui (check-in aujourd'hui)
        {
          checkInDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        // Réservations qui partent aujourd'hui (check-out aujourd'hui)
        {
          checkOutDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        // Réservations qui englobent aujourd'hui
        {
          AND: [
            { checkInDate: { lt: today } },
            { checkOutDate: { gt: today } },
          ],
        },
      ],
      // Seulement les réservations avec paiement confirmé
      paymentStatus: "succeeded",
    },
  });

  if (conflictingBookings.length === 0) {
    return true; // Aucune réservation, chambre disponible
  }

  // Vérifier les règles spécifiques selon l'heure
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const checkoutTimeInMinutes = checkoutHour * 60 + checkoutMinute;

  for (const booking of conflictingBookings) {
    // Si la réservation part aujourd'hui
    if (booking.checkOutDate.toDateString() === today.toDateString()) {
      // Avant l'heure de checkout : chambre occupée
      // Après l'heure de checkout : chambre disponible
      if (currentTimeInMinutes < checkoutTimeInMinutes) {
        return false;
      }
    }

    // Si la réservation arrive aujourd'hui
    if (booking.checkInDate.toDateString() === today.toDateString()) {
      // La chambre devient occupée dès l'arrivée prévue
      return false;
    }

    // Si la réservation englobe aujourd'hui (check-in avant aujourd'hui, check-out après aujourd'hui)
    if (booking.checkInDate < today && booking.checkOutDate > tomorrow) {
      return false;
    }
  }

  return true;
}

/**
 * Obtient la liste des chambres actuellement disponibles pour un hôtel
 * en tenant compte de l'heure de checkout
 */
export async function getCurrentlyAvailableRooms(hotelSlug: string): Promise<
  Array<{
    id: string;
    name: string;
    price: number;
    isActive: boolean;
    available: boolean;
  }>
> {
  // Récupérer toutes les chambres actives
  const rooms = await prisma.room.findMany({
    where: {
      hotelSlug,
      isActive: true,
    },
  });

  // Vérifier la disponibilité de chaque chambre
  const roomsWithAvailability = await Promise.all(
    rooms.map(async (room) => {
      const available = await isRoomCurrentlyAvailable(room.id, hotelSlug);
      return {
        id: room.id,
        name: room.name,
        price: room.price,
        isActive: room.isActive,
        available,
      };
    })
  );

  return roomsWithAvailability;
}
