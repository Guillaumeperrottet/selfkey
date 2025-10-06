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
    confirmationEmailTemplate: string | null;
    confirmationEmailTemplateWithDog: string | null;
    confirmationEmailTemplateWithoutDog: string | null;
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
  // Choisir le bon template selon si le client a un chien
  let template: string;

  // Si le client a coché "avec chien" et qu'un template spécifique est défini
  if (
    booking.hasDog === true &&
    booking.establishment.confirmationEmailTemplateWithDog
  ) {
    template = booking.establishment.confirmationEmailTemplateWithDog;
  }
  // Si le client a coché "sans chien" et qu'un template spécifique est défini
  else if (
    booking.hasDog === false &&
    booking.establishment.confirmationEmailTemplateWithoutDog
  ) {
    template = booking.establishment.confirmationEmailTemplateWithoutDog;
  }
  // Sinon, utiliser le template normal (général)
  else {
    template =
      booking.establishment.confirmationEmailTemplate ||
      getDefaultEmailTemplate();
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
function getDefaultEmailTemplate(): string {
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

Guten Tag {clientFirstName} {clientLastName},

Ihre Buchung im {establishmentName} wurde erfolgreich bestätigt!

📋 Buchungsnummer: {bookingNumber}
💰 Gezahlter Gesamtbetrag: {totalAmount} {currency}

Kostenaufstellung:
- Unterkunft: {roomPrice} {currency}
- Zusatzoptionen: {pricingOptionsTotal} {currency}
- Kurtaxe: {touristTaxTotal} {currency}
- Total ohne Gebühren: {baseAmount} {currency}

Details Ihrer Buchung:
- Zimmer: {roomName}
- Anreise: {checkInDate}
- Abreise: {checkOutDate}
- Zugangscode: {accessCode}

📄 Ihre Rechnung:
Laden Sie Ihre offizielle Rechnung herunter: {invoiceDownloadUrl}

Bei Fragen können Sie uns gerne kontaktieren:
📧 E-Mail: {hotelContactEmail}
📞 Telefon: {hotelContactPhone}

Wir wünschen Ihnen einen ausgezeichneten Aufenthalt!

Mit freundlichen Grüßen,
Das Team von {establishmentName}`;
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
