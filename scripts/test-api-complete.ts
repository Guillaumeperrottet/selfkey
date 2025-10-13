#!/usr/bin/env ts-node

/**
 * Script de test complet pour l'API et les webhooks
 *
 * Tests effectués :
 * 1. Créer une clé API
 * 2. Tester les endpoints API (GET /bookings)
 * 3. Créer un webhook
 * 4. Tester le webhook manuellement
 * 5. Simuler une réservation complète
 * 6. Vérifier les logs
 *
 * Usage: npx ts-node scripts/test-api-complete.ts
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

interface TestResults {
  passed: number;
  failed: number;
  tests: Array<{ name: string; status: "✅" | "❌"; message: string }>;
}

const results: TestResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name: string, success: boolean, message: string) {
  const status = success ? "✅" : "❌";
  results.tests.push({ name, status, message });
  if (success) {
    results.passed++;
  } else {
    results.failed++;
  }
  console.log(`${status} ${name}: ${message}`);
}

async function generateApiKey() {
  const key = `sk_live_${crypto.randomBytes(32).toString("hex")}`;
  return key;
}

async function test1_CreateApiKey() {
  console.log("\n🔑 Test 1: Création d'une clé API\n");

  try {
    // Récupérer un établissement existant
    const establishment = await prisma.establishment.findFirst();

    if (!establishment) {
      logTest(
        "Création clé API",
        false,
        "Aucun établissement trouvé dans la base"
      );
      return null;
    }

    const apiKey = await generateApiKey();

    const newKey = await prisma.apiKey.create({
      data: {
        name: "Test Auto API",
        key: apiKey,
        establishmentSlug: establishment.slug,
        isActive: true,
        permissions: {
          bookings: ["read"],
        },
        createdBy: "test-script",
      },
    });

    logTest(
      "Création clé API",
      true,
      `Clé créée: ${newKey.key.substring(0, 20)}...`
    );
    return newKey;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logTest("Création clé API", false, `Erreur: ${errorMessage}`);
    return null;
  }
}

async function test2_CallApiEndpoint(
  apiKey: string,
  establishmentSlug: string
) {
  console.log("\n📊 Test 2: Appel endpoint GET /api/v1/bookings\n");

  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/bookings?establishmentSlug=${establishmentSlug}&limit=5`,
      {
        headers: {
          "X-API-Key": apiKey,
        },
      }
    );

    const data = await response.json();

    if (response.status === 200 && data.success) {
      logTest(
        "GET /api/v1/bookings",
        true,
        `Récupéré ${data.data.length} réservations`
      );
      return true;
    } else {
      logTest(
        "GET /api/v1/bookings",
        false,
        `Erreur ${response.status}: ${data.error || "Unknown"}`
      );
      return false;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logTest("GET /api/v1/bookings", false, `Erreur réseau: ${errorMessage}`);
    return false;
  }
}

async function test3_CallApiWithoutKey() {
  console.log("\n🔒 Test 3: Appel API sans clé (doit échouer)\n");

  try {
    const response = await fetch(`${BASE_URL}/api/v1/bookings?limit=5`);

    if (response.status === 401) {
      logTest(
        "Sécurité API",
        true,
        "Requête sans clé correctement rejetée (401)"
      );
      return true;
    } else {
      logTest(
        "Sécurité API",
        false,
        `Devrait être 401 mais got ${response.status}`
      );
      return false;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logTest("Sécurité API", false, `Erreur: ${errorMessage}`);
    return false;
  }
}

async function test4_CreateWebhook(establishmentSlug: string) {
  console.log("\n🪝 Test 4: Création d'un webhook\n");

  try {
    const webhook = await prisma.webhook.create({
      data: {
        name: "Test Webhook Auto",
        establishmentSlug: establishmentSlug,
        url: `${BASE_URL}/api/sandbox/police-webhook`,
        events: ["booking.completed"],
        isActive: true,
        format: "json",
      },
    });

    logTest("Création webhook", true, `Webhook créé: ${webhook.name}`);
    return webhook;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logTest("Création webhook", false, `Erreur: ${errorMessage}`);
    return null;
  }
}

async function test5_TriggerWebhook(webhookId: string) {
  console.log("\n📤 Test 5: Déclenchement manuel du webhook\n");

  try {
    const response = await fetch(`${BASE_URL}/api/super-admin/webhooks/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ webhookId }),
    });

    const data = await response.json();

    if (response.ok) {
      logTest(
        "Déclenchement webhook",
        true,
        `Webhook testé, statut: ${data.statusCode || "N/A"}`
      );
      return true;
    } else {
      logTest(
        "Déclenchement webhook",
        false,
        `Erreur ${response.status}: ${data.error || "Unknown"}`
      );
      return false;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logTest("Déclenchement webhook", false, `Erreur: ${errorMessage}`);
    return false;
  }
}

async function test6_CheckApiLogs() {
  console.log("\n📋 Test 6: Vérification des logs API\n");

  try {
    const logsCount = await prisma.apiLog.count();

    if (logsCount > 0) {
      logTest("Logs API", true, `${logsCount} logs enregistrés`);
      return true;
    } else {
      logTest("Logs API", false, "Aucun log trouvé");
      return false;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logTest("Logs API", false, `Erreur: ${errorMessage}`);
    return false;
  }
}

async function test7_CheckWebhookLogs() {
  console.log("\n📋 Test 7: Vérification des logs webhooks\n");

  try {
    const logsCount = await prisma.webhookLog.count();

    if (logsCount > 0) {
      logTest("Logs Webhooks", true, `${logsCount} logs enregistrés`);
      return true;
    } else {
      logTest("Logs Webhooks", false, "Aucun log trouvé");
      return false;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logTest("Logs Webhooks", false, `Erreur: ${errorMessage}`);
    return false;
  }
}

async function cleanup(apiKeyId?: string, webhookId?: string) {
  console.log("\n🧹 Nettoyage...\n");

  try {
    if (apiKeyId) {
      await prisma.apiKey.delete({ where: { id: apiKeyId } });
      console.log("✅ Clé API supprimée");
    }
    if (webhookId) {
      await prisma.webhook.delete({ where: { id: webhookId } });
      console.log("✅ Webhook supprimé");
    }
  } catch {
    console.log("⚠️  Erreur lors du nettoyage (peut être ignoré)");
  }
}

async function main() {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   🧪 TEST COMPLET API & WEBHOOKS - SELFKEY         ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log("\n");

  let apiKey: Awaited<ReturnType<typeof test1_CreateApiKey>> = null;
  let webhook: Awaited<ReturnType<typeof test4_CreateWebhook>> = null;

  try {
    // Test 1: Créer une clé API
    apiKey = await test1_CreateApiKey();
    if (!apiKey) {
      console.log("\n❌ Impossible de continuer sans clé API");
      return;
    }

    // Test 2: Appeler l'API
    await test2_CallApiEndpoint(apiKey.key, apiKey.establishmentSlug!);

    // Test 3: Sécurité (sans clé)
    await test3_CallApiWithoutKey();

    // Test 4: Créer un webhook
    webhook = await test4_CreateWebhook(apiKey.establishmentSlug!);

    // Test 5: Déclencher le webhook
    if (webhook) {
      await test5_TriggerWebhook(webhook.id);
    }

    // Test 6 & 7: Vérifier les logs
    await test6_CheckApiLogs();
    await test7_CheckWebhookLogs();
  } finally {
    // Nettoyage
    await cleanup(apiKey?.id, webhook?.id);
  }

  // Résumé
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║              📊 RÉSUMÉ DES TESTS                    ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log("\n");

  results.tests.forEach((test) => {
    console.log(`${test.status} ${test.name}`);
  });

  console.log("\n");
  console.log(`✅ Tests réussis: ${results.passed}`);
  console.log(`❌ Tests échoués: ${results.failed}`);
  console.log(`📊 Total: ${results.tests.length}`);
  console.log("\n");

  if (results.failed === 0) {
    console.log("🎉 Tous les tests sont passés ! Votre API est prête !");
  } else {
    console.log(
      "⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus."
    );
  }

  await prisma.$disconnect();
  process.exit(results.failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("Erreur fatale:", error);
  process.exit(1);
});
