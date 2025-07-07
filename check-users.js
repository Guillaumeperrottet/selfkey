import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
  console.log("📋 Vérification des utilisateurs dans la base...\n");

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Total utilisateurs: ${users.length}`);

    if (users.length > 0) {
      console.log("\n👥 Utilisateurs trouvés:");
      users.forEach((user, index) => {
        console.log(
          `${index + 1}. ${user.email} (${user.name || "Sans nom"}) - Créé le ${user.createdAt.toLocaleDateString()}`
        );
        console.log(`   ID: ${user.id}, Email vérifié: ${user.emailVerified}`);
      });
    } else {
      console.log("✅ Aucun utilisateur dans la base de données");
    }

    // Vérifier les sessions
    const sessions = await prisma.session.findMany({
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    console.log(`\n🔐 Sessions actives: ${sessions.length}`);

    if (sessions.length > 0) {
      sessions.forEach((session, index) => {
        console.log(
          `${index + 1}. Session ID: ${session.id}, User: ${session.userId}, Expire: ${session.expiresAt.toLocaleDateString()}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
