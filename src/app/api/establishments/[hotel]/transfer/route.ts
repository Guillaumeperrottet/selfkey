import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { transferEstablishment } from "@/lib/establishment-transfer";

interface Props {
  params: Promise<{ hotel: string }>;
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { hotel: hotelSlug } = await params;

    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { toUserEmail } = body;

    if (!toUserEmail) {
      return NextResponse.json(
        { error: "Email de destination requis" },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toUserEmail)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Récupérer l'établissement et vérifier les permissions
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotelSlug },
      include: {
        users: {
          where: {
            userId: session.user.id,
            role: "owner",
          },
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
      return NextResponse.json(
        { error: "Vous n'êtes pas propriétaire de cet établissement" },
        { status: 403 }
      );
    }

    // Effectuer le transfert
    const result = await transferEstablishment(
      establishment.id,
      session.user.id,
      toUserEmail
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur API transfert:", error);

    const message =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    const status =
      message.includes("n'êtes pas propriétaire") ||
      message.includes("n'existe pas") ||
      message.includes("a déjà accès")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
