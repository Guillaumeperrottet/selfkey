import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    hotel: string;
  }>;
}

interface TestEmailRequest {
  testEmail: string;
  settings: {
    confirmationEmailTemplate: string;
    confirmationEmailFrom: string;
    hotelContactEmail: string;
    hotelContactPhone: string;
  };
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { hotel } = await params;
    const { testEmail, settings }: TestEmailRequest = await request.json();

    // Validation de l'email
    if (!testEmail || !testEmail.includes("@")) {
      return NextResponse.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      );
    }

    // Récupérer les paramètres de l'établissement pour connaître le type de système d'accès
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: {
        accessCodeType: true,
        generalAccessCode: true,
        accessInstructions: true,
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Déterminer le code d'accès et les instructions selon la configuration
    let accessCode = "1234"; // Par défaut pour les tests
    let accessInstructions = "Instructions d'accès par défaut";

    switch (establishment.accessCodeType) {
      case "room":
        accessCode = "1234"; // Code d'exemple pour une chambre
        accessInstructions =
          "Utilisez le code 1234 pour accéder à votre chambre. L'entrée se trouve à droite du bâtiment principal.";
        break;
      case "general":
        accessCode = establishment.generalAccessCode || "5678";
        accessInstructions = `Utilisez le code général ${accessCode} pour accéder à l'établissement.`;
        break;
      case "custom":
        accessCode = "Voir instructions ci-dessous";
        accessInstructions =
          establishment.accessInstructions ||
          "Instructions personnalisées non configurées";
        break;
      default:
        accessCode = "1234";
        accessInstructions =
          "Utilisez le code fourni pour accéder à votre hébergement.";
    }

    // Données d'exemple pour remplacer les variables
    const sampleData = {
      clientFirstName: "Jean",
      clientLastName: "Dupont",
      establishmentName: hotel,
      roomName: "Chambre Standard",
      checkInDate: "15 juillet 2025",
      checkOutDate: "17 juillet 2025",
      accessCode,
      accessInstructions,
      hotelContactEmail: settings.hotelContactEmail || "contact@hotel.ch",
      hotelContactPhone: settings.hotelContactPhone || "+41 XX XXX XX XX",
    };

    // Remplacer les variables dans le template
    let emailContent = settings.confirmationEmailTemplate;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      emailContent = emailContent.replace(regex, value);
    });

    // Convertir le texte en HTML simple (remplacer les retours à la ligne par <br>)
    const htmlContent = emailContent
      .replace(/\n/g, "<br>")
      .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");

    // Envoyer l'email via Resend
    const emailResult = await sendEmail({
      to: testEmail,
      from: settings.confirmationEmailFrom,
      subject: `Confirmation de réservation - Test (${hotel})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1976d2; margin: 0 0 10px 0;">📧 Email de test - Confirmation de réservation</h2>
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
              Vos vrais emails de confirmation auront les vraies informations de réservation.
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
      preview: {
        from: settings.confirmationEmailFrom,
        to: testEmail,
        subject: `Confirmation de réservation - Test (${hotel})`,
        content: emailContent.substring(0, 200) + "...",
      },
      resendId: emailResult.data?.id,
    });
  } catch (error) {
    console.error("Erreur envoi email de test:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
