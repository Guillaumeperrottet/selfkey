const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkEmailConfig() {
  try {
    const establishments = await prisma.establishment.findMany({
      select: {
        name: true,
        slug: true,
        confirmationEmailFrom: true,
        hotelContactEmail: true,
      },
    });

    console.log("=== Configuration Email des Établissements ===\n");

    establishments.forEach((est) => {
      console.log(`📨 ${est.name} (${est.slug})`);
      console.log(
        `   confirmationEmailFrom: ${est.confirmationEmailFrom || "Non configuré"}`
      );
      console.log(
        `   hotelContactEmail: ${est.hotelContactEmail || "Non configuré"}`
      );
      console.log("");
    });
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmailConfig();
