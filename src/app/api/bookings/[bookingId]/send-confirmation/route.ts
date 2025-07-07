import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

interface Props {
  params: Promise<{ bookingId: string }>;
}

interface TemplateData {
  clientFirstName: string;
  clientLastName: string;
  establishmentName: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  accessCode: string;
  accessInstructions: string;
}

interface BookingWithDetails {
  id: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  checkInDate: Date;
  checkOutDate: Date;
  stripePaymentIntentId: string | null;
  room: {
    id: string;
    name: string;
    accessCode: string | null;
  };
  establishment: {
    id: string;
    name: string;
    accessCodeType: string;
    confirmationEmailEnabled: boolean;
    confirmationWhatsappEnabled: boolean;
    confirmationEmailTemplate: string | null;
    confirmationWhatsappTemplate: string | null;
    confirmationEmailFrom: string | null;
    confirmationWhatsappFrom: string | null;
    generalAccessCode: string | null;
    accessInstructions: string | null;
  };
}

export async function POST(request: Request, { params }: Props) {
  try {
    const { bookingId } = await params;
    const body = await request.json();
    const { method } = body;

    if (!method || !["email", "whatsapp"].includes(method)) {
      return NextResponse.json(
        { error: "Méthode de confirmation invalide" },
        { status: 400 }
      );
    }

    // Récupérer la réservation avec les détails
    const booking = (await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: true,
        establishment: true,
      },
    })) as BookingWithDetails | null;

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que la réservation a bien été payée
    if (!booking.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "Réservation non payée" },
        { status: 400 }
      );
    }

    // Vérifier que la méthode est activée
    if (method === "email" && !booking.establishment.confirmationEmailEnabled) {
      return NextResponse.json(
        { error: "Confirmation par email non activée" },
        { status: 400 }
      );
    }

    if (
      method === "whatsapp" &&
      !booking.establishment.confirmationWhatsappEnabled
    ) {
      return NextResponse.json(
        { error: "Confirmation par WhatsApp non activée" },
        { status: 400 }
      );
    }

    // Déterminer le code d'accès selon la configuration
    let accessCode = "Voir instructions";

    switch (booking.establishment.accessCodeType) {
      case "room":
        // Priorité au code de la chambre
        accessCode = booking.room.accessCode || "Code chambre non défini";
        break;
      case "general":
        // Code général de l'établissement
        accessCode =
          booking.establishment.generalAccessCode || "Code général non défini";
        break;
      case "custom":
        // Instructions personnalisées uniquement
        accessCode = "Voir instructions ci-dessous";
        break;
      default:
        // Fallback : essayer code chambre puis général
        accessCode =
          booking.room.accessCode ||
          booking.establishment.generalAccessCode ||
          "Voir instructions";
    }

    // Préparer les données pour le template
    const templateData: TemplateData = {
      clientFirstName: booking.clientFirstName,
      clientLastName: booking.clientLastName,
      establishmentName: booking.establishment.name,
      roomName: booking.room.name,
      checkInDate: booking.checkInDate.toLocaleDateString("fr-FR"),
      checkOutDate: booking.checkOutDate.toLocaleDateString("fr-FR"),
      accessCode,
      accessInstructions:
        booking.establishment.accessInstructions ||
        "Contactez-nous pour plus d'informations",
    };

    // Envoyer la confirmation selon la méthode choisie
    if (method === "email") {
      await sendEmailConfirmation(booking, templateData);
    } else if (method === "whatsapp") {
      await sendWhatsAppConfirmation(booking, templateData);
    }

    // Mettre à jour la réservation
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        confirmationMethod: method,
        confirmationSent: true,
        confirmationSentAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Confirmation envoyée avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la confirmation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

async function sendEmailConfirmation(
  booking: BookingWithDetails,
  templateData: TemplateData
) {
  // Récupérer le template personnalisé ou utiliser le template par défaut
  const template =
    booking.establishment.confirmationEmailTemplate ||
    getDefaultEmailTemplate();

  // Remplacer les variables dans le template
  const emailContent = replaceTemplateVariables(template, templateData);

  // Créer le contenu HTML pour l'email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation de réservation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background-color: #f9fafb; border-radius: 0 0 8px 8px; }
        .booking-details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .access-code { background-color: #dbeafe; padding: 10px; border-radius: 5px; margin: 10px 0; font-weight: bold; color: #1e40af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${booking.establishment.name}</h1>
          <h2>Confirmation de réservation</h2>
        </div>
        
        <div class="content">
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${emailContent}</pre>
        </div>
        
        <div class="footer">
          <p>Cette confirmation a été générée automatiquement.</p>
          <p>En cas de question, contactez-nous.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Logique intelligente pour l'adresse email de destination
    let destinationEmail = booking.clientEmail;
    let useTestEmail = false;

    // En développement, utiliser l'adresse de test Resend SAUF si l'admin a configuré un domaine vérifié
    if (process.env.NODE_ENV === "development") {
      const fromEmail = booking.establishment.confirmationEmailFrom;

      // Si l'admin a configuré un domaine vérifié (pas resend.dev), tenter d'utiliser l'adresse du client
      if (fromEmail && !fromEmail.includes("resend.dev")) {
        destinationEmail = booking.clientEmail;
        console.log(
          `📧 Tentative d'envoi à l'adresse client (domaine personnalisé): ${destinationEmail}`
        );
      } else {
        destinationEmail = "delivered@resend.dev";
        useTestEmail = true;
        console.log(
          `📧 Utilisation de l'adresse de test Resend: ${destinationEmail} (original: ${booking.clientEmail})`
        );
      }
    }

    const result = await sendEmail({
      to: destinationEmail,
      from: booking.establishment.confirmationEmailFrom || `noreply@resend.dev`,
      subject: `Confirmation de réservation - ${booking.establishment.name}`,
      html: htmlContent,
    });

    if (!result.success) {
      // Si l'envoi échoue avec un domaine personnalisé, essayer avec l'adresse de test
      if (!useTestEmail && process.env.NODE_ENV === "development") {
        console.log(
          `❌ Échec avec le domaine personnalisé. Tentative avec l'adresse de test...`
        );

        const fallbackResult = await sendEmail({
          to: "delivered@resend.dev",
          from: "noreply@resend.dev",
          subject: `Confirmation de réservation - ${booking.establishment.name}`,
          html: htmlContent,
        });

        if (fallbackResult.success) {
          console.log(
            `✅ Email envoyé avec succès à l'adresse de test (fallback)`
          );
        } else {
          // Ajouter un délai pour éviter le rate limit
          await new Promise((resolve) => setTimeout(resolve, 1000));
          throw new Error(
            fallbackResult.error || "Erreur lors de l'envoi de l'email"
          );
        }
      } else {
        // Ajouter un délai pour éviter le rate limit
        await new Promise((resolve) => setTimeout(resolve, 1000));
        throw new Error(result.error || "Erreur lors de l'envoi de l'email");
      }
    } else {
      console.log("✅ Email envoyé avec succès à:", destinationEmail);
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
}

async function sendWhatsAppConfirmation(
  booking: BookingWithDetails,
  templateData: TemplateData
) {
  // Récupérer le template personnalisé ou utiliser le template par défaut
  const template =
    booking.establishment.confirmationWhatsappTemplate ||
    getDefaultWhatsAppTemplate();

  // Remplacer les variables dans le template
  const whatsappContent = replaceTemplateVariables(template, templateData);

  // Ici, vous pouvez intégrer votre service WhatsApp (Twilio, WhatsApp Business API, etc.)
  // Pour l'instant, on simule l'envoi
  console.log("Envoi WhatsApp à:", booking.clientPhone);
  console.log("Contenu:", whatsappContent);

  // TODO: Intégrer un vrai service WhatsApp
  // await sendWhatsApp({
  //   to: booking.clientPhone,
  //   from: booking.establishment.confirmationWhatsappFrom,
  //   message: whatsappContent,
  // });
}

function replaceTemplateVariables(
  template: string,
  data: TemplateData
): string {
  let result = template;

  (Object.keys(data) as (keyof TemplateData)[]).forEach((key) => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, "g"), data[key]);
  });

  return result;
}

function getDefaultEmailTemplate(): string {
  return `Bonjour {clientFirstName} {clientLastName},

Votre réservation à {establishmentName} a été confirmée avec succès !

Détails de votre réservation :
- Chambre : {roomName}
- Arrivée : {checkInDate}
- Départ : {checkOutDate}
- Code d'accès : {accessCode}

{accessInstructions}

Nous vous souhaitons un excellent séjour !

Cordialement,
L'équipe de {establishmentName}

---

Guten Tag {clientFirstName} {clientLastName},

Ihre Buchung im {establishmentName} wurde erfolgreich bestätigt!

Details Ihrer Buchung:
- Zimmer: {roomName}
- Anreise: {checkInDate}
- Abreise: {checkOutDate}
- Zugangscode: {accessCode}

{accessInstructions}

Wir wünschen Ihnen einen ausgezeichneten Aufenthalt!

Mit freundlichen Grüßen,
Das Team von {establishmentName}`;
}

function getDefaultWhatsAppTemplate(): string {
  return `🏨 Réservation confirmée !

Bonjour {clientFirstName},

Votre réservation à {establishmentName} est confirmée ✅

📅 Arrivée : {checkInDate}
📅 Départ : {checkOutDate}
🏠 Chambre : {roomName}
🔑 Code d'accès : {accessCode}

{accessInstructions}

Bon séjour ! 😊

---

🏨 Buchung bestätigt!

Guten Tag {clientFirstName},

Ihre Buchung im {establishmentName} ist bestätigt ✅

📅 Anreise: {checkInDate}
📅 Abreise: {checkOutDate}
🏠 Zimmer: {roomName}
🔑 Zugangscode: {accessCode}

{accessInstructions}

Schönen Aufenthalt! 😊`;
}
