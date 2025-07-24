import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaymentIntentWithCommission } from "@/lib/stripe-connect";

interface Props {
  params: Promise<{ hotel: string }>;
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { hotel } = await params;
    const body = await request.json();

    const {
      clientFirstName,
      clientLastName,
      clientEmail,
      clientPhone,
      clientVehicleNumber,
      clientBirthDate,
      clientAddress,
      clientPostalCode,
      clientCity,
      clientCountry,
      clientIdNumber,
      bookingType,
      dayParkingDuration,
      dayParkingStartTime,
      dayParkingEndTime,
      amount,
      adults,
      children,
      emailConfirmation = true,
    } = body;

    // Validation des données obligatoires
    if (
      !clientFirstName ||
      !clientLastName ||
      !clientEmail ||
      !clientPhone ||
      !bookingType ||
      !dayParkingDuration ||
      !dayParkingStartTime ||
      !dayParkingEndTime ||
      typeof amount !== "number" ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: "Données manquantes ou invalides" },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe et a le parking jour activé
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: {
        id: true,
        name: true,
        stripeAccountId: true,
        commissionRate: true,
        dayParkingCommissionRate: true,
        fixedFee: true,
        enableDayParking: true,
        dayParkingTarif1h: true,
        dayParkingTarif2h: true,
        dayParkingTarif3h: true,
        dayParkingTarif4h: true,
        dayParkingTarifHalfDay: true,
        dayParkingTarifFullDay: true,
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    if (!establishment.enableDayParking) {
      return NextResponse.json(
        { error: "Le parking jour n'est pas activé pour cet établissement" },
        { status: 400 }
      );
    }

    // Vérifier que Stripe est configuré
    if (!establishment.stripeAccountId) {
      return NextResponse.json(
        { error: "Paiements non configurés pour cet établissement" },
        { status: 503 }
      );
    }

    // Valider le tarif selon la durée
    const expectedPrices = {
      "1h": establishment.dayParkingTarif1h,
      "2h": establishment.dayParkingTarif2h,
      "3h": establishment.dayParkingTarif3h,
      "4h": establishment.dayParkingTarif4h,
      half_day: establishment.dayParkingTarifHalfDay,
      full_day: establishment.dayParkingTarifFullDay,
    };

    const expectedPrice =
      expectedPrices[dayParkingDuration as keyof typeof expectedPrices];
    if (!expectedPrice || amount !== expectedPrice) {
      return NextResponse.json(
        {
          error: "Prix incorrect pour cette durée",
          expected: expectedPrice,
          received: amount,
        },
        { status: 400 }
      );
    }

    // Créer une place temporaire pour le parking jour
    // On utilisera la première place disponible ou en créera une spécifique
    let room = await prisma.room.findFirst({
      where: {
        hotelSlug: hotel,
        isActive: true,
      },
    });

    // Si aucune place n'existe, créer une place parking par défaut
    if (!room) {
      room = await prisma.room.create({
        data: {
          hotelSlug: hotel,
          name: "Place de parking",
          price: 0, // Prix géré par le système de parking jour
          isActive: true,
        },
      });
    }

    // Calculer les commissions (utiliser le taux spécifique pour parking jour)
    const platformCommission = Math.round(
      (amount * establishment.dayParkingCommissionRate) / 100
    ); // Pas de frais fixes pour parking jour, seulement commission spécifique
    const ownerAmount = amount - platformCommission;

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        hotelSlug: hotel,
        roomId: room.id,
        // Informations client
        clientFirstName,
        clientLastName,
        clientEmail,
        clientPhone,
        clientBirthDate: new Date(clientBirthDate),
        clientAddress,
        clientPostalCode,
        clientCity,
        clientCountry,
        clientIdNumber,
        clientVehicleNumber: clientVehicleNumber || "Non renseigné",
        clientBirthPlace: "Non requis pour parking jour",
        // Configuration parking jour
        bookingType,
        dayParkingDuration,
        dayParkingStartTime: new Date(dayParkingStartTime),
        dayParkingEndTime: new Date(dayParkingEndTime),
        // Dates par défaut (utilisées pour compatibilité)
        checkInDate: new Date(dayParkingStartTime),
        checkOutDate: new Date(dayParkingEndTime),
        // Montants
        amount,
        platformCommission,
        ownerAmount,
        guests: adults + children,
        adults,
        children,
        // Options de prix (vide pour parking jour)
        selectedPricingOptions: {},
        pricingOptionsTotal: 0,
        // Configuration de confirmation
        emailConfirmation,
      },
    });

    // Créer le Payment Intent Stripe avec commission uniquement
    const paymentIntent = await createPaymentIntentWithCommission(
      amount,
      "chf",
      establishment.stripeAccountId,
      establishment.commissionRate,
      0 // Pas de frais fixes pour parking jour
    );

    // Mettre à jour la réservation avec l'ID du PaymentIntent
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        amount: booking.amount,
        dayParkingDuration: booking.dayParkingDuration,
        dayParkingStartTime: booking.dayParkingStartTime,
        dayParkingEndTime: booking.dayParkingEndTime,
      },
      payment: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création de la réservation parking jour:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
