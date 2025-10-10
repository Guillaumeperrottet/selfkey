import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoiceDownloadUrl } from "@/lib/invoice-security";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { bookingId, clientEmail } = await request.json();

    if (!bookingId || !clientEmail) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Vérifier que la réservation existe et appartient au bon client
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { establishment: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    if (booking.clientEmail !== clientEmail) {
      return NextResponse.json({ error: "Email incorrect" }, { status: 403 });
    }

    // Générer le lien de téléchargement sécurisé
    const invoiceDownloadUrl = generateInvoiceDownloadUrl(
      bookingId,
      clientEmail
    );

    // Envoyer l'email avec le lien de facture
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lien de téléchargement de votre facture</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin: 20px 0; }
          .invoice-section { background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 15px 0; text-align: center; }
          .invoice-button { 
            display: inline-block; 
            background-color: #1976d2; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold; 
            margin: 15px 0;
            font-size: 16px;
          }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${booking.establishment.name}</h1>
            <h2>Téléchargement de votre facture</h2>
          </div>
          
          <div class="content">
            <p>Bonjour ${booking.clientFirstName} ${booking.clientLastName},</p>
            
            <p>Voici le lien pour télécharger votre facture de réservation :</p>
            
            <div class="invoice-section">
              <h3>📄 Facture - Réservation #${booking.bookingNumber}</h3>
              <p><strong>Montant :</strong> ${booking.amount} ${booking.currency}</p>
              <p><strong>Date :</strong> ${booking.bookingDate.toLocaleDateString("fr-FR")}</p>
              
              <a href="${invoiceDownloadUrl}" class="invoice-button">
                📥 Facture / Rechnung / Invoice PDF
              </a>
              
              <p style="font-size: 12px; color: #666; margin-top: 15px;">
                Ce lien est sécurisé et personnel à votre réservation.<br>
                Vous pouvez l'utiliser à tout moment pour télécharger votre facture.
              </p>
            </div>
            
            <p>Pour toute question concernant votre facture ou votre séjour, n'hésitez pas à nous contacter.</p>
            
            <p>Cordialement,<br>
            L'équipe de ${booking.establishment.name}</p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement suite à votre demande.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to: clientEmail,
      from: `${booking.establishment.name} <noreply@selfkey.ch>`,
      subject: `Votre facture - Réservation #${booking.bookingNumber} - ${booking.establishment.name}`,
      html: htmlContent,
    });

    if (!result.success) {
      throw new Error(result.error || "Erreur lors de l'envoi de l'email");
    }

    return NextResponse.json({
      success: true,
      message: "Email avec lien de facture envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur envoi lien facture:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du lien de facture" },
      { status: 500 }
    );
  }
}
