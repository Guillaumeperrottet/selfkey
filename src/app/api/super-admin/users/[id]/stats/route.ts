import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Vérification de la session super-admin
    const session = request.cookies.get("super-admin-session");

    if (!session || session.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur avec toutes ses données
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        establishments: {
          include: {
            establishment: {
              include: {
                bookings: {
                  where: {
                    paymentStatus: "succeeded",
                  },
                  select: {
                    id: true,
                    amount: true,
                    touristTaxTotal: true,
                    adults: true,
                    children: true,
                    checkInDate: true,
                    checkOutDate: true,
                    bookingDate: true,
                    paymentStatus: true,
                  },
                },
                _count: {
                  select: {
                    bookings: {
                      where: {
                        paymentStatus: "succeeded",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        excelExports: {
          select: {
            id: true,
            fileName: true,
            recordsCount: true,
            exportedAt: true,
            establishmentSlug: true,
          },
          orderBy: {
            exportedAt: "desc",
          },
        },
        _count: {
          select: {
            excelExports: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Calculer les statistiques globales
    const allBookings = user.establishments.flatMap(
      (ue) => ue.establishment.bookings
    );

    const totalRevenue = allBookings.reduce(
      (sum, booking) => sum + booking.amount,
      0
    );

    const totalTouristTax = allBookings.reduce(
      (sum, booking) => sum + (booking.touristTaxTotal || 0),
      0
    );

    const totalPersons = allBookings.reduce(
      (sum, booking) => sum + booking.adults + (booking.children || 0),
      0
    );

    // Statistiques par mois (6 derniers mois)
    const now = new Date();

    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthBookings = allBookings.filter(
        (booking) =>
          booking.bookingDate >= monthStart && booking.bookingDate <= monthEnd
      );

      const monthRevenue = monthBookings.reduce(
        (sum, booking) => sum + booking.amount,
        0
      );

      const monthTax = monthBookings.reduce(
        (sum, booking) => sum + (booking.touristTaxTotal || 0),
        0
      );

      monthlyStats.push({
        month: monthStart.toLocaleDateString("fr-FR", {
          month: "short",
          year: "numeric",
        }),
        revenue: monthRevenue,
        tax: monthTax,
        bookings: monthBookings.length,
        persons: monthBookings.reduce(
          (sum, booking) => sum + booking.adults + (booking.children || 0),
          0
        ),
      });
    }

    // Statistiques par établissement
    const establishmentStats = user.establishments.map((ue) => {
      const establishment = ue.establishment;
      const bookings = establishment.bookings;

      return {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        revenue: bookings.reduce((sum, booking) => sum + booking.amount, 0),
        tax: bookings.reduce(
          (sum, booking) => sum + (booking.touristTaxTotal || 0),
          0
        ),
        bookings: bookings.length,
        persons: bookings.reduce(
          (sum, booking) => sum + booking.adults + (booking.children || 0),
          0
        ),
      };
    });

    // Statistiques des exports récents
    const recentExports = user.excelExports.slice(0, 10);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
      },
      stats: {
        global: {
          totalEstablishments: user.establishments.length,
          totalBookings: allBookings.length,
          totalRevenue,
          totalTouristTax,
          totalPersons,
          totalExports: user._count.excelExports,
        },
        monthly: monthlyStats,
        establishments: establishmentStats,
        recentExports,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
