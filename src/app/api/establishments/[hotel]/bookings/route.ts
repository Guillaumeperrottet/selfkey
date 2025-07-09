import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateBookingDates,
  checkRoomAvailability,
} from "@/lib/availability";
import { createPaymentIntentWithCommission } from "@/lib/stripe-connect";

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
      clientVehicleNumber,
      expectedPrice,
      selectedPricingOptions,
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
      !clientBirthPlace ||
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

    const calculatedPrice = basePrice + validatedPricingOptionsTotal;

    // Vérifier que le prix correspond
    if (expectedPrice !== calculatedPrice) {
      return NextResponse.json(
        {
          error: "Prix incorrect",
          expected: calculatedPrice,
          received: expectedPrice,
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

    // Calculer les commissions
    const platformCommission = Math.round(
      (calculatedPrice * establishment.commissionRate) / 100 +
        establishment.fixedFee
    );
    const ownerAmount = calculatedPrice - platformCommission;

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        hotelSlug: hotel,
        roomId,
        checkInDate: checkInDateObj,
        checkOutDate: checkOutDateObj,
        clientFirstName,
        clientLastName,
        clientEmail,
        clientPhone,
        clientBirthDate: new Date(clientBirthDate),
        clientBirthPlace,
        clientAddress,
        clientPostalCode,
        clientCity,
        clientCountry,
        clientIdNumber,
        clientVehicleNumber,
        guests: adults + children, // Total des invités pour compatibilité
        adults,
        children,
        amount: calculatedPrice,
        platformCommission,
        ownerAmount,
        selectedPricingOptions: selectedPricingOptions || {},
        pricingOptionsTotal: validatedPricingOptionsTotal,
      },
    });

    // Créer le Payment Intent Stripe
    const paymentIntent = await createPaymentIntentWithCommission(
      calculatedPrice,
      "chf", // Devise par défaut
      establishment.stripeAccountId,
      establishment.commissionRate,
      establishment.fixedFee
    );

    // Mettre à jour la réservation avec l'ID du PaymentIntent
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      bookingId: booking.id,
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
