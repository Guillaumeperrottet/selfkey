import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;

    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier les permissions d'accès à cet établissement
    const userEstablishment = await prisma.userEstablishment.findFirst({
      where: {
        userId: session.user.id,
        establishment: {
          slug: hotel,
        },
      },
    });

    if (!userEstablishment) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Récupérer les intégrations existantes
    const integrations = await prisma.integration.findMany({
      where: {
        establishmentSlug: hotel,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("Erreur récupération intégrations:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;
    const body = await request.json();
    const { type, name, configuration = {} } = body;

    if (!type || !name) {
      return NextResponse.json(
        { error: "Type et nom requis" },
        { status: 400 }
      );
    }

    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier les permissions d'accès à cet établissement
    const userEstablishment = await prisma.userEstablishment.findFirst({
      where: {
        userId: session.user.id,
        establishment: {
          slug: hotel,
        },
      },
    });

    if (!userEstablishment) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Créer l'intégration
    const integration = await prisma.integration.create({
      data: {
        establishmentSlug: hotel,
        type,
        name,
        status: "disconnected",
        configuration: configuration,
      },
    });

    return NextResponse.json({ integration });
  } catch (error) {
    console.error("Erreur création intégration:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
