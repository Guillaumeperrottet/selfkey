/**
 * Helper Stripe centralisé
 *
 * Utilise la configuration dynamique pour créer l'instance Stripe
 * avec les bonnes clés selon l'environnement
 */

import Stripe from "stripe";
import { stripeConfig, validateStripeKeys } from "./stripe-config";

// Instance Stripe créée de manière lazy
let stripeInstance: Stripe | null = null;

export const stripe = new Proxy({} as Stripe, {
  get(target, prop: keyof Stripe) {
    if (!stripeInstance) {
      validateStripeKeys(); // Valider seulement quand on utilise Stripe
      stripeInstance = new Stripe(stripeConfig.secretKey!, {
        apiVersion: "2025-05-28.basil",
        appInfo: {
          name: "SelfKey",
          version: "1.0.0",
        },
      });
    }
    return stripeInstance[prop];
  },
});

// Export des clés publiques pour le frontend
export const stripePublicKey = stripeConfig.publishableKey;
export const isStripeTestMode = stripeConfig.isTestMode;

// Helper pour afficher le mode actuel
export function getStripeMode() {
  return {
    isTestMode: stripeConfig.isTestMode,
    mode: stripeConfig.modeDescription,
    environment: stripeConfig.environment,
  };
}

// Helper pour les webhooks
export const stripeWebhookSecret = stripeConfig.webhookSecret;
