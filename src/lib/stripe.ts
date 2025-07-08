/**
 * Helper Stripe centralisé
 *
 * Utilise la configuration dynamique pour créer l'instance Stripe
 * avec les bonnes clés selon l'environnement
 */

import Stripe from "stripe";
import { stripeConfig } from "./stripe-config";

// Instance Stripe centralisée avec la bonne configuration
export const stripe = new Stripe(stripeConfig.secretKey!, {
  apiVersion: "2025-05-28.basil",
  appInfo: {
    name: "SelfKey",
    version: "1.0.0",
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
