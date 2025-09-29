import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { type, billing_details, paymentIntentId } = await request.json();

    console.log("🔍 Création PaymentMethod avec Customer:", {
      type,
      paymentIntentId,
    });

    // Récupérer le PaymentIntent pour obtenir le Customer ID
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const customerId = paymentIntent.customer;

    if (!customerId) {
      throw new Error("Aucun Customer trouvé sur le PaymentIntent");
    }

    console.log("🔍 Customer ID trouvé:", customerId);

    // Créer le PaymentMethod avec le Customer attaché
    const paymentMethod = await stripe.paymentMethods.create({
      type: type,
      billing_details: billing_details,
      customer: customerId as string, // Attacher directement le Customer
    });

    console.log("✅ PaymentMethod créé avec Customer attaché:", {
      id: paymentMethod.id,
      type: paymentMethod.type,
      customer: paymentMethod.customer,
      billing_details: paymentMethod.billing_details,
    });

    return NextResponse.json({ paymentMethod });
  } catch (error) {
    console.error("❌ Erreur création PaymentMethod avec Customer:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
