import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = request.cookies.get("super-admin-session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupération des stats générales
    const totalEstablishments = await prisma.establishment.count();
    const totalBookings = await prisma.booking.count();

    // Calcul des commissions totales
    const commissionsSum = await prisma.booking.aggregate({
      _sum: {
        platformCommission: true,
      },
    });

    // Calcul de la moyenne des taux de commission
    const avgCommissionRate = await prisma.establishment.aggregate({
      _avg: {
        commissionRate: true,
      },
    });

    // Commissions du mois en cours
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyCommissionsSum = await prisma.booking.aggregate({
      where: {
        bookingDate: {
          gte: firstDayOfMonth,
        },
      },
      _sum: {
        platformCommission: true,
      },
    });

    // Commissions du mois précédent pour calculer la croissance
    const firstDayOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastDayOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );

    const previousMonthCommissionsSum = await prisma.booking.aggregate({
      where: {
        bookingDate: {
          gte: firstDayOfPreviousMonth,
          lte: lastDayOfPreviousMonth,
        },
      },
      _sum: {
        platformCommission: true,
      },
    });

    const monthlyCommissions =
      monthlyCommissionsSum._sum.platformCommission || 0;
    const previousMonthCommissions =
      previousMonthCommissionsSum._sum.platformCommission || 0;

    const monthlyGrowth =
      previousMonthCommissions > 0
        ? ((monthlyCommissions - previousMonthCommissions) /
            previousMonthCommissions) *
          100
        : 0;

    const stats = {
      totalCommissions: commissionsSum._sum.platformCommission || 0,
      totalBookings,
      totalEstablishments,
      averageCommissionRate: avgCommissionRate._avg.commissionRate || 0,
      monthlyCommissions,
      monthlyGrowth,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
