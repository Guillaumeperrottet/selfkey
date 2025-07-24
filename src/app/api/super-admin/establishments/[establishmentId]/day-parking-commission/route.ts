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

    // Vérifier que l'utilisateur est super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Liste des super admins (à adapter selon votre logique)
    const superAdminEmails = [
      "admin@selfkey.com",
      "guillaume@selfkey.com",
      // Ajoutez votre email ici
    ];

    if (!superAdminEmails.includes(user.email)) {
      return NextResponse.json(
        { error: "Accès non autorisé - Super Admin requis" },
        { status: 403 }
      );
    }

    // Parser le body de la requête
    const body = await request.json();
    const { dayParkingCommissionRate } = body;

    // Validation des données
    if (typeof dayParkingCommissionRate !== "number") {
      return NextResponse.json(
        { error: "Le taux de commission doit être un nombre" },
        { status: 400 }
      );
    }

    if (dayParkingCommissionRate < 0 || dayParkingCommissionRate > 50) {
      return NextResponse.json(
        { error: "Le taux de commission doit être entre 0% et 50%" },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: { id: true, name: true, slug: true },
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
        name: true,
        slug: true,
        dayParkingCommissionRate: true,
        commissionRate: true,
        enableDayParking: true,
        stripeOnboarded: true,
      },
    });

    // Log de l'action pour audit
    console.log(
      `Super Admin ${user.email} a modifié la commission parking jour de l'établissement ${establishment.name} (${establishment.slug}) : ${dayParkingCommissionRate}%`
    );

    return NextResponse.json({
      success: true,
      message: "Taux de commission mis à jour avec succès",
      establishment: updatedEstablishment,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commission:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
