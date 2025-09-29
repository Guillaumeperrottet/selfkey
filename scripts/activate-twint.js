// Script pour activer TWINT sur le compte Connect
// Utilisation: node scripts/activate-twint.js

const Stripe = require("stripe");

// Assurez-vous que votre clé secrète Stripe est définie
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function activateTwint() {
  const accountId = "acct_1S3BpeA7TKdsLADt"; // ID du compte Patrick Perrottet

  try {
    console.log(`🔧 Activation de TWINT pour le compte Connect: ${accountId}`);

    // Vérifier d'abord l'état actuel des capabilities
    const account = await stripe.accounts.retrieve(accountId);
    console.log("📋 Capabilities actuelles:", account.capabilities);

    // Activer la capability twint_payments
    const capability = await stripe.accounts.updateCapability(
      accountId,
      "twint_payments",
      {
        requested: true,
      }
    );

    console.log("✅ TWINT capability mise à jour:", {
      account: accountId,
      capability: capability.id,
      status: capability.status,
      requirements: capability.requirements,
    });

    // Vérifier les capabilities après mise à jour
    const updatedAccount = await stripe.accounts.retrieve(accountId);
    console.log(
      "📋 Capabilities après mise à jour:",
      updatedAccount.capabilities
    );
  } catch (error) {
    console.error("❌ Erreur:", error.message);

    if (error.code) {
      console.error("Code d'erreur:", error.code);
    }

    if (error.param) {
      console.error("Paramètre en erreur:", error.param);
    }
  }
}

// Exécuter le script
activateTwint();
