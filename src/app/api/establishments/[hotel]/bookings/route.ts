import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateBookingDates,
  checkRoomAvailability,
  calculateStayDuration,
} from "@/lib/availability";
import { createPaymentIntentWithCommission } from "@/lib/stripe-connect";
import {
  getTouristTaxSettings,
  calculateTouristTax,
} from "@/lib/fee-calculator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;
    const body = await request.json();
    const {
      roomId,
      checkInDate,
      checkOutDate,
      adults,
      children,
      clientFirstName,
      clientLastName,
      clientEmail,
      clientPhone,
      clientBirthDate,
      clientBirthPlace,
      clientAddress,
      clientPostalCode,
      clientCity,
      clientCountry,
      clientIdNumber,
      clientIdType,
      clientVehicleNumber,
      expectedPrice,
      selectedPricingOptions,
      hasDog, // Ajout du champ hasDog
    } = body;

    // Validation des données
    if (
      !roomId ||
      !checkInDate ||
      !checkOutDate ||
      !clientFirstName ||
      !clientLastName ||
      !clientEmail ||
      !clientPhone ||
      !clientBirthDate ||
      !clientAddress ||
      !clientPostalCode ||
      !clientCity ||
      !clientCountry ||
      !clientIdNumber ||
      !clientVehicleNumber ||
      typeof expectedPrice !== "number" ||
      typeof adults !== "number" ||
      typeof children !== "number" ||
      adults < 1 ||
      children < 0
    ) {
      return NextResponse.json(
        { error: "Données manquantes ou invalides" },
        { status: 400 }
      );
    }

    // Vérifier que l'hôtel existe
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: {
        id: true,
        name: true,
        maxBookingDays: true,
        stripeAccountId: true,
        commissionRate: true,
        fixedFee: true,
      },
    });

    if (!establishment) {
      return NextResponse.json({ error: "Hôtel non trouvé" }, { status: 404 });
    }

    // Convertir les strings de dates en objets Date
    const checkInDateObj = new Date(checkInDate);
    const checkOutDateObj = new Date(checkOutDate);

    // Vérifier que les dates sont valides
    if (isNaN(checkInDateObj.getTime()) || isNaN(checkOutDateObj.getTime())) {
      return NextResponse.json({ error: "Dates invalides" }, { status: 400 });
    }

    // Valider les dates
    const validation = validateBookingDates(
      checkInDateObj,
      checkOutDateObj,
      establishment.maxBookingDays
    );

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Vérifier que la chambre existe
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        hotelSlug: hotel,
        isActive: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Chambre non trouvée" },
        { status: 404 }
      );
    }

    // Calculer le prix attendu
    const nights = Math.ceil(
      (checkOutDateObj.getTime() - checkInDateObj.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const basePrice = room.price * nights;

    // Valider les options de prix si présentes
    let validatedPricingOptionsTotal = 0;
    if (
      selectedPricingOptions &&
      Object.keys(selectedPricingOptions).length > 0
    ) {
      // Récupérer les options de prix actives
      const pricingOptions = await prisma.pricingOption.findMany({
        where: {
          establishment: {
            slug: hotel,
          },
          isActive: true,
        },
        include: {
          values: true,
        },
      });

      // Valider et calculer le total des options
      for (const option of pricingOptions) {
        const selectedValue = selectedPricingOptions[option.id];

        if (selectedValue) {
          if (Array.isArray(selectedValue)) {
            // Pour les checkboxes
            for (const valueId of selectedValue) {
              const value = option.values.find((v) => v.id === valueId);
              if (value) {
                validatedPricingOptionsTotal += value.priceModifier;
              }
            }
          } else {
            // Pour select et radio
            const value = option.values.find((v) => v.id === selectedValue);
            if (value) {
              validatedPricingOptionsTotal += value.priceModifier;
            }
          }
        } else if (option.isRequired) {
          return NextResponse.json(
            { error: `L'option "${option.name}" est obligatoire` },
            { status: 400 }
          );
        }
      }
    }

    // Calculer le nombre de nuits
    const numberOfNights = calculateStayDuration(
      checkInDateObj,
      checkOutDateObj
    );

    // Calculer la taxe de séjour (uniquement pour les adultes)
    const touristTaxSettings = await getTouristTaxSettings(hotel);
    const touristTaxCalculation = calculateTouristTax(
      adults, // Seulement les adultes (16+)
      numberOfNights, // Nombre de nuits
      touristTaxSettings.touristTaxAmount,
      touristTaxSettings.touristTaxEnabled
    );

    // Calculer les commissions de manière précise en travaillant en centimes
    // pour éviter les erreurs d'arrondi
    const calculatedPriceRappen = Math.round(
      (basePrice +
        validatedPricingOptionsTotal +
        touristTaxCalculation.totalTax) *
        100
    );
    const calculatedPrice = calculatedPriceRappen / 100;

    // Commission calculée en centimes pour plus de précision
    const commissionRappen = Math.round(
      (calculatedPriceRappen * establishment.commissionRate) / 100
    );
    const fixedFeeRappen = Math.round(establishment.fixedFee * 100);
    const platformCommissionRappen = commissionRappen + fixedFeeRappen;
    const platformCommission = platformCommissionRappen / 100;

    // Le prix final que paie le client inclut les frais de plateforme
    const finalPriceRappen = calculatedPriceRappen + platformCommissionRappen;
    const finalPrice = finalPriceRappen / 100;

    console.log("=== DEBUG PRICE CALCULATION ===");
    console.log("Base price (room * nights):", basePrice);
    console.log(
      "Validated pricing options total:",
      validatedPricingOptionsTotal
    );
    console.log("Tourist tax total:", touristTaxCalculation.totalTax);
    console.log("Calculated price (without platform fees):", calculatedPrice);
    console.log("Platform commission:", platformCommission);
    console.log("Final price (with platform fees):", finalPrice);
    console.log("Expected price (frontend):", expectedPrice);
    console.log("Selected pricing options:", selectedPricingOptions);
    console.log("==================================");

    // Vérifier que le prix correspond (avec tolérance pour les arrondis)
    const priceDifference = Math.abs(expectedPrice - calculatedPrice);
    const tolerance = 0.01; // Tolérance de 1 centime pour les arrondis

    if (priceDifference > tolerance) {
      return NextResponse.json(
        {
          error: "Prix incorrect",
          expected: calculatedPrice,
          received: expectedPrice,
          difference: priceDifference,
          breakdown: {
            basePrice,
            validatedPricingOptionsTotal,
            touristTaxTotal: touristTaxCalculation.totalTax,
            platformCommission,
            finalPrice,
          },
        },
        { status: 400 }
      );
    }

    // Vérifier la disponibilité de la chambre
    const availability = await checkRoomAvailability(
      roomId,
      checkInDateObj,
      checkOutDateObj
    );

    if (!availability.isAvailable) {
      return NextResponse.json(
        {
          error:
            "Cette chambre n'est plus disponible pour la période sélectionnée",
        },
        { status: 409 }
      );
    }

    // Vérifier que Stripe est configuré
    if (!establishment.stripeAccountId) {
      return NextResponse.json(
        { error: "Paiements non configurés pour cet établissement" },
        { status: 503 }
      );
    }

    // Le ownerAmount est basé sur le prix sans frais de plateforme
    const ownerAmount = calculatedPrice - platformCommission;

    // Créer le Payment Intent Stripe AVANT la réservation (pour éviter les réservations fantômes)
    // Le client paie le prix final (incluant les frais de plateforme)
    // Stocker toutes les données dans les metadata pour création après paiement
    const paymentIntent = await createPaymentIntentWithCommission(
      finalPrice, // Le client paie le prix final
      "chf", // Devise par défaut
      establishment.stripeAccountId,
      establishment.commissionRate,
      establishment.fixedFee,
      {
        // Distinguer du parking jour avec "classic_booking"
        booking_type: "classic_booking",
        establishment_id: establishment.id,
        hotel_slug: hotel,
        room_id: roomId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        client_first_name: clientFirstName,
        client_last_name: clientLastName,
        client_email: clientEmail,
        client_phone: clientPhone,
        client_birth_date: clientBirthDate,
        client_birth_place: clientBirthPlace || "",
        client_address: clientAddress,
        client_postal_code: clientPostalCode,
        client_city: clientCity,
        client_country: clientCountry,
        client_id_number: clientIdNumber,
        client_id_type: clientIdType || "Carte d'identité",
        client_vehicle_number: clientVehicleNumber,
        adults: adults.toString(),
        children: children.toString(),
        guests: (adults + children).toString(),
        amount: finalPrice.toString(),
        platform_commission: platformCommission.toString(),
        owner_amount: ownerAmount.toString(),
        selected_pricing_options: JSON.stringify(selectedPricingOptions || {}),
        pricing_options_total: validatedPricingOptionsTotal.toString(),
        tourist_tax_total: touristTaxCalculation.totalTax.toString(),
        has_dog: hasDog ? "true" : "false", // Ajout de hasDog dans les metadata
      }
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Erreur API booking:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
