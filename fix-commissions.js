/**
 * Script pour corriger les commissions manquantes des réservations existantes
 * Usage: node fix-commissions.js
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixCommissions() {
  console.log("🔧 Correction des commissions manquantes");
  console.log("========================================\n");

  try {
    // Récupérer toutes les réservations avec leurs établissements
    const bookings = await prisma.booking.findMany({
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
      orderBy: { bookingDate: "desc" },
    });

    console.log(`📊 Trouvé ${bookings.length} réservations à vérifier\n`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;

    for (const booking of bookings) {
      const expectedCommission = Math.round(
        (booking.amount * booking.establishment.commissionRate) / 100 +
          booking.establishment.fixedFee
      );
      const expectedOwnerAmount = booking.amount - expectedCommission;

      const isCommissionCorrect =
        booking.platformCommission === expectedCommission;
      const isOwnerAmountCorrect = booking.ownerAmount === expectedOwnerAmount;

      if (isCommissionCorrect && isOwnerAmountCorrect) {
        alreadyCorrectCount++;
        console.log(
          `✅ ${booking.establishment.name} - ${booking.room.name} (${booking.clientEmail})`
        );
        console.log(
          `   Montant: ${booking.amount} CHF | Commission: ${booking.platformCommission} CHF | Propriétaire: ${booking.ownerAmount} CHF`
        );
      } else {
        console.log(
          `🔧 CORRECTION: ${booking.establishment.name} - ${booking.room.name} (${booking.clientEmail})`
        );
        console.log(`   Montant: ${booking.amount} CHF`);
        console.log(
          `   Commission: ${booking.platformCommission} CHF → ${expectedCommission} CHF`
        );
        console.log(
          `   Propriétaire: ${booking.ownerAmount} CHF → ${expectedOwnerAmount} CHF`
        );
        console.log(
          `   Taux appliqué: ${booking.establishment.commissionRate}% + ${booking.establishment.fixedFee} CHF`
        );

        // Demander confirmation (pour la démo, on corrige automatiquement)
        const shouldFix = true; // En production, vous pourriez demander confirmation

        if (shouldFix) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              platformCommission: expectedCommission,
              ownerAmount: expectedOwnerAmount,
            },
          });
          fixedCount++;
          console.log(`   ✅ Corrigé !`);
        } else {
          console.log(`   ⏭️  Ignoré`);
        }
      }
      console.log("");
    }

    console.log("\n📈 Résumé des corrections");
    console.log("=========================");
    console.log(`✅ Réservations déjà correctes: ${alreadyCorrectCount}`);
    console.log(`🔧 Réservations corrigées: ${fixedCount}`);
    console.log(`📊 Total traité: ${bookings.length}`);

    // Vérifier les nouvelles statistiques
    const newStats = await prisma.booking.aggregate({
      _sum: { platformCommission: true },
      _count: { platformCommission: true },
    });

    console.log(
      `\n💰 Nouveau total de commissions: ${newStats._sum.platformCommission || 0} CHF`
    );

    if (newStats._count.platformCommission > 0) {
      const avgCommission =
        (newStats._sum.platformCommission || 0) /
        newStats._count.platformCommission;
      console.log(`📈 Commission moyenne: ${avgCommission.toFixed(2)} CHF`);
    }
  } catch (error) {
    console.error("❌ Erreur lors de la correction:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour vérifier uniquement (sans corriger)
async function verifyCommissions() {
  console.log("🔍 Vérification des commissions (mode lecture seule)");
  console.log("==================================================\n");

  try {
    const bookings = await prisma.booking.findMany({
      include: {
        establishment: {
          select: {
            name: true,
            commissionRate: true,
            fixedFee: true,
          },
        },
      },
    });

    let correctCount = 0;
    let incorrectCount = 0;
    let totalDifference = 0;

    for (const booking of bookings) {
      const expectedCommission = Math.round(
        (booking.amount * booking.establishment.commissionRate) / 100 +
          booking.establishment.fixedFee
      );

      const isCorrect = booking.platformCommission === expectedCommission;
      const difference = expectedCommission - booking.platformCommission;

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
        totalDifference += difference;
      }
    }

    console.log(`📊 Réservations correctes: ${correctCount}`);
    console.log(`❌ Réservations incorrectes: ${incorrectCount}`);
    console.log(`💰 Total commissions manquantes: ${totalDifference} CHF`);
    console.log(
      `📈 Précision: ${((correctCount / bookings.length) * 100).toFixed(1)}%`
    );
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la correction ou la vérification selon l'argument
const mode = process.argv[2];

if (mode === "verify") {
  verifyCommissions();
} else if (mode === "fix") {
  fixCommissions();
} else {
  console.log("Usage:");
  console.log("  node fix-commissions.js verify  # Vérifier seulement");
  console.log("  node fix-commissions.js fix     # Corriger les commissions");
}
