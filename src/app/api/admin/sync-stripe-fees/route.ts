import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Endpoint pour synchroniser les frais Stripe sur toutes les réservations
 * Récupère le balance_transaction de chaque PaymentIntent pour obtenir les frais exacts
 */
export async function POST() {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les réservations avec PaymentIntent mais sans stripeFee
    const bookingsWithoutFees = await prisma.booking.findMany({
      where: {
        stripePaymentIntentId: {
          not: null,
        },
        paymentStatus: "succeeded",
        stripeFee: null, // Seulement celles sans frais déjà calculés
      },
      select: {
        id: true,
        stripePaymentIntentId: true,
        hotelSlug: true,
      },
    });

    console.log(
      `🔄 Synchronisation des frais Stripe pour ${bookingsWithoutFees.length} réservations...`
    );

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ bookingId: string; error: string }> = [];

    // Traiter chaque réservation
    for (const booking of bookingsWithoutFees) {
      try {
        if (!booking.stripePaymentIntentId) continue;

        // Récupérer le PaymentIntent avec le balance_transaction
        const paymentIntent = await stripe.paymentIntents.retrieve(
          booking.stripePaymentIntentId,
          {
            expand: ["latest_charge", "latest_charge.balance_transaction"],
          }
        );

        // Extraire les frais du balance_transaction
        const charge = paymentIntent.latest_charge as Stripe.Charge | null;
        const balanceTransaction =
          charge?.balance_transaction as Stripe.BalanceTransaction | null;

        if (balanceTransaction && balanceTransaction.fee) {
          // Convertir les centimes en francs
          const feeInCHF = balanceTransaction.fee / 100;

          // Mettre à jour la réservation avec les frais
          await prisma.booking.update({
            where: { id: booking.id },
            data: { stripeFee: feeInCHF },
          });

          successCount++;
          console.log(
            `✅ Booking ${booking.id}: CHF ${feeInCHF.toFixed(2)} de frais Stripe`
          );
        } else {
          console.warn(
            `⚠️  Booking ${booking.id}: Pas de balance_transaction trouvé`
          );
          errorCount++;
          errors.push({
            bookingId: booking.id,
            error: "Balance transaction non trouvée",
          });
        }
      } catch (error) {
        console.error(`❌ Erreur pour booking ${booking.id}:`, error);
        errorCount++;
        errors.push({
          bookingId: booking.id,
          error: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synchronisation terminée : ${successCount} réussies, ${errorCount} erreurs`,
      stats: {
        total: bookingsWithoutFees.length,
        success: successCount,
        errors: errorCount,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Erreur lors de la synchronisation des frais Stripe:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la synchronisation",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * GET pour obtenir le statut de la synchronisation
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Compter les réservations
    const [totalWithPayment, withFees, withoutFees] = await Promise.all([
      prisma.booking.count({
        where: {
          stripePaymentIntentId: { not: null },
          paymentStatus: "succeeded",
        },
      }),
      prisma.booking.count({
        where: {
          stripePaymentIntentId: { not: null },
          paymentStatus: "succeeded",
          stripeFee: { not: null },
        },
      }),
      prisma.booking.count({
        where: {
          stripePaymentIntentId: { not: null },
          paymentStatus: "succeeded",
          stripeFee: null,
        },
      }),
    ]);

    return NextResponse.json({
      total: totalWithPayment,
      synchronized: withFees,
      pending: withoutFees,
      percentage:
        totalWithPayment > 0
          ? ((withFees / totalWithPayment) * 100).toFixed(1)
          : 0,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du statut de synchronisation:",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
