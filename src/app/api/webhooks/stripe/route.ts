import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendDayParkingConfirmation } from "@/lib/email";
import { stripe, stripeWebhookSecret } from "@/lib/stripe";

const endpointSecret = stripeWebhookSecret!;

export async function POST(request: NextRequest) {
  console.log("🔗 Webhook Stripe reçu !");
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ Pas de signature Stripe dans le webhook");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    console.log("✅ Webhook vérifié, type d'événement:", event.type);
  } catch (err) {
    console.error("❌ Erreur de vérification du webhook:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Gestion des événements selon la doc Stripe Connect
  switch (event.type) {
    case "account.updated":
      await handleAccountUpdated(event.data.object as Stripe.Account);
      break;

    case "account.application.deauthorized":
      await handleAccountDeauthorized(
        event.data.object as unknown as { account: string }
      );
      break;

    case "payment_intent.succeeded":
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleAccountUpdated(account: Stripe.Account) {
  try {
    // Mettre à jour le statut d'onboarding dans la base de données
    await prisma.establishment.updateMany({
      where: { stripeAccountId: account.id },
      data: {
        stripeOnboarded: account.charges_enabled && account.details_submitted,
      },
    });

    console.log(
      `Account ${account.id} updated - charges_enabled: ${account.charges_enabled}`
    );
  } catch (error) {
    console.error("Error updating account status:", error);
  }
}

async function handleAccountDeauthorized(data: { account: string }) {
  try {
    // Supprimer l'association du compte Stripe
    await prisma.establishment.updateMany({
      where: { stripeAccountId: data.account },
      data: {
        stripeAccountId: null,
        stripeOnboarded: false,
      },
    });

    console.log(`Account ${data.account} deauthorized`);
  } catch (error) {
    console.error("Error handling account deauthorization:", error);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`🎉 Payment succeeded for PaymentIntent: ${paymentIntent.id}`);
    console.log(
      "📋 Metadata:",
      JSON.stringify(paymentIntent.metadata, null, 2)
    );
    console.log("🔍 Booking type check:", paymentIntent.metadata.booking_type);

    // Vérifier si c'est un parking jour (nouvelle logique avec métadonnées)
    if (paymentIntent.metadata.booking_type === "day_parking") {
      console.log("🚗 Detected day parking booking, creating reservation...");
      await createDayParkingBookingFromMetadata(paymentIntent);
      return;
    }

    // Vérifier si c'est un parking nuit (nouvelle logique avec métadonnées)
    if (paymentIntent.metadata.booking_type === "night_parking") {
      console.log("🏨 Detected night parking booking, creating reservation...");
      await createNightParkingBookingFromMetadata(paymentIntent);
      return;
    }

    // Vérifier si c'est une réservation classique (hôtel/chambre)
    if (paymentIntent.metadata.booking_type === "classic_booking") {
      console.log(
        "🏨 Detected classic booking (hotel), creating reservation..."
      );
      await createClassicBookingFromMetadata(paymentIntent);
      return;
    }

    // Logique existante pour les réservations classiques
    await prisma.booking.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: "succeeded",
      },
    });

    console.log(`Payment succeeded for existing booking: ${paymentIntent.id}`);
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Mettre à jour la réservation comme échec de paiement
    const updatedBookings = await prisma.booking.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: "failed",
      },
    });

    console.log(`Payment failed for PaymentIntent: ${paymentIntent.id}`);

    // Optionnel : Supprimer les réservations échouées après 24h pour libérer les chambres
    // Cela peut être fait par un job CRON séparé, mais on peut aussi le faire ici
    if (updatedBookings.count > 0) {
      console.log(
        `🧹 Scheduling cleanup for failed payment: ${paymentIntent.id}`
      );
    }
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

async function createDayParkingBookingFromMetadata(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    console.log("🚗 Creating day parking booking from metadata...");
    const metadata = paymentIntent.metadata;
    console.log("📋 Metadata details:", JSON.stringify(metadata, null, 2));

    // Récupérer l'établissement
    console.log("🏨 Looking for establishment:", metadata.establishment_id);
    const establishment = await prisma.establishment.findUnique({
      where: { id: metadata.establishment_id },
    });

    if (!establishment) {
      console.error("❌ Establishment not found:", metadata.establishment_id);
      throw new Error(`Establishment not found: ${metadata.establishment_id}`);
    }

    console.log("✅ Establishment found:", establishment.name);

    // Le parking jour n'utilise pas de room - c'est un parking ouvert

    // Créer la réservation parking jour
    const booking = await prisma.booking.create({
      data: {
        hotelSlug: establishment.slug,
        roomId: null, // Pas de room pour le parking jour
        clientFirstName: metadata.client_first_name,
        clientLastName: metadata.client_last_name,
        clientEmail: metadata.client_email,
        clientPhone: metadata.client_phone,
        clientVehicleNumber: metadata.client_vehicle_number || undefined,
        clientBirthDate: metadata.client_birth_date
          ? new Date(metadata.client_birth_date)
          : new Date("1990-01-01"),
        clientAddress: metadata.client_address || "Non renseigné",
        clientPostalCode: metadata.client_postal_code || "0000",
        clientCity: metadata.client_city || "Non renseigné",
        clientCountry: metadata.client_country || "Suisse",
        clientIdNumber: metadata.client_id_number || "Non renseigné",
        bookingType: "day_parking",
        dayParkingDuration: metadata.day_parking_duration,
        dayParkingStartTime: metadata.day_parking_start_time,
        dayParkingEndTime: metadata.day_parking_end_time,
        amount: parseFloat(metadata.amount),
        ownerAmount: parseFloat(metadata.amount), // Pour parking jour, tout va au propriétaire (commission gérée par Stripe Connect)
        adults: parseInt(metadata.adults) || 1,
        children: parseInt(metadata.children) || 0,
        paymentStatus: "succeeded",
        stripePaymentIntentId: paymentIntent.id,
        checkInDate: new Date(), // Date actuelle pour parking jour
        checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h par défaut
      },
      select: {
        id: true,
        bookingNumber: true,
      },
    });

    console.log(
      `Day parking booking created: ${booking.id} for PaymentIntent: ${paymentIntent.id}`
    );

    // Envoyer l'email de confirmation si demandé
    if (metadata.email_confirmation === "true") {
      try {
        console.log("📧 Envoi de l'email de confirmation...");

        const dayParkingBookingData = {
          clientName: `${metadata.client_first_name} ${metadata.client_last_name}`,
          clientEmail: metadata.client_email,
          vehicleNumber: metadata.client_vehicle_number || "",
          duration: metadata.day_parking_duration || "1h",
          startTime: new Date(metadata.day_parking_start_time),
          endTime: new Date(metadata.day_parking_end_time),
          amount: parseFloat(metadata.amount),
          currency: "CHF",
          establishmentName: establishment.name,
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber.toString(),
          hotelSlug: metadata.hotel_slug, // Ajouté pour le lien d'extension
        };

        await sendDayParkingConfirmation(dayParkingBookingData);
        console.log("✅ Email de confirmation envoyé automatiquement");
      } catch (emailError) {
        console.error(
          "❌ Erreur lors de l'envoi de l'email de confirmation:",
          emailError
        );
        // Ne pas faire échouer la création de la réservation si l'email échoue
      }
    }
  } catch (error) {
    console.error("Error creating day parking booking from metadata:", error);
    throw error;
  }
}

async function createNightParkingBookingFromMetadata(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    console.log("🏨 Creating night parking booking from metadata...");
    const metadata = paymentIntent.metadata;
    console.log("📋 Metadata details:", JSON.stringify(metadata, null, 2));

    // Récupérer l'établissement
    console.log("🏨 Looking for establishment:", metadata.establishment_id);
    const establishment = await prisma.establishment.findUnique({
      where: { id: metadata.establishment_id },
    });

    if (!establishment) {
      console.error("❌ Establishment not found:", metadata.establishment_id);
      throw new Error(`Establishment not found: ${metadata.establishment_id}`);
    }

    console.log("✅ Establishment found:", establishment.name);

    // Vérifier que la chambre existe toujours
    const room = await prisma.room.findFirst({
      where: {
        id: metadata.room_id,
        hotelSlug: metadata.hotel_slug,
        isActive: true,
      },
    });

    if (!room) {
      console.error("❌ Room not found or inactive:", metadata.room_id);
      throw new Error(`Room not found or inactive: ${metadata.room_id}`);
    }

    console.log("✅ Room found:", room.name);

    // Créer la réservation nuit
    const booking = await prisma.booking.create({
      data: {
        hotelSlug: metadata.hotel_slug,
        roomId: metadata.room_id,
        clientFirstName: metadata.client_first_name,
        clientLastName: metadata.client_last_name,
        clientEmail: metadata.client_email,
        clientPhone: metadata.client_phone,
        clientBirthDate: new Date(metadata.client_birth_date),
        clientBirthPlace: metadata.client_birth_place || undefined,
        clientAddress: metadata.client_address,
        clientPostalCode: metadata.client_postal_code,
        clientCity: metadata.client_city,
        clientCountry: metadata.client_country,
        clientIdNumber: metadata.client_id_number,
        clientVehicleNumber: metadata.client_vehicle_number || undefined,
        checkInDate: new Date(metadata.check_in_date),
        checkOutDate: new Date(metadata.check_out_date),
        guests: parseInt(metadata.guests),
        adults: parseInt(metadata.adults),
        children: parseInt(metadata.children),
        amount: parseFloat(metadata.amount),
        platformCommission: parseFloat(metadata.platform_commission),
        ownerAmount: parseFloat(metadata.owner_amount),
        selectedPricingOptions: JSON.parse(metadata.selected_pricing_options),
        pricingOptionsTotal: parseFloat(metadata.pricing_options_total),
        paymentStatus: "succeeded",
        stripePaymentIntentId: paymentIntent.id,
        bookingType: "night_parking", // ou null selon votre schéma
        hasDog: metadata.has_dog === "true", // Ajout de hasDog depuis les metadata
      },
      select: {
        id: true,
        bookingNumber: true,
      },
    });

    console.log(
      `Night parking booking created: ${booking.id} for PaymentIntent: ${paymentIntent.id}`
    );

    // TODO: Envoyer l'email de confirmation pour parking nuit si nécessaire
    // Cette logique peut être ajoutée plus tard si besoin
  } catch (error) {
    console.error("Error creating night parking booking from metadata:", error);
    throw error;
  }
}

async function createClassicBookingFromMetadata(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    console.log("🏨 Creating classic booking (hotel) from metadata...");
    const metadata = paymentIntent.metadata;
    console.log("📋 Metadata details:", JSON.stringify(metadata, null, 2));

    // Récupérer l'établissement
    console.log("🏨 Looking for establishment:", metadata.establishment_id);
    const establishment = await prisma.establishment.findUnique({
      where: { id: metadata.establishment_id },
    });

    if (!establishment) {
      console.error("❌ Establishment not found:", metadata.establishment_id);
      throw new Error(`Establishment not found: ${metadata.establishment_id}`);
    }

    console.log("✅ Establishment found:", establishment.name);

    // Vérifier que la chambre existe toujours
    const room = await prisma.room.findFirst({
      where: {
        id: metadata.room_id,
        hotelSlug: metadata.hotel_slug,
        isActive: true,
      },
    });

    if (!room) {
      console.error("❌ Room not found or inactive:", metadata.room_id);
      throw new Error(`Room not found or inactive: ${metadata.room_id}`);
    }

    console.log("✅ Room found:", room.name);

    // Créer la réservation classique (hôtel)
    const booking = await prisma.booking.create({
      data: {
        hotelSlug: metadata.hotel_slug,
        roomId: metadata.room_id,
        clientFirstName: metadata.client_first_name,
        clientLastName: metadata.client_last_name,
        clientEmail: metadata.client_email,
        clientPhone: metadata.client_phone,
        clientBirthDate: new Date(metadata.client_birth_date),
        clientBirthPlace: metadata.client_birth_place || undefined,
        clientAddress: metadata.client_address,
        clientPostalCode: metadata.client_postal_code,
        clientCity: metadata.client_city,
        clientCountry: metadata.client_country,
        clientIdNumber: metadata.client_id_number,
        clientVehicleNumber: metadata.client_vehicle_number || undefined,
        checkInDate: new Date(metadata.check_in_date),
        checkOutDate: new Date(metadata.check_out_date),
        guests: parseInt(metadata.guests),
        adults: parseInt(metadata.adults),
        children: parseInt(metadata.children),
        amount: parseFloat(metadata.amount),
        platformCommission: parseFloat(metadata.platform_commission),
        ownerAmount: parseFloat(metadata.owner_amount),
        selectedPricingOptions: JSON.parse(metadata.selected_pricing_options),
        pricingOptionsTotal: parseFloat(metadata.pricing_options_total),
        touristTaxTotal: parseFloat(metadata.tourist_tax_total || "0"),
        paymentStatus: "succeeded",
        stripePaymentIntentId: paymentIntent.id,
        bookingType: "classic_booking", // Type payment-first pour réservations classiques
        hasDog: metadata.has_dog === "true", // Ajout de hasDog depuis les metadata
      },
      select: {
        id: true,
        bookingNumber: true,
      },
    });

    console.log(
      `Classic booking created: ${booking.id} for PaymentIntent: ${paymentIntent.id}`
    );

    // TODO: Envoyer l'email de confirmation pour réservation classique si nécessaire
    // Cette logique peut être ajoutée plus tard si besoin
  } catch (error) {
    console.error("Error creating classic booking from metadata:", error);
    throw error;
  }
}
