import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupDayParkingBookings() {
  console.log("🧹 Début du nettoyage des réservations parking jour...\n");

  try {
    // D'abord, compter les réservations parking jour existantes
    const dayParkingCount = await prisma.booking.count({
      where: {
        bookingType: "day_parking",
      },
    });

    console.log(`📊 Réservations parking jour trouvées : ${dayParkingCount}`);

    if (dayParkingCount === 0) {
      console.log("✅ Aucune réservation parking jour à supprimer.");
      return;
    }

    // Afficher quelques détails sur les réservations à supprimer
    const sampleBookings = await prisma.booking.findMany({
      where: {
        bookingType: "day_parking",
      },
      select: {
        id: true,
        clientFirstName: true,
        clientLastName: true,
        hotelSlug: true,
        dayParkingDuration: true,
        amount: true,
        paymentStatus: true,
        createdAt: true,
      },
      take: 5,
    });

    console.log("\n📋 Aperçu des réservations à supprimer :");
    sampleBookings.forEach((booking, index) => {
      console.log(
        `  ${index + 1}. ${booking.clientFirstName} ${booking.clientLastName} - ${booking.hotelSlug}`
      );
      console.log(
        `     Durée: ${booking.dayParkingDuration}, Montant: ${booking.amount} CHF, Status: ${booking.paymentStatus}`
      );
      console.log(
        `     Créée le: ${booking.createdAt.toLocaleDateString("fr-FR")}`
      );
    });

    if (dayParkingCount > 5) {
      console.log(`     ... et ${dayParkingCount - 5} autres réservations`);
    }

    // Demander confirmation (simulation en mode script)
    console.log(
      "\n⚠️  ATTENTION : Cette action va supprimer TOUTES les réservations parking jour de façon DÉFINITIVE !"
    );
    console.log("🔄 Suppression en cours...\n");

    // Supprimer toutes les réservations parking jour
    const deletedBookings = await prisma.booking.deleteMany({
      where: {
        bookingType: "day_parking",
      },
    });

    console.log(
      `✅ ${deletedBookings.count} réservations parking jour supprimées avec succès !`
    );

    // Optionnel : Nettoyer aussi les places de parking créées automatiquement qui ne servent plus à rien
    const unusedParkingRooms = await prisma.room.findMany({
      where: {
        name: "Place de parking",
        bookings: {
          none: {}, // Aucune réservation associée
        },
      },
    });

    if (unusedParkingRooms.length > 0) {
      console.log(
        `\n🅿️ ${unusedParkingRooms.length} places de parking inutilisées trouvées.`
      );

      const deletedRooms = await prisma.room.deleteMany({
        where: {
          name: "Place de parking",
          bookings: {
            none: {},
          },
        },
      });

      console.log(
        `✅ ${deletedRooms.count} places de parking inutilisées supprimées.`
      );
    }

    console.log("\n🎉 Nettoyage terminé avec succès !");
    console.log("📊 Résumé :");
    console.log(
      `   • Réservations parking jour supprimées : ${deletedBookings.count}`
    );
    console.log(
      `   • Places de parking nettoyées : ${unusedParkingRooms.length}`
    );
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage :", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction utilitaire pour afficher les statistiques avant suppression
async function showStatistics() {
  console.log("📊 Statistiques actuelles :\n");

  // Compter par établissement
  const bookingsByEstablishment = await prisma.booking.groupBy({
    by: ["hotelSlug"],
    where: {
      bookingType: "day_parking",
    },
    _count: {
      id: true,
    },
  });

  if (bookingsByEstablishment.length > 0) {
    console.log("📍 Répartition par établissement :");
    for (const group of bookingsByEstablishment) {
      console.log(`   • ${group.hotelSlug}: ${group._count.id} réservation(s)`);
    }
  }

  // Compter par statut de paiement
  const bookingsByStatus = await prisma.booking.groupBy({
    by: ["paymentStatus"],
    where: {
      bookingType: "day_parking",
    },
    _count: {
      id: true,
    },
  });

  if (bookingsByStatus.length > 0) {
    console.log("\n💳 Répartition par statut de paiement :");
    for (const group of bookingsByStatus) {
      const status = group.paymentStatus;
      const emoji =
        status === "succeeded" ? "✅" : status === "pending" ? "⏳" : "❌";
      console.log(`   ${emoji} ${status}: ${group._count.id} réservation(s)`);
    }
  }

  // Montant total
  const totalAmount = await prisma.booking.aggregate({
    where: {
      bookingType: "day_parking",
      paymentStatus: "succeeded",
    },
    _sum: {
      amount: true,
    },
  });

  if (totalAmount._sum.amount) {
    console.log(
      `\n💰 Montant total des parkings jour payés : ${totalAmount._sum.amount} CHF`
    );
  }

  console.log("\n" + "=".repeat(50) + "\n");
}

// Exécution du script
async function main() {
  console.log("🚗 Script de nettoyage des réservations parking jour\n");
  console.log("📅 Date :", new Date().toLocaleString("fr-FR"));
  console.log("=".repeat(50) + "\n");

  await showStatistics();
  await cleanupDayParkingBookings();
}

// Vérifier si le script est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("💥 Erreur fatale :", error);
    process.exit(1);
  });
}

export { cleanupDayParkingBookings, showStatistics };
