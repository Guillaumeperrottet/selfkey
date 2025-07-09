#!/usr/bin/env node

/**
 * Script pour créer des réservations de test pour l'export Excel
 * Usage: node create-test-bookings.js
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestBookings() {
  console.log("📊 Création de réservations de test pour l'export Excel...\n");

  try {
    // Vérifier qu'il y a un établissement et des chambres
    const establishment = await prisma.establishment.findFirst({
      include: { rooms: true },
    });

    if (!establishment) {
      console.log(
        "❌ Aucun établissement trouvé. Exécutez d'abord setup-test-data.js"
      );
      return;
    }

    if (establishment.rooms.length === 0) {
      console.log(
        "❌ Aucune chambre trouvée. Exécutez d'abord setup-test-data.js"
      );
      return;
    }

    const room = establishment.rooms[0];

    // Créer des réservations de test avec des données réalistes
    const bookingsData = [
      {
        clientFirstName: "Jean",
        clientLastName: "Dupont",
        clientEmail: "jean.dupont@email.com",
        clientPhone: "+41 79 123 45 67",
        clientBirthDate: new Date("1985-03-15"),
        clientAddress: "Rue de la Paix 12",
        clientPostalCode: "1700",
        clientCity: "Fribourg",
        clientCountry: "CH",
        clientIdNumber: "CHE123456789",
        checkInDate: new Date("2025-01-05"),
        checkOutDate: new Date("2025-01-07"),
        guests: 2,
        amount: 240.0,
      },
      {
        clientFirstName: "Marie",
        clientLastName: "Martin",
        clientEmail: "marie.martin@email.com",
        clientPhone: "+41 76 987 65 43",
        clientBirthDate: new Date("1990-07-22"),
        clientAddress: "Avenue des Alpes 45",
        clientPostalCode: "1700",
        clientCity: "Fribourg",
        clientCountry: "CH",
        clientIdNumber: "CHE987654321",
        checkInDate: new Date("2025-01-10"),
        checkOutDate: new Date("2025-01-12"),
        guests: 1,
        amount: 120.0,
      },
      {
        clientFirstName: "Pierre",
        clientLastName: "Schneider",
        clientEmail: "pierre.schneider@email.com",
        clientPhone: "+41 78 555 66 77",
        clientBirthDate: new Date("1978-11-08"),
        clientAddress: "Chemin du Lac 8",
        clientPostalCode: "1700",
        clientCity: "Fribourg",
        clientCountry: "CH",
        clientIdNumber: "CHE456789123",
        checkInDate: new Date("2025-01-15"),
        checkOutDate: new Date("2025-01-17"),
        guests: 2,
        amount: 240.0,
      },
      {
        clientFirstName: "Anna",
        clientLastName: "Weber",
        clientEmail: "anna.weber@email.com",
        clientPhone: "+41 77 444 33 22",
        clientBirthDate: new Date("1992-04-30"),
        clientAddress: "Hauptstrasse 23",
        clientPostalCode: "3000",
        clientCity: "Bern",
        clientCountry: "CH",
        clientIdNumber: "CHE789123456",
        checkInDate: new Date("2025-01-20"),
        checkOutDate: new Date("2025-01-22"),
        guests: 2,
        amount: 240.0,
      },
      {
        clientFirstName: "François",
        clientLastName: "Dubois",
        clientEmail: "francois.dubois@email.com",
        clientPhone: "+33 6 12 34 56 78",
        clientBirthDate: new Date("1988-09-12"),
        clientAddress: "Rue de Rivoli 100",
        clientPostalCode: "75001",
        clientCity: "Paris",
        clientCountry: "FR",
        clientIdNumber: "FR123456789",
        checkInDate: new Date("2025-01-25"),
        checkOutDate: new Date("2025-01-27"),
        guests: 2,
        amount: 240.0,
      },
    ];

    console.log(`🏨 Établissement: ${establishment.name}`);
    console.log(`🏠 Chambre utilisée: ${room.name}`);
    console.log(`📝 Création de ${bookingsData.length} réservations...\n`);

    for (const [index, bookingData] of bookingsData.entries()) {
      const booking = await prisma.booking.create({
        data: {
          ...bookingData,
          hotelSlug: establishment.slug,
          roomId: room.id,
          currency: "CHF",
          platformCommission: 0,
          ownerAmount: bookingData.amount,
        },
      });

      console.log(
        `   ✅ Réservation ${index + 1}: ${booking.clientFirstName} ${booking.clientLastName} (${booking.checkInDate.toLocaleDateString()} - ${booking.checkOutDate.toLocaleDateString()})`
      );
    }

    console.log(
      `\n🎉 ${bookingsData.length} réservations de test créées avec succès !`
    );
    console.log(
      "💡 Vous pouvez maintenant tester l'export Excel dans l'interface d'administration."
    );
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création des réservations de test:",
      error
    );
  } finally {
    await prisma.$disconnect();
  }
}

createTestBookings();
