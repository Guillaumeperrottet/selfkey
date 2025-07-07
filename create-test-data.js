/**
 * Script pour créer des données de test Stripe
 * Usage: node create-test-data.js
 */

import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

// Cartes de test Stripe
const TEST_CARDS = {
  visa_success: "pm_card_visa",
  visa_declined: "pm_card_visa_chargeDeclined",
  mastercard_success: "pm_card_mastercard",
  twint_success: "pm_card_twint", // Pour la Suisse
};

async function createTestPayments() {
  console.log("🧪 Création de données de test Stripe");
  console.log("====================================\n");

  try {
    // 1. Récupérer l'établissement existant
    const establishment = await prisma.establishment.findFirst({
      where: {
        stripeAccountId: { not: null },
      },
    });

    if (!establishment) {
      console.log("❌ Aucun établissement avec Stripe Connect trouvé");
      return;
    }

    console.log(`🏨 Utilisation de l'établissement: ${establishment.name}`);
    console.log(`💳 Compte Stripe: ${establishment.stripeAccountId}\n`);

    // 2. Créer des paiements de test réussis
    console.log("📋 Création de paiements de test réussis...");

    const successfulPayments = [
      { amount: 15000, description: "Réservation Suite Deluxe" }, // 150 CHF
      { amount: 22500, description: "Réservation Chambre Premium" }, // 225 CHF
      { amount: 35000, description: "Réservation Appartement" }, // 350 CHF
      { amount: 8000, description: "Réservation Chambre Standard" }, // 80 CHF
    ];

    for (const payment of successfulPayments) {
      try {
        // Calculer la commission
        const commissionAmount = Math.round(
          (payment.amount * establishment.commissionRate) / 100 +
            establishment.fixedFee * 100
        );

        // Créer le PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: payment.amount,
          currency: "chf",
          application_fee_amount: commissionAmount,
          transfer_data: {
            destination: establishment.stripeAccountId,
          },
          metadata: {
            test_data: "true",
            establishment_name: establishment.name,
          },
          description: payment.description,
        });

        // Confirmer le paiement avec une carte de test
        await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: TEST_CARDS.visa_success,
          return_url: "http://localhost:3001/payment-success",
        });

        console.log(`   ✅ Paiement créé: ${payment.description}`);
        console.log(`      Montant: ${(payment.amount / 100).toFixed(2)} CHF`);
        console.log(
          `      Commission: ${(commissionAmount / 100).toFixed(2)} CHF`
        );
        console.log(`      ID: ${paymentIntent.id}\n`);

        // Créer une réservation correspondante en base
        await createTestBooking(establishment.slug, payment, paymentIntent.id);
      } catch (error) {
        console.log(`   ❌ Erreur création paiement: ${error.message}`);
      }
    }

    // 3. Créer quelques paiements échoués pour tester
    console.log("📋 Création de paiements de test échoués...");

    const failedPayments = [
      { amount: 12000, description: "Tentative paiement carte refusée" },
      { amount: 18000, description: "Tentative paiement fonds insuffisants" },
    ];

    for (const payment of failedPayments) {
      try {
        const commissionAmount = Math.round(
          (payment.amount * establishment.commissionRate) / 100 +
            establishment.fixedFee * 100
        );

        const paymentIntent = await stripe.paymentIntents.create({
          amount: payment.amount,
          currency: "chf",
          application_fee_amount: commissionAmount,
          transfer_data: {
            destination: establishment.stripeAccountId,
          },
          metadata: {
            test_data: "true",
            establishment_name: establishment.name,
          },
          description: payment.description,
        });

        // Essayer de confirmer avec une carte qui échoue
        try {
          await stripe.paymentIntents.confirm(paymentIntent.id, {
            payment_method: TEST_CARDS.visa_declined,
            return_url: "http://localhost:3001/payment-failed",
          });
        } catch (declineError) {
          console.log(
            `   ⚠️  Paiement échoué (attendu): ${payment.description}`
          );
          console.log(
            `      Montant: ${(payment.amount / 100).toFixed(2)} CHF`
          );
          console.log(`      Raison: ${declineError.message}\n`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur création paiement échoué: ${error.message}`);
      }
    }

    console.log("🎉 Données de test créées avec succès !");
    console.log("\n📋 Prochaines étapes:");
    console.log("   1. Exécutez: node stripe-health-check.js check");
    console.log("   2. Visitez: http://localhost:3001/admin/stripe-monitoring");
    console.log("   3. Vérifiez: https://dashboard.stripe.com/test/payments");
  } catch (error) {
    console.error("❌ Erreur lors de la création des données de test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createTestBooking(hotelSlug, payment, paymentIntentId) {
  try {
    // Récupérer une chambre aléatoire
    const rooms = await prisma.room.findMany({
      where: { hotelSlug, isActive: true },
    });

    if (rooms.length === 0) {
      console.log("   ⚠️  Aucune chambre disponible pour créer la réservation");
      return;
    }

    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotelSlug },
    });

    // Calculer la commission
    const platformCommission =
      (payment.amount / 100) * (establishment.commissionRate / 100) +
      establishment.fixedFee;
    const ownerAmount = payment.amount / 100 - platformCommission;

    // Données de client fictives
    const fakeClients = [
      {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@test.com",
        phone: "+41791234567",
        address: "Rue de la Paix 12",
        postalCode: "1000",
        city: "Lausanne",
        country: "Suisse",
        idNumber: "CH123456789",
      },
      {
        firstName: "Marie",
        lastName: "Martin",
        email: "marie.martin@test.com",
        phone: "+41791234568",
        address: "Avenue des Alpes 25",
        postalCode: "1920",
        city: "Martigny",
        country: "Suisse",
        idNumber: "CH987654321",
      },
      {
        firstName: "Pierre",
        lastName: "Müller",
        email: "pierre.muller@test.com",
        phone: "+41791234569",
        address: "Bahnhofstrasse 1",
        postalCode: "8001",
        city: "Zürich",
        country: "Suisse",
        idNumber: "CH456789123",
      },
    ];

    const client = fakeClients[Math.floor(Math.random() * fakeClients.length)];
    const now = new Date();
    const checkIn = new Date(
      now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
    ); // Dans les 7 prochains jours
    const checkOut = new Date(
      checkIn.getTime() + (1 + Math.random() * 3) * 24 * 60 * 60 * 1000
    ); // 1-4 jours

    await prisma.booking.create({
      data: {
        hotelSlug,
        roomId: randomRoom.id,
        clientFirstName: client.firstName,
        clientLastName: client.lastName,
        clientEmail: client.email,
        clientPhone: client.phone,
        clientBirthDate: new Date("1990-01-01"),
        clientAddress: client.address,
        clientPostalCode: client.postalCode,
        clientCity: client.city,
        clientCountry: client.country,
        clientIdNumber: client.idNumber,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: 1 + Math.floor(Math.random() * 3), // 1-4 guests
        amount: payment.amount / 100,
        currency: "CHF",
        platformCommission,
        ownerAmount,
        stripePaymentIntentId: paymentIntentId,
      },
    });

    console.log(
      `   📋 Réservation créée pour ${client.firstName} ${client.lastName}`
    );
  } catch (error) {
    console.log(`   ⚠️  Erreur création réservation: ${error.message}`);
  }
}

async function cleanTestData() {
  console.log("🧹 Nettoyage des données de test");
  console.log("================================\n");

  try {
    // 1. Supprimer les PaymentIntents de test
    console.log("📋 Suppression des paiements de test Stripe...");

    const testPayments = await stripe.paymentIntents.list({
      limit: 100,
      metadata: { test_data: "true" },
    });

    for (const payment of testPayments.data) {
      try {
        // Note: On ne peut pas supprimer les PaymentIntents, mais on peut les lister
        console.log(
          `   ℹ️  Paiement de test trouvé: ${payment.id} - ${payment.description}`
        );
      } catch (error) {
        console.log(
          `   ⚠️  Erreur avec le paiement ${payment.id}: ${error.message}`
        );
      }
    }

    // 2. Supprimer les réservations de test de la base de données
    console.log("\n📋 Suppression des réservations de test...");

    const testBookings = await prisma.booking.findMany({
      where: {
        stripePaymentIntentId: {
          in: testPayments.data.map((p) => p.id),
        },
      },
    });

    console.log(`   📊 ${testBookings.length} réservations de test trouvées`);

    await prisma.booking.deleteMany({
      where: {
        stripePaymentIntentId: {
          in: testPayments.data.map((p) => p.id),
        },
      },
    });

    console.log("   ✅ Réservations de test supprimées");
    console.log("\n🎉 Nettoyage terminé !");
    console.log(
      "\n💡 Note: Les PaymentIntents Stripe de test restent visibles dans le dashboard Stripe"
    );
    console.log("   mais sont marqués comme données de test.");
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Gestion des arguments
const mode = process.argv[2];

if (mode === "create") {
  createTestPayments();
} else if (mode === "clean") {
  cleanTestData();
} else {
  console.log("Usage:");
  console.log("  node create-test-data.js create  # Créer des données de test");
  console.log(
    "  node create-test-data.js clean   # Nettoyer les données de test"
  );
  console.log("");
  console.log("💡 Ces commandes utilisent le mode test de Stripe");
  console.log("   Aucun vrai argent ne sera traité !");
}
