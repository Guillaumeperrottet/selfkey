// src/lib/stripe-connect.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Configuration des commissions (en pourcentage)
const PLATFORM_COMMISSION_RATE = parseFloat(
  process.env.PLATFORM_COMMISSION_RATE || "0"
); // 0% par défaut
const FIXED_FEE = parseFloat(process.env.PLATFORM_FIXED_FEE || "0"); // 0 CHF par défaut

interface CreateConnectedAccountParams {
  hotelName: string;
  email: string;
  country: string;
  businessType: "individual" | "company";
}

export async function createConnectedAccount(
  params: CreateConnectedAccountParams
) {
  try {
    const account = await stripe.accounts.create({
      type: "express", // Plus simple et approprié pour les hôtels
      country: params.country,
      email: params.email,
      business_type: params.businessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        hotel_name: params.hotelName,
      },
    });

    // Créer le lien d'onboarding
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${baseUrl}/stripe/refresh`,
      return_url: `${baseUrl}/stripe/success`,
      type: "account_onboarding",
    });

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  } catch (error) {
    console.error("Erreur création compte Stripe Connect:", error);
    throw error;
  }
}

export async function createPaymentIntentWithCommission(
  amount: number,
  currency: string,
  connectedAccountId: string,
  applicationFeeAmount?: number
) {
  try {
    // Vérifier que le compte connecté peut recevoir des charges
    const account = await stripe.accounts.retrieve(connectedAccountId);
    if (!account.charges_enabled) {
      throw new Error(
        "Le compte connecté ne peut pas encore recevoir de paiements"
      );
    }

    // Calculer la commission si pas spécifiée
    if (applicationFeeAmount === undefined) {
      applicationFeeAmount = Math.round(
        (amount * PLATFORM_COMMISSION_RATE) / 100 + FIXED_FEE
      );
    }

    // Valider que la commission ne dépasse pas le montant total
    if (applicationFeeAmount >= amount) {
      throw new Error(
        "La commission ne peut pas être supérieure ou égale au montant total"
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en centimes
      currency: currency.toLowerCase(),
      application_fee_amount: Math.round(applicationFeeAmount * 100), // Commission en centimes
      transfer_data: {
        destination: connectedAccountId, // L'argent va directement au propriétaire
      },
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        integration_type: "direct_charge",
        platform: "selfkey_hotels",
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error("Erreur création PaymentIntent avec commission:", error);

    // Améliorer la gestion d'erreurs selon la doc Stripe
    if (error instanceof Error) {
      if (error.message.includes("charges_enabled")) {
        throw new Error(
          "Le compte de l'hôtel n'est pas encore configuré pour recevoir des paiements"
        );
      }
      if (error.message.includes("application_fee_amount")) {
        throw new Error("Commission invalide");
      }
    }

    throw error;
  }
}

export async function getAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return {
      id: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      email: account.email,
    };
  } catch (error) {
    console.error("Erreur récupération statut compte:", error);
    throw error;
  }
}

export async function createAccountLink(accountId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/stripe/refresh`,
      return_url: `${baseUrl}/stripe/success`,
      type: "account_onboarding",
    });

    return accountLink.url;
  } catch (error) {
    console.error("Erreur création lien compte:", error);
    throw error;
  }
}

/**
 * Vérifier si le compte Stripe est configuré pour Connect
 */
export async function checkStripeConnectSetup() {
  try {
    // Tenter de récupérer les informations de plateforme
    const account = await stripe.accounts.retrieve();

    return {
      isSetup: true,
      accountId: account.id,
      country: account.country,
      capabilities: account.capabilities,
      connectEnabled: true,
    };
  } catch (error) {
    console.error("Stripe Connect non configuré:", error);

    if (
      error instanceof Error &&
      error.message.includes("signed up for Connect")
    ) {
      return {
        isSetup: false,
        error: "Stripe Connect n'est pas activé sur ce compte",
        setupUrl:
          "https://dashboard.stripe.com/settings/connect/platform-profile",
        connectEnabled: false,
      };
    }

    return {
      isSetup: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      connectEnabled: false,
    };
  }
}
