// Script de debug pour TWINT
const { stripe } = require("./src/lib/stripe.ts");

async function debugTwint() {
  try {
    console.log("🔍 Debug TWINT Configuration...\n");

    // 1. Tester un PaymentIntent simple
    console.log("1. Création PaymentIntent de test...");
    const testPI = await stripe.paymentIntents.create({
      amount: 1000, // 10 CHF
      currency: "chf",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "always",
      },
      metadata: {
        test: "twint_debug",
      },
    });

    console.log("✅ PaymentIntent créé:", testPI.id);
    console.log("📋 Payment methods supportées:", testPI.payment_method_types);

    // 2. Vérifier les comptes Connect
    console.log("\n2. Vérification des comptes Connect...");

    // Lister tous les comptes Connect accessibles
    const accounts = await stripe.accounts.list({ limit: 10 });
    console.log(`📊 Comptes accessibles: ${accounts.data.length}`);

    for (const account of accounts.data) {
      console.log(`\n🏨 Compte: ${account.id}`);
      console.log(`   - Charges enabled: ${account.charges_enabled}`);
      console.log(`   - Payouts enabled: ${account.payouts_enabled}`);
      console.log(`   - Country: ${account.country}`);

      if (account.capabilities) {
        console.log(
          `   - Card payments: ${account.capabilities.card_payments}`
        );
        console.log(
          `   - TWINT payments: ${account.capabilities.twint_payments}`
        );
      }
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

debugTwint();
