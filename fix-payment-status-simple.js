const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixPaymentStatus() {
  try {
    console.log("🔍 Recherche des réservations avec paiement réussi...");

    // D'abord, vérifions toutes les réservations avec un stripePaymentIntentId
    const bookingsWithPayment = await prisma.booking.findMany({
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
      },
    });

    console.log(
      `📊 Trouvé ${bookingsWithPayment.length} réservations avec PaymentIntent`
    );

    if (bookingsWithPayment.length > 0) {
      console.log("💰 Réservations trouvées:");
      bookingsWithPayment.forEach((booking) => {
        console.log(
          `  - ${booking.clientFirstName} ${booking.clientLastName} - ${booking.amount} CHF - ${booking.checkInDate.toLocaleDateString()}`
        );
      });

      // Mettre à jour toutes ces réservations pour avoir paymentStatus = "succeeded"
      const updateResult = await prisma.booking.updateMany({
        where: {
          stripePaymentIntentId: { not: null },
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
        stripePaymentIntentId: { not: null },
      },
    });

    console.log(
      `🎉 Total des réservations avec paiement: ${confirmedBookings}`
    );
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPaymentStatus();
