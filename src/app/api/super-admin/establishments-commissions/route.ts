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

    // Vérifier que l'utilisateur est super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        // Ajouter ici la logique pour vérifier si c'est un super admin
        // Pour l'instant, on peut utiliser une liste d'emails hardcodée
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

    // Récupérer tous les établissements avec leurs informations de commission
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        commissionRate: true,
        dayParkingCommissionRate: true,
        enableDayParking: true,
        stripeOnboarded: true,
        stripeAccountId: true,
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
