const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanupPendingBookings() {
  try {
    console.log("🧹 Nettoyage des réservations en pending sans paiement...\n");

    // Trouver les réservations en pending sans PaymentIntent
    const pendingBookings = await prisma.booking.findMany({
      where: {
        AND: [{ paymentStatus: "pending" }, { stripePaymentIntentId: null }],
      },
      select: {
        id: true,
        clientFirstName: true,
        clientLastName: true,
        amount: true,
        bookingDate: true,
      },
    });

    console.log(
      `📊 Trouvé ${pendingBookings.length} réservations en pending sans paiement:`
    );
    pendingBookings.forEach((booking, index) => {
      console.log(
        `  ${index + 1}. ${booking.clientFirstName} ${booking.clientLastName} - ${booking.amount} CHF`
      );
    });

    if (pendingBookings.length > 0) {
      console.log(
        `\n🚨 SUPPRESSION des ${pendingBookings.length} réservations en pending...`
      );

      const deleteResult = await prisma.booking.deleteMany({
        where: {
          AND: [{ paymentStatus: "pending" }, { stripePaymentIntentId: null }],
        },
      });

      console.log(
        `✅ ${deleteResult.count} réservations en pending supprimées`
      );
    } else {
      console.log("\n✅ Aucune réservation en pending à supprimer");
    }

    // Vérification finale
    const remainingBookings = await prisma.booking.count();
    const paidBookings = await prisma.booking.count({
      where: { paymentStatus: "succeeded" },
    });

    console.log(`\n🎉 Résultat final:`);
    console.log(`   Total des réservations: ${remainingBookings}`);
    console.log(`   Réservations payées: ${paidBookings}`);
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupPendingBookings();
