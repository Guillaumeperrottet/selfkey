import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification super admin
    const session = request.cookies.get("super-admin-session");

    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer tous les établissements avec leurs statistiques de taxes
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        touristTaxEnabled: true,
        touristTaxAmount: true,
        bookings: {
          where: {
            paymentStatus: "succeeded",
          },
          select: {
            touristTaxTotal: true,
            adults: true,
            children: true,
          },
        },
        _count: {
          select: {
            excelExports: true,
          },
        },
        excelExports: {
          select: {
            exportedAt: true,
          },
          orderBy: {
            exportedAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculer les statistiques pour chaque établissement
    const establishmentsWithStats = establishments.map((establishment) => {
      const totalTaxCollected = establishment.bookings.reduce(
        (sum, booking) => sum + (booking.touristTaxTotal || 0),
        0
      );

      // Calculer le nombre total de personnes (adultes + enfants)
      const totalPersons = establishment.bookings.reduce(
        (sum, booking) => sum + (booking.adults || 0) + (booking.children || 0),
        0
      );

      // Récupérer la date du dernier export
      const lastExportDate =
        establishment.excelExports.length > 0
          ? establishment.excelExports[0].exportedAt.toISOString()
          : null;

      return {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        touristTaxEnabled: establishment.touristTaxEnabled,
        touristTaxAmount: establishment.touristTaxAmount,
        totalTaxCollected,
        totalPersons,
        _count: {
          excelExports: establishment._count.excelExports,
        },
        lastExportDate,
      };
    });

    return NextResponse.json({
      success: true,
      establishments: establishmentsWithStats,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des taxes de séjour:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
