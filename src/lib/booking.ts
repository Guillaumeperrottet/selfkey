import { prisma } from "./prisma";
import { BookingData } from "@/types/hotel";
import { createPaymentIntentWithCommission } from "./stripe-connect";

export async function createBooking(
  hotelSlug: string,
  bookingData: BookingData
) {
  // Vérifier la disponibilité avant de créer la réservation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Vérifier que la chambre existe et appartient à l'hôtel
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

  const inventory = await prisma.dailyInventory.findUnique({
    where: {
      hotelSlug_roomId_date: {
        hotelSlug,
        roomId: bookingData.roomId,
        date: today,
      },
    },
  });

  const bookingCount = await prisma.booking.count({
    where: {
      hotelSlug,
      roomId: bookingData.roomId,
      bookingDate: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      stripePaymentIntentId: {
        not: null, // Seulement les réservations payées
      },
    },
  });

  const available = (inventory?.quantity || 0) - bookingCount;

  if (available <= 0) {
    throw new Error("Chambre non disponible");
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
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      phone: bookingData.phone,
      amount: bookingData.amount,
      currency: "CHF",
      platformCommission,
      ownerAmount,
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

  const paymentIntent = await createPaymentIntentWithCommission(
    booking.amount,
    booking.currency,
    booking.establishment.stripeAccountId,
    booking.platformCommission
  );

  return paymentIntent;
}

export async function updateBookingWithPayment(
  bookingId: string,
  paymentIntentId: string
) {
  return await prisma.booking.update({
    where: { id: bookingId },
    data: { stripePaymentIntentId: paymentIntentId },
  });
}
