/**
 * Script de test de performance et de charge
 * Usage: node performance-test.js
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function performanceTest() {
  console.log("⚡ Test de performance du système de commissions");
  console.log("===============================================\n");

  try {
    // 1. Test de charge - création rapide de réservations
    console.log("📊 Test 1: Création rapide de réservations");
    const startTime = Date.now();

    const establishment = await prisma.establishment.findFirst({
      include: { rooms: { where: { isActive: true } } },
    });

    if (!establishment) {
      console.log("❌ Aucun établissement trouvé");
      return;
    }

    const batchSize = 100;
    const batches = 5;
    let totalCreated = 0;

    for (let batch = 0; batch < batches; batch++) {
      const batchStart = Date.now();
      const bookingPromises = [];

      for (let i = 0; i < batchSize; i++) {
        const room =
          establishment.rooms[
            Math.floor(Math.random() * establishment.rooms.length)
          ];
        const amount = 100 + Math.floor(Math.random() * 300); // 100-400 CHF
        const commission = Math.round(
          (amount * establishment.commissionRate) / 100 + establishment.fixedFee
        );

        const bookingPromise = prisma.booking.create({
          data: {
            hotelSlug: establishment.slug,
            roomId: room.id,
            clientFirstName: `TestClient${batch}_${i}`,
            clientLastName: "Performance",
            clientEmail: `test${batch}_${i}@performance.test`,
            clientPhone: "+41791234567",
            clientBirthDate: new Date("1990-01-01"),
            clientAddress: "Test Address",
            clientPostalCode: "1000",
            clientCity: "Test City",
            clientCountry: "Suisse",
            clientIdNumber: `TEST${batch}${i}`,
            checkInDate: new Date(),
            checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            guests: 1,
            amount,
            currency: "CHF",
            platformCommission: commission,
            ownerAmount: amount - commission,
            stripePaymentIntentId: `pi_perf_${batch}_${i}_${Date.now()}`,
          },
        });

        bookingPromises.push(bookingPromise);
      }

      // Exécuter le batch
      await Promise.all(bookingPromises);
      totalCreated += batchSize;

      const batchTime = Date.now() - batchStart;
      console.log(
        `   Batch ${batch + 1}/${batches}: ${batchSize} réservations en ${batchTime}ms (${(batchSize / (batchTime / 1000)).toFixed(1)} réservations/sec)`
      );
    }

    const totalTime = Date.now() - startTime;
    console.log(
      `\n✅ Performance globale: ${totalCreated} réservations en ${totalTime}ms`
    );
    console.log(
      `📈 Débit moyen: ${(totalCreated / (totalTime / 1000)).toFixed(1)} réservations/seconde\n`
    );

    // 2. Test de lecture - récupération massive de données
    console.log("📊 Test 2: Lecture et calcul de commissions");
    const readStart = Date.now();

    const allBookings = await prisma.booking.findMany({
      include: {
        establishment: true,
        room: true,
      },
    });

    const readTime = Date.now() - readStart;
    console.log(
      `   Lecture de ${allBookings.length} réservations en ${readTime}ms`
    );

    // Calcul de vérification des commissions
    const calcStart = Date.now();
    let correctCommissions = 0;
    let incorrectCommissions = 0;

    for (const booking of allBookings) {
      const expectedCommission = Math.round(
        (booking.amount * booking.establishment.commissionRate) / 100 +
          booking.establishment.fixedFee
      );

      if (booking.platformCommission === expectedCommission) {
        correctCommissions++;
      } else {
        incorrectCommissions++;
      }
    }

    const calcTime = Date.now() - calcStart;
    console.log(
      `   Vérification de ${allBookings.length} commissions en ${calcTime}ms`
    );
    console.log(
      `   ✅ Correctes: ${correctCommissions}, ❌ Incorrectes: ${incorrectCommissions}\n`
    );

    // 3. Test d'agrégation - statistiques
    console.log("📊 Test 3: Calculs d'agrégation");
    const aggrStart = Date.now();

    const stats = await prisma.booking.aggregate({
      _sum: {
        amount: true,
        platformCommission: true,
      },
      _avg: {
        amount: true,
        platformCommission: true,
      },
      _count: true,
    });

    const aggrTime = Date.now() - aggrStart;
    console.log(`   Agrégation complète en ${aggrTime}ms`);
    console.log(`   💰 Total: ${stats._sum.amount?.toFixed(2)} CHF`);
    console.log(
      `   💸 Commissions: ${stats._sum.platformCommission?.toFixed(2)} CHF`
    );
    console.log(
      `   📊 Moyenne réservation: ${stats._avg.amount?.toFixed(2)} CHF`
    );
    console.log(
      `   📈 Commission moyenne: ${stats._avg.platformCommission?.toFixed(2)} CHF\n`
    );

    // 4. Test de requêtes complexes
    console.log("📊 Test 4: Requêtes complexes");
    const complexStart = Date.now();

    // Statistiques par établissement
    const establishmentStats = await prisma.establishment.findMany({
      include: {
        bookings: {
          select: {
            amount: true,
            platformCommission: true,
          },
        },
      },
    });

    const complexTime = Date.now() - complexStart;
    console.log(`   Requêtes complexes en ${complexTime}ms`);

    for (const est of establishmentStats) {
      const totalBookings = est.bookings.length;
      const totalRevenue = est.bookings.reduce((sum, b) => sum + b.amount, 0);
      const totalCommissions = est.bookings.reduce(
        (sum, b) => sum + b.platformCommission,
        0
      );

      console.log(
        `   🏨 ${est.name}: ${totalBookings} réservations, ${totalRevenue.toFixed(2)} CHF, ${totalCommissions.toFixed(2)} CHF commissions`
      );
    }

    console.log("\n🎯 Résumé des performances");
    console.log("===========================");
    console.log(
      `⚡ Écriture: ${(totalCreated / (totalTime / 1000)).toFixed(1)} réservations/sec`
    );
    console.log(
      `📖 Lecture: ${(allBookings.length / (readTime / 1000)).toFixed(1)} lectures/sec`
    );
    console.log(
      `🧮 Calcul: ${(allBookings.length / (calcTime / 1000)).toFixed(1)} vérifications/sec`
    );
    console.log(
      `📊 Agrégation: ${aggrTime}ms pour ${allBookings.length} entrées`
    );

    // Recommandations
    console.log("\n💡 Recommandations:");
    if (totalTime / totalCreated < 10) {
      console.log("   ✅ Performance excellent pour la création");
    } else {
      console.log("   ⚠️  Performance de création pourrait être améliorée");
    }

    if (readTime < 1000) {
      console.log("   ✅ Lecture rapide, indexation efficace");
    } else {
      console.log("   ⚠️  Temps de lecture élevé, considérez l'indexation");
    }
  } catch (error) {
    console.error("❌ Erreur lors du test de performance:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanPerformanceData() {
  console.log("🧹 Nettoyage des données de test de performance");
  console.log("==============================================\n");

  try {
    const result = await prisma.booking.deleteMany({
      where: {
        OR: [
          { clientLastName: "Performance" },
          { stripePaymentIntentId: { startsWith: "pi_perf_" } },
        ],
      },
    });

    console.log(`✅ ${result.count} réservations de test supprimées`);
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function benchmarkCalculations() {
  console.log("🧮 Benchmark des calculs de commissions");
  console.log("======================================\n");

  const iterations = 1000000; // 1 million
  const testData = [];

  // Préparer les données de test
  for (let i = 0; i < 100; i++) {
    testData.push({
      amount: 100 + Math.random() * 400,
      commissionRate: 5 + Math.random() * 15, // 5-20%
      fixedFee: Math.random() * 10, // 0-10 CHF
    });
  }

  console.log(`📊 Test avec ${iterations} calculs...`);

  const start = Date.now();

  for (let i = 0; i < iterations; i++) {
    const data = testData[i % testData.length];
    const commission = Math.round(
      (data.amount * data.commissionRate) / 100 + data.fixedFee
    );
    // Simulation d'utilisation
    if (commission < 0) console.log("Erreur impossible");
  }

  const time = Date.now() - start;
  const calcPerSec = iterations / (time / 1000);

  console.log(`✅ ${iterations} calculs en ${time}ms`);
  console.log(`⚡ ${calcPerSec.toFixed(0)} calculs/seconde`);
  console.log(
    `💡 Temps par calcul: ${((time / iterations) * 1000).toFixed(3)} microsecondes`
  );
}

// Gestion des arguments
const mode = process.argv[2];

if (mode === "performance") {
  performanceTest();
} else if (mode === "clean") {
  cleanPerformanceData();
} else if (mode === "benchmark") {
  benchmarkCalculations();
} else {
  console.log("Usage:");
  console.log(
    "  node performance-test.js performance  # Test de performance complet"
  );
  console.log(
    "  node performance-test.js benchmark    # Benchmark des calculs"
  );
  console.log(
    "  node performance-test.js clean        # Nettoyer les données de test"
  );
  console.log("");
  console.log("⚠️  Le test de performance crée beaucoup de données !");
}
