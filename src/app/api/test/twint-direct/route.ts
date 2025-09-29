import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

/**
 * Test PaymentIntent DIRECT sur le compte Connect (sans commission)
 * pour voir si le problème vient des commissions
 */
export async function POST(request: NextRequest) {
  try {
    const {
      amount = 300,
      currency = "chf",
      accountId = "acct_1S3BpeA7TKdsLADt",
    } = await request.json();

    console.log("🧪 Test PaymentIntent DIRECT sur compte Connect:", {
      amount,
      currency,
      accountId,
    });

    // Créer PaymentIntent DIRECTEMENT sur le compte Connect (pas de commission)
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(amount),
        currency,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "always",
        },
        metadata: {
          test_type: "direct_connect_no_commission",
          account_id: accountId,
          created_at: new Date().toISOString(),
        },
      },
      {
        stripeAccount: accountId, // PaymentIntent créé sur le compte Connect
      }
    );

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentMethodTypes: paymentIntent.payment_method_types,
        setupMethod: "direct_on_connect_account",
      },
    });
  } catch (error) {
    console.error("Erreur test PaymentIntent direct:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
