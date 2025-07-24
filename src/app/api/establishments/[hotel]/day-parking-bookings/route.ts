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

    // Vérifier que Stripe est configuré (sauf en mode développement)
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!establishment.stripeAccountId && !isDevelopment) {
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

    // Mode développement : simuler un PaymentIntent ET créer la réservation
    if (isDevelopment) {
      console.log(
        "🧪 Mode développement : simulation du PaymentIntent + création de la réservation"
      );

      const fakePaymentIntent = {
        id: `pi_dev_${Date.now()}`,
        client_secret: `pi_dev_${Date.now()}_secret_dev`,
        amount_received: amount * 100, // Stripe utilise les centimes
        currency: "chf",
      };

      // Créer la réservation parking jour même en mode dev pour tester le flow complet
      const dayParkingBooking = await prisma.booking.create({
        data: {
          hotelSlug: hotel,
          roomId: room.id,
          clientFirstName,
          clientLastName,
          clientEmail,
          clientPhone,
          clientVehicleNumber: clientVehicleNumber || "",
          clientBirthDate: clientBirthDate
            ? new Date(clientBirthDate)
            : new Date(),
          clientAddress: clientAddress || "",
          clientPostalCode: clientPostalCode || "",
          clientCity: clientCity || "",
          clientCountry: clientCountry || "",
          clientIdNumber: clientIdNumber || "",
          amount,
          currency: "CHF",
          platformCommission:
            (amount * (establishment.dayParkingCommissionRate || 5)) / 100,
          ownerAmount:
            amount -
            (amount * (establishment.dayParkingCommissionRate || 5)) / 100,
          checkInDate: new Date(dayParkingStartTime),
          checkOutDate: new Date(dayParkingEndTime),
          stripePaymentIntentId: fakePaymentIntent.id,
          paymentStatus: "succeeded", // Marquer comme payé en mode dev
          adults: adults || 1,
          children: children || 0,
          bookingType: "day",
          dayParkingDuration,
          dayParkingStartTime: new Date(dayParkingStartTime),
          dayParkingEndTime: new Date(dayParkingEndTime),
          emailConfirmation,
        },
      });

      console.log(
        "✅ Réservation parking jour créée en mode dev:",
        dayParkingBooking.id
      );

      // En mode développement, envoyer l'email de confirmation directement
      if (emailConfirmation) {
        try {
          console.log("📧 Envoi de l'email de confirmation en mode dev...");

          // Ici vous pouvez ajouter l'envoi d'email
          // Pour l'instant, on log juste qu'il devrait être envoyé
          console.log(
            "📧 Email de confirmation devrait être envoyé à:",
            clientEmail
          );
        } catch (emailError) {
          console.error("❌ Erreur envoi email en mode dev:", emailError);
        }
      }

      return NextResponse.json({
        success: true,
        payment: {
          clientSecret: fakePaymentIntent.client_secret,
          paymentIntentId: fakePaymentIntent.id,
          amount: amount,
          dayParkingDuration: dayParkingDuration,
          dayParkingStartTime: dayParkingStartTime,
          dayParkingEndTime: dayParkingEndTime,
        },
        message: "PaymentIntent simulé créé pour le développement.",
        isDevelopment: true,
        bookingId: dayParkingBooking.id,
      });
    }

    // Mode production : créer un vrai PaymentIntent
    const paymentIntent = await createPaymentIntentWithCommission(
      amount,
      "CHF",
      establishment.stripeAccountId!,
      establishment.dayParkingCommissionRate || 5,
      establishment.fixedFee || 0.5,
      {
        // Stocker les données de réservation pour création après paiement
        booking_type: "day_parking",
        establishment_id: establishment.id,
        client_first_name: clientFirstName,
        client_last_name: clientLastName,
        client_email: clientEmail,
        client_phone: clientPhone,
        client_vehicle_number: clientVehicleNumber || "",
        day_parking_duration: dayParkingDuration,
        day_parking_start_time: dayParkingStartTime,
        day_parking_end_time: dayParkingEndTime,
        amount: amount.toString(),
        adults: adults?.toString() || "1",
        children: children?.toString() || "0",
        client_birth_date: clientBirthDate || "",
        client_address: clientAddress || "",
        client_postal_code: clientPostalCode || "",
        client_city: clientCity || "",
        client_country: clientCountry || "",
        client_id_number: clientIdNumber || "",
        email_confirmation: emailConfirmation ? "true" : "false",
      }
    );

    // Retourner seulement le PaymentIntent - la réservation sera créée au webhook
    return NextResponse.json({
      success: true,
      payment: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        dayParkingDuration: dayParkingDuration,
        dayParkingStartTime: dayParkingStartTime,
        dayParkingEndTime: dayParkingEndTime,
      },
      message:
        "PaymentIntent créé. La réservation sera confirmée après paiement.",
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
