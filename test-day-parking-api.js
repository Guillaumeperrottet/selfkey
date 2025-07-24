import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDayParkingAPI() {
  try {
    console.log("🔍 Test de la logique API day-parking-control...\n");

    const hotel = "guillaumehotel";
    const date = "2025-07-24"; // Date d'aujourd'hui

    // Vérifier l'établissement
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: { id: true, name: true },
    });

    if (!establishment) {
      console.log("❌ Établissement introuvable");
      return;
    }

    console.log(`✅ Établissement trouvé: ${establishment.name}`);

    // Construire les filtres de date (comme dans l'API)
    let dateFilter = {};
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      dateFilter = {
        dayParkingStartTime: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      };

      console.log(
        `📅 Filtre de date: ${startDate.toISOString()} -> ${endDate.toISOString()}`
      );
    }

    // Test 1: Chercher avec les filtres exacts de l'API
    console.log("\n🔍 Test 1: Recherche avec filtres API exactes");
    const bookingsAPI = await prisma.booking.findMany({
      where: {
        hotelSlug: hotel,
        bookingType: "day_parking",
        ...dateFilter,
      },
      select: {
        id: true,
        clientFirstName: true,
        clientLastName: true,
        clientEmail: true,
        clientPhone: true,
        clientVehicleNumber: true,
        dayParkingDuration: true,
        dayParkingStartTime: true,
        dayParkingEndTime: true,
        amount: true,
        paymentStatus: true,
        bookingDate: true,
        emailConfirmation: true,
      },
      orderBy: [{ dayParkingStartTime: "desc" }, { bookingDate: "desc" }],
    });

    console.log(`📊 Résultats avec filtres API: ${bookingsAPI.length}`);

    if (bookingsAPI.length > 0) {
      bookingsAPI.forEach((booking) => {
        console.log(
          `  - ${booking.clientFirstName} ${booking.clientLastName} - ${booking.dayParkingStartTime}`
        );
      });
    }

    // Test 2: Chercher sans filtre de date
    console.log("\n🔍 Test 2: Recherche sans filtre de date");
    const bookingsNoDate = await prisma.booking.findMany({
      where: {
        hotelSlug: hotel,
        bookingType: "day_parking",
      },
      select: {
        id: true,
        clientFirstName: true,
        clientLastName: true,
        dayParkingStartTime: true,
        amount: true,
        bookingDate: true,
      },
      orderBy: { bookingDate: "desc" },
    });

    console.log(`📊 Résultats sans filtre date: ${bookingsNoDate.length}`);

    if (bookingsNoDate.length > 0) {
      bookingsNoDate.forEach((booking) => {
        console.log(`  - ${booking.clientFirstName} ${booking.clientLastName}`);
        console.log(`    Start: ${booking.dayParkingStartTime}`);
        console.log(`    Date: ${booking.bookingDate}`);
        console.log(`    Amount: ${booking.amount}`);
        console.log("");
      });
    }

    // Test 3: Vérifier les dates
    console.log("\n🔍 Test 3: Vérification des dates pour debug");
    const allDayBookings = await prisma.booking.findMany({
      where: {
        hotelSlug: hotel,
        bookingType: "day_parking",
      },
      select: {
        id: true,
        dayParkingStartTime: true,
        bookingDate: true,
      },
    });

    if (allDayBookings.length > 0) {
      console.log("Toutes les dates de parking jour:");
      allDayBookings.forEach((booking) => {
        const startTime = booking.dayParkingStartTime;
        const bookingDate = booking.bookingDate;
        console.log(`  - Start: ${startTime} (${startTime?.toDateString()})`);
        console.log(
          `    Booking: ${bookingDate} (${bookingDate.toDateString()})`
        );

        if (startTime) {
          const isToday =
            startTime.toDateString() === new Date(date).toDateString();
          console.log(`    Is today (${date}): ${isToday}`);
        }
        console.log("");
      });
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDayParkingAPI();
