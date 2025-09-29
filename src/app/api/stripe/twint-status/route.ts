import { NextRequest, NextResponse } from "next/server";
import { getAccountStatus } from "@/lib/stripe-connect";
import { prisma } from "@/lib/prisma";

/**
 * API pour vérifier l'état TWINT d'un établissement
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const establishmentId = searchParams.get("establishmentId");
    const stripeAccountId = searchParams.get("stripeAccountId");

    if (!establishmentId && !stripeAccountId) {
      return NextResponse.json(
        { error: "establishmentId ou stripeAccountId requis" },
        { status: 400 }
      );
    }

    let establishment;
    let accountId = stripeAccountId;

    // Récupérer l'établissement si on a l'ID
    if (establishmentId) {
      establishment = await prisma.establishment.findUnique({
        where: { id: establishmentId },
      });

      if (!establishment) {
        return NextResponse.json(
          { error: "Établissement non trouvé" },
          { status: 404 }
        );
      }

      accountId = establishment.stripeAccountId;
    }

    if (!accountId) {
      return NextResponse.json({
        error: "Aucun compte Stripe configuré",
        twint_ready: false,
        issues: ["Compte Stripe non configuré"],
        recommendations: ["Configurer Stripe Connect pour cet établissement"],
      });
    }

    // Vérifier l'état du compte Stripe
    const accountStatus = await getAccountStatus(accountId);

    // Analyser l'état TWINT
    const twintStatus = {
      account_id: accountId,
      establishment: establishment
        ? {
            id: establishment.id,
            name: establishment.name,
            slug: establishment.slug,
          }
        : null,

      // État général du compte
      charges_enabled: accountStatus.charges_enabled,
      payouts_enabled: accountStatus.payouts_enabled,
      details_submitted: accountStatus.details_submitted,
      country: accountStatus.country,

      // Capacités
      capabilities: accountStatus.capabilities,
      twint_capability: accountStatus.capabilities.twint_payments,

      // État TWINT
      twint_ready: accountStatus.twint_ready,

      // Exigences en cours
      requirements: accountStatus.requirements,

      // Analyse des problèmes
      issues: [] as string[],
      recommendations: [] as string[],
    };

    // Vérifier les problèmes TWINT
    if (accountStatus.country !== "CH") {
      twintStatus.issues.push(
        `Pays du compte: ${accountStatus.country} (TWINT nécessite la Suisse)`
      );
      twintStatus.recommendations.push("TWINT n'est disponible qu'en Suisse");
    }

    if (accountStatus.capabilities.twint_payments !== "active") {
      twintStatus.issues.push(
        `Capacité TWINT: ${accountStatus.capabilities.twint_payments}`
      );

      if (accountStatus.capabilities.twint_payments === "inactive") {
        twintStatus.recommendations.push(
          "Demander l'activation de TWINT dans le dashboard Stripe"
        );
      } else if (accountStatus.capabilities.twint_payments === "pending") {
        twintStatus.recommendations.push(
          "L'activation TWINT est en cours, attendre la validation"
        );
      }
    }

    if (!accountStatus.charges_enabled) {
      twintStatus.issues.push("Charges non activées sur le compte");
      twintStatus.recommendations.push(
        "Terminer la configuration du compte Stripe"
      );
    }

    if (accountStatus.requirements.currently_due.length > 0) {
      twintStatus.issues.push(
        `Informations manquantes: ${accountStatus.requirements.currently_due.join(", ")}`
      );
      twintStatus.recommendations.push(
        "Compléter les informations requises dans le dashboard Stripe"
      );
    }

    if (accountStatus.requirements.past_due.length > 0) {
      twintStatus.issues.push(
        `Informations en retard: ${accountStatus.requirements.past_due.join(", ")}`
      );
      twintStatus.recommendations.push(
        "URGENT: Compléter les informations en retard"
      );
    }

    // Recommandations générales
    if (twintStatus.issues.length === 0 && accountStatus.twint_ready) {
      twintStatus.recommendations.push("Configuration TWINT opérationnelle ✅");
    }

    return NextResponse.json(twintStatus);
  } catch (error) {
    console.error("Erreur vérification état TWINT:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la vérification TWINT",
        details: error instanceof Error ? error.message : String(error),
        twint_ready: false,
      },
      { status: 500 }
    );
  }
}
