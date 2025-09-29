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

    // ÉTAPE 1: Créer le PaymentMethod sans Customer
    const paymentMethod = await stripe.paymentMethods.create({
      type: type,
      billing_details: billing_details,
    });

    console.log("✅ PaymentMethod créé:", paymentMethod.id);

    // ÉTAPE 2: Attacher le PaymentMethod au Customer
    const attachedPaymentMethod = await stripe.paymentMethods.attach(
      paymentMethod.id,
      { customer: customerId as string }
    );

    console.log("✅ PaymentMethod attaché au Customer:", {
      id: attachedPaymentMethod.id,
      type: attachedPaymentMethod.type,
      customer: attachedPaymentMethod.customer,
      billing_details: attachedPaymentMethod.billing_details,
    });

    return NextResponse.json({ paymentMethod: attachedPaymentMethod });
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
