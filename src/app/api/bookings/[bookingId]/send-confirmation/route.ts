import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

  // Ici, vous pouvez intégrer votre service d'email (SendGrid, Nodemailer, etc.)
  // Pour l'instant, on simule l'envoi
  console.log("Envoi email à:", booking.clientEmail);
  console.log("Contenu:", emailContent);

  // TODO: Intégrer un vrai service d'email
  // await sendEmail({
  //   to: booking.clientEmail,
  //   from: booking.establishment.confirmationEmailFrom,
  //   subject: `Confirmation de réservation - ${booking.establishment.name}`,
  //   text: emailContent,
  // });
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
L'équipe de {establishmentName}`;
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

Bon séjour ! 😊`;
}
