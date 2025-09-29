import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaymentIntentWithCommission } from "@/lib/stripe-connect";

interface Props {
  params: Promise<{ bookingId: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { bookingId } = await params;

    // Récupérer la réservation avec les détails de l'établissement
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        establishment: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'établissement a Stripe configuré
    if (!booking.establishment.stripeAccountId) {
      return NextResponse.json(
        { error: "Paiements non configurés pour cet établissement" },
        { status: 503 }
      );
    }

    // Si le PaymentIntent existe déjà, tenter de le récupérer
    if (booking.stripePaymentIntentId) {
      try {
        // Si on a déjà un PaymentIntent, on peut recréer le clientSecret
        // En fait, on va simplement créer un nouveau PaymentIntent pour être sûr
        // car récupérer le clientSecret depuis Stripe est complexe avec Connect
        console.log("PaymentIntent existant trouvé, création d'un nouveau...");
      } catch (error) {
        console.warn(
          "Impossible de récupérer le PaymentIntent existant:",
          error
        );
      }
    }

    // Déterminer le taux de commission selon le type de réservation
    const commissionRate =
      booking.bookingType === "day"
        ? booking.establishment.dayParkingCommissionRate
        : booking.establishment.commissionRate;

    // Préparer les métadonnées client pour Twint
    const clientMetadata = {
      booking_id: booking.id,
      client_name: `${booking.clientFirstName} ${booking.clientLastName}`,
      client_email: booking.clientEmail,
      client_phone: booking.clientPhone,
      client_address: booking.clientAddress,
      client_city: booking.clientCity,
      client_postal_code: booking.clientPostalCode,
      client_country: booking.clientCountry,
      hotel_slug: booking.hotelSlug,
      booking_type: booking.bookingType || "classic_booking",
    };

    // Créer un nouveau PaymentIntent
    const paymentIntent = await createPaymentIntentWithCommission(
      booking.amount,
      booking.currency.toLowerCase(),
      booking.establishment.stripeAccountId,
      commissionRate,
      booking.establishment.fixedFee,
      clientMetadata
    );

    // Mettre à jour la réservation avec le nouveau PaymentIntent
    await prisma.booking.update({
      where: { id: bookingId },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    const clientSecret = paymentIntent.client_secret || "";

    return NextResponse.json({
      clientSecret,
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Erreur récupération PaymentIntent:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
