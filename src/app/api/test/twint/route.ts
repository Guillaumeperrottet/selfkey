import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

/**
 * Endpoint pour tester la configuration TWINT
 */
export async function GET() {
  try {
    console.log("Test configuration TWINT...");

    // Tester la création d'un PaymentIntent avec TWINT
    const testPaymentIntent = await stripe.paymentIntents.create({
      amount: 100, // 1 CHF
      currency: "chf",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "always",
      },
      metadata: {
        test: "twint_configuration",
      },
    });

    // Vérifier les comptes Connect avec TWINT
    const establishments = await prisma.establishment.findMany({
      where: {
        stripeAccountId: { not: null },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        stripeAccountId: true,
      },
    });

    const accountChecks = [];
    for (const establishment of establishments.slice(0, 3)) {
      if (establishment.stripeAccountId) {
        try {
          const account = await stripe.accounts.retrieve(
            establishment.stripeAccountId
          );
          accountChecks.push({
            hotel: establishment.name,
            accountId: establishment.stripeAccountId,
            twintEnabled: account.capabilities?.twint_payments === "active",
            cardEnabled: account.capabilities?.card_payments === "active",
            chargesEnabled: account.charges_enabled,
          });
        } catch (error) {
          accountChecks.push({
            hotel: establishment.name,
            accountId: establishment.stripeAccountId,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      twintAvailable: true,
      testPaymentIntentId: testPaymentIntent.id,
      testPaymentIntentStatus: testPaymentIntent.status,
      supportedPaymentMethods: testPaymentIntent.payment_method_types,
      accountChecks,
      message: "Configuration TWINT testée avec succès",
    });
  } catch (error) {
    console.error("Erreur test TWINT:", error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      message: "Erreur lors du test TWINT",
    });
  }
}

/**
 * Endpoint pour créer un PaymentIntent de test TWINT
 */
export async function POST(request: NextRequest) {
  try {
    const { amount = 100, currency = "chf" } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "always",
      },
      metadata: {
        test: "twint_payment_intent",
        created_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentMethodTypes: paymentIntent.payment_method_types,
      },
    });
  } catch (error) {
    console.error("Erreur création PaymentIntent test:", error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
}
