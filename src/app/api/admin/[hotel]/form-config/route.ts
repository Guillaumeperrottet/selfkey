import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface Props {
  params: Promise<{ hotel: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
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
      include: {
        establishment: {
          select: {
            formConfig: true,
          },
        },
      },
    });

    if (!userEstablishment) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json({
      formConfig: userEstablishment.establishment.formConfig || {},
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la configuration du formulaire:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { hotel } = await params;
    const body = await request.json();

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

    // Validation des données
    const { formConfig } = body;

    if (!formConfig || typeof formConfig !== "object") {
      return NextResponse.json(
        { error: "Configuration du formulaire invalide" },
        { status: 400 }
      );
    }

    // Mettre à jour la configuration
    const updatedEstablishment = await prisma.establishment.update({
      where: { slug: hotel },
      data: {
        formConfig: formConfig,
      },
      select: {
        formConfig: true,
      },
    });

    return NextResponse.json({
      message: "Configuration du formulaire sauvegardée avec succès",
      formConfig: updatedEstablishment.formConfig,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la sauvegarde de la configuration du formulaire:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
