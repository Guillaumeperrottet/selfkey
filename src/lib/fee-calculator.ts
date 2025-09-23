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
 * Utilise des calculs en centimes pour éviter les erreurs d'arrondi
 */
export function calculateFees(
  amount: number,
  commissionRate: number,
  fixedFee: number
): FeeCalculation {
  // Convertir en centimes pour les calculs précis
  const amountRappen = Math.round(amount * 100);
  const commissionRappen = Math.round((amountRappen * commissionRate) / 100);
  const fixedFeeRappen = Math.round(fixedFee * 100);
  const totalFeesRappen = commissionRappen + fixedFeeRappen;
  const netAmountRappen = Math.max(0, amountRappen - totalFeesRappen);

  // Reconvertir en CHF
  const commission = commissionRappen / 100;
  const totalFees = totalFeesRappen / 100;
  const netAmount = netAmountRappen / 100;
  const feePercentage =
    amountRappen > 0 ? (totalFeesRappen / amountRappen) * 100 : 0;

  return {
    originalAmount: amount,
    commission,
    fixedFee,
    totalFees,
    netAmount,
    feePercentage,
    commissionRate: commissionRate, // Garder le taux original
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

/**
 * Interface pour le calcul de la taxe de séjour
 */
export interface TouristTaxCalculation {
  enabled: boolean;
  taxPerPerson: number;
  numberOfAdults: number;
  numberOfNights: number;
  totalTax: number;
}

/**
 * Récupère les paramètres de taxe de séjour pour un établissement
 */
export async function getTouristTaxSettings(establishmentSlug: string) {
  try {
    const establishment = await prisma.establishment.findUnique({
      where: { slug: establishmentSlug },
      select: {
        touristTaxEnabled: true,
        touristTaxAmount: true,
      },
    });

    if (!establishment) {
      return {
        touristTaxEnabled: true,
        touristTaxAmount: 3.0,
      };
    }

    return {
      touristTaxEnabled: establishment.touristTaxEnabled,
      touristTaxAmount: establishment.touristTaxAmount,
    };
  } catch (error) {
    console.error("Erreur récupération paramètres taxe de séjour:", error);
    return {
      touristTaxEnabled: true,
      touristTaxAmount: 3.0,
    };
  }
}

/**
 * Calcule la taxe de séjour (uniquement pour les adultes 16+)
 */
export function calculateTouristTax(
  numberOfAdults: number,
  numberOfNights: number,
  taxPerPerson: number,
  enabled: boolean = true
): TouristTaxCalculation {
  if (
    !enabled ||
    numberOfAdults <= 0 ||
    numberOfNights <= 0 ||
    taxPerPerson <= 0
  ) {
    return {
      enabled,
      taxPerPerson,
      numberOfAdults,
      numberOfNights,
      totalTax: 0,
    };
  }

  return {
    enabled,
    taxPerPerson,
    numberOfAdults,
    numberOfNights,
    totalTax: numberOfAdults * numberOfNights * taxPerPerson,
  };
}

/**
 * Calcule la taxe de séjour pour un établissement spécifique (uniquement pour les adultes)
 */
export async function calculateEstablishmentTouristTax(
  numberOfAdults: number,
  numberOfNights: number,
  establishmentSlug: string
): Promise<TouristTaxCalculation> {
  const settings = await getTouristTaxSettings(establishmentSlug);
  return calculateTouristTax(
    numberOfAdults,
    numberOfNights,
    settings.touristTaxAmount,
    settings.touristTaxEnabled
  );
}

/**
 * Interface pour le calcul complet d'une réservation
 */
export interface CompleteBookingCalculation {
  roomPrice: number;
  pricingOptionsTotal: number;
  touristTax: TouristTaxCalculation;
  subtotal: number;
  fees: FeeCalculation;
  totalAmount: number;
}

/**
 * Calcule le montant total d'une réservation avec tous les frais
 */
export async function calculateCompleteBooking(
  roomPrice: number,
  numberOfAdults: number,
  numberOfNights: number,
  establishmentSlug: string,
  pricingOptionsTotal: number = 0
): Promise<CompleteBookingCalculation> {
  // Calculer la taxe de séjour (uniquement pour les adultes)
  const touristTax = await calculateEstablishmentTouristTax(
    numberOfAdults,
    numberOfNights,
    establishmentSlug
  );

  // Sous-total avant frais de plateforme
  const subtotal = roomPrice + pricingOptionsTotal + touristTax.totalTax;

  // Calculer les frais de plateforme sur le sous-total
  const fees = await calculateEstablishmentFees(subtotal, establishmentSlug);

  return {
    roomPrice,
    pricingOptionsTotal,
    touristTax,
    subtotal,
    fees,
    totalAmount: subtotal, // Le client paie le sous-total, les frais sont déduits du côté hôtelier
  };
}
