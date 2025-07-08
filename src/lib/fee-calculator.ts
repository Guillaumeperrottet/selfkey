/**
 * Utilitaires pour calculer les frais et commissions
 */

import { prisma } from "./prisma";

// Frais par défaut depuis les variables d'environnement (fallback)
export const defaultPlatformConfig = {
  commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || "1") / 100, // 1% = 0.01
  fixedFee: parseFloat(process.env.PLATFORM_FIXED_FEE || "0.10"), // 0.10 CHF
};

export interface FeeCalculation {
  originalAmount: number;
  commission: number;
  fixedFee: number;
  totalFees: number;
  netAmount: number;
  feePercentage: number;
  commissionRate: number; // Taux utilisé en pourcentage
}

/**
 * Récupère les frais configurés pour un établissement
 */
export async function getEstablishmentFees(establishmentSlug: string) {
  try {
    const establishment = await prisma.establishment.findUnique({
      where: { slug: establishmentSlug },
      select: {
        commissionRate: true,
        fixedFee: true,
      },
    });

    if (!establishment) {
      // Utiliser les frais par défaut si l'établissement n'est pas trouvé
      return {
        commissionRate: defaultPlatformConfig.commissionRate,
        fixedFee: defaultPlatformConfig.fixedFee,
      };
    }

    return {
      commissionRate: establishment.commissionRate / 100, // Convertir de % en décimal
      fixedFee: establishment.fixedFee,
    };
  } catch (error) {
    console.error("Erreur récupération frais établissement:", error);
    // Utiliser les frais par défaut en cas d'erreur
    return {
      commissionRate: defaultPlatformConfig.commissionRate,
      fixedFee: defaultPlatformConfig.fixedFee,
    };
  }
}

/**
 * Calcule les frais et le montant net pour un prix donné
 */
export function calculateFees(
  amount: number,
  commissionRate: number,
  fixedFee: number
): FeeCalculation {
  const commission = amount * commissionRate;
  const totalFees = commission + fixedFee;
  const netAmount = amount - totalFees;
  const feePercentage = (totalFees / amount) * 100;

  return {
    originalAmount: amount,
    commission,
    fixedFee,
    totalFees,
    netAmount: Math.max(0, netAmount), // Éviter les montants négatifs
    feePercentage,
    commissionRate: commissionRate * 100, // Retourner en pourcentage pour l'affichage
  };
}

/**
 * Calcule les frais pour un établissement spécifique
 */
export async function calculateEstablishmentFees(
  amount: number,
  establishmentSlug: string
): Promise<FeeCalculation> {
  const fees = await getEstablishmentFees(establishmentSlug);
  return calculateFees(amount, fees.commissionRate, fees.fixedFee);
}

/**
 * Formate un montant en CHF
 */
export function formatCHF(amount: number): string {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formate un pourcentage
 */
export function formatPercentage(percentage: number): string {
  return new Intl.NumberFormat("fr-CH", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percentage / 100);
}
