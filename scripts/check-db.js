import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log("🔍 Vérification des tables...");

    // Test des tables principales
    const userCount = await prisma.user.count();
    console.log(`✅ Table User: ${userCount} entrées`);

    const sessionCount = await prisma.session.count();
    console.log(`✅ Table Session: ${sessionCount} entrées`);

    const accountCount = await prisma.account.count();
    console.log(`✅ Table Account: ${accountCount} entrées`);

    // Test de la table problématique
    try {
      const verificationCount = await prisma.verificationToken.count();
      console.log(`✅ Table VerificationToken: ${verificationCount} entrées`);
    } catch (error) {
      console.log(`❌ Table VerificationToken manquante:`, error.message);
    }

    const establishmentCount = await prisma.establishment.count();
    console.log(`✅ Table Establishment: ${establishmentCount} entrées`);
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
