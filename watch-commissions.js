/**
 * Script pour vérifier les commissions en temps réel
 * Usage: node watch-commissions.js
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function watchCommissions() {
  console.log("🔍 Surveillance des commissions (Ctrl+C pour arrêter)");
  console.log("=====================================================\n");

  let lastBookingCount = 0;
  let lastCommissionTotal = 0;

  const checkCommissions = async () => {
    try {
      // Compter les réservations
      const bookingCount = await prisma.booking.count();

      // Calculer le total des commissions
      const commissionAggregate = await prisma.booking.aggregate({
        _sum: { platformCommission: true },
        _count: { platformCommission: true },
      });

      const totalCommissions = commissionAggregate._sum.platformCommission || 0;

      // Détecter les changements
      if (
        bookingCount !== lastBookingCount ||
        totalCommissions !== lastCommissionTotal
      ) {
        console.log(
          `📊 ${new Date().toLocaleString("fr-CH")} - Mise à jour détectée`
        );
        console.log(
          `   Réservations: ${bookingCount} (${bookingCount > lastBookingCount ? "+" + (bookingCount - lastBookingCount) : "aucune nouvelle"})`
        );
        console.log(
          `   Total commissions: ${totalCommissions} CHF (${totalCommissions > lastCommissionTotal ? "+" + (totalCommissions - lastCommissionTotal) + " CHF" : "aucun changement"})`
        );

        if (bookingCount > lastBookingCount) {
          // Nouvelle réservation - vérifier les détails
          const newBookings = await prisma.booking.findMany({
            include: {
              establishment: {
                select: { name: true, commissionRate: true, fixedFee: true },
              },
              room: { select: { name: true } },
            },
            orderBy: { bookingDate: "desc" },
            take: bookingCount - lastBookingCount,
          });

          console.log(`   📋 Nouvelles réservations:`);
          for (const booking of newBookings) {
            const expectedCommission = Math.round(
              (booking.amount * booking.establishment.commissionRate) / 100 +
                booking.establishment.fixedFee
            );
            const isCorrect = booking.platformCommission === expectedCommission;

            console.log(
              `     ${isCorrect ? "✅" : "❌"} ${booking.establishment.name} - ${booking.room.name}`
            );
            console.log(
              `       Montant: ${booking.amount} CHF | Commission: ${booking.platformCommission} CHF`
            );
            console.log(
              `       Attendue: ${expectedCommission} CHF | Taux: ${booking.establishment.commissionRate}%`
            );
            console.log(`       Client: ${booking.clientEmail}`);
          }
        }

        lastBookingCount = bookingCount;
        lastCommissionTotal = totalCommissions;
        console.log("");
      }

      // Afficher les stats actuelles toutes les 30 secondes
      const now = new Date();
      if (now.getSeconds() % 30 === 0) {
        console.log(`⏰ ${now.toLocaleString("fr-CH")} - Status actuel:`);
        console.log(`   📊 Total réservations: ${bookingCount}`);
        console.log(`   💰 Total commissions: ${totalCommissions} CHF`);

        if (bookingCount > 0) {
          const avgCommission = totalCommissions / bookingCount;
          console.log(
            `   📈 Commission moyenne: ${avgCommission.toFixed(2)} CHF`
          );
        }
        console.log("");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la surveillance:", error);
    }
  };

  // Surveillance initiale
  await checkCommissions();

  // Surveillance continue toutes les 2 secondes
  setInterval(checkCommissions, 2000);
}

// Gestion propre de l'arrêt
process.on("SIGINT", async () => {
  console.log("\n🛑 Arrêt de la surveillance...");
  await prisma.$disconnect();
  process.exit(0);
});

watchCommissions().catch(console.error);
