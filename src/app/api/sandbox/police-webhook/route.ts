import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/sandbox/police-webhook
 *
 * Endpoint sandbox qui simule l'API de la police.
 * Utilisez cette URL pour tester vos webhooks avant d'avoir l'URL réelle.
 *
 * URL de test : https://votre-domaine.com/api/sandbox/police-webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const contentType = request.headers.get("content-type");
    const signature = request.headers.get("x-webhook-signature");
    const event = request.headers.get("x-webhook-event");
    const isTest = request.headers.get("x-webhook-test");

    console.log("========================================");
    console.log("🚨 SANDBOX POLICE WEBHOOK - Données reçues");
    console.log("========================================");
    console.log("📅 Date:", new Date().toISOString());
    console.log("🔔 Event:", event);
    console.log("🧪 Test Mode:", isTest === "true" ? "OUI" : "NON");
    console.log("📝 Content-Type:", contentType);
    console.log("🔐 Signature:", signature ? "Présente" : "Absente");
    console.log("----------------------------------------");

    // Parser les données selon le format
    let data;
    if (contentType?.includes("application/json")) {
      data = JSON.parse(body);
      console.log("📦 Format: JSON");
      console.log("📋 Données:", JSON.stringify(data, null, 2));
    } else if (contentType?.includes("text/csv")) {
      console.log("📦 Format: CSV");
      console.log("📋 Données CSV:\n", body);
      data = { raw_csv: body };
    } else {
      console.log("📦 Format: Inconnu");
      console.log("📋 Body brut:", body);
      data = { raw: body };
    }

    console.log("========================================");

    // Simuler différents scénarios de réponse
    const scenario = request.nextUrl.searchParams.get("scenario") || "success";

    switch (scenario) {
      case "error":
        // Simuler une erreur serveur
        return NextResponse.json(
          { error: "Simulation d'erreur serveur" },
          { status: 500 }
        );

      case "timeout":
        // Simuler un timeout (attendre 35 secondes)
        await new Promise((resolve) => setTimeout(resolve, 35000));
        return NextResponse.json({ received: true });

      case "invalid":
        // Simuler une validation échouée
        return NextResponse.json(
          {
            error: "Validation failed",
            details: "Missing required field: clientIdNumber",
          },
          { status: 400 }
        );

      case "success":
      default:
        // Succès - Simuler la réponse de l'API police
        return NextResponse.json(
          {
            status: "received",
            message: "Réservation enregistrée avec succès",
            timestamp: new Date().toISOString(),
            bookingId: data?.data?.id || data?.id,
            bookingNumber: data?.data?.bookingNumber || data?.bookingNumber,
            smsStatus: "pending",
            smsScheduledFor: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Dans 5 minutes
            advantages: [
              {
                type: "museum_pass",
                name: "Pass Musées Fribourg",
                validUntil: data?.data?.checkOutDate || null,
              },
              {
                type: "transport",
                name: "Transport gratuit TPF",
                validUntil: data?.data?.checkOutDate || null,
              },
            ],
          },
          { status: 200 }
        );
    }
  } catch (error) {
    console.error("❌ Erreur dans le sandbox:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sandbox/police-webhook
 * Documentation du sandbox
 */
export async function GET() {
  return NextResponse.json({
    name: "SelfKey Sandbox - Police Webhook",
    description: "Endpoint de test pour simuler l'API de la police",
    version: "1.0.0",
    usage: {
      method: "POST",
      url: "/api/sandbox/police-webhook",
      contentType: "application/json ou text/csv",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Event": "booking.completed",
        "X-Webhook-Signature": "HMAC SHA256 signature (optionnel)",
        "X-Webhook-Test": "true (pour indiquer un test)",
      },
    },
    scenarios: {
      success: {
        description: "Réponse de succès (défaut)",
        query: "?scenario=success",
        response: "200 OK avec données de confirmation et avantages",
      },
      error: {
        description: "Simule une erreur serveur",
        query: "?scenario=error",
        response: "500 Internal Server Error",
      },
      invalid: {
        description: "Simule une validation échouée",
        query: "?scenario=invalid",
        response: "400 Bad Request",
      },
      timeout: {
        description: "Simule un timeout (35s)",
        query: "?scenario=timeout",
        response: "Timeout après 35 secondes",
      },
    },
    example: {
      url: "https://votre-domaine.com/api/sandbox/police-webhook",
      testCommand: `curl -X POST https://votre-domaine.com/api/sandbox/police-webhook \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Event: booking.completed" \\
  -d '{"test": "data"}'`,
    },
  });
}
