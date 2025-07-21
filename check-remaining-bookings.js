const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkRemainingBookings() {
  try {
    console.log("📊 Vérification des réservations restantes...\n");

    // Toutes les réservations
    const allBookings = await prisma.booking.findMany({
      select: {
        id: true,
        clientFirstName: true,
        clientLastName: true,
        amount: true,
        checkInDate: true,
        bookingDate: true,
        stripePaymentIntentId: true,
        paymentStatus: true,
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    console.log(`📋 Total des réservations: ${allBookings.length}`);

    allBookings.forEach((booking, index) => {
      const status = booking.paymentStatus || "Non défini";
      const paymentInfo = booking.stripePaymentIntentId
        ? "💳 Avec paiement"
        : "❌ Sans paiement";
      console.log(
        `  ${index + 1}. ${booking.clientFirstName} ${booking.clientLastName} - ${booking.amount} CHF - ${status} - ${paymentInfo}`
      );
    });

    // Réservations avec paiement réussi
    const successfulBookings = await prisma.booking.findMany({
      where: {
        paymentStatus: "succeeded",
      },
      select: {
        id: true,
        clientFirstName: true,
        clientLastName: true,
        amount: true,
        checkInDate: true,
        bookingDate: true,
      },
    });

    console.log(
      `\n✅ Réservations avec paiement réussi: ${successfulBookings.length}`
    );
    successfulBookings.forEach((booking, index) => {
      console.log(
        `  ${index + 1}. ${booking.clientFirstName} ${booking.clientLastName} - ${booking.amount} CHF - Check-in: ${booking.checkInDate}`
      );
    });
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRemainingBookings();
