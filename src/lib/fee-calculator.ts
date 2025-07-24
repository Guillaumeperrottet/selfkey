/**
 * Utilitaires pour calculer les frais et commissions
 */

import { prisma } from "./prisma";

// Frais par défaut depuis les variables d'environnement (fallback)
export const defaultPlatformConfig = {
  commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || "0") / 100, // 0% = 0.00
  fixedFee: parseFloat(process.env.PLATFORM_FIXED_FEE || "3.00"), // 3.00 CHF
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
        dayParkingCommissionRate: true,
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
 * Récupère les frais de commission spécifiques pour le parking jour
 */
export async function getDayParkingFees(
  hotelSlug: string
): Promise<{ commissionRate: number; fixedFee: number }> {
  try {
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotelSlug },
      select: {
        dayParkingCommissionRate: true,
        fixedFee: true,
      },
    });

    if (!establishment) {
      // Utiliser les frais par défaut pour parking jour
      return {
        commissionRate: 0.05, // 5% par défaut pour parking jour
        fixedFee: 0, // Pas de frais fixes pour parking jour
      };
    }

    return {
      commissionRate: establishment.dayParkingCommissionRate / 100, // Convertir de % en décimal
      fixedFee: 0, // Pas de frais fixes pour parking jour
    };
  } catch (error) {
    console.error("Erreur récupération frais parking jour:", error);
    // Utiliser les frais par défaut en cas d'erreur
    return {
      commissionRate: 0.05, // 5% par défaut
      fixedFee: 0,
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
