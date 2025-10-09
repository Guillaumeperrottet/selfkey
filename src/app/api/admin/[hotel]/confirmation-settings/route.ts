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
            confirmationEmailTemplateWithDog: true,
            confirmationEmailTemplateWithoutDog: true,
            confirmationEmailDesign: true,
            confirmationEmailDesignWithDog: true,
            confirmationEmailDesignWithoutDog: true,
            // English templates
            confirmationEmailTemplateEn: true,
            confirmationEmailTemplateWithDogEn: true,
            confirmationEmailTemplateWithoutDogEn: true,
            confirmationEmailDesignEn: true,
            confirmationEmailDesignWithDogEn: true,
            confirmationEmailDesignWithoutDogEn: true,
            // German templates
            confirmationEmailTemplateDe: true,
            confirmationEmailTemplateWithDogDe: true,
            confirmationEmailTemplateWithoutDogDe: true,
            confirmationEmailDesignDe: true,
            confirmationEmailDesignWithDogDe: true,
            confirmationEmailDesignWithoutDogDe: true,
            confirmationWhatsappTemplate: true,
            hotelContactEmail: true,
            hotelContactPhone: true,
            enableEmailCopyOnConfirmation: true,
            emailCopyAddresses: true,
            enableDogOption: true,
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
      confirmationEmailTemplateWithDog,
      confirmationEmailTemplateWithoutDog,
      confirmationEmailDesign,
      confirmationEmailDesignWithDog,
      confirmationEmailDesignWithoutDog,
      // English templates
      confirmationEmailTemplateEn,
      confirmationEmailTemplateWithDogEn,
      confirmationEmailTemplateWithoutDogEn,
      confirmationEmailDesignEn,
      confirmationEmailDesignWithDogEn,
      confirmationEmailDesignWithoutDogEn,
      // German templates
      confirmationEmailTemplateDe,
      confirmationEmailTemplateWithDogDe,
      confirmationEmailTemplateWithoutDogDe,
      confirmationEmailDesignDe,
      confirmationEmailDesignWithDogDe,
      confirmationEmailDesignWithoutDogDe,
      confirmationWhatsappTemplate,
      hotelContactEmail,
      hotelContactPhone,
      enableEmailCopyOnConfirmation,
      emailCopyAddresses,
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

    // Validation pour les adresses de copie email
    let validatedEmailCopyAddresses: string[] = [];
    if (enableEmailCopyOnConfirmation && emailCopyAddresses) {
      validatedEmailCopyAddresses = Array.isArray(emailCopyAddresses)
        ? emailCopyAddresses
            .filter((email) => email?.trim())
            .map((email) => email.trim())
        : [];

      // Validation des adresses email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = validatedEmailCopyAddresses.filter(
        (email) => !emailRegex.test(email)
      );

      if (invalidEmails.length > 0) {
        return NextResponse.json(
          {
            error: `Adresses email invalides : ${invalidEmails.join(", ")}`,
          },
          { status: 400 }
        );
      }
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
        confirmationEmailTemplateWithDog:
          confirmationEmailTemplateWithDog?.trim() || null,
        confirmationEmailTemplateWithoutDog:
          confirmationEmailTemplateWithoutDog?.trim() || null,
        confirmationEmailDesign: confirmationEmailDesign || null,
        confirmationEmailDesignWithDog: confirmationEmailDesignWithDog || null,
        confirmationEmailDesignWithoutDog:
          confirmationEmailDesignWithoutDog || null,
        // English templates
        confirmationEmailTemplateEn:
          confirmationEmailTemplateEn?.trim() || null,
        confirmationEmailTemplateWithDogEn:
          confirmationEmailTemplateWithDogEn?.trim() || null,
        confirmationEmailTemplateWithoutDogEn:
          confirmationEmailTemplateWithoutDogEn?.trim() || null,
        confirmationEmailDesignEn: confirmationEmailDesignEn || null,
        confirmationEmailDesignWithDogEn:
          confirmationEmailDesignWithDogEn || null,
        confirmationEmailDesignWithoutDogEn:
          confirmationEmailDesignWithoutDogEn || null,
        // German templates
        confirmationEmailTemplateDe:
          confirmationEmailTemplateDe?.trim() || null,
        confirmationEmailTemplateWithDogDe:
          confirmationEmailTemplateWithDogDe?.trim() || null,
        confirmationEmailTemplateWithoutDogDe:
          confirmationEmailTemplateWithoutDogDe?.trim() || null,
        confirmationEmailDesignDe: confirmationEmailDesignDe || null,
        confirmationEmailDesignWithDogDe:
          confirmationEmailDesignWithDogDe || null,
        confirmationEmailDesignWithoutDogDe:
          confirmationEmailDesignWithoutDogDe || null,
        confirmationWhatsappTemplate:
          confirmationWhatsappTemplate?.trim() || null,
        hotelContactEmail: hotelContactEmail?.trim() || null,
        hotelContactPhone: hotelContactPhone?.trim() || null,
        enableEmailCopyOnConfirmation: Boolean(enableEmailCopyOnConfirmation),
        emailCopyAddresses: validatedEmailCopyAddresses,
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
