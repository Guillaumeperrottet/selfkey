/**
 * 🧪 Script de test complet d'une réservation
 *
 * Ce script simule une réservation complète du début à la fin :
 * 1. Vérifie la disponibilité d'une chambre
 * 2. Crée un Payment Intent Stripe (mode test)
 * 3. Simule un paiement réussi
 * 4. Déclenche le webhook pour créer la réservation
 * 5. Envoie l'email de confirmation
 * 6. Affiche le résumé complet
 *
 * Usage: npx tsx scripts/test-complete-booking.ts [langue]
 *
 * Exemples:
 *   npx tsx scripts/test-complete-booking.ts fr
 *   npx tsx scripts/test-complete-booking.ts en
 *   npx tsx scripts/test-complete-booking.ts de
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TestBookingConfig {
  locale: "fr" | "en" | "de";
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  hasDog?: boolean;
  adults: number;
  children: number;
  daysFromNow: number; // Check-in dans X jours
  numberOfNights: number;
}

const DEFAULT_CONFIG: TestBookingConfig = {
  locale: "fr",
  email: process.env.TEST_EMAIL || "perrottet.guillaume.1997@gmail.com",
  firstName: "Guillaume",
  lastName: "Perrottet",
  phone: "+41791234567",
  hasDog: undefined, // undefined = général, true = avec chien, false = sans chien
  adults: 2,
  children: 0,
  daysFromNow: 7,
  numberOfNights: 3,
};

async function testCompleteBooking(config: TestBookingConfig = DEFAULT_CONFIG) {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 TEST COMPLET D'UNE RÉSERVATION");
  console.log("=".repeat(70) + "\n");

  const flag =
    config.locale === "fr" ? "🇫🇷" : config.locale === "en" ? "🇬🇧" : "🇩🇪";
  const localeName =
    config.locale === "fr"
      ? "Français"
      : config.locale === "en"
        ? "English"
        : "Deutsch";

  console.log(`${flag} Langue: ${localeName}`);
  console.log(`📧 Email: ${config.email}`);
  console.log(`👤 Client: ${config.firstName} ${config.lastName}`);
  console.log(
    `🐕 Chien: ${config.hasDog === true ? "Oui" : config.hasDog === false ? "Non" : "Non spécifié (général)"}`
  );
  console.log(
    `👥 Voyageurs: ${config.adults} adulte(s), ${config.children} enfant(s)`
  );
  console.log(`📅 Check-in: Dans ${config.daysFromNow} jours`);
  console.log(`🌙 Durée: ${config.numberOfNights} nuit(s)\n`);

  try {
    // ==========================================
    // ÉTAPE 1: Trouver un établissement et une chambre
    // ==========================================
    console.log("📍 ÉTAPE 1: Recherche d'un établissement et d'une chambre...");

    const establishment = await prisma.establishment.findFirst({
      where: {
        slug: { not: undefined },
        stripeAccountId: { not: null },
      },
    });

    if (!establishment || !establishment.slug) {
      throw new Error("❌ Aucun établissement trouvé");
    }

    console.log(
      `   ✅ Établissement: ${establishment.name} (${establishment.slug})`
    );

    const room = await prisma.room.findFirst({
      where: {
        hotelSlug: establishment.slug,
        isActive: true,
      },
    });

    if (!room) {
      throw new Error("❌ Aucune chambre active trouvée");
    }

    console.log(`   ✅ Chambre: ${room.name} - ${room.price} CHF/nuit\n`);

    // ==========================================
    // ÉTAPE 2: Calculer les dates et le prix
    // ==========================================
    console.log("💰 ÉTAPE 2: Calcul des dates et du prix...");

    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + config.daysFromNow);
    checkInDate.setHours(14, 0, 0, 0);

    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + config.numberOfNights);
    checkOutDate.setHours(12, 0, 0, 0);

    const basePrice = room.price * config.numberOfNights;
    const commission = basePrice * (establishment.commissionRate / 100);
    const fixedFee = establishment.fixedFee;
    const totalPrice = basePrice + commission + fixedFee;

    console.log(`   📅 Check-in: ${checkInDate.toLocaleDateString("fr-CH")}`);
    console.log(`   📅 Check-out: ${checkOutDate.toLocaleDateString("fr-CH")}`);
    console.log(`   💵 Prix de base: ${basePrice.toFixed(2)} CHF`);
    console.log(`   💵 Commission: ${commission.toFixed(2)} CHF`);
    console.log(`   💵 Frais fixes: ${fixedFee.toFixed(2)} CHF`);
    console.log(`   💵 TOTAL: ${totalPrice.toFixed(2)} CHF\n`);

    // ==========================================
    // ÉTAPE 3: Créer le Payment Intent
    // ==========================================
    console.log("💳 ÉTAPE 3: Création du Payment Intent Stripe...");

    const paymentResponse = await fetch(
      `http://localhost:3000/api/establishments/${establishment.slug}/bookings`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          adults: config.adults,
          children: config.children,
          clientFirstName: config.firstName,
          clientLastName: config.lastName,
          clientEmail: config.email,
          clientPhone: config.phone,
          clientBirthDate: "1997-01-01",
          clientBirthPlace: "Fribourg",
          clientAddress: "Rue du Test 123",
          clientPostalCode: "1700",
          clientCity: "Fribourg",
          clientCountry: "Suisse",
          clientIdNumber: "TEST123456",
          clientIdType: "Carte d'identité",
          clientVehicleNumber: "FR-123456",
          expectedPrice: basePrice,
          selectedPricingOptions: {},
          hasDog: config.hasDog,
          bookingLocale: config.locale,
        }),
      }
    );

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      throw new Error(`Erreur Payment Intent: ${JSON.stringify(error)}`);
    }

    const { paymentIntentId } = await paymentResponse.json();
    console.log(`   ✅ Payment Intent créé: ${paymentIntentId}\n`);

    // ==========================================
    // ÉTAPE 4: Simuler le paiement (confirmer le PI)
    // ==========================================
    console.log("✅ ÉTAPE 4: Simulation du paiement Stripe...");
    console.log(
      `   ⚠️  En mode test, vous devez confirmer manuellement le Payment Intent`
    );
    console.log(
      `   💡 Ouvrez Stripe Dashboard > Paiements > Recherchez ${paymentIntentId}`
    );
    console.log(
      `   💡 Ou utilisez la CLI: stripe payment_intents confirm ${paymentIntentId}\n`
    );

    console.log("   ⏳ Attente de 5 secondes pour le webhook...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // ==========================================
    // ÉTAPE 5: Vérifier la création de la réservation
    // ==========================================
    console.log("\n📦 ÉTAPE 5: Vérification de la réservation...");

    const booking = await prisma.booking.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
      },
      include: {
        room: true,
      },
    });

    if (!booking) {
      console.log(`   ⚠️  Réservation pas encore créée (webhook en attente)`);
      console.log(
        `   💡 La réservation sera créée automatiquement par le webhook Stripe`
      );
      console.log(`   💡 En production, cela prend quelques secondes\n`);

      console.log("🔍 Pour tester en local avec les webhooks:");
      console.log(
        "   1. Installez Stripe CLI: brew install stripe/stripe-cli/stripe"
      );
      console.log(
        "   2. Lancez: stripe listen --forward-to localhost:3000/api/webhooks/stripe"
      );
      console.log("   3. Relancez ce script\n");

      return;
    }

    console.log(`   ✅ Réservation créée: #${booking.bookingNumber}`);
    console.log(`   📧 Email: ${booking.clientEmail}`);
    console.log(
      `   🌐 Langue: ${booking.bookingLocale?.toUpperCase() || "FR"}`
    );
    console.log(
      `   🐕 Chien: ${booking.hasDog === true ? "Oui" : booking.hasDog === false ? "Non" : "Non spécifié"}\n`
    );

    // ==========================================
    // ÉTAPE 6: Envoyer l'email de confirmation
    // ==========================================
    console.log("📧 ÉTAPE 6: Envoi de l'email de confirmation...");

    const emailResponse = await fetch(
      `http://localhost:3000/api/bookings/${booking.id}/send-confirmation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "email" }),
      }
    );

    if (!emailResponse.ok) {
      const error = await emailResponse.json();
      throw new Error(`Erreur email: ${JSON.stringify(error)}`);
    }

    console.log(`   ✅ Email de confirmation envoyé !\n`);

    // ==========================================
    // RÉSUMÉ FINAL
    // ==========================================
    console.log("=".repeat(70));
    console.log("✨ TEST TERMINÉ AVEC SUCCÈS !");
    console.log("=".repeat(70) + "\n");

    console.log("📋 RÉSUMÉ DE LA RÉSERVATION:");
    console.log(`   • Numéro: #${booking.bookingNumber}`);
    console.log(`   • Établissement: ${establishment.name}`);
    console.log(`   • Chambre: ${booking.room?.name}`);
    console.log(
      `   • Client: ${booking.clientFirstName} ${booking.clientLastName}`
    );
    console.log(`   • Email: ${booking.clientEmail}`);
    console.log(
      `   • Check-in: ${booking.checkInDate.toLocaleDateString("fr-CH")}`
    );
    console.log(
      `   • Check-out: ${booking.checkOutDate.toLocaleDateString("fr-CH")}`
    );
    console.log(`   • Montant: ${booking.amount.toFixed(2)} CHF`);
    console.log(`   • Statut: ${booking.paymentStatus}`);
    console.log(`   • Langue: ${flag} ${booking.bookingLocale?.toUpperCase()}`);
    console.log(
      `   • Chien: ${booking.hasDog === true ? "✅ Oui" : booking.hasDog === false ? "❌ Non" : "➖ Non spécifié"}\n`
    );

    console.log("📬 VÉRIFICATIONS:");
    console.log(`   [ ] Vérifiez votre email: ${config.email}`);
    console.log(`   [ ] L'email est dans la bonne langue (${localeName})`);
    console.log(`   [ ] Les informations sont correctes`);
    console.log(`   [ ] Le design s'affiche correctement`);
    console.log(`   [ ] La réservation apparaît dans l'admin\n`);

    console.log("🔗 LIENS UTILES:");
    console.log(
      `   • Admin: http://localhost:3000/admin/${establishment.slug}`
    );
    console.log(
      `   • Stripe Dashboard: https://dashboard.stripe.com/test/payments/${paymentIntentId}`
    );
    console.log(`   • Invoice: http://localhost:3000/invoice/${booking.id}\n`);

    // Option: nettoyer la réservation de test
    if (process.env.CLEANUP_TEST_BOOKING === "true") {
      console.log("🧹 Nettoyage de la réservation de test...");
      await prisma.booking.delete({ where: { id: booking.id } });
      console.log("   ✅ Réservation supprimée\n");
    } else {
      console.log(
        "💾 Réservation conservée (ajoutez CLEANUP_TEST_BOOKING=true pour la supprimer)\n"
      );
    }
  } catch (error) {
    console.error("\n❌ ERREUR LORS DU TEST:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ==========================================
// EXÉCUTION DU SCRIPT
// ==========================================
const locale = (process.argv[2] || "fr") as "fr" | "en" | "de";
const config: TestBookingConfig = {
  ...DEFAULT_CONFIG,
  locale,
};

// Option: tester avec un chien
if (process.argv[3] === "withDog") {
  config.hasDog = true;
} else if (process.argv[3] === "withoutDog") {
  config.hasDog = false;
}

testCompleteBooking(config).catch((error) => {
  console.error(error);
  process.exit(1);
});
