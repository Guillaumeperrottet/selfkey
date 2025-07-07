#!/usr/bin/env node

/**
 * Script pour vider complètement la base de données
 * Préserve uniquement le compte super-admin
 *
 * ATTENTION: Ce script supprime TOUTES les données !
 * Utilisez avec précaution, uniquement en développement.
 *
 * Usage: node reset-database.js
 */

import { PrismaClient } from "@prisma/client";
import readline from "readline";

const prisma = new PrismaClient();

// Configuration du super-admin à préserver
const SUPER_ADMIN_EMAIL = "admin@selfkey.local";

async function confirmAction() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "⚠️  ATTENTION: Cette action va supprimer TOUTES les données de la base !\n" +
        "   Seul le compte super-admin sera préservé.\n" +
        "   Êtes-vous sûr de vouloir continuer ? (oui/non): ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "oui" || answer.toLowerCase() === "o");
      }
    );
  });
}

async function resetDatabase() {
  console.log("🗄️  Début du nettoyage de la base de données...\n");

  try {
    // 1. Supprimer les données dans l'ordre (à cause des contraintes de clés étrangères)

    console.log("🔥 Suppression des réservations...");
    const deletedBookings = await prisma.booking.deleteMany({
      where: {
        clientEmail: {
          not: SUPER_ADMIN_EMAIL, // Ne pas supprimer les réservations du super-admin si il en a
        },
      },
    });
    console.log(`   ✅ ${deletedBookings.count} réservations supprimées`);

    console.log("🔥 Suppression des chambres...");
    const deletedRooms = await prisma.room.deleteMany({});
    console.log(`   ✅ ${deletedRooms.count} chambres supprimées`);

    console.log("🔥 Suppression des codes d'accès...");
    const deletedAccessCodes = await prisma.accessCode.deleteMany({});
    console.log(`   ✅ ${deletedAccessCodes.count} codes d'accès supprimés`);

    console.log("🔥 Suppression des intégrations...");
    const deletedIntegrations = await prisma.integration.deleteMany({});
    console.log(`   ✅ ${deletedIntegrations.count} intégrations supprimées`);

    console.log("🔥 Suppression des établissements...");
    const deletedEstablishments = await prisma.establishment.deleteMany({});
    console.log(
      `   ✅ ${deletedEstablishments.count} établissements supprimés`
    );

    // 2. Supprimer les données d'authentification (sauf le super-admin)
    console.log("🔥 Suppression des sessions...");
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        user: {
          email: {
            not: SUPER_ADMIN_EMAIL,
          },
        },
      },
    });
    console.log(`   ✅ ${deletedSessions.count} sessions supprimées`);

    console.log("🔥 Suppression des comptes...");
    const deletedAccounts = await prisma.account.deleteMany({
      where: {
        user: {
          email: {
            not: SUPER_ADMIN_EMAIL,
          },
        },
      },
    });
    console.log(`   ✅ ${deletedAccounts.count} comptes supprimés`);

    console.log("🔥 Suppression des tokens de vérification...");
    const deletedVerificationTokens = await prisma.verificationToken.deleteMany(
      {
        where: {
          identifier: {
            not: SUPER_ADMIN_EMAIL,
          },
        },
      }
    );
    console.log(`   ✅ ${deletedVerificationTokens.count} tokens supprimés`);

    console.log("🔥 Suppression des utilisateurs (sauf super-admin)...");
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          not: SUPER_ADMIN_EMAIL,
        },
      },
    });
    console.log(`   ✅ ${deletedUsers.count} utilisateurs supprimés`);

    // 3. Vérifier que le super-admin existe toujours
    console.log("\n🔍 Vérification du super-admin...");
    const superAdmin = await prisma.user.findUnique({
      where: {
        email: SUPER_ADMIN_EMAIL,
      },
    });

    if (superAdmin) {
      console.log(`   ✅ Super-admin préservé: ${superAdmin.email}`);
    } else {
      console.log("   ⚠️  Super-admin non trouvé dans la base");
    }

    // 4. Statistiques finales
    console.log("\n📊 État final de la base de données:");
    const finalStats = await Promise.all([
      prisma.user.count(),
      prisma.establishment.count(),
      prisma.room.count(),
      prisma.booking.count(),
      prisma.accessCode.count(),
      prisma.integration.count(),
      prisma.session.count(),
      prisma.account.count(),
    ]);

    console.log(`   👥 Utilisateurs: ${finalStats[0]}`);
    console.log(`   🏨 Établissements: ${finalStats[1]}`);
    console.log(`   🏠 Chambres: ${finalStats[2]}`);
    console.log(`   📅 Réservations: ${finalStats[3]}`);
    console.log(`   🔐 Codes d'accès: ${finalStats[4]}`);
    console.log(`   🔗 Intégrations: ${finalStats[5]}`);
    console.log(`   🔑 Sessions: ${finalStats[6]}`);
    console.log(`   👤 Comptes: ${finalStats[7]}`);

    console.log("\n🎉 Nettoyage terminé avec succès !");
    console.log(
      "   La base de données est maintenant vide (sauf le super-admin)."
    );
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
    throw error;
  }
}

async function main() {
  console.log("🧹 Script de nettoyage de la base de données");
  console.log("==========================================\n");

  // Demander confirmation
  const confirmed = await confirmAction();
  if (!confirmed) {
    console.log("❌ Opération annulée par l'utilisateur");
    process.exit(0);
  }

  try {
    await resetDatabase();
  } catch (error) {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Gestion des arguments
const arg = process.argv[2];

if (arg === "--force") {
  // Mode force, pas de confirmation
  console.log("🧹 Mode force activé - Nettoyage sans confirmation");
  resetDatabase()
    .then(() => console.log("✅ Nettoyage terminé"))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
} else if (arg === "--help" || arg === "-h") {
  console.log("Usage:");
  console.log("  node reset-database.js        # Nettoyage avec confirmation");
  console.log("  node reset-database.js --force # Nettoyage sans confirmation");
  console.log("  node reset-database.js --help  # Afficher cette aide");
  console.log("");
  console.log("⚠️  ATTENTION: Ce script supprime TOUTES les données !");
  console.log("   Seul le compte super-admin est préservé.");
} else {
  main();
}
