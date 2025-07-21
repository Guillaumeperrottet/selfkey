const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixPaymentStatus() {
  try {
    console.log("🔍 Recherche des réservations avec paiement réussi...");

    // Trouver toutes les réservations qui ont un stripePaymentIntentId mais pas de paymentStatus
    const bookingsToUpdate = await prisma.booking.findMany({
      where: {
        stripePaymentIntentId: { not: null },
        OR: [{ paymentStatus: null }, { paymentStatus: { not: "succeeded" } }],
      },
      select: {
        id: true,
        stripePaymentIntentId: true,
        paymentStatus: true,
        clientFirstName: true,
        clientLastName: true,
        amount: true,
        checkInDate: true,
      },
    });

    console.log(
      `📊 Trouvé ${bookingsToUpdate.length} réservations à mettre à jour`
    );

    if (bookingsToUpdate.length > 0) {
      console.log("💰 Réservations trouvées:");
      bookingsToUpdate.forEach((booking) => {
        console.log(
          `  - ${booking.clientFirstName} ${booking.clientLastName} - ${booking.amount} CHF - ${booking.checkInDate.toLocaleDateString()}`
        );
      });

      // Mettre à jour toutes ces réservations
      const updateResult = await prisma.booking.updateMany({
        where: {
          stripePaymentIntentId: { not: null },
          OR: [
            { paymentStatus: null },
            { paymentStatus: { not: "succeeded" } },
          ],
        },
        data: {
          paymentStatus: "succeeded",
        },
      });

      console.log(
        `✅ ${updateResult.count} réservations mises à jour avec paymentStatus = "succeeded"`
      );
    }

    // Vérification finale
    const confirmedBookings = await prisma.booking.count({
      where: {
        paymentStatus: "succeeded",
      },
    });

    console.log(`🎉 Total des réservations confirmées: ${confirmedBookings}`);
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPaymentStatus();
