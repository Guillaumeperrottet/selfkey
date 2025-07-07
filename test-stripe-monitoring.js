#!/usr/bin/env node

/**
 * Script pour tester l'API de monitoring Stripe
 * Vérifie que l'API fonctionne correctement et retourne les bonnes données
 */

const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const API_URL = "http://localhost:3000/api/admin/stripe-monitoring";

async function testStripeMonitoring() {
  console.log("🔍 Test de l'API de monitoring Stripe...\n");

  try {
    // Test avec authentification
    const { stdout, stderr } = await execPromise(`curl -s -X GET "${API_URL}" \
      -H "Cookie: super-admin-session=authenticated" \
      -H "Content-Type: application/json"`);

    if (stderr) {
      console.log("❌ Erreur lors de l'appel API:", stderr);
      return;
    }

    console.log("✅ API accessible avec authentification");

    try {
      const data = JSON.parse(stdout);

      // Vérifier la structure des données
      if (data.payments && data.stats) {
        console.log(`  - Nombre de paiements: ${data.payments.length}`);
        console.log(`  - Paiements totaux: ${data.stats.totalPayments}`);
        console.log(
          `  - Commissions totales: ${data.stats.totalCommissions / 100}€`
        );
        console.log(
          `  - Taux de succès: ${data.stats.successRate.toFixed(1)}%`
        );
        console.log(
          `  - Taux de commission moyen: ${data.stats.averageCommissionRate}%`
        );
        console.log(`  - Comptes connectés: ${data.stats.connectedAccounts}`);
        console.log(`  - Paiements aujourd'hui: ${data.stats.paymentsToday}`);
        console.log(
          `  - Commissions aujourd'hui: ${data.stats.commissionsToday / 100}€`
        );

        // Vérifier quelques paiements
        if (data.payments.length > 0) {
          console.log("\n📝 Exemples de paiements:");
          data.payments.slice(0, 3).forEach((payment, index) => {
            console.log(
              `  ${index + 1}. ${payment.id} - ${payment.amount / 100}€ - ${payment.status}`
            );
            console.log(`     Établissement: ${payment.establishmentName}`);
            console.log(
              `     Commission: ${payment.applicationFeeAmount / 100}€`
            );
          });
        }

        console.log("\n✅ Structure des données valide");
      } else {
        console.log("❌ Structure des données invalide");
        console.log("Données reçues:", stdout.substring(0, 200));
      }
    } catch (parseError) {
      console.log("❌ Erreur lors du parsing JSON:", parseError.message);
      console.log("Réponse brute:", stdout.substring(0, 200));
    }
  } catch (error) {
    console.log(`❌ Erreur lors de l'appel API: ${error.message}`);
  }

  // Test sans authentification (doit échouer)
  console.log("\n🔒 Test sans authentification...");
  try {
    const { stdout } = await execPromise(`curl -s -X GET "${API_URL}" \
      -H "Content-Type: application/json"`);

    try {
      const data = JSON.parse(stdout);
      if (data.error) {
        console.log("✅ API correctement protégée (erreur d'authentification)");
      } else {
        console.log("❌ PROBLÈME: API accessible sans authentification !");
      }
    } catch (parseError) {
      console.log("❌ Réponse non-JSON reçue:", stdout.substring(0, 100));
    }
  } catch (error) {
    console.log(`❌ Erreur inattendue: ${error.message}`);
  }
}

// Fonction pour vérifier si le serveur est en cours d'exécution
async function checkServer() {
  try {
    await execPromise("curl -s http://localhost:3000 > /dev/null");
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log("🚀 Test du monitoring Stripe\n");

  // Vérifier que le serveur est en cours d'exécution
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log("❌ Serveur non disponible sur http://localhost:3000");
    console.log(
      '   Assurez-vous que le serveur Next.js est démarré avec "npm run dev"'
    );
    process.exit(1);
  }

  await testStripeMonitoring();

  console.log("\n🎉 Test terminé");
}

main().catch(console.error);
