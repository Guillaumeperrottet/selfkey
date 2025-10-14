/**
 * Utilitaires pour calculs monétaires précis
 * Évite les problèmes d'arrondis en travaillant toujours en centimes
 */

/**
 * Convertit un montant en CHF vers les centimes
 */
export function toRappen(chf: number): number {
  return Math.round(chf * 100);
}

/**
 * Convertit un montant en centimes vers CHF
 */
export function fromRappen(rappen: number): number {
  return rappen / 100;
}

/**
 * Additionne des montants en CHF de manière précise
 */
export function addMoney(...amounts: number[]): number {
  const totalRappen = amounts.reduce(
    (sum, amount) => sum + toRappen(amount),
    0
  );
  return fromRappen(totalRappen);
}

/**
 * Multiplie un montant par un facteur de manière précise
 */
export function multiplyMoney(amount: number, factor: number): number {
  const rappenAmount = toRappen(amount);
  const result = Math.round(rappenAmount * factor);
  return fromRappen(result);
}

/**
 * Calcule un pourcentage d'un montant de manière précise
 */
export function percentageOf(amount: number, percentage: number): number {
  const rappenAmount = toRappen(amount);
  const result = Math.round((rappenAmount * percentage) / 100);
  return fromRappen(result);
}

/**
 * Calcule les commissions de manière cohérente
 */
export function calculateCommission(
  amount: number,
  commissionRate: number,
  fixedFee: number
): {
  originalAmount: number;
  commission: number;
  fixedFee: number;
  totalCommission: number;
  netAmount: number;
  // Pour Stripe (en centimes)
  amountRappen: number;
  commissionRappen: number;
} {
  const originalRappen = toRappen(amount);
  const commissionRappen = Math.round((originalRappen * commissionRate) / 100);
  const fixedFeeRappen = toRappen(fixedFee);
  const totalCommissionRappen = commissionRappen + fixedFeeRappen;
  const netAmountRappen = originalRappen - totalCommissionRappen;

  return {
    originalAmount: amount,
    commission: fromRappen(commissionRappen),
    fixedFee,
    totalCommission: fromRappen(totalCommissionRappen),
    netAmount: fromRappen(Math.max(0, netAmountRappen)),
    // Pour Stripe
    amountRappen: originalRappen,
    commissionRappen: totalCommissionRappen,
  };
}

/**
 * Formate un montant en CHF de manière cohérente
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
 * Valide qu'un montant est cohérent (pas de problème d'arrondi JS)
 */
export function isValidMoneyAmount(amount: number): boolean {
  // Vérifier que le montant a au maximum 2 décimales
  const rounded = Math.round(amount * 100) / 100;
  return Math.abs(amount - rounded) < 0.001;
}

/**
 * Corrige les erreurs d'arrondi JavaScript
 */
export function fixRounding(amount: number): number {
  return Math.round(amount * 100) / 100;
}
