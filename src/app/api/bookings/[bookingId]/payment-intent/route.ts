import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

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

    if (!booking.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "PaymentIntent non trouvé pour cette réservation" },
        { status: 404 }
      );
    }

    // Récupérer le PaymentIntent depuis Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      booking.stripePaymentIntentId,
      {
        stripeAccount: booking.establishment.stripeAccountId || undefined,
      }
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
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
