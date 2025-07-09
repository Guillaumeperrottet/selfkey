import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint pour vérifier la configuration Stripe
 * Utile pour le debug en production
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification super admin
    const session = request.cookies.get("super-admin-session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Informations sur l'environnement
    const isProduction = process.env.NODE_ENV === "production";
    const forceTestMode = process.env.STRIPE_FORCE_TEST_MODE === "true";
    const useTestKeys = forceTestMode || !isProduction;

    // Vérification des clés
    const testSecretKey = process.env.STRIPE_TEST_SECRET_KEY;
    const testPublishableKey = process.env.STRIPE_TEST_PUBLISHABLE_KEY;
    const liveSecretKey = process.env.STRIPE_LIVE_SECRET_KEY;
    const livePublishableKey = process.env.STRIPE_LIVE_PUBLISHABLE_KEY;

    const config = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        isProduction,
        forceTestMode,
        useTestKeys,
        modeDescription: useTestKeys ? "TEST MODE" : "LIVE MODE",
      },
      keys: {
        test: {
          secretKey: testSecretKey
            ? `${testSecretKey.substring(0, 12)}...`
            : "❌ MANQUANT",
          publishableKey: testPublishableKey
            ? `${testPublishableKey.substring(0, 12)}...`
            : "❌ MANQUANT",
          hasSecretKey: !!testSecretKey,
          hasPublishableKey: !!testPublishableKey,
        },
        live: {
          secretKey: liveSecretKey
            ? `${liveSecretKey.substring(0, 12)}...`
            : "❌ MANQUANT",
          publishableKey: livePublishableKey
            ? `${livePublishableKey.substring(0, 12)}...`
            : "❌ MANQUANT",
          hasSecretKey: !!liveSecretKey,
          hasPublishableKey: !!livePublishableKey,
        },
      },
      currentConfig: {
        secretKey: useTestKeys ? testSecretKey : liveSecretKey,
        publishableKey: useTestKeys ? testPublishableKey : livePublishableKey,
        isValid: useTestKeys
          ? !!(testSecretKey && testPublishableKey)
          : !!(liveSecretKey && livePublishableKey),
      },
    };

    // Masquer les vraies clés dans la réponse
    const response = {
      ...config,
      currentConfig: {
        ...config.currentConfig,
        secretKey: config.currentConfig.secretKey
          ? `${config.currentConfig.secretKey.substring(0, 12)}...`
          : "❌ MANQUANT",
        publishableKey: config.currentConfig.publishableKey
          ? `${config.currentConfig.publishableKey.substring(0, 12)}...`
          : "❌ MANQUANT",
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur vérification config Stripe:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
