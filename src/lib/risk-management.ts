// src/lib/risk-management.ts
import { prisma } from "./prisma";
import { stripe } from "./stripe";

interface AccountRiskAssessment {
  accountId: string;
  riskLevel: "low" | "medium" | "high";
  reasons: string[];
  recommendedActions: string[];
}

/**
 * Évaluation du risque selon les responsabilités de la plateforme
 * mentionnées dans la doc Stripe Connect
 */
export async function assessAccountRisk(
  accountId: string
): Promise<AccountRiskAssessment> {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    const balance = await stripe.balance.retrieve({ stripeAccount: accountId });

    let riskLevel: "low" | "medium" | "high" = "low";
    const reasons: string[] = [];
    const recommendedActions: string[] = [];

    // Vérifications selon la doc Stripe Connect pour la liability de la plateforme

    // 1. Vérifier le statut de vérification
    if (!account.charges_enabled) {
      riskLevel = "high";
      reasons.push("Charges non activées");
      recommendedActions.push("Compléter le processus d'onboarding");
    }

    // 2. Vérifier les informations manquantes
    if (
      account.requirements?.currently_due &&
      account.requirements.currently_due.length > 0
    ) {
      if (riskLevel === "low") riskLevel = "medium";
      reasons.push(
        `Informations manquantes: ${account.requirements.currently_due.join(", ")}`
      );
      recommendedActions.push(
        "Demander la mise à jour des informations manquantes"
      );
    }

    // 3. Vérifier les soldes négatifs
    const negativeBalances = balance.available.filter((bal) => bal.amount < 0);
    if (negativeBalances.length > 0) {
      riskLevel = "high";
      reasons.push("Solde négatif détecté");
      recommendedActions.push(
        "Surveiller et gérer le solde négatif selon la responsabilité de la plateforme"
      );
    }

    // 4. Vérifier l'âge du compte
    if (account.created) {
      const accountAge = Date.now() - account.created * 1000;
      const isNewAccount = accountAge < 7 * 24 * 60 * 60 * 1000; // 7 jours

      if (isNewAccount && riskLevel === "low") {
        riskLevel = "medium";
        reasons.push("Compte récent (moins de 7 jours)");
        recommendedActions.push("Surveillance renforcée pour nouveau compte");
      }
    }

    return {
      accountId,
      riskLevel,
      reasons,
      recommendedActions,
    };
  } catch (error) {
    console.error("Erreur évaluation risque:", error);
    return {
      accountId,
      riskLevel: "high",
      reasons: ["Erreur lors de l'évaluation"],
      recommendedActions: ["Vérification manuelle requise"],
    };
  }
}

/**
 * Surveiller tous les comptes connectés
 */
export async function monitorAllConnectedAccounts() {
  try {
    const establishments = await prisma.establishment.findMany({
      where: {
        stripeAccountId: { not: null },
      },
    });

    const assessments: AccountRiskAssessment[] = [];

    for (const establishment of establishments) {
      if (establishment.stripeAccountId) {
        const assessment = await assessAccountRisk(
          establishment.stripeAccountId
        );
        assessments.push(assessment);

        // Logger les comptes à risque élevé
        if (assessment.riskLevel === "high") {
          console.warn(`⚠️ Compte à risque élevé détecté:`, {
            establishment: establishment.name,
            accountId: establishment.stripeAccountId,
            reasons: assessment.reasons,
          });
        }
      }
    }

    return assessments;
  } catch (error) {
    console.error("Erreur surveillance comptes:", error);
    throw error;
  }
}

/**
 * Notifier l'équipe en cas de problème selon les responsabilités de la plateforme
 */
export async function handlePlatformLiabilityAlert(
  accountId: string,
  type: "negative_balance" | "fraud_suspected" | "verification_failed",
  details: Record<string, unknown>
) {
  // Implémentation selon vos besoins (email, Slack, etc.)
  console.error(`🚨 Alerte responsabilité plateforme:`, {
    type,
    accountId,
    details,
    timestamp: new Date().toISOString(),
  });

  // Vous pourriez implémenter ici:
  // - Envoi d'email à l'équipe de gestion des risques
  // - Notification Slack
  // - Création d'un ticket de support
  // - Suspension temporaire du compte si nécessaire
}
