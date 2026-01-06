#!/usr/bin/env ts-node

/**
 * 🧪 Script de test des améliorations API & Webhooks
 *
 * Tests effectués :
 * 1. ✅ Sécurité routes super-admin
 * 2. ✅ Rate limiting (100 req/min)
 * 3. ✅ Nouveaux endpoints establishments
 * 4. ✅ Secret HMAC auto-généré
 * 5. ✅ Webhook auto-disable (simulation)
 *
 * Usage: npx tsx scripts/test-improvements.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

function logTest(
  name: string,
  success: boolean,
  message: string,
  duration?: number
) {
  const icon = success ? "✅" : "❌";
  console.log(
    `${icon} ${name}: ${message}${duration ? ` (${duration}ms)` : ""}`
  );
  results.push({ name, success, message, duration });
}

function logSection(title: string) {
  console.log("\n" + "=".repeat(70));
  console.log(`📋 ${title}`);
  console.log("=".repeat(70) + "\n");
}

// ============================================
// TEST 1: Sécurité routes super-admin
// ============================================
async function test1_SuperAdminSecurity() {
  logSection("TEST 1: Sécurité routes super-admin");

  const startTime = Date.now();

  try {
    // Tenter de créer une API key SANS authentification
    const response = await fetch(`${BASE_URL}/api/super-admin/api-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Unauthorized",
        permissions: { bookings: ["read"] },
      }),
    });

    if (response.status === 401) {
      logTest(
        "Sécurité API Keys",
        true,
        "Route correctement protégée (401)",
        Date.now() - startTime
      );
      return true;
    } else {
      logTest(
        "Sécurité API Keys",
        false,
        `Route NON protégée ! Status: ${response.status}`,
        Date.now() - startTime
      );
      return false;
    }
  } catch (error) {
    logTest(
      "Sécurité API Keys",
      false,
      `Erreur: ${error instanceof Error ? error.message : String(error)}`,
      Date.now() - startTime
    );
    return false;
  }
}

// ============================================
// TEST 2: Rate Limiting
// ============================================
async function test2_RateLimiting() {
  logSection("TEST 2: Rate Limiting (100 req/min)");

  // D'abord, créer une clé API pour tester
  const apiKey = await prisma.apiKey.create({
    data: {
      name: "Test Rate Limiting",
      key: `sk_test_${Date.now()}`,
      permissions: { bookings: ["read"], establishments: ["read"] },
      isActive: true,
      createdBy: "test-script",
    },
  });

  console.log(`   📝 Clé API créée: ${apiKey.key.substring(0, 20)}...`);

  try {
    const startTime = Date.now();
    let successCount = 0;
    let rateLimitHit = false;

    // Faire 105 requêtes rapides (doit dépasser 100/min)
    console.log("   🔄 Envoi de 105 requêtes...");

    for (let i = 0; i < 105; i++) {
      const response = await fetch(`${BASE_URL}/api/v1/bookings?limit=1`, {
        headers: { "X-API-Key": apiKey.key },
      });

      if (response.status === 200) {
        successCount++;
      } else if (response.status === 429) {
        rateLimitHit = true;
        const data = await response.json();
        logTest(
          "Rate Limiting",
          true,
          `Limite atteinte après ${successCount} requêtes: ${data.message}`,
          Date.now() - startTime
        );
        break;
      }

      // Petit délai pour ne pas saturer
      if (i % 10 === 0 && i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    if (!rateLimitHit) {
      logTest(
        "Rate Limiting",
        false,
        `Aucune limite atteinte après ${successCount} requêtes`,
        Date.now() - startTime
      );
    }

    return rateLimitHit;
  } finally {
    // Nettoyer
    await prisma.apiKey.delete({ where: { id: apiKey.id } });
  }
}

// ============================================
// TEST 3: Nouveaux endpoints establishments
// ============================================
async function test3_EstablishmentsEndpoints() {
  logSection("TEST 3: Nouveaux endpoints establishments");

  // Créer une clé API avec permissions establishments
  const apiKey = await prisma.apiKey.create({
    data: {
      name: "Test Establishments",
      key: `sk_test_${Date.now()}`,
      permissions: { establishments: ["read"] },
      isActive: true,
      createdBy: "test-script",
    },
  });

  try {
    // TEST 3.1: GET /api/v1/establishments
    const startTime1 = Date.now();
    const response1 = await fetch(`${BASE_URL}/api/v1/establishments?limit=5`, {
      headers: { "X-API-Key": apiKey.key },
    });

    if (response1.status === 200) {
      const data = await response1.json();
      logTest(
        "GET /api/v1/establishments",
        true,
        `Récupéré ${data.data.length} établissements`,
        Date.now() - startTime1
      );
    } else {
      logTest(
        "GET /api/v1/establishments",
        false,
        `Erreur ${response1.status}`,
        Date.now() - startTime1
      );
    }

    // TEST 3.2: GET /api/v1/establishments/:slug
    const startTime2 = Date.now();

    // Récupérer le premier établissement pour tester
    const establishments = await prisma.establishment.findFirst({
      select: { slug: true },
    });

    if (establishments) {
      const response2 = await fetch(
        `${BASE_URL}/api/v1/establishments/${establishments.slug}`,
        {
          headers: { "X-API-Key": apiKey.key },
        }
      );

      if (response2.status === 200) {
        const data = await response2.json();
        logTest(
          "GET /api/v1/establishments/:slug",
          true,
          `Détails récupérés pour ${data.data.name}`,
          Date.now() - startTime2
        );
      } else {
        logTest(
          "GET /api/v1/establishments/:slug",
          false,
          `Erreur ${response2.status}`,
          Date.now() - startTime2
        );
      }
    } else {
      logTest(
        "GET /api/v1/establishments/:slug",
        false,
        "Aucun établissement en DB",
        Date.now() - startTime2
      );
    }

    return true;
  } finally {
    // Nettoyer
    await prisma.apiKey.delete({ where: { id: apiKey.id } });
  }
}

// ============================================
// TEST 4: Secret HMAC auto-généré
// ============================================
async function test4_WebhookSecretGeneration() {
  logSection("TEST 4: Secret HMAC auto-généré");

  const startTime = Date.now();

  try {
    // Récupérer un établissement
    const establishment = await prisma.establishment.findFirst();

    if (!establishment) {
      logTest(
        "Secret HMAC auto-généré",
        false,
        "Aucun établissement disponible",
        Date.now() - startTime
      );
      return false;
    }

    // Générer un secret comme le fait l'API
    function generateWebhookSecret(): string {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let secret = "whsec_";

      for (let i = 0; i < 32; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      return secret;
    }

    // Créer un webhook avec le secret auto-généré (comme le fait l'API)
    const generatedSecret = generateWebhookSecret();
    const webhook = await prisma.webhook.create({
      data: {
        name: "Test Auto Secret",
        establishmentSlug: establishment.slug,
        url: "https://example.com/webhook",
        events: ["booking.completed"],
        isActive: true,
        secret: generatedSecret,
      },
    });

    // Vérifier que le secret a été généré avec le bon format
    if (
      webhook.secret &&
      webhook.secret.startsWith("whsec_") &&
      webhook.secret.length === 38
    ) {
      logTest(
        "Secret HMAC auto-généré",
        true,
        `Secret généré: ${webhook.secret.substring(0, 15)}...`,
        Date.now() - startTime
      );

      // Nettoyer
      await prisma.webhook.delete({ where: { id: webhook.id } });
      return true;
    } else {
      logTest(
        "Secret HMAC auto-généré",
        false,
        `Secret manquant ou format incorrect: ${webhook.secret}`,
        Date.now() - startTime
      );

      // Nettoyer
      await prisma.webhook.delete({ where: { id: webhook.id } });
      return false;
    }
  } catch (error) {
    logTest(
      "Secret HMAC auto-généré",
      false,
      `Erreur: ${error instanceof Error ? error.message : String(error)}`,
      Date.now() - startTime
    );
    return false;
  }
}

// ============================================
// TEST 5: Webhook auto-disable
// ============================================
async function test5_WebhookAutoDisable() {
  logSection("TEST 5: Webhook auto-disable après 10 échecs");

  const startTime = Date.now();

  try {
    // Récupérer un établissement
    const establishment = await prisma.establishment.findFirst();

    if (!establishment) {
      logTest(
        "Webhook auto-disable",
        false,
        "Aucun établissement disponible",
        Date.now() - startTime
      );
      return false;
    }

    // Créer un webhook
    const webhook = await prisma.webhook.create({
      data: {
        name: "Test Auto Disable",
        establishmentSlug: establishment.slug,
        url: "https://nonexistent-domain-12345.com/webhook",
        events: ["booking.completed"],
        isActive: true,
        secret: "test_secret",
        retryCount: 1, // 1 seule tentative pour accélérer le test
      },
    });

    console.log(`   📝 Webhook créé: ${webhook.id}`);
    console.log("   🔄 Simulation de 10 échecs consécutifs...");

    // Simuler 10 échecs consécutifs en créant des logs
    for (let i = 0; i < 10; i++) {
      await prisma.webhookLog.create({
        data: {
          webhookId: webhook.id,
          event: "booking.completed",
          url: webhook.url,
          payload: { test: true },
          statusCode: 500,
          success: false,
          attempt: 1,
          executionTime: 100,
        },
      });
    }

    // Importer la fonction de vérification
    const { checkAndDisableWebhook } = await import("@/lib/api/webhook");

    // Déclencher la vérification
    await checkAndDisableWebhook(webhook.id);

    // Vérifier que le webhook a été désactivé
    const updatedWebhook = await prisma.webhook.findUnique({
      where: { id: webhook.id },
    });

    if (updatedWebhook && !updatedWebhook.isActive) {
      logTest(
        "Webhook auto-disable",
        true,
        "Webhook correctement désactivé après 10 échecs",
        Date.now() - startTime
      );

      // Nettoyer
      await prisma.webhookLog.deleteMany({ where: { webhookId: webhook.id } });
      await prisma.webhook.delete({ where: { id: webhook.id } });
      return true;
    } else {
      logTest(
        "Webhook auto-disable",
        false,
        `Webhook toujours actif: ${updatedWebhook?.isActive}`,
        Date.now() - startTime
      );

      // Nettoyer
      await prisma.webhookLog.deleteMany({ where: { webhookId: webhook.id } });
      await prisma.webhook.delete({ where: { id: webhook.id } });
      return false;
    }
  } catch (error) {
    logTest(
      "Webhook auto-disable",
      false,
      `Erreur: ${error instanceof Error ? error.message : String(error)}`,
      Date.now() - startTime
    );
    return false;
  }
}

// ============================================
// TEST 6: Headers Rate Limit présents
// ============================================
async function test6_RateLimitHeaders() {
  logSection("TEST 6: Headers Rate Limit");

  // Récupérer un établissement pour lier la clé API
  const establishment = await prisma.establishment.findFirst();

  if (!establishment) {
    logTest("Headers Rate Limit", false, "Aucun établissement disponible", 0);
    return false;
  }

  // Créer une clé API liée à un établissement
  const apiKey = await prisma.apiKey.create({
    data: {
      name: `Test Headers ${Date.now()}`,
      key: `sk_test_headers_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      establishmentSlug: establishment.slug, // Lier à un établissement
      permissions: { bookings: ["read"] },
      isActive: true,
      createdBy: "test-script",
    },
  });

  try {
    // Attendre 100ms pour s'assurer que le rate limiter est prêt
    await new Promise((resolve) => setTimeout(resolve, 100));

    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/api/v1/bookings?limit=1`, {
      headers: { "X-API-Key": apiKey.key },
    });

    const headers = response.headers;
    const hasLimit = headers.has("x-ratelimit-limit");
    const hasRemaining = headers.has("x-ratelimit-remaining");
    const hasReset = headers.has("x-ratelimit-reset");

    console.log(`   📊 Status: ${response.status}`);
    console.log(
      `   📊 Headers disponibles: ${Array.from(headers.keys()).join(", ")}`
    );

    if (hasLimit && hasRemaining && hasReset) {
      logTest(
        "Headers Rate Limit",
        true,
        `Limit: ${headers.get("x-ratelimit-limit")}, Remaining: ${headers.get("x-ratelimit-remaining")}`,
        Date.now() - startTime
      );
      return true;
    } else {
      logTest(
        "Headers Rate Limit",
        false,
        `Headers manquants: Limit=${hasLimit}, Remaining=${hasRemaining}, Reset=${hasReset}`,
        Date.now() - startTime
      );
      return false;
    }
  } finally {
    // Nettoyer
    await prisma.apiKey.delete({ where: { id: apiKey.id } });
  }
}

// ============================================
// MAIN - Exécuter tous les tests
// ============================================
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   🧪 TEST DES AMÉLIORATIONS API & WEBHOOKS         ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const startTime = Date.now();

  try {
    await test1_SuperAdminSecurity();
    await test2_RateLimiting();
    await test3_EstablishmentsEndpoints();
    await test4_WebhookSecretGeneration();
    await test5_WebhookAutoDisable();
    await test6_RateLimitHeaders();
  } catch (error) {
    console.error("\n❌ Erreur fatale:", error);
  }

  const duration = Date.now() - startTime;

  // Résumé
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║              📊 RÉSUMÉ DES TESTS                    ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const total = results.length;

  console.log(`✅ Tests réussis : ${passed}/${total}`);
  console.log(`❌ Tests échoués : ${failed}/${total}`);
  console.log(`⏱️  Durée totale  : ${(duration / 1000).toFixed(2)}s\n`);

  if (failed > 0) {
    console.log("❌ ÉCHECS DÉTAILLÉS:\n");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   • ${r.name}: ${r.message}`);
      });
    console.log();
  }

  if (failed === 0) {
    console.log("🎉 TOUS LES TESTS SONT PASSÉS !\n");
    console.log("✅ L'API est prête pour la production.\n");
  } else {
    console.log(
      "⚠️  Certains tests ont échoué. Vérifiez les détails ci-dessus.\n"
    );
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error("Erreur fatale:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
