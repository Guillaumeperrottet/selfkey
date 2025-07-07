#!/usr/bin/env node

/**
 * Script pour créer des données de test basiques après nettoyage
 * À utiliser après reset-database.js
 *
 * Usage: node setup-test-data.js
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestData() {
  console.log("🏗️  Création des données de test...\n");

  try {
    // 1. Créer un établissement de test
    console.log("🏨 Création d'un établissement de test...");
    const establishment = await prisma.establishment.create({
      data: {
        name: "Alpha-hôtel",
        slug: "alpha-hotel",
        description: "Hôtel de test pour le développement",
        address: "123 Rue de Test, 1000 Lausanne",
        phone: "+41 21 123 45 67",
        email: "test@alpha-hotel.ch",
        website: "https://alpha-hotel.ch",
        commissionRate: 10.0,
        fixedFee: 5.0,
        maxBookingDays: 30,
        allowFutureBookings: true,
        stripeOnboarded: false,
        emailConfirmationEnabled: true,
        autoEmailConfirmation: false,
      },
    });
    console.log(
      `   ✅ Établissement créé: ${establishment.name} (ID: ${establishment.id})`
    );

    // 2. Créer quelques chambres
    console.log("🏠 Création de chambres...");
    const rooms = await Promise.all([
      prisma.room.create({
        data: {
          name: "Chambre Standard",
          description: "Chambre confortable avec vue sur la ville",
          price: 120.0,
          maxGuests: 2,
          amenities: ["WiFi", "TV", "Salle de bain privée"],
          establishmentId: establishment.id,
        },
      }),
      prisma.room.create({
        data: {
          name: "Suite Deluxe",
          description: "Suite spacieuse avec balcon",
          price: 250.0,
          maxGuests: 4,
          amenities: ["WiFi", "TV", "Balcon", "Minibar", "Jacuzzi"],
          establishmentId: establishment.id,
        },
      }),
    ]);
    console.log(`   ✅ ${rooms.length} chambres créées`);

    // 3. Créer des codes d'accès
    console.log("🔐 Création de codes d'accès...");
    const accessCodes = await Promise.all([
      prisma.accessCode.create({
        data: {
          code: "TEST2025",
          isActive: true,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
          establishmentId: establishment.id,
        },
      }),
      prisma.accessCode.create({
        data: {
          code: "DEMO123",
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          establishmentId: establishment.id,
        },
      }),
    ]);
    console.log(`   ✅ ${accessCodes.length} codes d'accès créés`);

    // 4. Statistiques finales
    console.log("\n📊 Données de test créées:");
    const stats = await Promise.all([
      prisma.establishment.count(),
      prisma.room.count(),
      prisma.accessCode.count(),
    ]);

    console.log(`   🏨 Établissements: ${stats[0]}`);
    console.log(`   🏠 Chambres: ${stats[1]}`);
    console.log(`   🔐 Codes d'accès: ${stats[2]}`);

    console.log("\n🎉 Données de test créées avec succès !");
    console.log("\nInformations utiles:");
    console.log(`   🏨 Établissement: ${establishment.name}`);
    console.log(`   🔗 URL: http://localhost:3000/${establishment.slug}`);
    console.log(`   🔐 Codes d'accès: TEST2025, DEMO123`);
    console.log(`   📧 Super-admin: perrottet.guillaume.97@gmail.com`);
  } catch (error) {
    console.error("❌ Erreur lors de la création des données:", error);
    throw error;
  }
}

async function main() {
  console.log("🏗️  Configuration des données de test");
  console.log("====================================\n");

  try {
    await createTestData();
  } catch (error) {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
