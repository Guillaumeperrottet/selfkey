/**
 * Script de monitoring complet pour Stripe Connect
 * Usage: node stripe-health-check.js
 */

import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

async function checkStripeHealth() {
  console.log("🔍 Vérification de la santé Stripe Connect");
  console.log("==========================================\n");

  try {
    // 1. Vérifier l'état du compte principal
    console.log("1. 🏢 Vérification du compte principal Stripe");
    const account = await stripe.accounts.retrieve();
    console.log(`   ✅ Compte ID: ${account.id}`);
    console.log(`   ✅ Pays: ${account.country}`);
    console.log(
      `   ✅ Charges activées: ${account.charges_enabled ? "Oui" : "Non"}`
    );
    console.log(
      `   ✅ Paiements activés: ${account.payouts_enabled ? "Oui" : "Non"}`
    );
    console.log("");

    // 2. Vérifier les comptes connectés
    console.log("2. 🔗 Vérification des comptes connectés");
    const establishments = await prisma.establishment.findMany({
      where: {
        stripeAccountId: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        stripeAccountId: true,
        stripeOnboarded: true,
      },
    });

    console.log(`   📊 ${establishments.length} comptes connectés trouvés`);

    for (const establishment of establishments) {
      try {
        const connectedAccount = await stripe.accounts.retrieve(
          establishment.stripeAccountId
        );
        console.log(
          `   ${connectedAccount.charges_enabled ? "✅" : "❌"} ${establishment.name}`
        );
        console.log(`      ID: ${establishment.stripeAccountId}`);
        console.log(
          `      Charges: ${connectedAccount.charges_enabled ? "Activées" : "Désactivées"}`
        );
        console.log(
          `      Paiements: ${connectedAccount.payouts_enabled ? "Activés" : "Désactivés"}`
        );
        console.log(`      Email: ${connectedAccount.email || "N/A"}`);
      } catch (error) {
        console.log(`   ❌ ${establishment.name}: Erreur de récupération`);
        console.log(`      ${error.message}`);
      }
    }
    console.log("");

    // 3. Vérifier les paiements récents
    console.log("3. 💳 Vérification des paiements récents (24h)");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentPayments = await stripe.paymentIntents.list({
      limit: 50,
      created: {
        gte: Math.floor(yesterday.getTime() / 1000),
      },
    });

    console.log(
      `   📊 ${recentPayments.data.length} paiements dans les dernières 24h`
    );

    const statusCounts = {};
    let totalAmount = 0;
    let totalCommissions = 0;

    recentPayments.data.forEach((pi) => {
      statusCounts[pi.status] = (statusCounts[pi.status] || 0) + 1;
      totalAmount += pi.amount;
      totalCommissions += pi.application_fee_amount || 0;
    });

    Object.entries(statusCounts).forEach(([status, count]) => {
      const emoji =
        status === "succeeded" ? "✅" : status === "pending" ? "⏳" : "❌";
      console.log(`   ${emoji} ${status}: ${count} paiements`);
    });

    console.log(`   💰 Total: ${(totalAmount / 100).toFixed(2)} CHF`);
    console.log(
      `   💸 Commissions: ${(totalCommissions / 100).toFixed(2)} CHF`
    );
    console.log(
      `   📈 Taux de réussite: ${(((statusCounts.succeeded || 0) / recentPayments.data.length) * 100).toFixed(1)}%`
    );
    console.log("");

    // 4. Vérifier les événements d'erreur
    console.log("4. ⚠️  Vérification des événements d'erreur récents");
    const errorEvents = await stripe.events.list({
      limit: 20,
      types: [
        "payment_intent.payment_failed",
        "payment_intent.processing_error",
      ],
    });

    console.log(`   📊 ${errorEvents.data.length} événements d'erreur trouvés`);

    if (errorEvents.data.length > 0) {
      errorEvents.data.forEach((event) => {
        console.log(
          `   ❌ ${event.type} - ${new Date(event.created * 1000).toLocaleString("fr-CH")}`
        );
        if (event.data.object.last_payment_error) {
          console.log(
            `      Raison: ${event.data.object.last_payment_error.message}`
          );
        }
      });
    } else {
      console.log("   ✅ Aucun événement d'erreur récent");
    }
    console.log("");

    // 5. Vérifier les transfers
    console.log("5. 🔄 Vérification des transfers récents");
    const recentTransfers = await stripe.transfers.list({
      limit: 20,
      created: {
        gte: Math.floor(yesterday.getTime() / 1000),
      },
    });

    console.log(
      `   📊 ${recentTransfers.data.length} transfers dans les dernières 24h`
    );

    let totalTransferred = 0;
    recentTransfers.data.forEach((transfer) => {
      totalTransferred += transfer.amount;
    });

    console.log(
      `   💰 Total transféré: ${(totalTransferred / 100).toFixed(2)} CHF`
    );
    console.log("");

    // 6. Réconciliation commissions vs base de données
    console.log("6. 🔄 Réconciliation avec la base de données");
    const dbBookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: yesterday,
        },
        stripePaymentIntentId: {
          not: null,
        },
      },
      select: {
        id: true,
        amount: true,
        platformCommission: true,
        stripePaymentIntentId: true,
        establishment: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(
      `   📊 ${dbBookings.length} réservations en base des dernières 24h`
    );

    let dbTotalAmount = 0;
    let dbTotalCommissions = 0;
    let reconciliationIssues = 0;

    for (const booking of dbBookings) {
      dbTotalAmount += booking.amount;
      dbTotalCommissions += booking.platformCommission;

      // Vérifier si le paiement existe côté Stripe
      const stripePayment = recentPayments.data.find(
        (pi) => pi.id === booking.stripePaymentIntentId
      );
      if (!stripePayment) {
        console.log(
          `   ❌ Paiement non trouvé côté Stripe: ${booking.stripePaymentIntentId}`
        );
        reconciliationIssues++;
      } else {
        const expectedCommission = stripePayment.application_fee_amount || 0;
        const dbCommission = booking.platformCommission * 100; // Conversion en centimes

        if (Math.abs(expectedCommission - dbCommission) > 1) {
          console.log(
            `   ❌ Incohérence commission: ${booking.establishment.name}`
          );
          console.log(
            `      Stripe: ${(expectedCommission / 100).toFixed(2)} CHF`
          );
          console.log(`      DB: ${(dbCommission / 100).toFixed(2)} CHF`);
          reconciliationIssues++;
        }
      }
    }

    console.log(`   💰 Total DB: ${dbTotalAmount.toFixed(2)} CHF`);
    console.log(`   💸 Commissions DB: ${dbTotalCommissions.toFixed(2)} CHF`);
    console.log(
      `   ${reconciliationIssues === 0 ? "✅" : "❌"} Incohérences: ${reconciliationIssues}`
    );
    console.log("");

    // 7. Score de santé global
    console.log("7. 📊 Score de santé global");
    const healthScore = Math.max(
      0,
      100 -
        errorEvents.data.length * 10 -
        reconciliationIssues * 15 -
        (recentPayments.data.length - (statusCounts.succeeded || 0)) * 5
    );

    console.log(`   🎯 Score: ${healthScore}/100`);
    console.log(
      `   ${healthScore >= 90 ? "🟢" : healthScore >= 70 ? "🟡" : "🔴"} État: ${
        healthScore >= 90
          ? "Excellent"
          : healthScore >= 70
            ? "Bon"
            : "Attention requise"
      }`
    );

    // Recommandations
    console.log("\n📋 Recommandations:");
    if (healthScore >= 90) {
      console.log("   ✅ Système en bon état, continuez le monitoring");
    } else {
      if (errorEvents.data.length > 2) {
        console.log(
          "   ⚠️  Trop d'erreurs de paiement, vérifiez les paramètres"
        );
      }
      if (reconciliationIssues > 0) {
        console.log(
          "   ⚠️  Incohérences détectées, vérifiez les calculs de commission"
        );
      }
      if (healthScore < 70) {
        console.log("   🚨 Contactez le support Stripe");
      }
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour monitoring continu
async function continuousMonitoring() {
  console.log("🔄 Monitoring continu Stripe (Ctrl+C pour arrêter)");
  console.log("===============================================\n");

  const runCheck = async () => {
    console.log(
      `⏰ ${new Date().toLocaleString("fr-CH")} - Vérification automatique`
    );
    await checkStripeHealth();
    console.log("=".repeat(60) + "\n");
  };

  // Vérification initiale
  await runCheck();

  // Puis toutes les 5 minutes
  setInterval(runCheck, 5 * 60 * 1000);
}

// Gestion des arguments
const mode = process.argv[2];

if (mode === "watch") {
  continuousMonitoring();
} else if (mode === "check") {
  checkStripeHealth();
} else {
  console.log("Usage:");
  console.log("  node stripe-health-check.js check  # Vérification unique");
  console.log("  node stripe-health-check.js watch  # Monitoring continu");
}
