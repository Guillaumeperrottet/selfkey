import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { type, billing_details } = await request.json();

    console.log("🔍 Création PaymentMethod:", { type, billing_details });

    const paymentMethod = await stripe.paymentMethods.create({
      type: type,
      billing_details: billing_details,
    });

    console.log("✅ PaymentMethod créé côté serveur:", {
      id: paymentMethod.id,
      type: paymentMethod.type,
      billing_details: paymentMethod.billing_details,
    });

    return NextResponse.json({ paymentMethod });
  } catch (error) {
    console.error("❌ Erreur création PaymentMethod côté serveur:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
