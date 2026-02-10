import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/auth/check";

export async function GET() {
  try {
    // Vérifier que l'utilisateur est super-admin
    const adminCheck = await isSuperAdmin();
    if (!adminCheck.valid) {
      return NextResponse.json(
        { error: "Unauthorized", message: adminCheck.message },
        { status: 401 },
      );
    }

    // Récupérer tous les établissements avec leurs informations de commission
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        enableDayParking: true,
        dayParkingCommissionRate: true,
        commissionRate: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      establishments,
      count: establishments.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des établissements:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
