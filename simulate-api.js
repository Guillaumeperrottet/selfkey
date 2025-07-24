import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function simulateAPICall() {
  try {
    console.log("🔍 Simulation de l'API day-parking-control...\n");

    const hotel = "guillaumehotel";
    const date = "2025-07-24"; // Date d'aujourd'hui

    // Vérifier l'établissement (comme dans l'API)
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: { id: true },
    });

    if (!establishment) {
      console.log("❌ Établissement introuvable");
      return;
    }

    console.log("✅ Établissement trouvé");

    // Construire les filtres de date (exactement comme dans l'API)
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
        `📅 Filtre de date appliqué: ${startDate.toISOString()} -> ${endDate.toISOString()}`
      );
    }

    // Récupérer les réservations parking jour (exactement comme dans l'API)
    const bookings = await prisma.booking.findMany({
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

    console.log(`📊 Réservations trouvées: ${bookings.length}`);

    // Formater les données (exactement comme dans l'API)
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      clientFirstName: booking.clientFirstName,
      clientLastName: booking.clientLastName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      clientVehicleNumber: booking.clientVehicleNumber || "Non renseigné",
      dayParkingDuration: booking.dayParkingDuration || "1h",
      dayParkingStartTime: booking.dayParkingStartTime?.toISOString() || "",
      dayParkingEndTime: booking.dayParkingEndTime?.toISOString() || "",
      amount: booking.amount || 0,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.bookingDate.toISOString(),
      emailConfirmation: booking.emailConfirmation || false,
    }));

    console.log("\n📋 Données formatées:");
    formattedBookings.forEach((booking, index) => {
      console.log(
        `${index + 1}. ${booking.clientFirstName} ${booking.clientLastName}`
      );
      console.log(`   Email: ${booking.clientEmail}`);
      console.log(`   Véhicule: ${booking.clientVehicleNumber}`);
      console.log(`   Durée: ${booking.dayParkingDuration}`);
      console.log(`   Start: ${booking.dayParkingStartTime}`);
      console.log(`   End: ${booking.dayParkingEndTime}`);
      console.log(`   Montant: ${booking.amount} CHF`);
      console.log(`   Status: ${booking.paymentStatus}`);
      console.log(`   Email conf: ${booking.emailConfirmation}`);
      console.log("");
    });

    const response = {
      success: true,
      bookings: formattedBookings,
      count: formattedBookings.length,
    };

    console.log("✅ Réponse JSON simulée:");
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateAPICall();
