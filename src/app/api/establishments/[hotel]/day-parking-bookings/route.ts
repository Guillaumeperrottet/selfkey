import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaymentIntentWithCommission } from "@/lib/stripe-connect";
import { sendDayParkingConfirmation } from "@/lib/email";

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
      clientIdType,
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

    // Le parking jour n'utilise pas de "room" spécifique
    // C'est un parking ouvert sans limitation de places

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
          // Pas de roomId pour le parking jour - c'est un parking ouvert
          roomId: null,
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
          bookingType: "day_parking",
          dayParkingDuration,
          dayParkingStartTime: new Date(dayParkingStartTime),
          dayParkingEndTime: new Date(dayParkingEndTime),
          emailConfirmation,
        },
        select: {
          id: true,
          bookingNumber: true,
        },
      });

      console.log(
        "✅ Réservation parking jour créée en mode dev:",
        dayParkingBooking.id
      );

      // Envoie l'email de confirmation
      try {
        const dayParkingBookingData = {
          clientName: `${clientFirstName} ${clientLastName}`,
          clientEmail: clientEmail,
          vehicleNumber: clientVehicleNumber || "",
          duration: dayParkingDuration || "1h",
          startTime: new Date(dayParkingStartTime),
          endTime: new Date(dayParkingEndTime),
          amount,
          currency: "CHF",
          establishmentName: establishment.name,
          bookingId: dayParkingBooking.id,
          bookingNumber: dayParkingBooking.bookingNumber.toString(),
          hotelSlug: hotel, // Ajouter le hotelSlug manquant
        };

        await sendDayParkingConfirmation(dayParkingBookingData);
        console.log(
          "Email de confirmation envoyé pour la réservation:",
          dayParkingBooking.id
        );
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
        // On ne bloque pas la réservation même si l'email échoue
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
      0, // Pas de frais fixes pour parking jour
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
        client_id_type: clientIdType || "Carte d'identité",
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
