/**
 * Configuration Stripe dynamique
 *
 * Permet de switcher entre les clés test et live selon l'environnement
 * ou de forcer le mode test même en production
 */

const isProduction = process.env.NODE_ENV === "production";
const forceTestMode = process.env.STRIPE_FORCE_TEST_MODE === "true";

// Utiliser les clés test si:
// - On force le mode test OU
// - On est en développement (pas en production)
const useTestKeys = forceTestMode || !isProduction;

export const stripeConfig = {
  // Clés serveur (backend)
  secretKey: useTestKeys
    ? process.env.STRIPE_TEST_SECRET_KEY
    : process.env.STRIPE_LIVE_SECRET_KEY,

  // Clés publiques (frontend)
  publishableKey: useTestKeys
    ? process.env.STRIPE_TEST_PUBLISHABLE_KEY
    : process.env.STRIPE_LIVE_PUBLISHABLE_KEY,

  // Webhook secrets (si vous en avez)
  webhookSecret: useTestKeys
    ? process.env.STRIPE_TEST_WEBHOOK_SECRET ||
      process.env.STRIPE_WEBHOOK_SECRET
    : process.env.STRIPE_LIVE_WEBHOOK_SECRET ||
      process.env.STRIPE_WEBHOOK_SECRET,

  // Informations utiles
  isTestMode: useTestKeys,
  environment: isProduction ? "production" : "development",
  modeDescription: useTestKeys ? "TEST MODE" : "LIVE MODE",
};

// Validation des clés (seulement à l'exécution, pas au build)
export function validateStripeKeys() {
  if (!stripeConfig.secretKey) {
    throw new Error(
      `❌ Clé secrète Stripe manquante pour le mode ${stripeConfig.modeDescription}`
    );
  }

  if (!stripeConfig.publishableKey) {
    throw new Error(
      `❌ Clé publique Stripe manquante pour le mode ${stripeConfig.modeDescription}`
    );
  }
}

// Log informatif (seulement en développement)
if (!isProduction) {
  console.log("🔧 Configuration Stripe:", {
    environment: stripeConfig.environment,
    mode: stripeConfig.modeDescription,
    forceTestMode: forceTestMode,
    secretKeyPrefix: stripeConfig.secretKey?.substring(0, 12) + "...",
    publishableKeyPrefix: stripeConfig.publishableKey?.substring(0, 12) + "...",
  });
}
