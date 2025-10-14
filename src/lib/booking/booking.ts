import { prisma } from "@/lib/database/prisma";
import { BookingData } from "@/types/hotel";
import { createPaymentIntentWithCommission } from "@/lib/payment/connect";

export async function createBooking(
  hotelSlug: string,
  bookingData: BookingData
) {
  // Si c'est un parking jour (pas de roomId), on skip la validation de chambre
  if (!bookingData.roomId) {
    // Récupérer les infos de l'établissement pour calculer la commission
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotelSlug },
    });

    if (!establishment) {
      throw new Error("Établissement non trouvé");
    }

    // Calculer la commission
    const platformCommission = Math.round(
      (bookingData.amount * establishment.commissionRate) / 100 +
        establishment.fixedFee
    );
    const ownerAmount = bookingData.amount - platformCommission;

    // Pour le parking jour, on crée directement la réservation
    const booking = await prisma.booking.create({
      data: {
        hotelSlug,
        roomId: null,
        clientFirstName: bookingData.clientFirstName,
        clientLastName: bookingData.clientLastName,
        clientEmail: bookingData.clientEmail,
        clientPhone: bookingData.clientPhone,
        clientBirthDate: bookingData.clientBirthDate,
        clientAddress: bookingData.clientAddress,
        clientPostalCode: bookingData.clientPostalCode,
        clientCity: bookingData.clientCity,
        clientCountry: bookingData.clientCountry,
        clientIdNumber: bookingData.clientIdNumber,
        clientIdType: bookingData.clientIdType,
        guests: bookingData.guests,
        amount: bookingData.amount,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        bookingType: "day",
        currency: "CHF",
        platformCommission,
        ownerAmount,
        hasDog: bookingData.hasDog || false,
        bookingLocale: bookingData.bookingLocale || "fr",
      },
    });
    return booking;
  }

  // Vérifier que la chambre existe et appartient à l'hôtel (pour parking de nuit)
  const room = await prisma.room.findFirst({
    where: {
      id: bookingData.roomId,
      hotelSlug,
      isActive: true,
    },
  });

  if (!room) {
    throw new Error("Chambre non trouvée");
  }

  // Vérifier que le prix correspond
  if (bookingData.amount !== room.price) {
    throw new Error("Prix incorrect");
  }

  // Une chambre = une disponibilité unique
  // Vérifier qu'il n'y a pas déjà une réservation pour cette chambre aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const existingBooking = await prisma.booking.findFirst({
    where: {
      hotelSlug,
      roomId: bookingData.roomId,
      bookingDate: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (existingBooking) {
    throw new Error("Cette chambre est déjà réservée pour aujourd'hui");
  }

  // Récupérer les infos de l'établissement pour calculer la commission
  const establishment = await prisma.establishment.findUnique({
    where: { slug: hotelSlug },
  });

  if (!establishment) {
    throw new Error("Établissement non trouvé");
  }

  // Calculer la commission
  const platformCommission = Math.round(
    (bookingData.amount * establishment.commissionRate) / 100 +
      establishment.fixedFee
  );
  const ownerAmount = bookingData.amount - platformCommission;

  // Créer la réservation
  const booking = await prisma.booking.create({
    data: {
      hotelSlug,
      roomId: bookingData.roomId,
      clientFirstName: bookingData.clientFirstName,
      clientLastName: bookingData.clientLastName,
      clientEmail: bookingData.clientEmail,
      clientPhone: bookingData.clientPhone,
      clientBirthDate: bookingData.clientBirthDate,
      clientAddress: bookingData.clientAddress,
      clientPostalCode: bookingData.clientPostalCode,
      clientCity: bookingData.clientCity,
      clientCountry: bookingData.clientCountry,
      clientIdNumber: bookingData.clientIdNumber,
      clientIdType: bookingData.clientIdType,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      guests: bookingData.guests,
      amount: bookingData.amount,
      currency: "CHF",
      platformCommission,
      ownerAmount,
      hasDog: bookingData.hasDog || false,
      bookingLocale: bookingData.bookingLocale || "fr",
    },
  });

  return booking;
}

export async function createPaymentIntentForBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { establishment: true },
  });

  if (!booking) {
    throw new Error("Réservation non trouvée");
  }

  if (!booking.establishment.stripeAccountId) {
    throw new Error("Compte Stripe non configuré pour cet établissement");
  }

  // Déterminer le taux de commission selon le type de réservation
  const commissionRate =
    booking.bookingType === "day"
      ? booking.establishment.dayParkingCommissionRate
      : booking.establishment.commissionRate;

  // Pour le parking jour, pas de frais fixes
  const fixedFee =
    booking.bookingType === "day" ? 0 : booking.establishment.fixedFee;

  const paymentIntent = await createPaymentIntentWithCommission(
    booking.amount,
    booking.currency,
    booking.establishment.stripeAccountId,
    commissionRate,
    fixedFee
  );

  return paymentIntent;
}

export async function updateBookingWithPayment(
  bookingId: string,
  paymentIntentId: string
) {
  return await prisma.booking.update({
    where: { id: bookingId },
    data: {
      stripePaymentIntentId: paymentIntentId,
      paymentStatus: "succeeded", // Marquer le paiement comme réussi
    },
  });
}
