import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/auth-check";

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification super admin
    const adminCheck = await isSuperAdmin();
    if (!adminCheck.valid) {
      return Response.json({ error: "Accès non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const {
      establishmentId,
      commissionRate,
      dayParkingCommissionRate,
      fixedFee,
    } = body;

    if (!establishmentId) {
      return Response.json(
        { error: "ID d'établissement requis" },
        { status: 400 }
      );
    }

    // Valider les valeurs numériques
    const updateData: {
      commissionRate?: number;
      dayParkingCommissionRate?: number;
      fixedFee?: number;
    } = {};

    if (commissionRate !== undefined) {
      const rate = parseFloat(commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return Response.json(
          { error: "Taux de commission invalide (0-100%)" },
          { status: 400 }
        );
      }
      updateData.commissionRate = rate;
    }

    if (dayParkingCommissionRate !== undefined) {
      const rate = parseFloat(dayParkingCommissionRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return Response.json(
          { error: "Taux de commission parking jour invalide (0-100%)" },
          { status: 400 }
        );
      }
      updateData.dayParkingCommissionRate = rate;
    }

    if (fixedFee !== undefined) {
      const fee = parseFloat(fixedFee);
      if (isNaN(fee) || fee < 0) {
        return Response.json(
          { error: "Frais fixe invalide (doit être positif)" },
          { status: 400 }
        );
      }
      updateData.fixedFee = fee;
    }

    // Mettre à jour l'établissement
    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: updateData,
      select: {
        id: true,
        slug: true,
        name: true,
        commissionRate: true,
        dayParkingCommissionRate: true,
        fixedFee: true,
      },
    });

    return Response.json({
      success: true,
      establishment: updatedEstablishment,
      message: "Établissement mis à jour avec succès",
    });
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour de l'établissement:", error);

    // Gestion des erreurs Prisma spécifiques
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return Response.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    return Response.json(
      { error: "Erreur lors de la mise à jour de l'établissement" },
      { status: 500 }
    );
  }
}
