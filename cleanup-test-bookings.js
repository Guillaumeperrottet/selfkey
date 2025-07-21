const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanupTestBookings() {
  try {
    console.log("🧹 Nettoyage des réservations de test...");

    // Récupérer toutes les réservations avec paiement, triées par date de réservation (la plus récente en premier)
    const allBookings = await prisma.booking.findMany({
      where: {
        stripePaymentIntentId: { not: null },
      },
      select: {
        id: true,
        stripePaymentIntentId: true,
        clientFirstName: true,
        clientLastName: true,
        amount: true,
        checkInDate: true,
        bookingDate: true,
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    console.log(`📊 Trouvé ${allBookings.length} réservations avec paiement:`);
    allBookings.forEach((booking, index) => {
      console.log(
        `  ${index + 1}. ${booking.clientFirstName} ${booking.clientLastName} - ${booking.amount} CHF - Réservée le ${booking.bookingDate.toLocaleString()}`
      );
    });

    if (allBookings.length > 1) {
      // Garder la première (la plus récente) et supprimer les autres
      const latestBooking = allBookings[0];
      const bookingsToDelete = allBookings.slice(1);

      console.log(`\n✅ Réservation à GARDER (la plus récente):`);
      console.log(
        `   ${latestBooking.clientFirstName} ${latestBooking.clientLastName} - ${latestBooking.amount} CHF - ${latestBooking.bookingDate.toLocaleString()}`
      );

      console.log(
        `\n❌ Réservations à SUPPRIMER (${bookingsToDelete.length}):`
      );
      bookingsToDelete.forEach((booking) => {
        console.log(
          `   ${booking.clientFirstName} ${booking.clientLastName} - ${booking.amount} CHF - ${booking.bookingDate.toLocaleString()}`
        );
      });

      // Demander confirmation (simulation)
      console.log(
        `\n🚨 SUPPRESSION des ${bookingsToDelete.length} anciennes réservations de test...`
      );

      // Supprimer les anciennes réservations
      const idsToDelete = bookingsToDelete.map((b) => b.id);
      const deleteResult = await prisma.booking.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      });

      console.log(`✅ ${deleteResult.count} réservations supprimées`);

      // Vérification finale
      const remainingBookings = await prisma.booking.count({
        where: {
          stripePaymentIntentId: { not: null },
        },
      });

      console.log(
        `\n🎉 Il reste ${remainingBookings} réservation payée (la vraie)`
      );
    } else if (allBookings.length === 1) {
      console.log(
        `\n✅ Parfait ! Il n'y a déjà qu'une seule réservation payée.`
      );
    } else {
      console.log(`\n⚠️ Aucune réservation avec paiement trouvée.`);
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestBookings();
