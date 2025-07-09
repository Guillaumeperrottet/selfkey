import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestBooking() {
  try {
    // Trouver un établissement existant
    const establishment = await prisma.establishment.findFirst();

    if (!establishment) {
      console.log(
        "Aucun établissement trouvé. Créez d'abord un établissement."
      );
      return;
    }

    // Trouver une chambre
    const room = await prisma.room.findFirst({
      where: { hotelSlug: establishment.slug },
    });

    if (!room) {
      console.log("Aucune chambre trouvée. Créez d'abord une chambre.");
      return;
    }

    // Créer une réservation test avec les nouveaux champs
    const booking = await prisma.booking.create({
      data: {
        hotelSlug: establishment.slug,
        roomId: room.id,
        checkInDate: new Date("2025-07-15"),
        checkOutDate: new Date("2025-07-17"),
        clientFirstName: "Jean",
        clientLastName: "Dupont",
        clientEmail: "jean.dupont@example.com",
        clientPhone: "+41 79 123 45 67",
        clientBirthDate: new Date("1985-03-15"),
        clientBirthPlace: "Lausanne, Suisse",
        clientAddress: "Rue de la Paix 123",
        clientPostalCode: "1000",
        clientCity: "Lausanne",
        clientCountry: "Suisse",
        clientIdNumber: "AI-123456",
        clientVehicleNumber: "VD 123456",
        adults: 2,
        children: 1,
        guests: 3,
        amount: 300.0,
        platformCommission: 30.0,
        ownerAmount: 270.0,
        stripePaymentIntentId: "test_payment_intent",
      },
    });

    console.log("✅ Réservation test créée:", booking.id);
    console.log("Données:", {
      nom: `${booking.clientFirstName} ${booking.clientLastName}`,
      lieuNaissance: booking.clientBirthPlace,
      vehicule: booking.clientVehicleNumber,
      adultes: booking.adults,
      enfants: booking.children,
    });
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création de la réservation test:",
      error
    );
  } finally {
    await prisma.$disconnect();
  }
}

createTestBooking();
