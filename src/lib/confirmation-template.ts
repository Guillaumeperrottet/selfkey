import { replaceImagePlaceholders } from "@/lib/image-utils";

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
}

export interface BookingWithDetails {
  id: string;
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
  room: {
    name: string;
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
    bookingNumber: booking.id,
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
    booking.hasDog &&
    booking.establishment.confirmationEmailTemplateWithDog
  ) {
    template = booking.establishment.confirmationEmailTemplateWithDog;
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
