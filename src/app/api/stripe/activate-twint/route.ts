import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔧 Activation de TWINT pour le compte Connect: ${accountId}`);

    // Activer la capability twint_payments pour le compte Connect
    const capability = await stripe.accounts.updateCapability(
      accountId,
      "twint_payments",
      {
        requested: true,
      }
    );

    console.log("✅ TWINT capability activée:", {
      account: accountId,
      capability: capability.id,
      status: capability.status,
      requirements: capability.requirements,
    });

    return NextResponse.json({
      success: true,
      capability: capability,
      message: `TWINT capability ${capability.status} pour le compte ${accountId}`,
    });
  } catch (error) {
    console.error("❌ Erreur activation TWINT:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          details: "Erreur lors de l'activation de TWINT",
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
