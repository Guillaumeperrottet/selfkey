import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { replaceImagePlaceholders } from "@/lib/image-utils";

interface Params {
  params: Promise<{
    hotel: string;
  }>;
}

interface TestEmailRequest {
  testEmail: string;
  templateType?: "general" | "withDogs" | "withoutDogs"; // Types cohérents avec le front
  settings: {
    confirmationEmailTemplate: string;
    confirmationEmailTemplateWithDog?: string;
    confirmationEmailTemplateWithoutDog?: string;
    confirmationEmailFrom: string;
    hotelContactEmail: string;
    hotelContactPhone: string;
    enableEmailCopyOnConfirmation: boolean;
    emailCopyAddresses: string[];
  };
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { hotel } = await params;
    const { testEmail, settings, templateType }: TestEmailRequest =
      await request.json();

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
        id: true,
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

    // Déterminer le code d'accès selon la configuration
    let accessCode = "1234"; // Par défaut pour les tests

    switch (establishment.accessCodeType) {
      case "room":
        accessCode = "1234"; // Code d'exemple pour une chambre
        break;
      case "general":
        accessCode = establishment.generalAccessCode || "5678";
        break;
      case "custom":
        accessCode =
          establishment.accessInstructions ||
          "Instructions personnalisées non configurées";
        break;
      default:
        accessCode = "1234";
    }

    // Données d'exemple pour remplacer les variables
    const sampleData = {
      clientFirstName: "Jean",
      clientLastName: "Dupont",
      establishmentName: hotel,
      roomName: "Place Standard",
      checkInDate: "15 juillet 2025",
      checkOutDate: "17 juillet 2025",
      accessCode,
      hotelContactEmail: settings.hotelContactEmail || "contact@hotel.ch",
      hotelContactPhone: settings.hotelContactPhone || "+41 XX XXX XX XX",
      bookingNumber: "DEMO-12345-2025",
      totalAmount: "150.00",
      currency: "CHF",
      invoiceDownloadUrl: `${process.env.NEXTAUTH_URL || "https://selfkey.ch"}/invoice/test-demo-booking?token=demo-test-token`,
    };

    // Sélectionner le bon template selon le type demandé
    let emailTemplate: string;
    if (
      templateType === "withDogs" &&
      settings.confirmationEmailTemplateWithDog
    ) {
      emailTemplate = settings.confirmationEmailTemplateWithDog;
    } else if (
      templateType === "withoutDogs" &&
      settings.confirmationEmailTemplateWithoutDog
    ) {
      emailTemplate = settings.confirmationEmailTemplateWithoutDog;
    } else {
      emailTemplate = settings.confirmationEmailTemplate;
    }

    // Détecter si c'est du HTML AVANT le remplacement des variables
    const isHtmlTemplate =
      emailTemplate.includes("<table") ||
      emailTemplate.includes("<!DOCTYPE") ||
      emailTemplate.includes("<html") ||
      (emailTemplate.includes("<div") && emailTemplate.includes("style="));

    // Remplacer les variables dans le template
    let emailContent = emailTemplate;
    Object.entries(sampleData).forEach(([key, value]) => {
      // Transformer automatiquement invoiceDownloadUrl en bouton HTML
      if (key === "invoiceDownloadUrl" && value && isHtmlTemplate) {
        value = `<a href="${value}" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">📥 Télécharger la facture PDF</a>`;
      }
      const regex = new RegExp(`\\{${key}\\}`, "g");
      emailContent = emailContent.replace(regex, value);
    });

    // Traiter les placeholders d'images
    emailContent = await replaceImagePlaceholders(
      emailContent,
      establishment.id
    );

    // Le contenu est déjà du HTML d'Unlayer, pas besoin de conversion
    const htmlContent = emailContent;

    // Préparer les adresses en copie si activées
    let bccAddresses: string[] = [];
    if (
      settings.enableEmailCopyOnConfirmation &&
      settings.emailCopyAddresses &&
      settings.emailCopyAddresses.length > 0
    ) {
      bccAddresses = settings.emailCopyAddresses;
      console.log(
        `📧 Email de test envoyé avec copie à ${bccAddresses.length} adresse(s): ${bccAddresses.join(", ")}`
      );
    }

    // Préparer le sujet selon le type de template
    const templateTypeLabel =
      templateType === "withDogs" ? " - Avec chien" : "";
    const emailSubject = `Confirmation de réservation - Test${templateTypeLabel} (${hotel})`;

    // Envoyer l'email via Resend - HTML pur d'Unlayer sans wrapper
    const emailResult = await sendEmail({
      to: testEmail,
      from: settings.confirmationEmailFrom,
      subject: emailSubject,
      bcc: bccAddresses.length > 0 ? bccAddresses : undefined,
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
      preview: {
        from: settings.confirmationEmailFrom,
        to: testEmail,
        subject: emailSubject,
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
