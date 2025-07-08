import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

/**
 * Test simple de création de compte Connect
 */
export async function POST() {
  try {
    console.log("Test création compte Connect...");

    const account = await stripe.accounts.create({
      type: "express",
      country: "CH",
      email: "test@example.com",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    console.log("Compte créé avec succès:", account.id);

    // Nettoyer le compte test
    await stripe.accounts.del(account.id);

    return NextResponse.json({
      success: true,
      message: "Stripe Connect fonctionne correctement",
      accountId: account.id,
    });
  } catch (error) {
    console.error("Erreur test Connect:", error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      type:
        error instanceof Error && "type" in error
          ? (error as { type: string }).type
          : undefined,
    });
  }
}
