import { Resend } from "resend";
import { HotelConfig } from "@/types/hotel";
import { prisma } from "@/lib/prisma";
import {
  getAccessCodeForBooking,
  generateAccessInstructions,
} from "@/lib/access-codes";

// Resend est optionnel - ne pas planter si pas configuré
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface BookingConfirmationData {
  id: string; // ID de la réservation
  clientName: string;
  clientEmail: string;
  roomName: string;
  roomId: string | null;
  amount: number;
  currency: string;
  bookingDate: Date;
  hotelSlug: string; // Ajouté pour récupérer les codes d'accès
}

export async function sendBookingConfirmation(
  booking: BookingConfirmationData,
  hotelConfig: HotelConfig
) {
  // Récupérer les informations d'accès pour cette réservation
  const accessInfo = booking.roomId
    ? await getAccessCodeForBooking(booking.hotelSlug, booking.roomId)
    : null;
  const accessInstructionsHtml = generateAccessInstructions(accessInfo);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation de réservation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${hotelConfig.colors.primary}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .booking-details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${hotelConfig.name}</h1>
          <h2>Confirmation de réservation</h2>
        </div>
        
        <div class="content">
          <p>Bonjour ${booking.clientName},</p>
          
          <p>Votre réservation a été confirmée avec succès !</p>
          
          <div class="booking-details">
            <h3>Détails de votre réservation :</h3>
            <p><strong>📋 Numéro de réservation :</strong> ${booking.id}</p>
            <p><strong>Chambre :</strong> ${booking.roomName} (N° ${booking.roomId})</p>
            <p><strong>Date :</strong> ${booking.bookingDate.toLocaleDateString("fr-CH")}</p>
            <p><strong>Montant payé :</strong> ${booking.amount} ${booking.currency}</p>
          </div>
          
          ${accessInstructionsHtml}
          
          <p>Vous pouvez vous présenter directement à votre chambre. En cas de problème, contactez-nous :</p>
          <p>
            <strong>Email :</strong> ${hotelConfig.contact.email}<br>
            <strong>Téléphone :</strong> ${hotelConfig.contact.phone}
          </p>
          
          <p>Nous vous souhaitons un excellent séjour !</p>
        </div>
        
        <div class="footer">
          <p>Cette confirmation a été générée automatiquement.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Si Resend n'est pas configuré, on simule l'envoi
    if (!resend) {
      console.log("📧 Email simulé (Resend non configuré):", {
        to: booking.clientEmail,
        subject: `Confirmation de réservation - ${hotelConfig.name}`,
        booking: booking,
      });
      return { id: "simulated-email" };
    }

    const { data, error } = await resend.emails.send({
      from: `${hotelConfig.name} <noreply@selfkey.ch>`,
      to: [booking.clientEmail],
      subject: `Confirmation de réservation - ${hotelConfig.name}`,
      html: htmlContent,
    });

    if (error) {
      console.error("Erreur envoi email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
}

// Interface pour les données de réservation parking jour
interface DayParkingBookingData {
  clientName: string;
  clientEmail: string;
  vehicleNumber: string;
  duration: string;
  startTime: Date;
  endTime: Date;
  amount: number;
  currency: string;
  establishmentName: string;
  bookingId: string;
  hotelSlug: string; // Ajouté pour générer le lien d'extension
}

export async function sendDayParkingConfirmation(
  booking: DayParkingBookingData
) {
  try {
    // Récupérer le template d'email personnalisé depuis la base de données
    const establishment = await prisma.establishment.findUnique({
      where: { slug: booking.hotelSlug },
      select: {
        dayParkingEmailTemplate: true,
        name: true,
        hotelContactEmail: true,
        hotelContactPhone: true,
      },
    });

    if (!establishment) {
      throw new Error(`Établissement non trouvé: ${booking.hotelSlug}`);
    }

    // Template par défaut si aucun template personnalisé
    const defaultTemplate = `Bonjour {clientFirstName} {clientLastName},

Votre réservation de parking jour à {establishmentName} a été confirmée avec succès !

📋 Numéro de réservation : {bookingId}

Détails de votre parking :
- Durée : {dayParkingDuration}
- Heure de fin : {dayParkingEndTime}
- Plaque d'immatriculation : {clientVehicleNumber}

IMPORTANT : Votre stationnement commence dès maintenant. Veillez à libérer la place avant {dayParkingEndTime}.

⏰ Besoin de plus de temps ?
Réservez facilement une extension : {extendParkingUrl}

Pour toute question, vous pouvez nous contacter :
📧 Email : {hotelContactEmail}
📞 Téléphone : {hotelContactPhone}

Bon stationnement !

Cordialement,
L'équipe de {establishmentName}

---

Hello {clientFirstName} {clientLastName},

Your day parking reservation at {establishmentName} has been successfully confirmed!

Parking details:
- Duration: {dayParkingDuration}
- End time: {dayParkingEndTime}
- License plate: {clientVehicleNumber}

IMPORTANT: Your parking starts now. Please free the space before {dayParkingEndTime}.

⏰ Need more time?
Easily book an extension: {extendParkingUrl}

For any questions, you can contact us:
📧 Email: {hotelContactEmail}
📞 Phone: {hotelContactPhone}

Happy parking!

Best regards,
The {establishmentName} team

---

Guten Tag {clientFirstName} {clientLastName},

Ihre Tagesparkplatz-Reservierung bei {establishmentName} wurde erfolgreich bestätigt!

📋 Buchungsnummer: {bookingId}

Parkplatz-Details:
- Dauer: {dayParkingDuration}
- Endzeit: {dayParkingEndTime}
- Kennzeichen: {clientVehicleNumber}

WICHTIG: Ihr Parkplatz beginnt jetzt. Bitte räumen Sie den Platz vor {dayParkingEndTime}.

⏰ Mehr Zeit benötigt?
Einfach eine Verlängerung buchen: {extendParkingUrl}

Für Fragen können Sie uns kontaktieren:
📧 E-Mail: {hotelContactEmail}
📞 Telefon: {hotelContactPhone}

Gutes Parken!

Mit freundlichen Grüßen,
Das {establishmentName} Team`;

    const template = establishment.dayParkingEmailTemplate || defaultTemplate;

    // Générer l'URL d'extension
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://selfkey.ch";
    const extendParkingUrl = `${baseUrl}/${booking.hotelSlug}/parking-jour`;

    // Formatage des dates
    const formatTime = (date: Date) => {
      return date.toLocaleString("fr-CH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getDurationLabel = (duration: string) => {
      const labels = {
        "1h": "1 heure",
        "2h": "2 heures",
        "3h": "3 heures",
        "4h": "4 heures",
        half_day: "Demi-journée (6h)",
        full_day: "Journée complète (12h)",
      };
      return labels[duration as keyof typeof labels] || duration;
    };

    // Remplacer les variables dans le template
    const personalizedContent = template
      .replace(/{clientFirstName}/g, booking.clientName.split(" ")[0] || "")
      .replace(
        /{clientLastName}/g,
        booking.clientName.split(" ").slice(1).join(" ") || ""
      )
      .replace(/{establishmentName}/g, booking.establishmentName)
      .replace(/{clientVehicleNumber}/g, booking.vehicleNumber)
      .replace(/{dayParkingDuration}/g, getDurationLabel(booking.duration))
      .replace(/{dayParkingStartTime}/g, formatTime(booking.startTime))
      .replace(/{dayParkingEndTime}/g, formatTime(booking.endTime))
      .replace(/{amount}/g, booking.amount.toFixed(2))
      .replace(/{currency}/g, booking.currency)
      .replace(/{extendParkingUrl}/g, extendParkingUrl)
      .replace(/{hotelContactEmail}/g, establishment.hotelContactEmail || "")
      .replace(/{hotelContactPhone}/g, establishment.hotelContactPhone || "")
      .replace(/{bookingId}/g, booking.bookingId);

    // Convertir le contenu en HTML simple
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation Parking Jour</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background-color: #f8fafc; white-space: pre-line; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚗 Parking Jour Confirmé</h1>
          <p>Votre place de parking est réservée</p>
        </div>
        <div class="content">
          ${personalizedContent}
        </div>
        <div class="footer">
          <p>Cette confirmation a été générée automatiquement.</p>
          <p>Numéro de réservation : ${booking.bookingId.slice(-8).toUpperCase()}</p>
        </div>
      </body>
      </html>
    `;

    // Envoyer l'email
    if (!resend) {
      console.log("📧 Email parking jour simulé (Resend non configuré):", {
        to: booking.clientEmail,
        subject: `🚗 Parking Jour Confirmé - ${booking.establishmentName}`,
        content: personalizedContent.substring(0, 200) + "...",
      });
      return { id: "simulated-email-day-parking" };
    }

    const { data, error } = await resend.emails.send({
      from: `${booking.establishmentName} <noreply@selfkey.ch>`,
      to: [booking.clientEmail],
      subject: `🚗 Parking Jour Confirmé - ${booking.establishmentName}`,
      html: htmlContent,
    });

    if (error) {
      console.error("Erreur envoi email parking jour:", error);
      throw error;
    }

    console.log("✅ Email parking jour envoyé avec succès:", data?.id);
    return data;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email parking jour:", error);
    throw error;
  }
}

// Fonction générique pour envoyer des emails (utilisée par Better Auth)
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!resend) {
    console.warn("⚠️ Resend non configuré - simulation envoi email");
    console.log(`📧 Email simulé - À: ${to}, Sujet: ${subject}`);
    return { id: "simulated-email" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "SelfKey <noreply@selfkey.ch>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Erreur envoi email:", error);
      throw new Error(`Erreur envoi email: ${error.message}`);
    }

    console.log("📧 Email envoyé avec succès:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
}
