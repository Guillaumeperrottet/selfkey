import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateBookingDates,
  checkRoomAvailability,
} from "@/lib/availability";
import { createPaymentIntentWithCommission } from "@/lib/stripe-connect";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;
    const body = await request.json();
    const {
      roomId,
      checkInDate,
      checkOutDate,
      clientFirstName,
      clientLastName,
      clientEmail,
      clientPhone,
      clientBirthDate,
      clientAddress,
      clientPostalCode,
      clientCity,
      clientCountry,
      clientIdNumber,
      expectedPrice,
    } = body;

    // Validation des données
    if (
      !roomId ||
      !checkInDate ||
      !checkOutDate ||
      !clientFirstName ||
      !clientLastName ||
      !clientEmail ||
      !clientPhone ||
      !clientBirthDate ||
      !clientAddress ||
      !clientPostalCode ||
      !clientCity ||
      !clientCountry ||
      !clientIdNumber ||
      typeof expectedPrice !== "number"
    ) {
      return NextResponse.json(
        { error: "Données manquantes ou invalides" },
        { status: 400 }
      );
    }

    // Vérifier que l'hôtel existe
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: {
        id: true,
        name: true,
        maxBookingDays: true,
        stripeAccountId: true,
      },
    });

    if (!establishment) {
      return NextResponse.json({ error: "Hôtel non trouvé" }, { status: 404 });
    }

    // Valider les dates
    const validation = validateBookingDates(
      checkInDate,
      checkOutDate,
      establishment.maxBookingDays
    );

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Vérifier que la chambre existe
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        hotelSlug: hotel,
        isActive: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Chambre non trouvée" },
        { status: 404 }
      );
    }

    // Calculer le prix attendu
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    const calculatedPrice = room.price * nights;

    // Vérifier que le prix correspond
    if (expectedPrice !== calculatedPrice) {
      return NextResponse.json({ error: "Prix incorrect" }, { status: 400 });
    }

    // Vérifier la disponibilité de la chambre
    const availability = await checkRoomAvailability(roomId, checkIn, checkOut);

    if (!availability.isAvailable) {
      return NextResponse.json(
        {
          error:
            "Cette chambre n'est pas disponible pour la période sélectionnée",
        },
        { status: 409 }
      );
    }

    // Vérifier que Stripe est configuré
    if (!establishment.stripeAccountId) {
      return NextResponse.json(
        { error: "Paiements non configurés pour cet établissement" },
        { status: 503 }
      );
    }

    // Calculer les commissions
    const platformCommission = 0; // À implémenter selon les règles de commission
    const ownerAmount = calculatedPrice - platformCommission;

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        hotelSlug: hotel,
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        clientFirstName,
        clientLastName,
        clientEmail,
        clientPhone,
        clientBirthDate: new Date(clientBirthDate),
        clientAddress,
        clientPostalCode,
        clientCity,
        clientCountry,
        clientIdNumber,
        guests: 1, // TODO: ajouter le nombre d'invités au formulaire si nécessaire
        amount: calculatedPrice,
        platformCommission,
        ownerAmount,
      },
    });

    // Créer le Payment Intent Stripe
    const paymentIntent = await createPaymentIntentWithCommission(
      calculatedPrice,
      "chf", // Devise par défaut
      establishment.stripeAccountId,
      platformCommission
    );

    // Mettre à jour la réservation avec l'ID du PaymentIntent
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Erreur API booking:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
