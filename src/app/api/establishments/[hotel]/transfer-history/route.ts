import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getEstablishmentTransferHistory } from "@/lib/establishment-transfer";

interface Props {
  params: Promise<{ hotel: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { hotel: hotelSlug } = await params;

    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'établissement et vérifier l'accès
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotelSlug },
      include: {
        users: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    if (establishment.users.length === 0) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Récupérer l'historique des transferts
    const transferHistory = await getEstablishmentTransferHistory(
      establishment.id
    );

    return NextResponse.json({
      transfers: transferHistory,
      count: transferHistory.length,
    });
  } catch (error) {
    console.error("Erreur récupération historique transferts:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
