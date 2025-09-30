import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID est requis" },
        { status: 400 }
      );
    }

    console.log(
      `🔄 Tentative de réactivation forcée de TWINT pour ${accountId}`
    );

    // Étape 1: Désactiver TWINT (si possible)
    try {
      await stripe.accounts.updateCapability(accountId, "twint_payments", {
        requested: false,
      });
      console.log("✅ TWINT désactivé");
    } catch {
      console.log("⚠️ Impossible de désactiver TWINT (déjà inactif)");
    }

    // Attendre un peu
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Étape 2: Réactiver TWINT
    const capability = await stripe.accounts.updateCapability(
      accountId,
      "twint_payments",
      {
        requested: true,
      }
    );

    console.log("✅ TWINT réactivé:", capability.status);

    return NextResponse.json({
      success: true,
      capability,
      message: `TWINT réactivé avec le statut: ${capability.status}`,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la réactivation forcée:", error);

    return NextResponse.json(
      {
        error: "Erreur lors de la réactivation",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
