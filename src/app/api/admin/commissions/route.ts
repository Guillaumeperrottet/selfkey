import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = request.cookies.get("super-admin-session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    // Récupération des établissements avec leurs statistiques
    const establishments = await prisma.establishment.findMany({
      include: {
        bookings: {
          select: {
            platformCommission: true,
            amount: true,
            bookingDate: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calcul des métriques pour chaque établissement
    const establishmentsWithStats = establishments.map((establishment) => {
      const totalCommissions = establishment.bookings.reduce(
        (sum, booking) => sum + (booking.platformCommission || 0),
        0
      );

      const totalBookings = establishment._count.bookings;

      const totalAmount = establishment.bookings.reduce(
        (sum, booking) => sum + booking.amount,
        0
      );

      const averageBookingValue =
        totalBookings > 0 ? totalAmount / totalBookings : 0;

      // Commissions du mois en cours
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const monthlyCommissions = establishment.bookings
        .filter((booking) => booking.bookingDate >= firstDayOfMonth)
        .reduce((sum, booking) => sum + (booking.platformCommission || 0), 0);

      // Dernière réservation
      const lastBookingDate =
        establishment.bookings.length > 0
          ? establishment.bookings.reduce((latest, booking) => {
              const bookingDate = new Date(booking.bookingDate);
              const latestDate = new Date(latest);
              return bookingDate > latestDate ? booking.bookingDate : latest;
            }, establishment.bookings[0].bookingDate)
          : null;

      return {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        commissionRate: establishment.commissionRate,
        fixedFee: establishment.fixedFee,
        totalCommissions,
        totalBookings,
        lastBookingDate,
        stripeOnboarded: establishment.stripeOnboarded,
        monthlyCommissions,
        averageBookingValue,
      };
    });

    return NextResponse.json(establishmentsWithStats);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données de commission:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
