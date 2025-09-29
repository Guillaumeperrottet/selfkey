import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "PaymentIntent ID is required" },
        { status: 400 }
      );
    }

    console.log(
      `🔍 Récupération du Customer pour PaymentIntent: ${paymentIntentId}`
    );

    // Récupérer le PaymentIntent pour obtenir le Customer ID
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log("✅ Customer ID trouvé:", paymentIntent.customer);

    return NextResponse.json({
      customerId: paymentIntent.customer,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("❌ Erreur récupération Customer:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
