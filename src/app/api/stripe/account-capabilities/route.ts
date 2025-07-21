import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialiser Stripe avec la clé secrète appropriée
const stripe = new Stripe(
  process.env.STRIPE_FORCE_TEST_MODE === "true" ||
  process.env.NODE_ENV !== "production"
    ? process.env.STRIPE_TEST_SECRET_KEY!
    : process.env.STRIPE_LIVE_SECRET_KEY!
);

/**
 * API pour vérifier les méthodes de paiement disponibles pour un compte
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "accountId requis" }, { status: 400 });
    }

    // Récupérer les informations du compte Connect
    const account = await stripe.accounts.retrieve(accountId);

    // Récupérer les capabilities (capacités de paiement)
    const capabilities = account.capabilities || {};

    return NextResponse.json({
      accountId,
      country: account.country,
      capabilities: {
        card_payments: capabilities.card_payments,
        transfers: capabilities.transfers,
        twint_payments: capabilities.twint_payments,
      },
      payouts_enabled: account.payouts_enabled,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification des capabilities:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
