/**
 * Script pour simuler des réservations complètes en local
 * Usage: node simulate-bookings.js
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Données fictives réalistes
const FAKE_CLIENTS = [
  {
    firstName: "Sophie",
    lastName: "Bernard",
    email: "sophie.bernard@gmail.com",
    phone: "+41791234501",
    birthDate: "1985-03-15",
    address: "Rue du Lac 45",
    postalCode: "1007",
    city: "Lausanne",
    country: "Suisse",
    idNumber: "CHE123456789",
  },
  {
    firstName: "Thomas",
    lastName: "Weber",
    email: "thomas.weber@outlook.com",
    phone: "+41791234502",
    birthDate: "1992-08-22",
    address: "Hauptstrasse 123",
    postalCode: "8001",
    city: "Zürich",
    country: "Suisse",
    idNumber: "CHE987654321",
  },
  {
    firstName: "Elena",
    lastName: "Rossi",
    email: "elena.rossi@icloud.com",
    phone: "+41791234503",
    birthDate: "1988-12-03",
    address: "Via Roma 18",
    postalCode: "6900",
    city: "Lugano",
    country: "Suisse",
    idNumber: "CHE456789012",
  },
  {
    firstName: "Marc",
    lastName: "Dubois",
    email: "marc.dubois@yahoo.fr",
    phone: "+41791234504",
    birthDate: "1975-06-18",
    address: "Avenue de la Gare 7",
    postalCode: "1950",
    city: "Sion",
    country: "Suisse",
    idNumber: "CHE789012345",
  },
  {
    firstName: "Anna",
    lastName: "Schmidt",
    email: "anna.schmidt@gmx.ch",
    phone: "+41791234505",
    birthDate: "1990-11-25",
    address: "Dorfstrasse 56",
    postalCode: "3000",
    city: "Bern",
    country: "Suisse",
    idNumber: "CHE321654987",
  },
];

const ROOM_SCENARIOS = [
  { basePrice: 89, name: "Chambre Standard", description: "Séjour court" },
  { basePrice: 149, name: "Chambre Supérieure", description: "Week-end" },
  { basePrice: 229, name: "Suite", description: "Séjour romantique" },
  {
    basePrice: 189,
    name: "Chambre Familiale",
    description: "Vacances famille",
  },
  { basePrice: 299, name: "Appartement", description: "Séjour longue durée" },
  { basePrice: 449, name: "Suite Présidentielle", description: "Séjour VIP" },
];

async function simulateBookings(count = 10) {
  console.log(`🎭 Simulation de ${count} réservations réalistes`);
  console.log("=============================================\n");

  try {
    const establishment = await prisma.establishment.findFirst({
      include: {
        rooms: {
          where: { isActive: true },
        },
      },
    });

    if (!establishment || establishment.rooms.length === 0) {
      console.log("❌ Aucun établissement ou chambre trouvé");
      return;
    }

    console.log(`🏨 Établissement: ${establishment.name}`);
    console.log(`💰 Taux de commission: ${establishment.commissionRate}%`);
    console.log(`🔧 Frais fixes: ${establishment.fixedFee} CHF\n`);

    const createdBookings = [];

    for (let i = 0; i < count; i++) {
      try {
        // Sélectionner des données aléatoires
        const client =
          FAKE_CLIENTS[Math.floor(Math.random() * FAKE_CLIENTS.length)];
        const room =
          establishment.rooms[
            Math.floor(Math.random() * establishment.rooms.length)
          ];
        const scenario =
          ROOM_SCENARIOS[Math.floor(Math.random() * ROOM_SCENARIOS.length)];

        // Générer des dates réalistes
        const now = new Date();
        const daysFromNow = Math.floor(Math.random() * 30); // Dans les 30 prochains jours
        const checkInDate = new Date(
          now.getTime() + daysFromNow * 24 * 60 * 60 * 1000
        );
        const stayDuration = 1 + Math.floor(Math.random() * 4); // 1 à 4 nuits
        const checkOutDate = new Date(
          checkInDate.getTime() + stayDuration * 24 * 60 * 60 * 1000
        );

        // Calculer le prix (prix de base + variation aléatoire)
        const priceVariation = 0.8 + Math.random() * 0.4; // ±20%
        const amount = Math.round(scenario.basePrice * priceVariation);

        // Calculer la commission
        const platformCommission = Math.round(
          (amount * establishment.commissionRate) / 100 + establishment.fixedFee
        );
        const ownerAmount = amount - platformCommission;

        // Générer un faux PaymentIntent ID
        const fakePaymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Créer la réservation
        const booking = await prisma.booking.create({
          data: {
            hotelSlug: establishment.slug,
            roomId: room.id,
            clientFirstName: client.firstName,
            clientLastName: client.lastName,
            clientEmail: client.email,
            clientPhone: client.phone,
            clientBirthDate: new Date(client.birthDate),
            clientAddress: client.address,
            clientPostalCode: client.postalCode,
            clientCity: client.city,
            clientCountry: client.country,
            clientIdNumber: client.idNumber,
            checkInDate,
            checkOutDate,
            guests: 1 + Math.floor(Math.random() * 3), // 1 à 4 personnes
            amount,
            currency: "CHF",
            platformCommission,
            ownerAmount,
            stripePaymentIntentId: fakePaymentIntentId,
            // Ajouter une variété de dates de réservation
            bookingDate: new Date(
              now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ), // Jusqu'à 7 jours dans le passé
          },
        });

        createdBookings.push(booking);

        console.log(`✅ Réservation ${i + 1}/${count} créée`);
        console.log(`   👤 Client: ${client.firstName} ${client.lastName}`);
        console.log(`   🏠 Chambre: ${room.name}`);
        console.log(
          `   📅 Séjour: ${checkInDate.toLocaleDateString("fr-CH")} - ${checkOutDate.toLocaleDateString("fr-CH")} (${stayDuration} nuit${stayDuration > 1 ? "s" : ""})`
        );
        console.log(`   💰 Montant: ${amount} CHF`);
        console.log(
          `   💸 Commission: ${platformCommission} CHF (${((platformCommission / amount) * 100).toFixed(1)}%)`
        );
        console.log(`   🏦 Propriétaire: ${ownerAmount} CHF`);
        console.log(`   📧 Email: ${client.email}`);
        console.log("");

        // Petite pause pour éviter de surcharger
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.log(
          `❌ Erreur création réservation ${i + 1}: ${error.message}`
        );
      }
    }

    // Résumé
    console.log("📊 Résumé de la simulation");
    console.log("==========================");

    const totalAmount = createdBookings.reduce((sum, b) => sum + b.amount, 0);
    const totalCommissions = createdBookings.reduce(
      (sum, b) => sum + b.platformCommission,
      0
    );
    const averageBooking = totalAmount / createdBookings.length;
    const averageCommission = totalCommissions / createdBookings.length;

    console.log(`✅ Réservations créées: ${createdBookings.length}`);
    console.log(`💰 Chiffre d'affaires total: ${totalAmount.toFixed(2)} CHF`);
    console.log(`💸 Total commissions: ${totalCommissions.toFixed(2)} CHF`);
    console.log(`📈 Commission moyenne: ${averageCommission.toFixed(2)} CHF`);
    console.log(`📊 Réservation moyenne: ${averageBooking.toFixed(2)} CHF`);
    console.log(
      `🎯 Taux de commission effectif: ${((totalCommissions / totalAmount) * 100).toFixed(2)}%`
    );

    console.log("\n🔧 Prochaines étapes:");
    console.log("   1. Testez: node test-commission.js");
    console.log("   2. Vérifiez: node stripe-health-check.js check");
    console.log("   3. Interface: http://localhost:3001/admin/commissions");
  } catch (error) {
    console.error("❌ Erreur lors de la simulation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanSimulatedBookings() {
  console.log("🧹 Nettoyage des réservations simulées");
  console.log("=====================================\n");

  try {
    // Supprimer les réservations avec des PaymentIntent fictifs
    const result = await prisma.booking.deleteMany({
      where: {
        stripePaymentIntentId: {
          startsWith: "pi_test_",
        },
      },
    });

    console.log(`✅ ${result.count} réservations simulées supprimées`);
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function generateDiverseScenarios() {
  console.log("🎯 Génération de scénarios diversifiés");
  console.log("=====================================\n");

  // Scénarios spécifiques
  const scenarios = [
    {
      name: "Haute saison",
      count: 15,
      priceMultiplier: 1.3,
      description: "Période de forte demande",
    },
    {
      name: "Basse saison",
      count: 8,
      priceMultiplier: 0.7,
      description: "Période creuse avec promotions",
    },
    {
      name: "Week-ends",
      count: 12,
      priceMultiplier: 1.1,
      description: "Réservations de week-end",
    },
    {
      name: "Séjours longs",
      count: 6,
      priceMultiplier: 0.9,
      description: "Séjours de plus de 3 nuits",
    },
  ];

  for (const scenario of scenarios) {
    console.log(`📋 Scénario: ${scenario.name} (${scenario.description})`);
    // Ici on pourrait adapter la logique de simulation selon le scénario
    await simulateBookings(scenario.count);
    console.log(`✅ ${scenario.name} terminé\n`);
  }
}

// Gestion des arguments
const mode = process.argv[2];
const count = parseInt(process.argv[3]) || 10;

if (mode === "create") {
  simulateBookings(count);
} else if (mode === "clean") {
  cleanSimulatedBookings();
} else if (mode === "scenarios") {
  generateDiverseScenarios();
} else {
  console.log("Usage:");
  console.log(
    "  node simulate-bookings.js create [nombre]     # Créer N réservations (défaut: 10)"
  );
  console.log(
    "  node simulate-bookings.js clean              # Supprimer les réservations simulées"
  );
  console.log(
    "  node simulate-bookings.js scenarios          # Générer des scénarios diversifiés"
  );
  console.log("");
  console.log("Exemples:");
  console.log(
    "  node simulate-bookings.js create 5           # 5 réservations"
  );
  console.log(
    "  node simulate-bookings.js create 50          # 50 réservations"
  );
  console.log("");
  console.log("💡 Ces réservations sont entièrement locales (pas de Stripe)");
}
