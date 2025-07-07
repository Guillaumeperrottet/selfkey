import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = request.cookies.get("super-admin-session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { establishmentId, commissionRate, fixedFee } = await request.json();

    // Validation des données
    if (
      !establishmentId ||
      typeof commissionRate !== "number" ||
      typeof fixedFee !== "number"
    ) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    if (commissionRate < 0 || commissionRate > 100) {
      return NextResponse.json(
        { error: "Le taux de commission doit être entre 0 et 100%" },
        { status: 400 }
      );
    }

    if (fixedFee < 0) {
      return NextResponse.json(
        { error: "Les frais fixes ne peuvent pas être négatifs" },
        { status: 400 }
      );
    }

    // Mettre à jour l'établissement
    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: {
        commissionRate,
        fixedFee,
      },
    });

    return NextResponse.json({
      success: true,
      establishment: updatedEstablishment,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des commissions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
