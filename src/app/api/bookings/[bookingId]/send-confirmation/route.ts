import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { isRateLimited } from "@/lib/rate-limiter";
import { replaceImagePlaceholders } from "@/lib/image-utils";

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
  hotelContactEmail: string;
  hotelContactPhone: string;
  bookingNumber: string;
  totalAmount: string; // Montant total payé par le client
  baseAmount: string; // Montant de base (sans frais de plateforme)
  roomPrice: string; // Prix de la chambre uniquement
  pricingOptionsTotal: string; // Total des options supplémentaires
  touristTaxTotal: string; // Total de la taxe de séjour
  currency: string;
}

interface BookingWithDetails {
  id: string;
  bookingNumber: number;
  hotelSlug: string;
  roomId: string | null;
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  clientPhone: string;
  amount: number;
  currency: string;
  ownerAmount: number;
  pricingOptionsTotal: number;
  touristTaxTotal: number;
  checkInDate: Date;
  checkOutDate: Date;
  stripePaymentIntentId: string | null;
  confirmationSent: boolean;
  confirmationSentAt: Date | null;
  bookingType: string;
  dayParkingDuration: string | null;
  dayParkingStartTime: Date | null;
  dayParkingEndTime: Date | null;
  hasDog: boolean | null;
  room: {
    id: string;
    name: string;
    price: number;
    allowDogs: boolean;
    accessCode: string | null;
  } | null;
  establishment: {
    id: string;
    name: string;
    accessCodeType: string;
    confirmationEmailEnabled: boolean;
    confirmationWhatsappEnabled: boolean;
    confirmationEmailTemplate: string | null;
    confirmationEmailTemplateWithDog: string | null;
    confirmationEmailTemplateWithoutDog: string | null;
    confirmationWhatsappTemplate: string | null;
    confirmationEmailFrom: string | null;
    confirmationWhatsappFrom: string | null;
    generalAccessCode: string | null;
    accessInstructions: string | null;
    hotelContactEmail: string | null;
    hotelContactPhone: string | null;
    enableEmailCopyOnConfirmation: boolean;
    emailCopyAddresses: string[];
  };
}

export async function POST(request: Request, { params }: Props) {
  try {
    const { bookingId } = await params;

    // Protection rate limiting par booking ID (maximum 3 tentatives par minute)
    if (
      isRateLimited(`booking-confirmation-${bookingId}`, {
        windowMs: 60000,
        maxRequests: 3,
      })
    ) {
      console.log(`🚫 Rate limit dépassé pour la réservation ${bookingId}`);
      return NextResponse.json(
        {
          error:
            "Trop de tentatives d'envoi. Veuillez patienter avant de réessayer.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { method } = body;

    if (!method || !["email", "whatsapp"].includes(method)) {
      return NextResponse.json(
        { error: "Méthode de confirmation invalide" },
        { status: 400 }
      );
    }

    // Récupérer la réservation complète
    const booking: BookingWithDetails | null = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        bookingNumber: true,
        hotelSlug: true,
        roomId: true,
        clientEmail: true,
        clientFirstName: true,
        clientLastName: true,
        clientPhone: true,
        amount: true,
        currency: true,
        ownerAmount: true,
        pricingOptionsTotal: true,
        touristTaxTotal: true,
        checkInDate: true,
        checkOutDate: true,
        stripePaymentIntentId: true,
        confirmationSent: true,
        confirmationSentAt: true,
        bookingType: true,
        dayParkingDuration: true,
        dayParkingStartTime: true,
        dayParkingEndTime: true,
        hasDog: true,
        room: {
          select: {
            id: true,
            name: true,
            price: true,
            allowDogs: true,
            accessCode: true,
          },
        },
        establishment: {
          select: {
            id: true,
            name: true,
            accessCodeType: true,
            confirmationEmailEnabled: true,
            confirmationWhatsappEnabled: true,
            confirmationEmailTemplate: true,
            confirmationEmailTemplateWithDog: true,
            confirmationEmailTemplateWithoutDog: true,
            confirmationWhatsappTemplate: true,
            confirmationEmailFrom: true,
            confirmationWhatsappFrom: true,
            generalAccessCode: true,
            accessInstructions: true,
            hotelContactEmail: true,
            hotelContactPhone: true,
            enableEmailCopyOnConfirmation: true,
            emailCopyAddresses: true,
          },
        },
      },
    });
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

    // Vérifier si une confirmation a déjà été envoyée récemment (dans les 5 dernières minutes)
    if (booking.confirmationSent && booking.confirmationSentAt) {
      const now = new Date();
      const lastSent = new Date(booking.confirmationSentAt);
      const diffInMinutes = (now.getTime() - lastSent.getTime()) / (1000 * 60);

      if (diffInMinutes < 5) {
        console.log(
          `⚠️ Email de confirmation déjà envoyé il y a ${Math.round(
            diffInMinutes
          )} minute(s). Éviter l'envoi en double.`
        );
        return NextResponse.json({
          message: "Confirmation déjà envoyée récemment",
          lastSent: booking.confirmationSentAt,
        });
      }
    }

    // Déterminer le code d'accès selon la configuration
    let accessCode = "Voir instructions";

    switch (booking.establishment.accessCodeType) {
      case "room":
        // Priorité au code de la chambre
        accessCode = booking.room?.accessCode || "Code chambre non défini";
        break;
      case "general":
        // Code général de l'établissement
        accessCode =
          booking.establishment.generalAccessCode || "Code général non défini";
        break;
      case "custom":
        // Instructions personnalisées complètes
        accessCode =
          booking.establishment.accessInstructions ||
          "Instructions non configurées";
        break;
      default:
        // Fallback : essayer code chambre puis général
        accessCode =
          booking.room?.accessCode ||
          booking.establishment.generalAccessCode ||
          "Voir instructions";
    }

    // Préparer les données pour le template selon le type de réservation
    const isBookingDayParking = booking.bookingType === "day";

    // Calculer la durée et le prix de base pour les données détaillées
    let duration = 1;
    let roomBasePrice = 0;

    if (!isBookingDayParking && booking.room) {
      duration = Math.ceil(
        (booking.checkOutDate.getTime() - booking.checkInDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      roomBasePrice = booking.room.price * duration;
    }

    // Calculer le montant de base (sans frais de plateforme)
    const baseAmount =
      roomBasePrice + booking.pricingOptionsTotal + booking.touristTaxTotal;

    const templateData: TemplateData = {
      clientFirstName: booking.clientFirstName,
      clientLastName: booking.clientLastName,
      establishmentName: booking.establishment.name,
      roomName: isBookingDayParking
        ? `Place de parking (${booking.dayParkingDuration})`
        : booking.room?.name || "Parking jour",
      checkInDate: isBookingDayParking
        ? booking.dayParkingStartTime?.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) || "Non défini"
        : booking.checkInDate.toLocaleDateString("fr-FR"),
      checkOutDate: isBookingDayParking
        ? booking.dayParkingEndTime?.toLocaleDateString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }) || "Non défini"
        : booking.checkOutDate.toLocaleDateString("fr-FR"),
      accessCode,
      hotelContactEmail:
        booking.establishment.hotelContactEmail || "Non renseigné",
      hotelContactPhone:
        booking.establishment.hotelContactPhone || "Non renseigné",
      bookingNumber: booking.bookingNumber.toString(),
      totalAmount: booking.amount.toFixed(2), // Montant total payé par le client
      baseAmount: baseAmount.toFixed(2), // Montant de base (sans frais de plateforme)
      roomPrice: roomBasePrice.toFixed(2), // Prix de la chambre uniquement
      pricingOptionsTotal: booking.pricingOptionsTotal.toFixed(2), // Total des options
      touristTaxTotal: booking.touristTaxTotal.toFixed(2), // Total de la taxe de séjour
      currency: booking.currency || "CHF",
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

// Fonction pour traiter les placeholders d'images
async function processImagePlaceholders(
  content: string,
  establishmentId: string
): Promise<string> {
  return await replaceImagePlaceholders(content, establishmentId);
}

async function sendEmailConfirmation(
  booking: BookingWithDetails,
  templateData: TemplateData
) {
  // Choisir le bon template selon si le client a un chien
  let template: string;

  // Si le client a coché "avec chien" et qu'un template spécifique est défini
  if (
    booking.hasDog &&
    booking.establishment.confirmationEmailTemplateWithDog
  ) {
    template = booking.establishment.confirmationEmailTemplateWithDog;
    console.log(
      "📧 Utilisation du template EMAIL AVEC CHIEN (client a un chien)"
    );
  }
  // Sinon, utiliser le template normal (général)
  else {
    template =
      booking.establishment.confirmationEmailTemplate ||
      getDefaultEmailTemplate();
    console.log("📧 Utilisation du template EMAIL NORMAL");
  }

  // Remplacer les variables dans le template
  let emailContent = replaceTemplateVariables(template, templateData);

  // Traiter les placeholders d'images
  emailContent = await processImagePlaceholders(
    emailContent,
    booking.establishment.id
  );

  // Détecter si c'est du HTML Unlayer (contient des balises HTML complexes)
  const isUnlayerHtml =
    emailContent.includes("<table") ||
    emailContent.includes("<!DOCTYPE") ||
    emailContent.includes("<html") ||
    (emailContent.includes("<div") && emailContent.includes("style="));

  let htmlContent: string;

  if (isUnlayerHtml) {
    // C'est du HTML Unlayer, l'utiliser tel quel
    htmlContent = emailContent;
    console.log("📧 Template HTML Unlayer détecté - utilisation directe");
  } else {
    // C'est du texte simple, l'emballer dans un template de base
    htmlContent = `
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
    console.log("📧 Template texte simple détecté - emballage HTML appliqué");
  }

  try {
    // Logique intelligente pour l'adresse email de destination
    let destinationEmail = booking.clientEmail;

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
        console.log(
          `📧 Utilisation de l'adresse de test Resend: ${destinationEmail} (original: ${booking.clientEmail})`
        );
      }
    }

    // Fonction d'envoi avec retry automatique
    const sendEmailWithRetry = async () => {
      // Préparer les adresses en copie si activées
      let bccAddresses: string[] = [];
      if (
        booking.establishment.enableEmailCopyOnConfirmation &&
        booking.establishment.emailCopyAddresses &&
        booking.establishment.emailCopyAddresses.length > 0
      ) {
        bccAddresses = booking.establishment.emailCopyAddresses;
        console.log(
          `📧 Envoi avec copie à ${bccAddresses.length} adresse(s): ${bccAddresses.join(", ")}`
        );
      }

      const result = await sendEmail({
        to: destinationEmail,
        from:
          booking.establishment.confirmationEmailFrom || `noreply@resend.dev`,
        subject: `Confirmation de réservation - ${booking.establishment.name}`,
        html: htmlContent,
        bcc: bccAddresses.length > 0 ? bccAddresses : undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de l'envoi de l'email");
      }

      return result;
    };

    // Tenter l'envoi avec retry automatique
    await retryWithBackoff(sendEmailWithRetry, 3, 1000);

    console.log("✅ Email envoyé avec succès à:", destinationEmail);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);

    // Si on est en développement et qu'on n'utilisait pas déjà l'adresse de test, essayer en fallback
    if (
      process.env.NODE_ENV === "development" &&
      booking.clientEmail !== "delivered@resend.dev"
    ) {
      console.log("🔄 Tentative de fallback avec l'adresse de test Resend...");

      try {
        const fallbackSend = async () => {
          // Préparer les adresses en copie si activées
          let bccAddresses: string[] = [];
          if (
            booking.establishment.enableEmailCopyOnConfirmation &&
            booking.establishment.emailCopyAddresses &&
            booking.establishment.emailCopyAddresses.length > 0
          ) {
            bccAddresses = booking.establishment.emailCopyAddresses;
          }

          const fallbackResult = await sendEmail({
            to: "delivered@resend.dev",
            from: "noreply@resend.dev",
            subject: `Confirmation de réservation - ${booking.establishment.name}`,
            html: htmlContent,
            bcc: bccAddresses.length > 0 ? bccAddresses : undefined,
          });

          if (!fallbackResult.success) {
            throw new Error(
              fallbackResult.error || "Erreur lors de l'envoi de l'email"
            );
          }

          return fallbackResult;
        };

        await retryWithBackoff(fallbackSend, 2, 1500);
        console.log(
          "✅ Email envoyé avec succès à l'adresse de test (fallback)"
        );
        return;
      } catch (fallbackError) {
        console.error("❌ Échec du fallback:", fallbackError);
      }
    }

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

📋 Numéro de réservation : {bookingNumber}
💰 Montant payé : {totalAmount} {currency}

Détails de votre réservation :
- Place : {roomName}
- Arrivée : {checkInDate}
- Départ : {checkOutDate}
- Code d'accès : {accessCode}

Contactez-nous pour plus d'informations

Pour toute question, vous pouvez nous contacter :
📧 Email : {hotelContactEmail}
📞 Téléphone : {hotelContactPhone}

Nous vous souhaitons un excellent séjour !

Cordialement,
L'équipe de {establishmentName}

---

Guten Tag {clientFirstName} {clientLastName},

Ihre Buchung im {establishmentName} wurde erfolgreich bestätigt!

📋 Buchungsnummer: {bookingNumber}
💰 Gezahlter Betrag: {totalAmount} {currency}

Details Ihrer Buchung:
- Zimmer: {roomName}
- Anreise: {checkInDate}
- Abreise: {checkOutDate}
- Zugangscode: {accessCode}

Bei Fragen können Sie uns gerne kontaktieren:
📧 E-Mail: {hotelContactEmail}
📞 Telefon: {hotelContactPhone}

Wir wünschen Ihnen einen ausgezeichneten Aufenthalt!

Mit freundlichen Grüßen,
Das Team von {establishmentName}`;
}

function getDefaultWhatsAppTemplate(): string {
  return `🏨 Réservation confirmée !

Bonjour {clientFirstName},

Votre réservation à {establishmentName} est confirmée ✅

📋 N° réservation : {bookingNumber}
💰 Montant payé : {totalAmount} {currency}
📅 Arrivée : {checkInDate}
📅 Départ : {checkOutDate}
🏠 Chambre : {roomName}
🔑 Code d'accès : {accessCode}

💬 Contact :
📧 {hotelContactEmail}
📞 {hotelContactPhone}

Bon séjour ! 😊

---

🏨 Buchung bestätigt!

Guten Tag {clientFirstName},

Ihre Buchung im {establishmentName} ist bestätigt ✅

📋 Buchungsnr.: {bookingNumber}
💰 Gezahlter Betrag: {totalAmount} {currency}
📅 Anreise: {checkInDate}
📅 Abreise: {checkOutDate}
🏠 Zimmer: {roomName}
🔑 Zugangscode: {accessCode}

💬 Kontakt:
📧 {hotelContactEmail}
📞 {hotelContactPhone}

Schönen Aufenthalt! 😊`;
}

// Fonction utilitaire pour gérer les délais avec retry progressif
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Délai progressif: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(
          `⏳ Tentative ${attempt}/${maxRetries} après un délai de ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Si c'est une erreur de rate limit et qu'il reste des tentatives
      if (
        error instanceof Error &&
        error.message.includes("rate_limit_exceeded") &&
        attempt < maxRetries
      ) {
        console.log(
          `🔄 Rate limit détecté, tentative ${attempt + 1}/${maxRetries + 1}`
        );
        continue;
      }

      // Pour les autres erreurs ou si on a épuisé les tentatives
      if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }

  throw lastError!;
}
