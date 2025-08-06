import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification super admin
    const session = request.cookies.get("super-admin-session");

    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer tous les établissements avec leurs statistiques
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        enableDayParking: true,
        parkingOnlyMode: true,
        dayParkingCommissionRate: true,
        commissionRate: true,
        fixedFee: true,
        dayParkingFixedFee: true,
        stripeOnboarded: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Récupérer les statistiques de réservation pour chaque établissement
    const establishmentsWithStats = await Promise.all(
      establishments.map(async (est) => {
        // Compter seulement les réservations payées
        const bookingCount = await prisma.booking.count({
          where: {
            hotelSlug: est.slug,
            paymentStatus: "succeeded",
          },
        });

        // Compter les réservations par type (seulement les payées)
        const nightBookings = await prisma.booking.count({
          where: {
            hotelSlug: est.slug,
            bookingType: { in: ["night", "classic_booking"] },
            paymentStatus: "succeeded",
          },
        });

        const dayBookings = await prisma.booking.count({
          where: {
            hotelSlug: est.slug,
            bookingType: { in: ["day", "day_parking"] },
            paymentStatus: "succeeded",
          },
        });

        // Dernière réservation payée
        const lastBooking = await prisma.booking.findFirst({
          where: {
            hotelSlug: est.slug,
            paymentStatus: "succeeded",
          },
          select: { bookingDate: true },
          orderBy: { bookingDate: "desc" },
        });

        // Calculer les revenus totaux
        const totalRevenueResult = await prisma.booking.aggregate({
          where: {
            hotelSlug: est.slug,
            paymentStatus: "succeeded",
          },
          _sum: {
            amount: true,
            platformCommission: true,
          },
        });

        return {
          ...est,
          totalBookings: bookingCount,
          nightBookings,
          dayBookings,
          totalRevenue: totalRevenueResult._sum.amount || 0,
          totalCommissions: totalRevenueResult._sum.platformCommission || 0,
          lastBooking: lastBooking?.bookingDate?.toISOString() || null,
        };
      })
    );

    return Response.json({
      success: true,
      establishments: establishmentsWithStats,
      count: establishmentsWithStats.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des établissements:", error);
    return Response.json(
      { error: "Erreur lors de la récupération des établissements" },
      { status: 500 }
    );
  }
}
