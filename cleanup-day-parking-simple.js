/**
 * Script de nettoyage des réservations parking jour - Version Simple
 * Utilisation: node cleanup-day-parking-simple.js
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanup() {
  console.log("🚗 Nettoyage des réservations parking jour...\n");

  try {
    // Compter les réservations existantes
    const count = await prisma.booking.count({
      where: { bookingType: "day" },
    });

    console.log(`📊 Réservations parking jour trouvées : ${count}`);

    if (count === 0) {
      console.log("✅ Aucune réservation à supprimer.");
      return;
    }

    // Afficher quelques détails
    const sample = await prisma.booking.findMany({
      where: { bookingType: "day" },
      select: {
        clientFirstName: true,
        clientLastName: true,
        hotelSlug: true,
        amount: true,
        paymentStatus: true,
      },
      take: 3,
    });

    console.log("\n📋 Exemples de réservations à supprimer :");
    sample.forEach((booking, i) => {
      console.log(
        `  ${i + 1}. ${booking.clientFirstName} ${booking.clientLastName} - ${booking.hotelSlug} (${booking.amount} CHF)`
      );
    });

    // Supprimer toutes les réservations parking jour
    const result = await prisma.booking.deleteMany({
      where: { bookingType: "day" },
    });

    console.log(`\n✅ ${result.count} réservations parking jour supprimées !`);

    // Nettoyer les places de parking inutilisées
    const unusedRooms = await prisma.room.deleteMany({
      where: {
        name: "Place de parking",
        bookings: { none: {} },
      },
    });

    if (unusedRooms.count > 0) {
      console.log(
        `🅿️ ${unusedRooms.count} places de parking inutilisées supprimées.`
      );
    }

    console.log("\n🎉 Nettoyage terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage :", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
cleanup();
