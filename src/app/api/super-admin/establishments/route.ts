import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Pour le moment, permettre à tout utilisateur connecté d'accéder à cette fonction
    // Dans un vrai système, vous devriez vérifier si l'utilisateur est super admin

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
      { status: 500 }
    );
  }
}
