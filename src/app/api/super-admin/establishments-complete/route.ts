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
        dayParkingCommissionRate: true,
        commissionRate: true,
        fixedFee: true,
        stripeOnboarded: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Récupérer les statistiques de réservation pour chaque établissement
    const establishmentsWithStats = await Promise.all(
      establishments.map(async (est) => {
        const bookingCount = await prisma.booking.count({
          where: { hotelSlug: est.slug },
        });

        const lastBooking = await prisma.booking.findFirst({
          where: { hotelSlug: est.slug },
          select: { bookingDate: true },
          orderBy: { bookingDate: "desc" },
        });

        // Calculer les revenus totaux
        const totalRevenueResult = await prisma.booking.aggregate({
          where: {
            hotelSlug: est.slug,
            paymentStatus: "paid",
          },
          _sum: { amount: true },
        });

        return {
          ...est,
          totalBookings: bookingCount,
          totalRevenue: totalRevenueResult._sum.amount || 0,
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
