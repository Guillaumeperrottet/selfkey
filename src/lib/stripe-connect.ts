// src/lib/stripe-connect.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

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
        twint_payments: { requested: true }, // Support TWINT pour la Suisse
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
  commissionRate: number,
  fixedFee: number
) {
  try {
    // Vérifier que le compte connecté peut recevoir des charges
    const account = await stripe.accounts.retrieve(connectedAccountId);
    if (!account.charges_enabled) {
      throw new Error(
        "Le compte connecté ne peut pas encore recevoir de paiements"
      );
    }

    // Calculer la commission avec les taux spécifiques à l'établissement
    const applicationFeeAmount = Math.round(
      (amount * commissionRate) / 100 + fixedFee
    );

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
        allow_redirects: "always", // Nécessaire pour TWINT
      },
      // Supprimé payment_method_types car incompatible avec automatic_payment_methods
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

/**
 * Vérifier les commissions et transferts d'un paiement
 */
export async function verifyPaymentCommission(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: ["charges", "application_fee"],
      }
    );

    const transfers = await stripe.transfers.list({
      limit: 10,
      destination: paymentIntent.transfer_data?.destination as string,
    });

    const relatedTransfer = transfers.data.find(
      (transfer) => transfer.source_transaction === paymentIntentId
    );

    return {
      paymentIntentId,
      amount: paymentIntent.amount,
      applicationFeeAmount: paymentIntent.application_fee_amount,
      transferAmount: relatedTransfer?.amount,
      transferId: relatedTransfer?.id,
      status: paymentIntent.status,
      connectedAccount: paymentIntent.transfer_data?.destination,
      isCommissionCorrect:
        paymentIntent.application_fee_amount ===
        paymentIntent.amount - (relatedTransfer?.amount || 0),
    };
  } catch (error) {
    console.error("Erreur vérification commission:", error);
    throw error;
  }
}

/**
 * Obtenir les statistiques de commission pour un compte connecté
 */
export async function getConnectedAccountStats(connectedAccountId: string) {
  try {
    const account = await stripe.accounts.retrieve(connectedAccountId);

    // Récupérer les paiements des 30 derniers jours
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;

    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte: thirtyDaysAgo },
    });

    // Filtrer les paiements pour ce compte connecté
    const accountPayments = paymentIntents.data.filter(
      (pi) => pi.transfer_data?.destination === connectedAccountId
    );

    const transfers = await stripe.transfers.list({
      limit: 100,
      destination: connectedAccountId,
      created: { gte: thirtyDaysAgo },
    });

    const totalAmount = accountPayments.reduce((sum, pi) => sum + pi.amount, 0);
    const totalFees = accountPayments.reduce(
      (sum, pi) => sum + (pi.application_fee_amount || 0),
      0
    );
    const totalTransfers = transfers.data.reduce(
      (sum, transfer) => sum + transfer.amount,
      0
    );

    return {
      accountId: connectedAccountId,
      accountDetails: {
        id: account.id,
        email: account.email,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        country: account.country,
      },
      stats: {
        totalPayments: accountPayments.length,
        totalAmount,
        totalFees,
        totalTransfers,
        averagePayment: totalAmount / (accountPayments.length || 1),
        commissionRate: totalAmount > 0 ? (totalFees / totalAmount) * 100 : 0,
        successfulPayments: accountPayments.filter(
          (pi) => pi.status === "succeeded"
        ).length,
      },
    };
  } catch (error) {
    console.error("Erreur récupération stats compte connecté:", error);
    throw error;
  }
}

/**
 * Vérifier l'état de santé global de Stripe Connect
 */
export async function checkStripeConnectHealth() {
  try {
    // Vérifier l'état du compte principal
    const account = await stripe.accounts.retrieve();

    // Récupérer les événements récents pour détecter les problèmes
    const events = await stripe.events.list({
      limit: 100,
      types: ["payment_intent.payment_failed", "account.updated"],
    });

    const failedPayments = events.data.filter(
      (e) => e.type === "payment_intent.payment_failed"
    );
    const accountUpdates = events.data.filter(
      (e) => e.type === "account.updated"
    );

    // Calculer les métriques de santé
    const healthScore = Math.max(0, 100 - failedPayments.length * 10);

    return {
      isHealthy: healthScore >= 80,
      healthScore,
      accountStatus: {
        id: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        country: account.country,
      },
      issues: {
        failedPayments: failedPayments.length,
        recentAccountUpdates: accountUpdates.length,
      },
      recommendations: [
        ...(failedPayments.length > 5
          ? ["Vérifier les paramètres de paiement"]
          : []),
        ...(healthScore < 80 ? ["Contacter le support Stripe"] : []),
      ],
    };
  } catch (error) {
    console.error("Erreur vérification santé Stripe Connect:", error);
    return {
      isHealthy: false,
      healthScore: 0,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Créer un rapport de réconciliation des commissions
 */
export async function generateCommissionReport(startDate: Date, endDate: Date) {
  try {
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    // Récupérer tous les paiements de la période
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte: startTimestamp, lte: endTimestamp },
      expand: ["data.charges"],
    });

    // Récupérer tous les transfers de la période
    const transfers = await stripe.transfers.list({
      limit: 100,
      created: { gte: startTimestamp, lte: endTimestamp },
    });

    // Calculer les totaux
    const totalRevenue = paymentIntents.data.reduce(
      (sum, pi) => sum + pi.amount,
      0
    );
    const totalCommissions = paymentIntents.data.reduce(
      (sum, pi) => sum + (pi.application_fee_amount || 0),
      0
    );
    const totalTransfers = transfers.data.reduce(
      (sum, transfer) => sum + transfer.amount,
      0
    );

    // Analyser les données par compte connecté
    const accountStats = new Map();
    paymentIntents.data.forEach((pi) => {
      const accountId = pi.transfer_data?.destination;
      if (accountId) {
        if (!accountStats.has(accountId)) {
          accountStats.set(accountId, {
            payments: 0,
            revenue: 0,
            commissions: 0,
            transfers: 0,
          });
        }
        const stats = accountStats.get(accountId);
        stats.payments++;
        stats.revenue += pi.amount;
        stats.commissions += pi.application_fee_amount || 0;
      }
    });

    transfers.data.forEach((transfer) => {
      const accountId = transfer.destination;
      if (accountStats.has(accountId)) {
        const stats = accountStats.get(accountId);
        stats.transfers += transfer.amount;
      }
    });

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalPayments: paymentIntents.data.length,
        totalRevenue,
        totalCommissions,
        totalTransfers,
        commissionRate:
          totalRevenue > 0 ? (totalCommissions / totalRevenue) * 100 : 0,
      },
      byAccount: Array.from(accountStats.entries()).map(
        ([accountId, stats]) => ({
          accountId,
          ...stats,
        })
      ),
      discrepancies: Array.from(accountStats.entries())
        .filter(
          ([, stats]) =>
            Math.abs(stats.revenue - stats.transfers - stats.commissions) > 1
        )
        .map(([accountId, stats]) => ({
          accountId,
          expectedTransfer: stats.revenue - stats.commissions,
          actualTransfer: stats.transfers,
          difference: stats.revenue - stats.commissions - stats.transfers,
        })),
    };
  } catch (error) {
    console.error("Erreur génération rapport commissions:", error);
    throw error;
  }
}
