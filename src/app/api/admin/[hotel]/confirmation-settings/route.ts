import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface Props {
  params: Promise<{ hotel: string }>;
}

export async function GET(request: Request, { params }: Props) {
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
            confirmationEmailEnabled: true,
            confirmationWhatsappEnabled: true,
            confirmationEmailFrom: true,
            confirmationWhatsappFrom: true,
            confirmationEmailTemplate: true,
            confirmationWhatsappTemplate: true,
            hotelContactEmail: true,
            hotelContactPhone: true,
          },
        },
      },
    });

    if (!userEstablishment) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json(userEstablishment.establishment);
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Props) {
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
    const {
      confirmationEmailEnabled,
      confirmationWhatsappEnabled,
      confirmationEmailFrom,
      confirmationWhatsappFrom,
      confirmationEmailTemplate,
      confirmationWhatsappTemplate,
      hotelContactEmail,
      hotelContactPhone,
    } = body;

    // Valider que si l'email est activé, une adresse d'envoi est fournie
    if (confirmationEmailEnabled && !confirmationEmailFrom?.trim()) {
      return NextResponse.json(
        { error: "Une adresse email d'envoi est requise" },
        { status: 400 }
      );
    }

    // Valider que si WhatsApp est activé, un numéro est fourni
    if (confirmationWhatsappEnabled && !confirmationWhatsappFrom?.trim()) {
      return NextResponse.json(
        { error: "Un numéro WhatsApp d'envoi est requis" },
        { status: 400 }
      );
    }

    // Mettre à jour les paramètres
    const updatedEstablishment = await prisma.establishment.update({
      where: { slug: hotel },
      data: {
        confirmationEmailEnabled: Boolean(confirmationEmailEnabled),
        confirmationWhatsappEnabled: Boolean(confirmationWhatsappEnabled),
        confirmationEmailFrom: confirmationEmailFrom?.trim() || null,
        confirmationWhatsappFrom: confirmationWhatsappFrom?.trim() || null,
        confirmationEmailTemplate: confirmationEmailTemplate?.trim() || null,
        confirmationWhatsappTemplate:
          confirmationWhatsappTemplate?.trim() || null,
        hotelContactEmail: hotelContactEmail?.trim() || null,
        hotelContactPhone: hotelContactPhone?.trim() || null,
      },
    });

    return NextResponse.json({
      message: "Paramètres sauvegardés avec succès",
      establishment: updatedEstablishment,
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
