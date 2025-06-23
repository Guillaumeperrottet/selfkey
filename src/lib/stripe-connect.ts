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
      type: "standard", // Permet au propriétaire de gérer son compte
      country: params.country,
      email: params.email,
      business_type: params.businessType,
      metadata: {
        hotel_name: params.hotelName,
      },
    });

    // Créer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe/success`,
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
    // Calculer la commission si pas spécifiée
    if (applicationFeeAmount === undefined) {
      applicationFeeAmount = Math.round(
        (amount * PLATFORM_COMMISSION_RATE) / 100 + FIXED_FEE
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
    });

    return paymentIntent;
  } catch (error) {
    console.error("Erreur création PaymentIntent avec commission:", error);
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
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe/success`,
      type: "account_onboarding",
    });

    return accountLink.url;
  } catch (error) {
    console.error("Erreur création lien compte:", error);
    throw error;
  }
}
