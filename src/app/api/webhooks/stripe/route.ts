import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
    // Mettre à jour la réservation comme payée
    await prisma.booking.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        // Vous pouvez ajouter un champ status si nécessaire
      },
    });

    console.log(`Payment succeeded for PaymentIntent: ${paymentIntent.id}`);
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Gérer l'échec du paiement selon vos besoins
    console.log(`Payment failed for PaymentIntent: ${paymentIntent.id}`);

    // Vous pourriez envoyer un email de notification, logger l'échec, etc.
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}
