import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification super admin
    const session = request.cookies.get("super-admin-session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les dernières réservations avec paiements réussis et détails des commissions
    const recentBookings = await prisma.booking.findMany({
      where: {
        paymentStatus: "succeeded",
      },
      take: 10,
      orderBy: { bookingDate: "desc" },
      include: {
        establishment: {
          select: {
            name: true,
            slug: true,
            commissionRate: true,
            fixedFee: true,
          },
        },
        room: {
          select: {
            name: true,
          },
        },
      },
    });

    // Vérifier les calculs de commission pour chaque réservation
    const bookingsWithValidation = recentBookings.map((booking) => {
      // Recalculer la commission attendue de manière précise
      const amountRappen = Math.round(booking.amount * 100);
      const commissionRappen = Math.round(
        (amountRappen * booking.establishment.commissionRate) / 100
      );
      const fixedFeeRappen = Math.round(booking.establishment.fixedFee * 100);
      const expectedCommissionRappen = commissionRappen + fixedFeeRappen;
      const expectedCommission = expectedCommissionRappen / 100;

      const isCommissionCorrect =
        Math.abs(booking.platformCommission - expectedCommission) < 0.01; // Tolérance de 1 centime
      const commissionDifference =
        Math.round((booking.platformCommission - expectedCommission) * 100) /
        100;

      return {
        id: booking.id,
        bookingDate: booking.bookingDate,
        establishmentName: booking.establishment.name,
        establishmentSlug: booking.establishment.slug,
        roomName: booking.room ? booking.room.name : "Parking jour",
        amount: booking.amount,
        currency: booking.currency,
        commissionRate: booking.establishment.commissionRate,
        fixedFee: booking.establishment.fixedFee,
        actualCommission: booking.platformCommission,
        expectedCommission,
        isCommissionCorrect,
        commissionDifference,
        clientEmail: booking.clientEmail,
        stripePaymentIntentId: booking.stripePaymentIntentId,
      };
    });

    // Statistiques globales
    const totalCommissions = recentBookings.reduce(
      (sum, booking) => sum + booking.platformCommission,
      0
    );
    const commissionsCorrect = bookingsWithValidation.filter(
      (b) => b.isCommissionCorrect
    ).length;
    const commissionsIncorrect = bookingsWithValidation.filter(
      (b) => !b.isCommissionCorrect
    ).length;

    return NextResponse.json({
      summary: {
        totalBookings: recentBookings.length,
        totalCommissions,
        commissionsCorrect,
        commissionsIncorrect,
        accuracy:
          recentBookings.length > 0
            ? (commissionsCorrect / recentBookings.length) * 100
            : 0,
      },
      bookings: bookingsWithValidation,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification des commissions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}
