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

    // Récupérer les détails complets du compte
    const account = await stripe.accounts.retrieve(accountId);

    // Récupérer les capabilities
    const capabilities = await stripe.accounts.listCapabilities(accountId);

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        type: account.type,
        country: account.country,
        default_currency: account.default_currency,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        requirements: account.requirements,
        business_profile: account.business_profile,
      },
      capabilities: capabilities.data,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du statut du compte:", error);

    return NextResponse.json(
      {
        error: "Erreur lors de la récupération du statut",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
