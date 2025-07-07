import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function completeCleanup() {
  console.log("🧹 Nettoyage complet FORCÉ de la base...\n");

  try {
    // Supprimer dans l'ordre pour éviter les contraintes
    console.log("🗑️ Suppression des sessions...");
    await prisma.session.deleteMany({});

    console.log("🗑️ Suppression des comptes...");
    await prisma.account.deleteMany({});

    console.log("🗑️ Suppression des vérifications...");
    await prisma.verification.deleteMany({});

    console.log("🗑️ Suppression des utilisateurs...");
    await prisma.user.deleteMany({});

    console.log("🗑️ Suppression des réservations...");
    await prisma.booking.deleteMany({});

    console.log("🗑️ Suppression des places...");
    await prisma.room.deleteMany({});

    console.log("🗑️ Suppression des relations...");
    await prisma.userEstablishment.deleteMany({});

    console.log("🗑️ Suppression des établissements...");
    await prisma.establishment.deleteMany({});

    // Vérifier que tout est vide
    const userCount = await prisma.user.count();
    const sessionCount = await prisma.session.count();
    const accountCount = await prisma.account.count();

    console.log("\n✅ Nettoyage terminé !");
    console.log(`👥 Utilisateurs restants: ${userCount}`);
    console.log(`🔐 Sessions restantes: ${sessionCount}`);
    console.log(`📱 Comptes OAuth restants: ${accountCount}`);

    if (userCount === 0 && sessionCount === 0 && accountCount === 0) {
      console.log("\n🎉 Base de données entièrement vide !");
    } else {
      console.log("\n⚠️ Il reste encore des données...");
    }
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
  } finally {
    await prisma.$disconnect();
  }
}

completeCleanup();
