#!/usr/bin/env node

/**
 * Script pour vérifier la configuration Stripe
 */

// Simule l'environnement de production
process.env.NODE_ENV = "production";

console.log("🔧 Vérification de la configuration Stripe...\n");

console.log("Variables d'environnement:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("STRIPE_FORCE_TEST_MODE:", process.env.STRIPE_FORCE_TEST_MODE);
console.log(
  "STRIPE_TEST_SECRET_KEY:",
  process.env.STRIPE_TEST_SECRET_KEY
    ? `${process.env.STRIPE_TEST_SECRET_KEY.substring(0, 12)}...`
    : "❌ MANQUANT"
);
console.log(
  "STRIPE_LIVE_SECRET_KEY:",
  process.env.STRIPE_LIVE_SECRET_KEY
    ? `${process.env.STRIPE_LIVE_SECRET_KEY.substring(0, 12)}...`
    : "❌ MANQUANT"
);

console.log("\n" + "=".repeat(50));

// Test de la configuration
try {
  // Import dynamique pour éviter les erreurs de build
  const { stripeConfig } = require("./src/lib/stripe-config");

  console.log("\n📊 Configuration Stripe détectée:");
  console.log("Environment:", stripeConfig.environment);
  console.log("Mode:", stripeConfig.modeDescription);
  console.log("Is Test Mode:", stripeConfig.isTestMode);
  console.log(
    "Secret Key:",
    stripeConfig.secretKey
      ? `${stripeConfig.secretKey.substring(0, 12)}...`
      : "❌ MANQUANT"
  );
  console.log(
    "Publishable Key:",
    stripeConfig.publishableKey
      ? `${stripeConfig.publishableKey.substring(0, 12)}...`
      : "❌ MANQUANT"
  );

  // Test de validation
  const { validateStripeKeys } = require("./src/lib/stripe-config");
  validateStripeKeys();

  console.log("\n✅ Configuration Stripe valide !");
} catch (error) {
  console.log("\n❌ Erreur de configuration:");
  console.log(error.message);
}

console.log("\n" + "=".repeat(50));
console.log("💡 Si l'erreur persiste sur Vercel:");
console.log(
  "1. Vérifiez que STRIPE_FORCE_TEST_MODE=true est bien configuré sur Vercel"
);
console.log(
  "2. Vérifiez que STRIPE_TEST_SECRET_KEY est bien configuré sur Vercel"
);
console.log("3. Redéployez l'application après avoir mis à jour les variables");
