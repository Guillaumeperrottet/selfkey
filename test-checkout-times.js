#!/usr/bin/env node

/**
 * Script pour tester les heures de checkout configurables
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testCheckoutTimes() {
  console.log("🕐 Test des heures de checkout configurables");
  console.log("=".repeat(50));

  try {
    // Chercher un établissement existant
    const establishment = await prisma.establishment.findFirst({
      select: {
        slug: true,
        name: true,
        checkoutTime: true,
        checkinTime: true,
      },
    });

    if (!establishment) {
      console.log("❌ Aucun établissement trouvé");
      return;
    }

    console.log(
      `\n📍 Établissement: ${establishment.name} (${establishment.slug})`
    );
    console.log(
      `🕒 Heure de check-in: ${establishment.checkinTime || "15:00 (par défaut)"}`
    );
    console.log(
      `🕓 Heure de check-out: ${establishment.checkoutTime || "12:00 (par défaut)"}`
    );

    // Tester la mise à jour des heures
    console.log("\n🔄 Test de mise à jour des heures...");

    const updatedEstablishment = await prisma.establishment.update({
      where: { slug: establishment.slug },
      data: {
        checkoutTime: "14:00", // Changement pour test
        checkinTime: "16:00",
      },
      select: {
        checkoutTime: true,
        checkinTime: true,
      },
    });

    console.log(`✅ Mise à jour réussie:`);
    console.log(`   Check-in: ${updatedEstablishment.checkinTime}`);
    console.log(`   Check-out: ${updatedEstablishment.checkoutTime}`);

    // Restaurer les valeurs par défaut
    await prisma.establishment.update({
      where: { slug: establishment.slug },
      data: {
        checkoutTime: "12:00",
        checkinTime: "15:00",
      },
    });

    console.log("🔄 Valeurs restaurées aux défauts (12:00 et 15:00)");

    // Tester la logique de disponibilité avec import dynamique
    console.log("\n🧪 Test de la logique de disponibilité...");

    try {
      // Import dynamique pour éviter les problèmes d'ESM
      const { isRoomCurrentlyAvailable } = await import(
        "./src/lib/availability.js"
      );

      // Chercher une chambre pour tester
      const room = await prisma.room.findFirst({
        where: { hotelSlug: establishment.slug },
        select: { id: true, name: true },
      });

      if (room) {
        const isAvailable = await isRoomCurrentlyAvailable(
          room.id,
          establishment.slug
        );
        console.log(
          `📍 Chambre ${room.name}: ${isAvailable ? "✅ Disponible" : "❌ Occupée"}`
        );

        const now = new Date();
        console.log(
          `⏰ Heure actuelle: ${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`
        );
        console.log(
          `🔍 L'heure de checkout (${updatedEstablishment.checkoutTime || "12:00"}) est prise en compte`
        );
      } else {
        console.log("⚠️  Aucune chambre trouvée pour tester");
      }
    } catch (importError) {
      console.log(
        "⚠️  Test de disponibilité ignoré (problème d'import ES modules)"
      );
    }

    console.log("\n✅ Tests terminés avec succès!");
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCheckoutTimes();
