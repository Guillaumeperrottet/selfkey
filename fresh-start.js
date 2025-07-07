#!/usr/bin/env node

/**
 * Script pour réinitialiser complètement l'environnement de test
 * Combine reset-database.js + setup-test-data.js
 *
 * Usage: node fresh-start.js
 */

import { PrismaClient } from "@prisma/client";
import readline from "readline";

const prisma = new PrismaClient();
const SUPER_ADMIN_EMAIL = "perrottet.guillaume.97@gmail.com";

async function confirmAction() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "🚀 Réinitialisation complète de l'environnement de test\n" +
        "   - Suppression de toutes les données\n" +
        "   - Préservation du super-admin\n" +
        "   - Création de nouvelles données de test\n" +
        "   Continuer ? (oui/non): ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "oui" || answer.toLowerCase() === "o");
      }
    );
  });
}

async function resetDatabase() {
  console.log("🗄️  Nettoyage de la base de données...\n");

  // Supprimer les données dans l'ordre
  const deletedBookings = await prisma.booking.deleteMany({});
  console.log(`   ✅ ${deletedBookings.count} réservations supprimées`);

  const deletedRooms = await prisma.room.deleteMany({});
  console.log(`   ✅ ${deletedRooms.count} chambres supprimées`);

  try {
    const deletedPricingOptionValues =
      await prisma.pricingOptionValue.deleteMany({});
    console.log(
      `   ✅ ${deletedPricingOptionValues.count} valeurs de tarification supprimées`
    );
  } catch (e) {
    console.log(`   ⚠️  Pas de valeurs de tarification à supprimer`);
  }

  try {
    const deletedPricingOptions = await prisma.pricingOption.deleteMany({});
    console.log(
      `   ✅ ${deletedPricingOptions.count} options de tarification supprimées`
    );
  } catch (e) {
    console.log(`   ⚠️  Pas d'options de tarification à supprimer`);
  }

  try {
    const deletedIntegrationLogs = await prisma.integrationLog.deleteMany({});
    console.log(
      `   ✅ ${deletedIntegrationLogs.count} logs d'intégration supprimés`
    );
  } catch (e) {
    console.log(`   ⚠️  Pas de logs d'intégration à supprimer`);
  }

  try {
    const deletedIntegrations = await prisma.integration.deleteMany({});
    console.log(`   ✅ ${deletedIntegrations.count} intégrations supprimées`);
  } catch (e) {
    console.log(`   ⚠️  Pas d'intégrations à supprimer`);
  }

  try {
    const deletedUserEstablishments = await prisma.userEstablishment.deleteMany(
      {}
    );
    console.log(
      `   ✅ ${deletedUserEstablishments.count} relations utilisateur-établissement supprimées`
    );
  } catch (e) {
    console.log(
      `   ⚠️  Pas de relations utilisateur-établissement à supprimer`
    );
  }

  const deletedEstablishments = await prisma.establishment.deleteMany({});
  console.log(`   ✅ ${deletedEstablishments.count} établissements supprimés`);

  // Supprimer les données d'auth (sauf super-admin)
  await prisma.session.deleteMany({
    where: {
      user: {
        email: {
          not: SUPER_ADMIN_EMAIL,
        },
      },
    },
  });

  await prisma.account.deleteMany({
    where: {
      user: {
        email: {
          not: SUPER_ADMIN_EMAIL,
        },
      },
    },
  });

  await prisma.verification.deleteMany({
    where: {
      identifier: {
        not: SUPER_ADMIN_EMAIL,
      },
    },
  });

  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: {
        not: SUPER_ADMIN_EMAIL,
      },
    },
  });
  console.log(`   ✅ ${deletedUsers.count} utilisateurs supprimés`);

  // Vérifier le super-admin
  const superAdmin = await prisma.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });

  if (superAdmin) {
    console.log(`   ✅ Super-admin préservé: ${superAdmin.email}`);
  } else {
    console.log("   ⚠️  Super-admin non trouvé");
  }
}

async function createTestData() {
  console.log("\n🏗️  Création des données de test...\n");

  // Créer un établissement
  const establishment = await prisma.establishment.create({
    data: {
      name: "Alpha-hôtel",
      slug: "alpha-hotel",
      commissionRate: 10.0,
      fixedFee: 5.0,
      maxBookingDays: 30,
      allowFutureBookings: true,
      stripeOnboarded: false,
      accessCodeType: "room",
      generalAccessCode: "TEST2025",
      accessInstructions:
        "Utilisez le code TEST2025 ou les codes spécifiques aux chambres",
      confirmationEmailEnabled: true,
      confirmationWhatsappEnabled: false,
    },
  });
  console.log(`   ✅ Établissement: ${establishment.name}`);

  // Créer des chambres
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: "Chambre Standard",
        price: 120.0,
        accessCode: "STANDARD123",
        hotelSlug: establishment.slug,
      },
    }),
    prisma.room.create({
      data: {
        name: "Suite Deluxe",
        price: 250.0,
        accessCode: "DELUXE456",
        hotelSlug: establishment.slug,
      },
    }),
    prisma.room.create({
      data: {
        name: "Chambre Économique",
        price: 80.0,
        accessCode: "ECO789",
        hotelSlug: establishment.slug,
      },
    }),
  ]);
  console.log(`   ✅ ${rooms.length} chambres créées`);

  // Les codes d'accès sont maintenant intégrés dans l'établissement et les chambres
  const accessCodes = [
    { code: establishment.generalAccessCode, type: "general" },
    { code: rooms[0].accessCode, type: "room", room: rooms[0].name },
    { code: rooms[1].accessCode, type: "room", room: rooms[1].name },
    { code: rooms[2].accessCode, type: "room", room: rooms[2].name },
  ];
  console.log(`   ✅ ${accessCodes.length} codes d'accès configurés`);

  return { establishment, rooms, accessCodes };
}

async function main() {
  console.log("🚀 Réinitialisation complète de l'environnement");
  console.log("===============================================\n");

  // Demander confirmation (sauf en mode force)
  const forceMode = process.argv.includes("--force");
  if (!forceMode) {
    const confirmed = await confirmAction();
    if (!confirmed) {
      console.log("❌ Opération annulée");
      process.exit(0);
    }
  }

  try {
    // 1. Nettoyer la base
    await resetDatabase();

    // 2. Créer les données de test
    const { establishment, rooms, accessCodes } = await createTestData();

    // 3. Statistiques finales
    console.log("\n📊 Environnement prêt !");
    console.log("====================");
    console.log(`🏨 Établissement: ${establishment.name}`);
    console.log(`🏠 Chambres: ${rooms.length}`);
    console.log(`🔐 Codes d'accès: ${accessCodes.length}`);
    console.log("");
    console.log("🔗 URLs utiles:");
    console.log(
      `   Interface publique: http://localhost:3000/${establishment.slug}`
    );
    console.log(
      `   Admin commissions: http://localhost:3000/admin/commissions`
    );
    console.log(
      `   Monitoring Stripe: http://localhost:3000/admin/stripe-monitoring`
    );
    console.log("");
    console.log("🔐 Codes d'accès de test:");
    console.log(`   - ${establishment.generalAccessCode} (code général)`);
    accessCodes.slice(1).forEach((code) => {
      console.log(`   - ${code.code} (${code.room})`);
    });
    console.log("");
    console.log("📧 Super-admin: perrottet.guillaume.97@gmail.com");
    console.log("");
    console.log("🎉 Prêt pour les tests !");
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
