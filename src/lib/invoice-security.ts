import crypto from "crypto";

/**
 * Génère un token sécurisé pour accéder à une facture
 */
export function generateInvoiceToken(
  bookingId: string,
  clientEmail: string
): string {
  const secret = process.env.NEXTAUTH_SECRET || "default-secret";
  const data = `${bookingId}:${clientEmail}`;
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Vérifie la validité d'un token de facture
 */
export function verifyInvoiceToken(
  token: string,
  bookingId: string,
  clientEmail: string
): boolean {
  const expectedToken = generateInvoiceToken(bookingId, clientEmail);
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

/**
 * Génère une URL sécurisée pour télécharger une facture
 */
export function generateInvoiceDownloadUrl(
  bookingId: string,
  clientEmail: string,
  baseUrl: string = process.env.NEXTAUTH_URL || "http://localhost:3000"
): string {
  const token = generateInvoiceToken(bookingId, clientEmail);
  return `${baseUrl}/api/invoice/${bookingId}?token=${token}`;
}
