import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendEmail } from "@/lib/email";

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

    // NOTE: Pour les emails de TEST, on n'envoie PAS de copie BCC
    console.log(
      `📧 Email de TEST parking jour - Envoi uniquement à: ${testEmail}`
    );

    // Envoyer l'email via Resend - HTML pur d'Unlayer sans wrapper
    const emailResult = await sendEmail({
      to: testEmail,
      from:
        userEstablishment.establishment.confirmationEmailFrom ||
        `${userEstablishment.establishment.name} <no-reply@votrapp.com>`,
      subject: `Test - Confirmation parking jour - ${userEstablishment.establishment.name}`,
      html: htmlContent, // HTML pur généré par Unlayer
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
