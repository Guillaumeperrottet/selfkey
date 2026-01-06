import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { isSuperAdmin } from "@/lib/auth/check";

/**
 * POST /api/super-admin/webhooks/test
 * Teste un webhook avec des données fictives ou une réservation existante
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est super-admin
    const adminCheck = await isSuperAdmin();
    if (!adminCheck.valid) {
      return NextResponse.json(
        { error: "Unauthorized", message: adminCheck.message },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { webhookId, bookingId } = body;

    if (!webhookId) {
      return NextResponse.json(
        { error: "webhookId is required" },
        { status: 400 }
      );
    }

    // Récupérer le webhook
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
      include: {
        establishment: true,
      },
    });

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    // Préparer les données de test
    let testData;

    if (bookingId) {
      // Utiliser une vraie réservation
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          room: true,
          establishment: true,
        },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      testData = {
        // Identifiants
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        hotelSlug: booking.hotelSlug,

        // Client
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

        // Relations
        room: booking.room,
        establishment: booking.establishment,
      };
    } else {
      // Générer des données fictives
      testData = {
        id: "test_" + Date.now(),
        bookingNumber: 9999,
        hotelSlug: webhook.establishmentSlug,

        // Client - Données fictives
        clientFirstName: "Jean",
        clientLastName: "Test",
        clientEmail: "jean.test@example.com",
        clientPhone: "+41791234567",
        clientBirthDate: "1985-03-15T00:00:00.000Z",
        clientBirthPlace: "Fribourg",
        clientAddress: "Rue de Test 123",
        clientPostalCode: "1700",
        clientCity: "Fribourg",
        clientCountry: "Switzerland",
        clientIdNumber: "TEST-123456789",
        clientIdType: "Carte d'identité",
        clientVehicleNumber: "FR-TEST-01",

        // Séjour
        checkInDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        checkOutDate: new Date(
          Date.now() + 9 * 24 * 60 * 60 * 1000
        ).toISOString(),
        bookingDate: new Date().toISOString(),
        adults: 2,
        children: 1,
        guests: 3,
        hasDog: false,

        // Financier
        amount: 250.0,
        currency: "CHF",
        platformCommission: 15.5,
        ownerAmount: 234.5,
        pricingOptionsTotal: 30.0,
        touristTaxTotal: 9.0,
        selectedPricingOptions: { breakfast: "included" },
        paymentStatus: "succeeded",

        // Réservation
        bookingType: "night",
        bookingLocale: "fr",

        // Relations
        room: {
          id: "test_room",
          name: "Chambre Double Test",
          price: 120.0,
          accessCode: "1234",
        },
        establishment: {
          id: webhook.establishment.id,
          slug: webhook.establishment.slug,
          name: webhook.establishment.name,
          address: webhook.establishment.address,
          city: webhook.establishment.city,
          postalCode: webhook.establishment.postalCode,
          country: webhook.establishment.country,
        },
      };
    }

    // Préparer le payload selon le format
    let payload: string;
    let contentType: string;

    if (webhook.format === "csv") {
      // Convertir en CSV
      const headers = Object.keys(testData);
      const values = Object.values(testData).map((val) => {
        if (val === null || val === undefined) return "";
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
      });
      payload = [headers.join(","), values.join(",")].join("\n");
      contentType = "text/csv";
    } else {
      // Format JSON
      const jsonPayload = {
        event: "booking.completed",
        timestamp: new Date().toISOString(),
        test: true, // Flag pour indiquer que c'est un test
        data: testData,
      };
      payload = JSON.stringify(jsonPayload, null, 2);
      contentType = "application/json";
    }

    // Envoyer la requête de test
    const startTime = Date.now();
    let success = false;
    let statusCode: number | null = null;
    let responseBody: string | null = null;
    let error: string | null = null;

    try {
      const headers: HeadersInit = {
        "Content-Type": contentType,
        "User-Agent": "SelfKey-Webhook-Test/1.0",
        "X-Webhook-Event": "booking.completed",
        "X-Webhook-Test": "true",
      };

      if (webhook.secret) {
        const signature = crypto
          .createHmac("sha256", webhook.secret)
          .update(payload)
          .digest("hex");
        headers["X-Webhook-Signature"] = signature;
      }

      const response = await fetch(webhook.url, {
        method: "POST",
        headers,
        body: payload,
        signal: AbortSignal.timeout(30000),
      });

      statusCode = response.status;
      responseBody = await response.text();
      success = response.ok;

      // Logger le test
      await prisma.webhookLog.create({
        data: {
          webhookId: webhook.id,
          bookingId: bookingId || null,
          event: "booking.completed",
          url: webhook.url,
          payload: JSON.parse(JSON.stringify({ test: true, ...testData })),
          statusCode,
          responseBody: responseBody.substring(0, 1000),
          success,
          attempt: 1,
          executionTime: Date.now() - startTime,
        },
      });

      return NextResponse.json({
        success: true,
        test: true,
        webhook: {
          id: webhook.id,
          name: webhook.name,
          url: webhook.url,
          format: webhook.format,
        },
        result: {
          success,
          statusCode,
          responseBody: responseBody.substring(0, 500),
          executionTime: Date.now() - startTime,
        },
        payload: webhook.format === "json" ? JSON.parse(payload) : payload,
      });
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error";

      // Logger l'erreur
      await prisma.webhookLog.create({
        data: {
          webhookId: webhook.id,
          bookingId: bookingId || null,
          event: "booking.completed",
          url: webhook.url,
          payload: JSON.parse(JSON.stringify({ test: true, ...testData })),
          statusCode: 0,
          responseBody: null,
          success: false,
          attempt: 1,
          error,
          executionTime: Date.now() - startTime,
        },
      });

      return NextResponse.json({
        success: false,
        test: true,
        webhook: {
          id: webhook.id,
          name: webhook.name,
          url: webhook.url,
          format: webhook.format,
        },
        result: {
          success: false,
          error,
          executionTime: Date.now() - startTime,
        },
        payload: webhook.format === "json" ? JSON.parse(payload) : payload,
      });
    }
  } catch (error) {
    console.error("Error testing webhook:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
