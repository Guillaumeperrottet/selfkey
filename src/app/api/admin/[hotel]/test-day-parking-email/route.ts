import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendEmail } from "@/lib/resend";

interface Props {
  params: Promise<{ hotel: string }>;
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
      include: {
        establishment: {
          select: {
            name: true,
            hotelContactEmail: true,
            hotelContactPhone: true,
            accessInstructions: true,
            dayParkingEmailTemplate: true,
            confirmationEmailFrom: true,
          },
        },
      },
    });

    if (!userEstablishment) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { emailTemplate, testEmail } = body;

    // Validation
    if (!testEmail || !emailTemplate) {
      return NextResponse.json(
        { error: "Email de test et template requis" },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Données de test pour remplacer les variables
    const testData = {
      clientFirstName: "Jean",
      clientLastName: "Dupont",
      establishmentName: userEstablishment.establishment.name,
      roomName: "Place A1",
      dayParkingDuration: "4 heures",
      dayParkingStartTime: "09:00",
      dayParkingEndTime: "13:00",
      clientVehicleNumber: "GE 123456",
      accessCode: "1234",
      hotelContactEmail:
        userEstablishment.establishment.hotelContactEmail || "contact@hotel.ch",
      hotelContactPhone:
        userEstablishment.establishment.hotelContactPhone || "+41 22 123 45 67",
      extendParkingUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://selfkey.ch"}/${hotel}/parking-jour`, // Ajouté pour le test
    };

    // Remplacer les variables dans le template
    let processedTemplate = emailTemplate;
    Object.entries(testData).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      processedTemplate = processedTemplate.split(placeholder).join(value);
    });

    // Convertir le texte en HTML simple (remplacer les retours à la ligne par <br>)
    const htmlContent = processedTemplate
      .replace(/\n/g, "<br>")
      .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");

    // Envoyer l'email via Resend
    const emailResult = await sendEmail({
      to: testEmail,
      from:
        userEstablishment.establishment.confirmationEmailFrom ||
        `${userEstablishment.establishment.name} <no-reply@votrapp.com>`,
      subject: `Test - Confirmation parking jour - ${userEstablishment.establishment.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1976d2; margin: 0 0 10px 0;">🚗 Email de test - Confirmation parking jour</h2>
            <p style="margin: 0; color: #666; font-size: 14px;">
              Ceci est un email de test envoyé depuis votre panneau d'administration SelfKey.
            </p>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            ${htmlContent}
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f0f7ff; border-radius: 8px; border-left: 4px solid #1976d2;">
            <p style="margin: 0; font-size: 12px; color: #666;">
              <strong>Note :</strong> Cet email a été généré automatiquement par SelfKey avec des données d'exemple. 
              Vos vrais emails de confirmation parking jour auront les vraies informations de réservation.
            </p>
          </div>
        </div>
      `,
    });

    if (!emailResult.success) {
      console.error("Erreur envoi email:", emailResult.error);
      return NextResponse.json(
        { error: `Erreur envoi email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email de test envoyé avec succès à ${testEmail}`,
      testData: {
        from:
          userEstablishment.establishment.confirmationEmailFrom ||
          `${userEstablishment.establishment.name} <no-reply@votrapp.com>`,
        recipient: testEmail,
        subject: `Test - Confirmation parking jour - ${userEstablishment.establishment.name}`,
        preview: processedTemplate.substring(0, 200) + "...",
        variables: testData,
      },
      resendId: emailResult.data?.id,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de test:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
