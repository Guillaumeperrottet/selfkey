import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification super admin
    const session = request.cookies.get("super-admin-session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les données Stripe
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Récupérer les PaymentIntents des dernières 24h avec expansion des charges
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      created: {
        gte: Math.floor(today.getTime() / 1000),
      },
      expand: ["data.charges"],
    });

    // Récupérer tous les paiements récents (derniers 30 jours) avec expansion
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allPaymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      created: {
        gte: Math.floor(thirtyDaysAgo.getTime() / 1000),
      },
      expand: ["data.charges"],
    });

    // Récupérer les transfers pour voir les commissions réellement prélevées
    const transfers = await stripe.transfers.list({
      limit: 100,
      created: {
        gte: Math.floor(thirtyDaysAgo.getTime() / 1000),
      },
    });

    // Créer un mapping des transfers
    const transferMap = new Map();
    transfers.data.forEach((transfer) => {
      if (transfer.source_transaction) {
        transferMap.set(transfer.source_transaction, transfer);
      }
    });

    // Récupérer toutes les réservations des 30 derniers jours
    const allBookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        establishment: {
          select: {
            name: true,
            stripeAccountId: true,
          },
        },
        room: {
          select: {
            name: true,
          },
        },
      },
    });

    // Créer un mapping des réservations par PaymentIntent
    const bookingMap = new Map();
    allBookings.forEach((booking) => {
      if (booking.stripePaymentIntentId) {
        bookingMap.set(booking.stripePaymentIntentId, booking);
      }
    });

    // Transformer les données Stripe en format utilisable
    const payments = allPaymentIntents.data.map((pi) => {
      const booking = bookingMap.get(pi.id);
      const transfer = transferMap.get(pi.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const charge = (pi as any).charges?.data[0]; // Type assertion temporaire

      return {
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        created: pi.created,
        applicationFeeAmount: pi.application_fee_amount || 0,
        connectedAccountId: pi.transfer_data?.destination || "N/A",
        establishmentName: booking?.establishment?.name || "Inconnu",
        bookingId: booking?.id || "N/A",
        clientEmail: booking?.clientEmail || "N/A",
        paymentMethod: charge?.payment_method_details?.type || "card",
        transferId: transfer?.id,
        refunded: (charge?.amount_refunded || 0) > 0,
        refundAmount: charge?.amount_refunded || 0,
      };
    });

    // Calculer les statistiques
    const totalPayments = allPaymentIntents.data.length;
    const totalCommissions = allPaymentIntents.data.reduce(
      (sum, pi) => sum + (pi.application_fee_amount || 0),
      0
    );
    const totalRefunds = allPaymentIntents.data.reduce((sum, pi) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const charge = (pi as any).charges?.data[0];
      return sum + (charge?.amount_refunded || 0);
    }, 0);
    const successfulPayments = allPaymentIntents.data.filter(
      (pi) => pi.status === "succeeded"
    ).length;
    const successRate =
      totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
    const pendingPayments = allPaymentIntents.data.filter(
      (pi) => pi.status === "processing" || pi.status === "requires_action"
    ).length;

    // Paiements d'aujourd'hui
    const paymentsToday = paymentIntents.data.length;
    const commissionsToday = paymentIntents.data.reduce(
      (sum, pi) => sum + (pi.application_fee_amount || 0),
      0
    );

    // Comptes connectés
    const connectedAccounts = await prisma.establishment.count({
      where: {
        stripeAccountId: {
          not: null,
        },
      },
    });

    // Taux de commission moyen
    const establishmentsWithCommission = await prisma.establishment.findMany({
      select: {
        commissionRate: true,
      },
      where: {
        commissionRate: {
          gt: 0,
        },
      },
    });

    const averageCommissionRate =
      establishmentsWithCommission.length > 0
        ? establishmentsWithCommission.reduce(
            (sum, est) => sum + est.commissionRate,
            0
          ) / establishmentsWithCommission.length
        : 0;

    const stats = {
      totalPayments,
      totalCommissions,
      totalRefunds,
      successRate,
      averageCommissionRate,
      paymentsToday,
      commissionsToday,
      connectedAccounts,
      pendingPayments,
    };

    return NextResponse.json({
      payments: payments.slice(0, 50), // Limiter aux 50 plus récents
      stats,
    });
  } catch (error) {
    console.error("Erreur lors du monitoring Stripe:", error);
    return NextResponse.json(
      { error: "Erreur lors du monitoring Stripe" },
      { status: 500 }
    );
  }
}
