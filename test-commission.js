/**
 * Script de test pour vérifier les commissions
 * Usage: node test-commission.js
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testCommissionCalculation() {
  console.log("🔍 Test de vérification des commissions");
  console.log("=====================================\n");

  try {
    // 1. Récupérer les établissements avec leurs taux de commission
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        commissionRate: true,
        fixedFee: true,
        bookings: {
          select: {
            id: true,
            amount: true,
            platformCommission: true,
            bookingDate: true,
            clientEmail: true,
            room: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            bookingDate: "desc",
          },
          take: 5, // Les 5 dernières réservations
        },
      },
    });

    console.log(`📊 Trouvé ${establishments.length} établissement(s)\n`);

    for (const establishment of establishments) {
      console.log(`🏨 ${establishment.name} (${establishment.slug})`);
      console.log(`   Taux de commission: ${establishment.commissionRate}%`);
      console.log(`   Frais fixes: ${establishment.fixedFee} CHF`);
      console.log(
        `   Réservations récentes: ${establishment.bookings.length}\n`
      );

      // Vérifier chaque réservation
      for (const booking of establishment.bookings) {
        const expectedCommission = Math.round(
          (booking.amount * establishment.commissionRate) / 100 +
            establishment.fixedFee
        );

        const isCorrect = booking.platformCommission === expectedCommission;
        const difference = booking.platformCommission - expectedCommission;

        console.log(`   📋 Réservation ${booking.id}`);
        console.log(
          `      Date: ${booking.bookingDate.toLocaleDateString("fr-CH")}`
        );
        console.log(`      Chambre: ${booking.room.name}`);
        console.log(`      Client: ${booking.clientEmail}`);
        console.log(`      Montant: ${booking.amount} CHF`);
        console.log(`      Commission attendue: ${expectedCommission} CHF`);
        console.log(
          `      Commission réelle: ${booking.platformCommission} CHF`
        );
        console.log(
          `      Status: ${isCorrect ? "✅ CORRECT" : "❌ INCORRECT"}`
        );

        if (!isCorrect) {
          console.log(
            `      Différence: ${difference > 0 ? "+" : ""}${difference} CHF`
          );
        }
        console.log("");
      }
    }

    // 2. Statistiques globales
    const totalBookings = await prisma.booking.count();
    const totalCommissions = await prisma.booking.aggregate({
      _sum: {
        platformCommission: true,
      },
    });

    console.log("\n📈 Statistiques globales");
    console.log("========================");
    console.log(`Total réservations: ${totalBookings}`);
    console.log(
      `Total commissions: ${totalCommissions._sum.platformCommission || 0} CHF`
    );

    // 3. Vérification des 10 dernières réservations
    const recentBookings = await prisma.booking.findMany({
      include: {
        establishment: {
          select: {
            name: true,
            commissionRate: true,
            fixedFee: true,
          },
        },
        room: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
      take: 10,
    });

    console.log("\n🔍 Vérification des 10 dernières réservations");
    console.log("============================================");

    let correctCount = 0;
    let incorrectCount = 0;

    for (const booking of recentBookings) {
      const expectedCommission = Math.round(
        (booking.amount * booking.establishment.commissionRate) / 100 +
          booking.establishment.fixedFee
      );

      const isCorrect = booking.platformCommission === expectedCommission;

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      console.log(
        `${isCorrect ? "✅" : "❌"} ${booking.establishment.name} - ${booking.room.name}`
      );
      console.log(
        `   Montant: ${booking.amount} CHF | Commission: ${booking.platformCommission} CHF (attendue: ${expectedCommission} CHF)`
      );
    }

    console.log(
      `\n📊 Résumé: ${correctCount} correctes, ${incorrectCount} incorrectes`
    );
    console.log(
      `💯 Précision: ${((correctCount / (correctCount + incorrectCount)) * 100).toFixed(1)}%`
    );
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour simuler une réservation et vérifier la commission
async function simulateBooking(establishmentSlug, roomPrice) {
  console.log(`\n🎯 Simulation de réservation pour ${establishmentSlug}`);
  console.log("=============================================");

  try {
    const establishment = await prisma.establishment.findUnique({
      where: { slug: establishmentSlug },
      select: {
        id: true,
        name: true,
        commissionRate: true,
        fixedFee: true,
      },
    });

    if (!establishment) {
      console.log(`❌ Établissement ${establishmentSlug} non trouvé`);
      return;
    }

    const expectedCommission = Math.round(
      (roomPrice * establishment.commissionRate) / 100 + establishment.fixedFee
    );

    console.log(`🏨 Établissement: ${establishment.name}`);
    console.log(`💰 Prix de la chambre: ${roomPrice} CHF`);
    console.log(`📊 Taux de commission: ${establishment.commissionRate}%`);
    console.log(`🔧 Frais fixes: ${establishment.fixedFee} CHF`);
    console.log(`💸 Commission calculée: ${expectedCommission} CHF`);
    console.log(
      `📈 Commission en pourcentage du prix: ${((expectedCommission / roomPrice) * 100).toFixed(2)}%`
    );
  } catch (error) {
    console.error("❌ Erreur lors de la simulation:", error);
  }
}

// Exécution des tests
async function runTests() {
  await testCommissionCalculation();

  // Exemples de simulation
  console.log("\n" + "=".repeat(50));
  console.log("🎯 SIMULATIONS DE RÉSERVATIONS");
  console.log("=".repeat(50));

  // Simuler pour différents établissements (remplacez par vos vrais slugs)
  await simulateBooking("alpha-hotel", 150); // 150 CHF
  await simulateBooking("alpha-hotel", 200); // 200 CHF
  await simulateBooking("alpha-hotel", 300); // 300 CHF
}

runTests().catch(console.error);
