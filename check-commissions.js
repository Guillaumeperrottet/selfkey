const { PrismaClient } = require("@prisma/client");

async function checkCommissions() {
  const prisma = new PrismaClient();

  try {
    // D'abord lister tous les établissements
    const establishments = await prisma.establishment.findMany({
      select: {
        name: true,
        slug: true,
        commissionRate: true,
        fixedFee: true,
        dayParkingCommissionRate: true,
      },
    });

    console.log("📋 Établissements disponibles:");
    establishments.forEach((est) => {
      console.log(`- ${est.name} (${est.slug})`);
    });

    if (establishments.length === 0) {
      console.log("❌ Aucun établissement trouvé");
      return;
    }

    // Prendre le premier établissement disponible
    const establishment = establishments[0];

    console.log("\n🏨 Analysant:", establishment.name);
    console.log("🔗 Slug:", establishment.slug);
    console.log("\n--- 🌙 PARKING NUIT ---");
    console.log("💰 Commission rate:", establishment.commissionRate + "%");
    console.log("💳 Fixed fee:", establishment.fixedFee + " CHF");
    console.log("\n--- ☀️ PARKING JOUR ---");
    console.log(
      "💰 Commission rate:",
      establishment.dayParkingCommissionRate + "%"
    );
    console.log("💳 Fixed fee: 0 CHF (pas de frais fixes)");

    console.log("\n--- 🧪 TEST tarif 1 CHF parking jour ---");
    const dayCommission = (1 * establishment.dayParkingCommissionRate) / 100;
    console.log("🎯 Tarif: 1.00 CHF");
    console.log(
      "📊 Commission: " +
        dayCommission.toFixed(2) +
        " CHF (" +
        establishment.dayParkingCommissionRate +
        "% de 1 CHF)"
    );
    console.log(
      "💵 Montant restant: " + (1 - dayCommission).toFixed(2) + " CHF"
    );

    if (dayCommission < 1) {
      console.log("✅ Commission valide - Tarif 1 CHF possible!");
    } else {
      console.log("❌ Commission trop élevée - Tarif 1 CHF impossible");
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCommissions();
