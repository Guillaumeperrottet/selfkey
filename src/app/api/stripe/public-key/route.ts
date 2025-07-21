import { NextResponse } from "next/server";

/**
 * API pour récupérer la clé publique Stripe
 */
export async function GET() {
  try {
    // Informations sur l'environnement
    const isProduction = process.env.NODE_ENV === "production";
    const forceTestMode = process.env.STRIPE_FORCE_TEST_MODE === "true";
    const useTestKeys = forceTestMode || !isProduction;

    // Récupérer la bonne clé publique selon l'environnement
    const publishableKey = useTestKeys
      ? process.env.STRIPE_TEST_PUBLISHABLE_KEY
      : process.env.STRIPE_LIVE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error("❌ Clé publique Stripe manquante", {
        useTestKeys,
        hasTestKey: !!process.env.STRIPE_TEST_PUBLISHABLE_KEY,
        hasLiveKey: !!process.env.STRIPE_LIVE_PUBLISHABLE_KEY,
      });
      return NextResponse.json(
        { error: "Configuration Stripe manquante" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      publishableKey,
      mode: useTestKeys ? "test" : "live",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la clé publique:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
