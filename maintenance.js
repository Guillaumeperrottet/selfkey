#!/usr/bin/env node

/**
 * Script de maintenance et d'information sur les outils disponibles
 * Affiche les scripts disponibles et leurs fonctions
 *
 * Usage: node maintenance.js [command]
 */

import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);
const prisma = new PrismaClient();

const SCRIPTS = {
  "fresh-start": {
    file: "fresh-start.js",
    description: "Réinitialisation complète (nettoyage + données de test)",
    usage: "node fresh-start.js [--force]",
    category: "database",
  },
  reset: {
    file: "reset-database.js",
    description: "Nettoyage de la base de données (préserve super-admin)",
    usage: "node reset-database.js [--force]",
    category: "database",
  },
  monitor: {
    file: "stripe-health-check.js",
    description: "Monitoring complet Stripe Connect",
    usage: "node stripe-health-check.js [check|watch]",
    category: "monitoring",
  },
  "test-api": {
    file: "test-stripe-monitoring.js",
    description: "Test de l'API de monitoring",
    usage: "node test-stripe-monitoring.js",
    category: "testing",
  },
  simulate: {
    file: "simulate-bookings.js",
    description: "Simulation de réservations",
    usage: "node simulate-bookings.js",
    category: "testing",
  },
  performance: {
    file: "performance-test.js",
    description: "Tests de performance et charge",
    usage: "node performance-test.js",
    category: "testing",
  },
};

async function showStats() {
  try {
    console.log("📊 État actuel de la base de données:");
    console.log("=====================================");

    const stats = await Promise.all([
      prisma.user.count(),
      prisma.establishment.count(),
      prisma.room.count(),
      prisma.booking.count(),
    ]);

    console.log(`👥 Utilisateurs: ${stats[0]}`);
    console.log(`🏨 Établissements: ${stats[1]}`);
    console.log(`🏠 Chambres: ${stats[2]}`);
    console.log(`📅 Réservations: ${stats[3]}`);
    console.log("");

    // Vérifier le super-admin
    const superAdmin = await prisma.user.findFirst({
      where: { email: "admin@selfkey.local" },
    });
    console.log(`🔐 Super-admin: ${superAdmin ? "✅ Présent" : "❌ Absent"}`);

    // Vérifier les commissions
    const commissions = await prisma.booking.aggregate({
      _sum: { platformCommission: true },
    });
    console.log(
      `💰 Commissions totales: ${(commissions._sum.platformCommission || 0).toFixed(2)} CHF`
    );
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des statistiques:",
      error.message
    );
  }
}

function showHelp() {
  console.log("🛠️  Outils de gestion des commissions");
  console.log("====================================\n");

  const categories = {
    database: "🗄️  Base de données",
    monitoring: "📊 Monitoring",
    testing: "🧪 Tests",
  };

  Object.entries(categories).forEach(([key, title]) => {
    console.log(title);
    console.log("-".repeat(title.length - 2));

    Object.entries(SCRIPTS).forEach(([name, script]) => {
      if (script.category === key) {
        console.log(`  ${name.padEnd(12)} : ${script.description}`);
        console.log(`  ${"".padEnd(12)}   Usage: ${script.usage}`);
        console.log("");
      }
    });
  });

  console.log("🚀 Commandes de maintenance:");
  console.log("---------------------------");
  console.log("  stats       : Afficher l'état de la base de données");
  console.log("  help        : Afficher cette aide");
  console.log("  run <script>: Exécuter un script");
  console.log("");
  console.log("📚 Documentation:");
  console.log("  GUIDE_ADMINISTRATION_COMMISSIONS.md");
  console.log("  GUIDE_NETTOYAGE_BDD.md");
  console.log("  SCRIPTS_REFERENCE.md");
}

async function runScript(scriptName) {
  if (!SCRIPTS[scriptName]) {
    console.log(`❌ Script "${scriptName}" non trouvé.`);
    console.log("Scripts disponibles:", Object.keys(SCRIPTS).join(", "));
    return;
  }

  const script = SCRIPTS[scriptName];
  console.log(`🚀 Exécution de ${script.file}...`);
  console.log(`Description: ${script.description}`);
  console.log("");

  try {
    const { stdout, stderr } = await execPromise(`node ${script.file}`);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution:`, error.message);
  }
}

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case "stats":
        await showStats();
        break;
      case "help":
      case "--help":
      case "-h":
        showHelp();
        break;
      case "run":
        const scriptName = process.argv[3];
        if (!scriptName) {
          console.log("❌ Veuillez spécifier un script à exécuter.");
          console.log("Usage: node maintenance.js run <script>");
          console.log("Scripts disponibles:", Object.keys(SCRIPTS).join(", "));
          return;
        }
        await runScript(scriptName);
        break;
      default:
        console.log("🛠️  Maintenance des outils de gestion des commissions\n");
        if (command) {
          console.log(`❌ Commande "${command}" non reconnue.`);
        }
        console.log("Commandes disponibles:");
        console.log("  stats  : Afficher l'état de la base de données");
        console.log("  help   : Afficher l'aide complète");
        console.log("  run    : Exécuter un script");
        console.log("");
        console.log("Pour plus d'informations: node maintenance.js help");
        break;
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
