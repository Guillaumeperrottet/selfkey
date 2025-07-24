import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDayParkingBookings() {
  try {
    console.log(
      "🔍 Vérification des réservations de parking jour pour 'guillaumehotel'...\n"
    );

    // Vérifier toutes les réservations pour cet hôtel
    const allBookings = await prisma.booking.findMany({
      where: {
        hotelSlug: "guillaumehotel",
      },
      select: {
        id: true,
        clientFirstName: true,
        clientLastName: true,
        bookingType: true,
        roomId: true,
        dayParkingStartTime: true,
        dayParkingEndTime: true,
        dayParkingDuration: true,
        amount: true,
        paymentStatus: true,
        bookingDate: true,
        stripePaymentIntentId: true,
      },
      orderBy: { bookingDate: "desc" },
    });

    console.log(`📊 Total réservations trouvées: ${allBookings.length}\n`);

    if (allBookings.length === 0) {
      console.log("❌ Aucune réservation trouvée pour 'guillaumehotel'");
      return;
    }

    // Grouper par type
    const byType = allBookings.reduce((acc, booking) => {
      const type = booking.bookingType || "undefined";
      if (!acc[type]) acc[type] = [];
      acc[type].push(booking);
      return acc;
    }, {});

    console.log("📋 Répartition par type:");
    Object.entries(byType).forEach(([type, bookings]) => {
      console.log(`  ${type}: ${bookings.length} réservation(s)`);
    });

    console.log("\n");

    // Afficher les réservations de parking jour spécifiquement
    const dayParkingBookings = allBookings.filter(
      (b) =>
        b.bookingType === "day_parking" || (!b.roomId && b.dayParkingStartTime) // Parking jour sans chambre
    );

    if (dayParkingBookings.length > 0) {
      console.log("🚗 Réservations parking jour trouvées:");
      dayParkingBookings.forEach((booking) => {
        console.log(`  - ID: ${booking.id}`);
        console.log(
          `    Client: ${booking.clientFirstName} ${booking.clientLastName}`
        );
        console.log(`    Type: ${booking.bookingType || "undefined"}`);
        console.log(`    Montant: ${booking.amount} CHF`);
        console.log(`    Statut: ${booking.paymentStatus}`);
        console.log(
          `    Durée: ${booking.dayParkingDuration || "non définie"}`
        );
        console.log(
          `    Début: ${booking.dayParkingStartTime || "non défini"}`
        );
        console.log(`    Fin: ${booking.dayParkingEndTime || "non définie"}`);
        console.log(
          `    PaymentIntent: ${booking.stripePaymentIntentId || "aucun"}`
        );
        console.log(`    Réservé le: ${booking.bookingDate}`);
        console.log("");
      });
    } else {
      console.log("❌ Aucune réservation parking jour trouvée");

      // Afficher quelques exemples pour débugger
      if (allBookings.length > 0) {
        console.log("\n📝 Exemples de réservations existantes:");
        allBookings.slice(0, 3).forEach((booking) => {
          console.log(
            `  - ID: ${booking.id}, Type: ${booking.bookingType || "undefined"}, RoomID: ${booking.roomId || "null"}`
          );
        });
      }
    }

    // Vérifier aussi les établissements
    const establishment = await prisma.establishment.findUnique({
      where: { slug: "guillaumehotel" },
      select: { id: true, name: true, slug: true },
    });

    console.log(
      `\n🏨 Établissement: ${establishment ? establishment.name + " (" + establishment.slug + ")" : "NON TROUVÉ"}`
    );
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDayParkingBookings();
