import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification super admin
    const session = request.cookies.get("super-admin-session");

    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { establishmentId, touristTaxEnabled, touristTaxAmount } = body;

    if (!establishmentId) {
      return NextResponse.json(
        { error: "ID d'établissement requis" },
        { status: 400 }
      );
    }

    // Préparer les données à mettre à jour
    const updateData: {
      touristTaxEnabled?: boolean;
      touristTaxAmount?: number;
    } = {};

    if (touristTaxEnabled !== undefined) {
      updateData.touristTaxEnabled = touristTaxEnabled;
    }

    if (touristTaxAmount !== undefined) {
      if (isNaN(touristTaxAmount) || touristTaxAmount < 0) {
        return NextResponse.json(
          { error: "Montant de taxe invalide" },
          { status: 400 }
        );
      }
      updateData.touristTaxAmount = touristTaxAmount;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée à mettre à jour" },
        { status: 400 }
      );
    }

    // Mettre à jour l'établissement
    const updatedEstablishment = await prisma.establishment.update({
      where: {
        id: establishmentId,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        touristTaxEnabled: true,
        touristTaxAmount: true,
      },
    });

    return NextResponse.json({
      success: true,
      establishment: updatedEstablishment,
      message: "Taxe de séjour mise à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la taxe:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
