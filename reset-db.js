import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log("🔄 Réinitialisation complète de la base de données...\n");

  if (!process.argv.includes("--force")) {
    console.log(
      "⚠️  ATTENTION: Ceci va supprimer TOUTES les données de la base de données!"
    );
    console.log("⚠️  Pour confirmer, relancez le script avec --force:");
    console.log("npm run reset-db:force");
    return;
  }

  try {
    console.log("🗑️  Suppression de toutes les données...");

    // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères

    // 1. Tables dépendantes d'abord
    await prisma.integrationLog.deleteMany({});
    console.log("✅ Logs d'intégration supprimés");

    await prisma.integration.deleteMany({});
    console.log("✅ Intégrations supprimées");

    await prisma.pricingOptionValue.deleteMany({});
    console.log("✅ Valeurs des options de prix supprimées");

    await prisma.pricingOption.deleteMany({});
    console.log("✅ Options de prix supprimées");

    await prisma.booking.deleteMany({});
    console.log("✅ Réservations supprimées");

    await prisma.room.deleteMany({});
    console.log("✅ Places supprimées");

    await prisma.userEstablishment.deleteMany({});
    console.log("✅ Relations utilisateur-établissement supprimées");

    await prisma.establishment.deleteMany({});
    console.log("✅ Établissements supprimés");

    // 2. Tables d'authentification
    await prisma.session.deleteMany({});
    console.log("✅ Sessions supprimées");

    await prisma.account.deleteMany({});
    console.log("✅ Comptes OAuth supprimés");

    await prisma.verification.deleteMany({});
    console.log("✅ Tokens de vérification supprimés");

    await prisma.user.deleteMany({});
    console.log("✅ Utilisateurs supprimés");

    console.log("\n✨ Base de données réinitialisée avec succès!");
    console.log(
      "🎯 Vous pouvez maintenant créer un nouveau compte administrateur."
    );
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
