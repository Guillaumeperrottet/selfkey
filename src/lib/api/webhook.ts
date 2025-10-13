import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Types d'événements webhook supportés
 */
export type WebhookEvent =
  | "booking.completed"
  | "booking.cancelled"
  | "booking.updated";

/**
 * Format de données pour webhook
 */
export type WebhookFormat = "json" | "csv";

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

/**
 * Génère une signature HMAC pour sécuriser le webhook
 */
function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Convertit les données de réservation en format CSV
 */
function bookingToCSV(booking: Record<string, unknown>): string {
  const headers = Object.keys(booking);
  const values = Object.values(booking).map((val) => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  });

  return [headers.join(","), values.join(",")].join("\n");
}

/**
 * Envoie un webhook pour un événement donné
 */
export async function triggerWebhook(
  establishmentSlug: string,
  event: WebhookEvent,
  data: Record<string, unknown>,
  bookingId?: string
): Promise<void> {
  try {
    // Récupérer tous les webhooks actifs pour cet établissement et cet événement
    const webhooks = await prisma.webhook.findMany({
      where: {
        establishmentSlug,
        isActive: true,
        events: {
          has: event,
        },
      },
    });

    // Si aucun webhook configuré, on sort
    if (webhooks.length === 0) {
      console.log(
        `No active webhooks for ${establishmentSlug} and event ${event}`
      );
      return;
    }

    // Envoyer à chaque webhook configuré
    for (const webhook of webhooks) {
      // Exécuter en arrière-plan (sans bloquer)
      sendWebhookWithRetry(webhook.id, event, data, bookingId).catch(
        (error) => {
          console.error(`Failed to send webhook ${webhook.id}:`, error);
        }
      );
    }
  } catch (error) {
    console.error("Error triggering webhooks:", error);
  }
}

/**
 * Envoie un webhook avec système de retry
 */
async function sendWebhookWithRetry(
  webhookId: string,
  event: WebhookEvent,
  data: Record<string, unknown>,
  bookingId?: string,
  attempt: number = 1
): Promise<void> {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
  });

  if (!webhook || !webhook.isActive) {
    return;
  }

  const startTime = Date.now();
  let success = false;
  let statusCode: number | null = null;
  let responseBody: string | null = null;
  let error: string | null = null;

  try {
    // Préparer le payload
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Convertir en CSV si demandé
    let body: string;
    let contentType: string;

    if (webhook.format === "csv") {
      body = bookingToCSV(data);
      contentType = "text/csv";
    } else {
      body = JSON.stringify(payload);
      contentType = "application/json";
    }

    // Générer la signature si secret configuré
    const headers: HeadersInit = {
      "Content-Type": contentType,
      "User-Agent": "SelfKey-Webhook/1.0",
      "X-Webhook-Event": event,
      "X-Webhook-Attempt": attempt.toString(),
    };

    if (webhook.secret) {
      headers["X-Webhook-Signature"] = generateSignature(body, webhook.secret);
    }

    // Envoyer la requête
    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(30000), // Timeout 30s
    });

    statusCode = response.status;
    responseBody = await response.text();
    success = response.ok; // 2xx

    // Logger le résultat
    await prisma.webhookLog.create({
      data: {
        webhookId,
        bookingId: bookingId || null,
        event,
        url: webhook.url,
        payload: JSON.parse(JSON.stringify(payload)),
        statusCode,
        responseBody: responseBody.substring(0, 1000), // Limiter à 1000 chars
        success,
        attempt,
        executionTime: Date.now() - startTime,
      },
    });

    // Si échec et qu'il reste des tentatives, retry
    if (!success && attempt < webhook.retryCount) {
      const delay = webhook.retryDelay * 1000 * attempt; // Backoff exponentiel
      console.log(
        `Webhook ${webhookId} failed (attempt ${attempt}), retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      await sendWebhookWithRetry(
        webhookId,
        event,
        data,
        bookingId,
        attempt + 1
      );
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook ${webhookId} error (attempt ${attempt}):`, error);

    // Logger l'erreur
    await prisma.webhookLog.create({
      data: {
        webhookId,
        bookingId: bookingId || null,
        event,
        url: webhook.url,
        payload: JSON.parse(
          JSON.stringify({ event, timestamp: new Date().toISOString(), data })
        ),
        statusCode: statusCode || 0,
        responseBody: null,
        success: false,
        attempt,
        error,
        executionTime: Date.now() - startTime,
      },
    });

    // Retry si possible
    if (attempt < webhook.retryCount) {
      const delay = webhook.retryDelay * 1000 * attempt;
      console.log(
        `Webhook ${webhookId} error (attempt ${attempt}), retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      await sendWebhookWithRetry(
        webhookId,
        event,
        data,
        bookingId,
        attempt + 1
      );
    }
  }
}

/**
 * Helper pour envoyer les données d'une réservation complète
 */
export async function sendBookingWebhook(
  bookingId: string,
  event: WebhookEvent
): Promise<void> {
  try {
    // Récupérer toutes les données de la réservation
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: true,
        establishment: {
          select: {
            id: true,
            slug: true,
            name: true,
            address: true,
            city: true,
            postalCode: true,
            country: true,
            hotelContactEmail: true,
            hotelContactPhone: true,
            billingCompanyName: true,
            billingAddress: true,
            billingCity: true,
            billingPostalCode: true,
            billingCountry: true,
            vatNumber: true,
          },
        },
      },
    });

    if (!booking) {
      console.error(`Booking ${bookingId} not found for webhook`);
      return;
    }

    // Préparer les données à envoyer
    const webhookData = {
      // Identifiants
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      hotelSlug: booking.hotelSlug,

      // Client - Informations personnelles
      clientFirstName: booking.clientFirstName,
      clientLastName: booking.clientLastName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      clientBirthDate: booking.clientBirthDate?.toISOString(),
      clientBirthPlace: booking.clientBirthPlace,
      clientAddress: booking.clientAddress,
      clientPostalCode: booking.clientPostalCode,
      clientCity: booking.clientCity,
      clientCountry: booking.clientCountry,
      clientIdNumber: booking.clientIdNumber,
      clientIdType: booking.clientIdType,
      clientVehicleNumber: booking.clientVehicleNumber,

      // Séjour
      checkInDate: booking.checkInDate.toISOString(),
      checkOutDate: booking.checkOutDate.toISOString(),
      bookingDate: booking.bookingDate.toISOString(),
      adults: booking.adults,
      children: booking.children,
      guests: booking.guests,
      hasDog: booking.hasDog,

      // Financier
      amount: booking.amount,
      currency: booking.currency,
      platformCommission: booking.platformCommission,
      ownerAmount: booking.ownerAmount,
      pricingOptionsTotal: booking.pricingOptionsTotal,
      touristTaxTotal: booking.touristTaxTotal,
      selectedPricingOptions: booking.selectedPricingOptions,
      paymentStatus: booking.paymentStatus,

      // Réservation
      bookingType: booking.bookingType,
      bookingLocale: booking.bookingLocale,
      dayParkingDuration: booking.dayParkingDuration,
      dayParkingStartTime: booking.dayParkingStartTime?.toISOString(),
      dayParkingEndTime: booking.dayParkingEndTime?.toISOString(),

      // Confirmation
      confirmationSent: booking.confirmationSent,
      confirmationSentAt: booking.confirmationSentAt?.toISOString(),
      confirmationMethod: booking.confirmationMethod,

      // Relations
      room: booking.room
        ? {
            id: booking.room.id,
            name: booking.room.name,
            price: booking.room.price,
            accessCode: booking.room.accessCode,
          }
        : null,

      establishment: booking.establishment,
    };

    // Trigger le webhook
    await triggerWebhook(booking.hotelSlug, event, webhookData, bookingId);
  } catch (error) {
    console.error(`Error sending booking webhook for ${bookingId}:`, error);
  }
}
