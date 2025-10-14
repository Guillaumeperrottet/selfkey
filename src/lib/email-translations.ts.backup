/**
 * Fonction helper pour traduire les emails de confirmation
 * en fonction de la langue du client
 */

import { translations, type Locale } from "./booking-translations";

export function getEmailTranslations(locale: Locale = "fr") {
  return translations[locale].email;
}

/**
 * Détecte la langue préférée du client à partir de différentes sources
 */
export function detectClientLocale(
  savedLocale?: string,
  clientEmail?: string,
  browserLocale?: string
): Locale {
  // 1. Priorité à la langue sauvegardée
  if (savedLocale && ["fr", "en", "de"].includes(savedLocale)) {
    return savedLocale as Locale;
  }

  // 2. Détecter depuis l'email (domaines .de, .fr, etc.)
  if (clientEmail) {
    const domain = clientEmail.split("@")[1]?.toLowerCase();
    if (domain?.endsWith(".de") || domain?.endsWith(".at")) return "de";
    if (domain?.endsWith(".fr")) return "fr";
    if (domain?.endsWith(".ch")) return "fr"; // Suisse par défaut FR
  }

  // 3. Depuis le navigateur
  if (browserLocale) {
    const lang = browserLocale.toLowerCase().split("-")[0];
    if (["fr", "en", "de"].includes(lang)) return lang as Locale;
  }

  // 4. Par défaut: français
  return "fr";
}

/**
 * Traduit le sujet de l'email
 */
export function getEmailSubject(
  locale: Locale,
  establishmentName: string
): string {
  const t = getEmailTranslations(locale);
  return `${t.subject} - ${establishmentName}`;
}

/**
 * Génère le corps de l'email traduit
 */
export function generateEmailBody(
  locale: Locale,
  data: {
    clientName: string;
    bookingNumber: string;
    checkInDate: string;
    checkOutDate: string;
    roomName: string;
    totalAmount: string;
    currency: string;
    establishmentName: string;
    accessInstructions?: string;
    invoiceDownloadUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
  }
): string {
  const t = getEmailTranslations(locale);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t.subject}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          background-color: #84994F; 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content { 
          background-color: #f9f9f9; 
          padding: 30px 20px; 
        }
        .booking-details { 
          background-color: white; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
          border-left: 4px solid #84994F;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #666;
        }
        .detail-value {
          color: #333;
        }
        .total {
          background-color: #84994F;
          color: white;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
          font-size: 20px;
          font-weight: bold;
        }
        .button { 
          display: inline-block; 
          background-color: #84994F; 
          color: white !important; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 15px 0;
          font-weight: 600;
        }
        .button:hover {
          background-color: #6d7d3f;
        }
        .access-section {
          background-color: #e3f2fd;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer { 
          text-align: center; 
          padding: 20px; 
          color: #666; 
          font-size: 14px; 
        }
        a { 
          color: #84994F; 
          text-decoration: none; 
        }
        a:hover { 
          text-decoration: underline; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${t.confirmed}</h1>
      </div>
      
      <div class="content">
        <p><strong>${t.greeting(data.clientName)}</strong></p>
        <p>${t.confirmed}</p>
        
        <div class="booking-details">
          <h3 style="margin-top: 0; color: #84994F;">${t.bookingDetails}</h3>
          
          <div class="detail-row">
            <span class="detail-label">${t.bookingNumber}:</span>
            <span class="detail-value"><strong>${data.bookingNumber}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">${t.roomType}:</span>
            <span class="detail-value">${data.roomName}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">${t.arrivalDate}:</span>
            <span class="detail-value">${data.checkInDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">${t.departureDate}:</span>
            <span class="detail-value">${data.checkOutDate}</span>
          </div>
        </div>
        
        <div class="total">
          ${t.totalAmount}: ${data.totalAmount} ${data.currency}
        </div>
        
        ${
          data.accessInstructions
            ? `
        <div class="access-section">
          <h3 style="margin-top: 0; color: #1976d2;">${t.accessInstructions}</h3>
          ${data.accessInstructions}
        </div>
        `
            : ""
        }
        
        ${
          data.invoiceDownloadUrl
            ? `
        <div style="text-align: center;">
          <a href="${data.invoiceDownloadUrl}" class="button">
            ${t.downloadInvoice}
          </a>
        </div>
        `
            : ""
        }
        
        <div class="footer">
          <p><strong>${t.needHelp}</strong></p>
          ${data.contactEmail ? `<p>📧 <a href="mailto:${data.contactEmail}">${data.contactEmail}</a></p>` : ""}
          ${data.contactPhone ? `<p>📞 ${data.contactPhone}</p>` : ""}
          <br>
          <p>${t.thanks}</p>
          <p><strong>${t.team} ${data.establishmentName}</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
