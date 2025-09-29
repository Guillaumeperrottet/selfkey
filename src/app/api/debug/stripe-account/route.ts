import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

/**
 * API pour diagnostiquer en détail un compte Stripe Connect
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "accountId requis" }, { status: 400 });
    }

    // Récupérer tous les détails du compte
    const account = await stripe.accounts.retrieve(accountId);

    // Informations détaillées pour diagnostic Twint
    const accountInfo = {
      id: account.id,
      country: account.country,
      business_type: account.business_type,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      payouts_enabled: account.payouts_enabled,

      // Capacités de paiement
      capabilities: {
        card_payments: account.capabilities?.card_payments,
        twint_payments: account.capabilities?.twint_payments,
        transfers: account.capabilities?.transfers,
      },

      // Exigences en attente
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        past_due: account.requirements?.past_due || [],
        pending_verification: account.requirements?.pending_verification || [],
        disabled_reason: account.requirements?.disabled_reason,
      },

      // Paramètres
      settings: {
        payouts: account.settings?.payouts,
        payments: account.settings?.payments,
      },

      // Métadonnées
      metadata: account.metadata,

      // Business profile
      business_profile: {
        name: account.business_profile?.name,
        support_email: account.business_profile?.support_email,
        support_phone: account.business_profile?.support_phone,
        url: account.business_profile?.url,
      },
    };

    return NextResponse.json({
      success: true,
      account: accountInfo,
      twintStatus: {
        available: account.capabilities?.twint_payments === "active",
        status: account.capabilities?.twint_payments,
        requirements: account.requirements?.currently_due?.filter(
          (req) => req.includes("twint") || req.includes("payment")
        ),
      },
    });
  } catch (error) {
    console.error("Erreur diagnostic compte Stripe:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
