import crypto from "crypto";

/**
 * Génère un token sécurisé pour l'extension de parking
 */
export function generateExtensionToken(bookingId: string): string {
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`extend-${bookingId}`)
    .digest("hex")
    .substring(0, 32);
}

/**
 * Vérifie qu'un token correspond à une réservation
 */
export function verifyExtensionToken(
  token: string,
  bookingId: string
): boolean {
  return generateExtensionToken(bookingId) === token;
}
