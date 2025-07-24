/**
 * Script de nettoyage avancé des réservations parking jour
 * Utilisation: node cleanup-day-parking-advanced.js [--stats-only|--force]
 *
 * Options:
 * --stats-only : Affiche seulement les statistiques sans supprimer
 * --force      : Supprime sans demander confirmation
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Arguments de ligne de commande
const args = process.argv.slice(2);
const statsOnly = args.includes("--stats-only");
const force = args.includes("--force");

async function showDetailedStatistics() {
  console.log("📊 Statistiques détaillées des réservations parking jour\n");
  console.log("=".repeat(60));

  // Compter le total
  const totalCount = await prisma.booking.count({
    where: { bookingType: "day_parking" },
  });

  console.log(`\n📈 Total des réservations parking jour : ${totalCount}`);

  if (totalCount === 0) {
    console.log("✅ Aucune réservation parking jour dans la base de données.");
    return false;
  }

  // Statistiques par établissement
  const byEstablishment = await prisma.booking.groupBy({
    by: ["hotelSlug"],
    where: { bookingType: "day_parking" },
    _count: { id: true },
    _sum: { amount: true },
  });

  console.log("\n🏨 Répartition par établissement :");
  for (const group of byEstablishment) {
    console.log(
      `   • ${group.hotelSlug}: ${group._count.id} réservation(s) - ${group._sum.amount || 0} CHF`
    );
  }

  // Statistiques par statut de paiement
  const byStatus = await prisma.booking.groupBy({
    by: ["paymentStatus"],
    where: { bookingType: "day_parking" },
    _count: { id: true },
    _sum: { amount: true },
  });

  console.log("\n💳 Répartition par statut de paiement :");
  for (const group of byStatus) {
    const emoji =
      group.paymentStatus === "succeeded"
        ? "✅"
        : group.paymentStatus === "pending"
          ? "⏳"
          : "❌";
    console.log(
      `   ${emoji} ${group.paymentStatus}: ${group._count.id} réservation(s) - ${group._sum.amount || 0} CHF`
    );
  }

  // Statistiques par durée
  const byDuration = await prisma.booking.groupBy({
    by: ["dayParkingDuration"],
    where: {
      bookingType: "day_parking",
      dayParkingDuration: { not: null },
    },
    _count: { id: true },
    _sum: { amount: true },
  });

  console.log("\n⏰ Répartition par durée :");
  for (const group of byDuration) {
    console.log(
      `   🅿️ ${group.dayParkingDuration}: ${group._count.id} réservation(s) - ${group._sum.amount || 0} CHF`
    );
  }

  // Montants totaux
  const amounts = await prisma.booking.aggregate({
    where: { bookingType: "day_parking" },
    _sum: { amount: true },
    _avg: { amount: true },
    _min: { amount: true },
    _max: { amount: true },
  });

  console.log("\n💰 Statistiques financières :");
  console.log(`   • Montant total : ${amounts._sum.amount || 0} CHF`);
  console.log(
    `   • Montant moyen : ${amounts._avg.amount?.toFixed(2) || 0} CHF`
  );
  console.log(`   • Montant minimum : ${amounts._min.amount || 0} CHF`);
  console.log(`   • Montant maximum : ${amounts._max.amount || 0} CHF`);

  // Réservations récentes
  const recent = await prisma.booking.findMany({
    where: { bookingType: "day_parking" },
    select: {
      id: true,
      clientFirstName: true,
      clientLastName: true,
      clientEmail: true,
      hotelSlug: true,
      dayParkingDuration: true,
      amount: true,
      paymentStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (recent.length > 0) {
    console.log("\n📅 5 réservations les plus récentes :");
    recent.forEach((booking, i) => {
      const date = booking.createdAt.toLocaleDateString("fr-FR");
      const time = booking.createdAt.toLocaleTimeString("fr-FR");
      console.log(
        `   ${i + 1}. ${booking.clientFirstName} ${booking.clientLastName} (${booking.clientEmail})`
      );
      console.log(
        `      📍 ${booking.hotelSlug} - ${booking.dayParkingDuration} - ${booking.amount} CHF - ${booking.paymentStatus}`
      );
      console.log(`      📅 ${date} à ${time}`);
    });
  }

  console.log("\n" + "=".repeat(60));
  return true;
}

async function cleanupBookings() {
  console.log("\n🧹 Suppression des réservations parking jour...\n");

  try {
    // Supprimer toutes les réservations parking jour
    const deletedBookings = await prisma.booking.deleteMany({
      where: { bookingType: "day_parking" },
    });

    console.log(
      `✅ ${deletedBookings.count} réservations parking jour supprimées.`
    );

    // Nettoyer les places de parking inutilisées
    const deletedRooms = await prisma.room.deleteMany({
      where: {
        name: "Place de parking",
        bookings: { none: {} },
      },
    });

    if (deletedRooms.count > 0) {
      console.log(
        `🅿️ ${deletedRooms.count} places de parking inutilisées supprimées.`
      );
    }

    console.log("\n🎉 Nettoyage terminé avec succès !");
    console.log("📊 Résumé :");
    console.log(`   • Réservations supprimées : ${deletedBookings.count}`);
    console.log(`   • Places nettoyées : ${deletedRooms.count}`);
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error.message);
    throw error;
  }
}

async function main() {
  console.log("🚗 Script de nettoyage avancé - Réservations parking jour");
  console.log(`📅 ${new Date().toLocaleString("fr-FR")}\n`);

  try {
    // Afficher les statistiques
    const hasBookings = await showDetailedStatistics();

    if (!hasBookings) {
      console.log("\n✨ Rien à nettoyer !");
      return;
    }

    // Si mode stats uniquement, arrêter ici
    if (statsOnly) {
      console.log(
        "\n📋 Mode statistiques uniquement - Aucune suppression effectuée."
      );
      return;
    }

    // Si pas en mode force, demander confirmation
    if (!force) {
      console.log(
        "\n⚠️  ATTENTION : Cette action va supprimer TOUTES les réservations parking jour !"
      );
      console.log(
        "💡 Utilisez --stats-only pour voir seulement les statistiques"
      );
      console.log("💡 Utilisez --force pour supprimer sans confirmation");
      console.log("\n❌ Arrêt du script. Ajoutez --force pour supprimer.");
      return;
    }

    // Effectuer le nettoyage
    await cleanupBookings();
  } catch (error) {
    console.error("💥 Erreur fatale :", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Afficher l'aide si demandée
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
🚗 Script de nettoyage avancé des réservations parking jour

Utilisation:
  node cleanup-day-parking-advanced.js [options]

Options:
  --stats-only    Affiche seulement les statistiques sans supprimer
  --force         Supprime toutes les réservations sans demander confirmation
  --help, -h      Affiche cette aide

Exemples:
  node cleanup-day-parking-advanced.js --stats-only
  node cleanup-day-parking-advanced.js --force
`);
  process.exit(0);
}

// Exécuter le script principal
main();
