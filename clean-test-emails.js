import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanTestEmails() {
  console.log("🧹 Nettoyage des emails de test...\n");

  try {
    // Lister d'abord tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("📋 Utilisateurs actuels dans la base de données:");
    users.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.email} (${user.name || "Sans nom"}) - Créé le ${user.createdAt.toLocaleDateString()}`
      );
    });

    console.log("\n🔍 Recherche des emails de test...");

    // Patterns d'emails de test à supprimer
    const testPatterns = [
      "test@",
      "demo@",
      "example@",
      "admin@test",
      "user@test",
      "+test",
      ".test@",
      "guillaume+",
      "guili+",
    ];

    const testUsers = users.filter((user) =>
      testPatterns.some((pattern) =>
        user.email.toLowerCase().includes(pattern.toLowerCase())
      )
    );

    if (testUsers.length === 0) {
      console.log("✅ Aucun email de test trouvé.");
      return;
    }

    console.log(`\n🎯 ${testUsers.length} email(s) de test trouvé(s):`);
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name || "Sans nom"})`);
    });

    // Demander confirmation (en mode interactif)
    if (process.argv.includes("--force")) {
      console.log("\n⚠️  Mode forcé activé, suppression sans confirmation...");
    } else {
      console.log(
        "\n⚠️  Pour supprimer ces emails de test, relancez le script avec --force:"
      );
      console.log("node clean-test-emails.js --force");
      return;
    }

    // Supprimer les comptes et données associées
    console.log("\n🗑️  Suppression en cours...");

    for (const user of testUsers) {
      try {
        // Supprimer les sessions d'abord
        await prisma.session.deleteMany({
          where: { userId: user.id },
        });

        // Supprimer les comptes OAuth
        await prisma.account.deleteMany({
          where: { userId: user.id },
        });

        // Supprimer les tokens de vérification
        await prisma.verification.deleteMany({
          where: {
            OR: [{ identifier: user.email }, { userId: user.id }],
          },
        });

        // Supprimer l'utilisateur
        await prisma.user.delete({
          where: { id: user.id },
        });

        console.log(`✅ Supprimé: ${user.email}`);
      } catch (error) {
        console.error(
          `❌ Erreur lors de la suppression de ${user.email}:`,
          error.message
        );
      }
    }

    console.log("\n✨ Nettoyage terminé!");

    // Afficher le nombre d'utilisateurs restants
    const remainingUsers = await prisma.user.count();
    console.log(`📊 Utilisateurs restants: ${remainingUsers}`);
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ajouter une fonction pour supprimer un email spécifique
async function removeSpecificEmail(email) {
  console.log(`🎯 Suppression de l'email spécifique: ${email}\n`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
      return;
    }

    console.log(
      `👤 Utilisateur trouvé: ${user.name || "Sans nom"} (${user.email})`
    );

    // Supprimer les données associées
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.account.deleteMany({ where: { userId: user.id } });
    await prisma.verification.deleteMany({
      where: {
        OR: [{ identifier: user.email }, { userId: user.id }],
      },
    });

    // Supprimer l'utilisateur
    await prisma.user.delete({ where: { id: user.id } });

    console.log(`✅ ${email} supprimé avec succès!`);
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression de ${email}:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

// Vérifier les arguments de ligne de commande
const args = process.argv.slice(2);
const emailToRemove = args.find((arg) => arg.includes("@"));

if (emailToRemove) {
  removeSpecificEmail(emailToRemove);
} else {
  cleanTestEmails();
}
