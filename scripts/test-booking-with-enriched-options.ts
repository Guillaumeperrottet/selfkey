/**
 * 🧪 Script de test avec Options de Prix Enrichies
 *
 * Ce script crée une réservation de test avec des options de prix
 * au format enrichi (snapshot complet) pour tester le nouveau système.
 *
 * Usage: npx tsx scripts/test-booking-with-enriched-options.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testBookingWithEnrichedOptions() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 TEST RÉSERVATION AVEC OPTIONS DE PRIX ENRICHIES");
  console.log("=".repeat(70) + "\n");

  try {
    // ==========================================
    // ÉTAPE 1: Trouver l'établissement "test"
    // ==========================================
    console.log("📍 ÉTAPE 1: Recherche de l'établissement 'test'...");

    const establishment = await prisma.establishment.findFirst({
      where: {
        slug: "test",
      },
    });

    if (!establishment) {
      throw new Error("❌ Établissement 'test' non trouvé");
    }

    console.log(`   ✅ Établissement: ${establishment.name}\n`);

    // ==========================================
    // ÉTAPE 2: Récupérer les options de prix
    // ==========================================
    console.log("💰 ÉTAPE 2: Récupération des options de prix...");

    const pricingOptions = await prisma.pricingOption.findMany({
      where: {
        establishmentId: establishment.id,
        isActive: true,
      },
      include: {
        values: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    if (pricingOptions.length === 0) {
      throw new Error("❌ Aucune option de prix active trouvée");
    }

    console.log(
      `   ✅ ${pricingOptions.length} option(s) de prix trouvée(s):\n`
    );
    pricingOptions.forEach((option) => {
      console.log(`   • ${option.name} (${option.type})`);
      option.values.forEach((value) => {
        const priceDisplay =
          value.priceModifier >= 0
            ? `+${value.priceModifier}`
            : value.priceModifier;
        console.log(
          `     - ${value.label}: ${priceDisplay} CHF ${value.isDefault ? "(par défaut)" : ""}`
        );
      });
    });
    console.log();

    // ==========================================
    // ÉTAPE 3: Trouver une chambre
    // ==========================================
    console.log("🛏️  ÉTAPE 3: Recherche d'une chambre...");

    const room = await prisma.room.findFirst({
      where: {
        hotelSlug: "test",
        isActive: true,
      },
    });

    if (!room) {
      throw new Error("❌ Aucune chambre active trouvée");
    }

    console.log(`   ✅ Chambre: ${room.name} - ${room.price} CHF/nuit\n`);

    // ==========================================
    // ÉTAPE 4: Créer les options enrichies
    // ==========================================
    console.log("✨ ÉTAPE 4: Création du snapshot enrichi des options...");

    const selectedPricingOptions: Record<
      string,
      | {
          optionId: string;
          optionName: string;
          optionType: string;
          valueId: string;
          valueLabel: string;
          priceModifier: number;
          selectedAt: string;
        }
      | Array<{
          optionId: string;
          optionName: string;
          optionType: string;
          valueId: string;
          valueLabel: string;
          priceModifier: number;
          selectedAt: string;
        }>
    > = {};
    let pricingOptionsTotal = 0;

    // Sélectionner des options de test
    pricingOptions.forEach((option) => {
      // Pour chaque option, sélectionner la première valeur avec un prix > 0
      const valueWithPrice = option.values.find((v) => v.priceModifier > 0);
      const selectedValue = valueWithPrice || option.values[0];

      if (selectedValue) {
        const enrichedOption = {
          optionId: option.id,
          optionName: option.name,
          optionType: option.type,
          valueId: selectedValue.id,
          valueLabel: selectedValue.label,
          priceModifier: selectedValue.priceModifier,
          selectedAt: new Date().toISOString(),
        };

        if (option.type === "checkbox") {
          // Pour checkbox, format array
          selectedPricingOptions[option.id] = [enrichedOption];
        } else {
          // Pour radio/select, format objet
          selectedPricingOptions[option.id] = enrichedOption;
        }

        pricingOptionsTotal += selectedValue.priceModifier;

        console.log(
          `   ✅ ${option.name}: ${selectedValue.label} (${selectedValue.priceModifier >= 0 ? "+" : ""}${selectedValue.priceModifier} CHF)`
        );
      }
    });

    console.log(`\n   💰 Total options: ${pricingOptionsTotal} CHF\n`);

    // ==========================================
    // ÉTAPE 5: Calculer les dates et le prix
    // ==========================================
    console.log("📅 ÉTAPE 5: Calcul des dates et du prix total...");

    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 2);
    checkInDate.setHours(14, 0, 0, 0);

    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 1);
    checkOutDate.setHours(12, 0, 0, 0);

    const numberOfNights = 1;
    const basePrice = room.price * numberOfNights;

    // Taxe de séjour
    const touristTaxAmount = establishment.touristTaxEnabled
      ? establishment.touristTaxAmount || 3.0
      : 0;
    const touristTaxTotal = touristTaxAmount * 1 * numberOfNights; // 1 adulte

    const subtotal = basePrice + pricingOptionsTotal + touristTaxTotal;
    const commission = subtotal * (establishment.commissionRate / 100);
    const fixedFee = establishment.fixedFee;
    const totalPrice = subtotal + commission + fixedFee;

    console.log(`   📅 Check-in: ${checkInDate.toLocaleDateString("fr-CH")}`);
    console.log(`   📅 Check-out: ${checkOutDate.toLocaleDateString("fr-CH")}`);
    console.log(`   💵 Prix chambre: ${basePrice.toFixed(2)} CHF`);
    console.log(`   💵 Options: ${pricingOptionsTotal.toFixed(2)} CHF`);
    console.log(`   💵 Taxe de séjour: ${touristTaxTotal.toFixed(2)} CHF`);
    console.log(`   💵 Sous-total: ${subtotal.toFixed(2)} CHF`);
    console.log(`   💵 Commission: ${commission.toFixed(2)} CHF`);
    console.log(`   💵 Frais fixes: ${fixedFee.toFixed(2)} CHF`);
    console.log(`   💵 TOTAL: ${totalPrice.toFixed(2)} CHF\n`);

    // ==========================================
    // ÉTAPE 6: Créer la réservation directement
    // ==========================================
    console.log("💾 ÉTAPE 6: Création de la réservation dans la base...");

    const booking = await prisma.booking.create({
      data: {
        establishment: {
          connect: { id: establishment.id },
        },
        room: {
          connect: { id: room.id },
        },
        checkInDate,
        checkOutDate,
        clientFirstName: "Guillaume",
        clientLastName: "Perrottet",
        clientEmail: "perrottet.guillaume.1997@gmail.com",
        clientPhone: "+41793414074",
        clientBirthDate: new Date("1997-08-15T00:00:00.000Z"),
        clientBirthPlace: "Fribourg",
        clientAddress: "En Palud 38",
        clientPostalCode: "1643",
        clientCity: "Gumefens",
        clientCountry: "Suisse",
        clientIdNumber: "TEST123456",
        clientIdType: "Carte d'identité",
        clientVehicleNumber: "FR-191-197",
        adults: 1,
        children: 0,
        guests: 1,
        amount: totalPrice,
        ownerAmount: subtotal,
        currency: "CHF",
        paymentStatus: "succeeded",
        stripePaymentIntentId: `pi_test_enriched_${Date.now()}`,
        selectedPricingOptions: selectedPricingOptions,
        pricingOptionsTotal: pricingOptionsTotal,
        touristTaxTotal: touristTaxTotal,
        hasDog: false,
        bookingLocale: "fr",
        bookingType: "classic",
      },
    });

    console.log(`   ✅ Réservation créée: #${booking.bookingNumber}\n`);

    // ==========================================
    // ÉTAPE 7: Vérifier le format enrichi
    // ==========================================
    console.log("🔍 ÉTAPE 7: Vérification du format enrichi...");

    const savedBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
    });

    console.log("\n   📦 Données stockées:");
    console.log(JSON.stringify(savedBooking?.selectedPricingOptions, null, 2));
    console.log();

    // Vérifier le format
    const firstOptionKey = Object.keys(
      savedBooking?.selectedPricingOptions || {}
    )[0];
    const firstOptionValue = (
      savedBooking?.selectedPricingOptions as Record<string, unknown>
    )?.[firstOptionKey];
    const isEnriched =
      firstOptionValue &&
      typeof firstOptionValue === "object" &&
      "optionName" in firstOptionValue;

    console.log(
      `   ${isEnriched ? "✅" : "❌"} Format enrichi détecté: ${isEnriched}\n`
    );

    // ==========================================
    // RÉSUMÉ FINAL
    // ==========================================
    console.log("=".repeat(70));
    console.log("✨ RÉSERVATION DE TEST CRÉÉE AVEC SUCCÈS !");
    console.log("=".repeat(70) + "\n");

    console.log("📋 RÉSUMÉ:");
    console.log(`   • ID: ${booking.id}`);
    console.log(`   • Numéro: #${booking.bookingNumber}`);
    console.log(`   • Email: ${booking.clientEmail}`);
    console.log(`   • Montant: ${booking.amount.toFixed(2)} CHF`);
    console.log(
      `   • Options enrichies: ${Object.keys(selectedPricingOptions).length}`
    );
    console.log(`   • Format enrichi: ${isEnriched ? "✅ OUI" : "❌ NON"}\n`);

    console.log("🔗 VÉRIFICATIONS À FAIRE:");
    console.log(
      `   [ ] Admin: http://localhost:3000/admin/${establishment.slug}`
    );
    console.log(
      `   [ ] Modal détails → Les noms des options s'affichent correctement`
    );
    console.log(
      `   [ ] Fiche réception → Les options sont détaillées ligne par ligne`
    );
    console.log(
      `   [ ] Facture PDF: http://localhost:3000/invoice/${booking.id}`
    );
    console.log(
      `   [ ] Facture PDF → Les options s'affichent avec leurs noms\n`
    );

    console.log("💡 Commande pour supprimer cette réservation:");
    console.log(
      `   npx prisma studio (puis recherchez #${booking.bookingNumber})\n`
    );
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
testBookingWithEnrichedOptions().catch((error) => {
  console.error(error);
  process.exit(1);
});
