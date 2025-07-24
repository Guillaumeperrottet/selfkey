import { Resend } from "resend";
import { HotelConfig } from "@/types/hotel";
import {
  getAccessCodeForBooking,
  generateAccessInstructions,
} from "@/lib/access-codes";

// Resend est optionnel - ne pas planter si pas configuré
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface BookingConfirmationData {
  clientName: string;
  clientEmail: string;
  roomName: string;
  roomId: string;
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
  const accessInfo = await getAccessCodeForBooking(
    booking.hotelSlug,
    booking.roomId
  );
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
}

export async function sendDayParkingConfirmation(
  booking: DayParkingBookingData
) {
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

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation Parking Jour</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background-color: #f8fafc; }
        .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
        .detail-label { font-weight: 600; color: #475569; }
        .detail-value { font-weight: 500; }
        .highlight { background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2563eb; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; }
        .total { font-size: 18px; font-weight: bold; color: #059669; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 Parking Jour Confirmé</h1>
          <p>Votre place de parking est réservée</p>
        </div>
        
        <div class="content">
          <p>Bonjour <strong>${booking.clientName}</strong>,</p>
          
          <p>Votre réservation de parking jour a été confirmée avec succès !</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #1e40af;">Détails de votre réservation</h3>
            
            <div class="detail-row">
              <span class="detail-label">Établissement :</span>
              <span class="detail-value">${booking.establishmentName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Véhicule :</span>
              <span class="detail-value">${booking.vehicleNumber}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Durée :</span>
              <span class="detail-value">${getDurationLabel(booking.duration)}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Début :</span>
              <span class="detail-value">${formatTime(booking.startTime)}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Fin :</span>
              <span class="detail-value">${formatTime(booking.endTime)}</span>
            </div>
            
            <div class="detail-row" style="border-bottom: none; padding-top: 15px;">
              <span class="detail-label">Total payé :</span>
              <span class="detail-value total">${booking.amount.toFixed(2)} ${booking.currency}</span>
            </div>
          </div>
          
          <div class="highlight">
            <strong>📍 Informations importantes :</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Votre temps de stationnement a commencé dès la confirmation du paiement</li>
              <li>Veuillez respecter les horaires indiqués ci-dessus</li>
              <li>Gardez cette confirmation avec vous pendant votre stationnement</li>
            </ul>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 14px; color: #475569;">
              <strong>Numéro de réservation :</strong> 
              <span style="font-family: monospace; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px;">
                ${booking.bookingId.slice(-8).toUpperCase()}
              </span>
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>Cette confirmation a été générée automatiquement.</p>
          <p>Merci d'avoir choisi nos services !</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Si Resend n'est pas configuré, on simule l'envoi
    if (!resend) {
      console.log("📧 Email parking jour simulé (Resend non configuré):", {
        to: booking.clientEmail,
        subject: `Parking Jour Confirmé - ${booking.establishmentName}`,
        booking: booking,
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
