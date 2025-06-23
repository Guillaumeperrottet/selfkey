import { Resend } from "resend";
import { HotelConfig } from "@/types/hotel";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface BookingConfirmationData {
  clientName: string;
  clientEmail: string;
  roomName: string;
  roomId: string;
  amount: number;
  currency: string;
  bookingDate: Date;
}

export async function sendBookingConfirmation(
  booking: BookingConfirmationData,
  hotelConfig: HotelConfig
) {
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
    const { data, error } = await resend.emails.send({
      from: `${hotelConfig.name} <no-reply@votrapp.com>`,
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
