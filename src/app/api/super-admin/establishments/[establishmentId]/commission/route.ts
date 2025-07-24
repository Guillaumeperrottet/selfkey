import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    const { establishmentId } = await params;

    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les données de la requête
    const body = await request.json();
    const { dayParkingCommissionRate } = body;

    // Validation des données
    if (typeof dayParkingCommissionRate !== "number") {
      return NextResponse.json(
        { error: "Le taux de commission doit être un nombre" },
        { status: 400 }
      );
    }

    if (dayParkingCommissionRate < 0 || dayParkingCommissionRate > 100) {
      return NextResponse.json(
        { error: "Le taux de commission doit être entre 0% et 100%" },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: { id: true, name: true },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement introuvable" },
        { status: 404 }
      );
    }

    // Mettre à jour le taux de commission
    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: {
        dayParkingCommissionRate,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        enableDayParking: true,
        dayParkingCommissionRate: true,
        commissionRate: true,
      },
    });

    return NextResponse.json({
      success: true,
      establishment: updatedEstablishment,
      message: `Commission mise à jour pour ${establishment.name}`,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commission:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
