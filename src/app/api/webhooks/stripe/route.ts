import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendDayParkingConfirmation } from "@/lib/email";
import { stripe, stripeWebhookSecret } from "@/lib/stripe";

const endpointSecret = stripeWebhookSecret!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
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
    console.log("📋 Metadata:", JSON.stringify(paymentIntent.metadata, null, 2));
    console.log("🔍 Booking type check:", paymentIntent.metadata.booking_type);

    // Vérifier si c'est un parking jour (nouvelle logique avec métadonnées)
    if (paymentIntent.metadata.booking_type === "day_parking") {
      console.log("🚗 Detected day parking booking, creating reservation...");
      await createDayParkingBookingFromMetadata(paymentIntent);
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

    // Récupérer ou créer une place de parking
    let room = await prisma.room.findFirst({
      where: {
        hotelSlug: establishment.slug,
        isActive: true,
      },
    });

    if (!room) {
      room = await prisma.room.create({
        data: {
          hotelSlug: establishment.slug,
          name: "Place de parking",
          price: 0,
          isActive: true,
        },
      });
    }

    // Créer la réservation parking jour
    const booking = await prisma.booking.create({
      data: {
        hotelSlug: establishment.slug,
        roomId: room.id,
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
