import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

/**
 * API pour récupérer les détails d'un PaymentIntent et diagnostiquer les échecs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "paymentIntentId requis" },
        { status: 400 }
      );
    }

    // Récupérer le PaymentIntent avec tous les détails
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: ["latest_charge", "latest_charge.balance_transaction"],
      }
    );

    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      payment_method_types: paymentIntent.payment_method_types,
      last_payment_error: paymentIntent.last_payment_error,
      cancellation_reason: paymentIntent.cancellation_reason,
      latest_charge:
        paymentIntent.latest_charge &&
        typeof paymentIntent.latest_charge === "object"
          ? {
              id: paymentIntent.latest_charge.id,
              status: paymentIntent.latest_charge.status,
              failure_code: paymentIntent.latest_charge.failure_code,
              failure_message: paymentIntent.latest_charge.failure_message,
              outcome: paymentIntent.latest_charge.outcome,
            }
          : null,
      created: paymentIntent.created,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du PaymentIntent:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Erreur serveur",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Erreur inconnue" }, { status: 500 });
  }
}
