/**
 * Script de diagnostic pour analyser les réservations parking
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debug() {
  console.log("🔍 Diagnostic des réservations parking...\n");

  try {
    // Toutes les réservations
    const allBookings = await prisma.booking.count();
    console.log(`📊 Total réservations : ${allBookings}`);

    // Toutes les réservations avec leurs types
    const bookingTypes = await prisma.booking.groupBy({
      by: ["bookingType"],
      _count: true,
    });

    console.log("\n📋 Répartition par type :");
    bookingTypes.forEach((type) => {
      console.log(
        `  - ${type.bookingType || "null"}: ${type._count} réservations`
      );
    });

    // Réservations de ce jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        id: true,
        clientFirstName: true,
        clientLastName: true,
        bookingType: true,
        dayParkingDuration: true,
        amount: true,
        paymentStatus: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`\n🕐 Réservations d'aujourd'hui (${todayBookings.length}) :`);
    todayBookings.forEach((booking, i) => {
      console.log(
        `  ${i + 1}. ${booking.clientFirstName} ${booking.clientLastName}`
      );
      console.log(`     Type: "${booking.bookingType}"`);
      console.log(`     Durée parking: ${booking.dayParkingDuration || "N/A"}`);
      console.log(`     Montant: ${booking.amount} CHF`);
      console.log(`     Statut: ${booking.paymentStatus}`);
      console.log(`     ID: ${booking.id}`);
      console.log("");
    });

    // Rechercher par différents critères
    console.log("🔎 Tests de recherche :");

    const dayParkingCount = await prisma.booking.count({
      where: { bookingType: "day_parking" },
    });
    console.log(`  - bookingType = "day_parking": ${dayParkingCount}`);

    const dayCount = await prisma.booking.count({
      where: { bookingType: "day" },
    });
    console.log(`  - bookingType = "day": ${dayCount}`);

    const withDurationCount = await prisma.booking.count({
      where: {
        dayParkingDuration: { not: null },
      },
    });
    console.log(`  - avec dayParkingDuration: ${withDurationCount}`);

    const parkingTypeCount = await prisma.booking.count({
      where: {
        OR: [
          { bookingType: "day_parking" },
          { bookingType: "day" },
          { dayParkingDuration: { not: null } },
        ],
      },
    });
    console.log(`  - tous critères parking: ${parkingTypeCount}`);
  } catch (error) {
    console.error("❌ Erreur :", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
