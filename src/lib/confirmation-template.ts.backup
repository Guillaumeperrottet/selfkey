import { replaceImagePlaceholders } from "@/lib/image-utils";
import { generateInvoiceDownloadUrl } from "@/lib/invoice-security";

export interface TemplateData {
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
  totalAmount: string; // Montant total payé par le client (avec frais de plateforme)
  baseAmount: string; // Montant de base (sans frais de plateforme)
  roomPrice: string; // Prix de la chambre uniquement
  pricingOptionsTotal: string; // Total des options supplémentaires
  touristTaxTotal: string; // Total de la taxe de séjour
  currency: string;
  invoiceDownloadUrl: string; // Lien de téléchargement de facture
}

export interface BookingWithDetails {
  id: string;
  bookingNumber?: number;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  checkInDate: Date;
  checkOutDate: Date;
  bookingType: string;
  dayParkingDuration?: string | null;
  dayParkingStartTime?: Date | null;
  dayParkingEndTime?: Date | null;
  hasDog: boolean;
  bookingLocale?: string; // Langue choisie: "fr", "en", "de"
  stripePaymentIntentId: string | null;
  amount: number; // Montant total payé par le client
  currency: string;
  ownerAmount: number; // Montant reçu par l'hôtelier (sans frais de plateforme)
  pricingOptionsTotal: number; // Total des options supplémentaires
  touristTaxTotal: number; // Total de la taxe de séjour
  room: {
    name: string;
    price: number; // Prix de la chambre
    accessCode: string | null;
  } | null;
  establishment: {
    id: string;
    name: string;
    accessCodeType: string;
    // Templates français
    confirmationEmailTemplate: string | null;
    confirmationEmailTemplateWithDog: string | null;
    confirmationEmailTemplateWithoutDog: string | null;
    // Templates anglais
    confirmationEmailTemplateEn: string | null;
    confirmationEmailTemplateWithDogEn: string | null;
    confirmationEmailTemplateWithoutDogEn: string | null;
    // Templates allemands
    confirmationEmailTemplateDe: string | null;
    confirmationEmailTemplateWithDogDe: string | null;
    confirmationEmailTemplateWithoutDogDe: string | null;
    generalAccessCode: string | null;
    accessInstructions: string | null;
    hotelContactEmail: string | null;
    hotelContactPhone: string | null;
  };
}

/**
 * Génère les données du template pour une réservation
 */
export function generateTemplateData(
  booking: BookingWithDetails
): TemplateData {
  // Déterminer le code d'accès selon la configuration
  let accessCode = "Voir instructions";

  switch (booking.establishment.accessCodeType) {
    case "room":
      accessCode = booking.room?.accessCode || "Code chambre non défini";
      break;
    case "general":
      accessCode =
        booking.establishment.generalAccessCode || "Code général non défini";
      break;
    case "custom":
      accessCode =
        booking.establishment.accessInstructions ||
        "Instructions non configurées";
      break;
    default:
      accessCode =
        booking.room?.accessCode ||
        booking.establishment.generalAccessCode ||
        "Voir instructions";
  }

  // Préparer les données selon le type de réservation
  const isBookingDayParking = booking.bookingType === "day";

  // Calculer la durée pour le prix de base de la chambre
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

  return {
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
    bookingNumber: booking.bookingNumber?.toString() || booking.id,
    totalAmount: booking.amount.toFixed(2), // Montant total payé par le client
    baseAmount: baseAmount.toFixed(2), // Montant de base (sans frais de plateforme)
    roomPrice: roomBasePrice.toFixed(2), // Prix de la chambre uniquement
    pricingOptionsTotal: booking.pricingOptionsTotal.toFixed(2), // Total des options
    touristTaxTotal: booking.touristTaxTotal.toFixed(2), // Total de la taxe de séjour
    currency: booking.currency || "CHF",
    invoiceDownloadUrl: generateInvoiceDownloadUrl(
      booking.id,
      booking.clientEmail
    ), // Lien de téléchargement de facture
  };
}

/**
 * Génère le contenu de confirmation (même logique que l'email)
 */
export async function generateConfirmationContent(
  booking: BookingWithDetails,
  templateData: TemplateData
): Promise<string> {
  // Déterminer la langue de la réservation (par défaut: français)
  const locale = booking.bookingLocale || "fr";

  // Sélectionner le bon template selon la langue ET si le client a un chien
  let template: string | null = null;

  // Templates pour les réservations avec chien
  if (booking.hasDog === true) {
    switch (locale) {
      case "en":
        template = booking.establishment.confirmationEmailTemplateWithDogEn;
        break;
      case "de":
        template = booking.establishment.confirmationEmailTemplateWithDogDe;
        break;
      case "fr":
      default:
        template = booking.establishment.confirmationEmailTemplateWithDog;
        break;
    }
  }
  // Templates pour les réservations sans chien
  else if (booking.hasDog === false) {
    switch (locale) {
      case "en":
        template = booking.establishment.confirmationEmailTemplateWithoutDogEn;
        break;
      case "de":
        template = booking.establishment.confirmationEmailTemplateWithoutDogDe;
        break;
      case "fr":
      default:
        template = booking.establishment.confirmationEmailTemplateWithoutDog;
        break;
    }
  }

  // Si aucun template spécifique "avec/sans chien" n'est défini, utiliser le template général
  if (!template) {
    switch (locale) {
      case "en":
        template = booking.establishment.confirmationEmailTemplateEn;
        break;
      case "de":
        template = booking.establishment.confirmationEmailTemplateDe;
        break;
      case "fr":
      default:
        template = booking.establishment.confirmationEmailTemplate;
        break;
    }
  }

  // Si toujours pas de template, utiliser le template par défaut
  if (!template) {
    template = getDefaultEmailTemplate(locale);
  }

  // Remplacer les variables dans le template
  let content = replaceTemplateVariables(template, templateData);

  // Traiter les placeholders d'images
  content = await processImagePlaceholders(content, booking.establishment.id);

  return content;
}

/**
 * Remplace les variables dans le template
 */
function replaceTemplateVariables(
  template: string,
  data: TemplateData
): string {
  let result = template;

  // Remplacer chaque variable
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Traite les placeholders d'images
 */
async function processImagePlaceholders(
  content: string,
  establishmentId: string
): Promise<string> {
  return await replaceImagePlaceholders(content, establishmentId);
}

/**
 * Template par défaut si aucun template personnalisé n'est configuré
 */
function getDefaultEmailTemplate(locale: string = "fr"): string {
  if (locale === "en") {
    return `Hello {clientFirstName} {clientLastName},

Your reservation at {establishmentName} has been successfully confirmed!

📋 Booking number: {bookingNumber}
💰 Total amount paid: {totalAmount} {currency}

Cost breakdown:
- Accommodation: {roomPrice} {currency}
- Additional options: {pricingOptionsTotal} {currency}
- Tourist tax: {touristTaxTotal} {currency}
- Total excl. fees: {baseAmount} {currency}

Reservation details:
- Place: {roomName}
- Check-in: {checkInDate}
- Check-out: {checkOutDate}
- Access code: {accessCode}

📄 Your invoice:
Download your official invoice: {invoiceDownloadUrl}

Contact us for more information

For any questions, you can reach us at:
📧 Email: {hotelContactEmail}
📞 Phone: {hotelContactPhone}

We wish you an excellent stay!

Best regards,
The {establishmentName} team

---
`;
  } else if (locale === "de") {
    return `Hallo {clientFirstName} {clientLastName},

Ihre Reservierung bei {establishmentName} wurde erfolgreich bestätigt!

📋 Buchungsnummer: {bookingNumber}
💰 Gezahlter Gesamtbetrag: {totalAmount} {currency}

Kostenaufschlüsselung:
- Unterkunft: {roomPrice} {currency}
- Zusätzliche Optionen: {pricingOptionsTotal} {currency}
- Kurtaxe: {touristTaxTotal} {currency}
- Gesamt ohne Gebühren: {baseAmount} {currency}

Details Ihrer Reservierung:
- Platz: {roomName}
- Ankunft: {checkInDate}
- Abreise: {checkOutDate}
- Zugangscode: {accessCode}

📄 Ihre Rechnung:
Laden Sie Ihre offizielle Rechnung herunter: {invoiceDownloadUrl}

Kontaktieren Sie uns für weitere Informationen

Bei Fragen können Sie uns erreichen unter:
📧 E-Mail: {hotelContactEmail}
📞 Telefon: {hotelContactPhone}

Wir wünschen Ihnen einen angenehmen Aufenthalt!

Mit freundlichen Grüßen,
Das {establishmentName} Team

---
`;
  } else {
    // Français par défaut
    return `Bonjour {clientFirstName} {clientLastName},

Votre réservation à {establishmentName} a été confirmée avec succès !

📋 Numéro de réservation : {bookingNumber}
💰 Montant total payé : {totalAmount} {currency}

Détail des coûts :
- Hébergement : {roomPrice} {currency}
- Options supplémentaires : {pricingOptionsTotal} {currency}
- Taxe de séjour : {touristTaxTotal} {currency}
- Total hors frais : {baseAmount} {currency}

Détails de votre réservation :
- Place : {roomName}
- Arrivée : {checkInDate}
- Départ : {checkOutDate}
- Code d'accès : {accessCode}

📄 Votre facture :
Téléchargez votre facture officielle : {invoiceDownloadUrl}

Contactez-nous pour plus d'informations

Pour toute question, vous pouvez nous contacter :
📧 Email : {hotelContactEmail}
📞 Téléphone : {hotelContactPhone}

Nous vous souhaitons un excellent séjour !

Cordialement,
L'équipe de {establishmentName}

---
`;
  }
}

/**
 * Détecte si le contenu est du HTML complexe (Unlayer) ou du texte simple
 */
export function isHtmlContent(content: string): boolean {
  return (
    content.includes("<table") ||
    content.includes("<!DOCTYPE") ||
    content.includes("<html") ||
    (content.includes("<div") && content.includes("style="))
  );
}
