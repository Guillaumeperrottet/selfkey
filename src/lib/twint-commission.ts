import { stripe } from "./stripe";

/**
 * Prélever la commission après un paiement Twint réussi
 * (car Twint ne supporte pas application_fee_amount)
 */
export async function collectTwintCommission(
  paymentIntentId: string,
  connectedAccountId: string,
  commissionAmount: number,
  currency: string = "chf"
) {
  try {
    console.log("💰 Prélèvement commission Twint:", {
      paymentIntentId,
      connectedAccountId,
      commissionAmount,
      currency,
    });

    // Vérifier que le PaymentIntent est bien réussi
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      { stripeAccount: connectedAccountId }
    );

    if (paymentIntent.status !== "succeeded") {
      throw new Error(
        `PaymentIntent ${paymentIntentId} n'est pas réussi: ${paymentIntent.status}`
      );
    }

    // Créer un Transfer de commission vers le compte principal
    // Note: On reverse depuis le compte Connect vers le compte principal
    const transfer = await stripe.transfers.create(
      {
        amount: commissionAmount,
        currency: currency.toLowerCase(),
        destination: process.env.STRIPE_MAIN_ACCOUNT_ID || "acct_main", // Compte principal
        source_transaction: paymentIntent.latest_charge as string,
        metadata: {
          type: "twint_commission",
          payment_intent_id: paymentIntentId,
          commission_collected_at: new Date().toISOString(),
        },
      },
      {
        stripeAccount: connectedAccountId,
      }
    );

    console.log("✅ Commission Twint prélevée:", {
      transferId: transfer.id,
      amount: transfer.amount,
    });

    return transfer;
  } catch (error) {
    console.error("❌ Erreur prélèvement commission Twint:", error);

    // TODO: Ajouter un système de logging des erreurs de commission
    // En attendant, on log juste dans la console

    throw error;
  }
}

/**
 * Webhook handler pour collecter automatiquement les commissions Twint
 */
export async function handleTwintPaymentSuccess(paymentIntent: {
  id: string;
  metadata?: Record<string, string>;
  account?: string;
  currency: string;
}) {
  // Vérifier si c'est un paiement Twint sans commission auto
  if (
    paymentIntent.metadata?.integration_type ===
      "direct_charge_twint_compatible" &&
    paymentIntent.metadata?.original_commission
  ) {
    const commissionAmount = parseInt(
      paymentIntent.metadata.original_commission
    );

    if (commissionAmount > 0) {
      // Attendre 5 secondes pour s'assurer que le paiement est bien finalisé
      setTimeout(async () => {
        try {
          const accountId =
            paymentIntent.metadata?.connected_account_id ||
            paymentIntent.account;
          if (accountId) {
            await collectTwintCommission(
              paymentIntent.id,
              accountId,
              commissionAmount,
              paymentIntent.currency
            );
          }
        } catch (error) {
          console.error("Erreur collection commission différée:", error);
        }
      }, 5000);
    }
  }
}
