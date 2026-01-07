/**
 * Utilitaires pour la gestion des options de prix avec système de snapshot
 *
 * Ce module permet de stocker un snapshot complet des options de prix au moment
 * de la réservation, garantissant que l'information reste disponible même si
 * les options sont modifiées ou supprimées par la suite.
 */

import type { PricingOption } from "@/lib/pricing/options";

/**
 * Interface pour une option de prix enrichie avec snapshot complet
 */
export interface EnrichedPricingOption {
  optionId: string;
  optionName: string;
  optionType: "radio" | "checkbox" | "select";
  valueId: string;
  valueLabel: string;
  priceModifier: number;
  selectedAt: string;
}

/**
 * Interface pour le format compressé (pour metadata Stripe, limite 500 caractères)
 * On stocke seulement optionId => valueId, car on peut recréer l'enrichissement
 * depuis la base de données au moment du webhook
 */
export interface CompressedPricingOptions {
  [optionId: string]: string | string[];
}

/**
 * Compresse le format enrichi en format minimal pour Stripe metadata
 * Stripe limite les metadata à 500 caractères par valeur, donc on ne garde que les IDs
 *
 * @param enrichedOptions - Options enrichies complètes
 * @returns Format compressé avec seulement optionId => valueId
 */
export function compressPricingOptions(
  enrichedOptions: Record<
    string,
    EnrichedPricingOption | EnrichedPricingOption[]
  >
): CompressedPricingOptions {
  const compressed: CompressedPricingOptions = {};

  Object.entries(enrichedOptions).forEach(([optionId, value]) => {
    if (Array.isArray(value)) {
      // Checkbox: array de valueIds
      compressed[optionId] = value.map((v) => v.valueId);
    } else {
      // Radio/Select: un seul valueId
      compressed[optionId] = value.valueId;
    }
  });

  return compressed;
}

/**
 * Enrichit les options sélectionnées avec toutes leurs informations
 * pour créer un snapshot complet au moment de la réservation
 *
 * @param selectedOptions - Map des options sélectionnées (format ancien: ID => ID)
 * @param availableOptions - Liste complète des options de prix disponibles
 * @returns Map enrichie avec snapshot complet des données
 *
 * @example
 * ```typescript
 * const enriched = enrichPricingOptions(
 *   { "opt1": "val1", "opt2": ["val2", "val3"] },
 *   pricingOptions
 * );
 * // Résultat:
 * // {
 * //   "opt1": {
 * //     optionId: "opt1",
 * //     optionName: "Petit-déjeuner",
 * //     valueLabel: "Avec petit-déjeuner",
 * //     priceModifier: 15.0,
 * //     ...
 * //   },
 * //   "opt2": [...]
 * // }
 * ```
 */
export function enrichPricingOptions(
  selectedOptions: Record<string, string | string[]>,
  availableOptions: PricingOption[],
  duration: number = 1
): Record<string, EnrichedPricingOption | EnrichedPricingOption[]> {
  const enriched: Record<
    string,
    EnrichedPricingOption | EnrichedPricingOption[]
  > = {};

  Object.entries(selectedOptions).forEach(([optionId, valueIds]) => {
    const option = availableOptions.find((o) => o.id === optionId);
    if (!option) {
      console.warn(
        `⚠️ Option non trouvée lors de l'enrichissement: ${optionId}`
      );
      return;
    }

    // Normaliser en array pour traitement uniforme
    const valueArray = Array.isArray(valueIds) ? valueIds : [valueIds];

    // Enrichir chaque valeur sélectionnée
    const enrichedValues = valueArray
      .map((valueId) => {
        const value = option.values.find((v) => v.id === valueId);
        if (!value) {
          console.warn(
            `⚠️ Valeur non trouvée: ${valueId} pour l'option ${option.name}`
          );
          return null;
        }

        // Multiplier par duration si isPerNight=true
        const multiplier = value.isPerNight ? duration : 1;
        const calculatedPrice = value.priceModifier * multiplier;

        return {
          optionId: option.id,
          optionName: option.name,
          optionType: option.type,
          valueId: value.id,
          valueLabel: value.label,
          priceModifier: calculatedPrice,
          selectedAt: new Date().toISOString(),
        } as EnrichedPricingOption;
      })
      .filter((v): v is EnrichedPricingOption => v !== null);

    // Si checkbox (multiple), garder en array, sinon prendre le premier élément
    enriched[optionId] =
      option.type === "checkbox" ? enrichedValues : enrichedValues[0];
  });

  return enriched;
}

/**
 * Type pour les options enrichies ou l'ancien format
 */
export type SelectedPricingOptions = Record<
  string,
  string | string[] | EnrichedPricingOption | EnrichedPricingOption[]
>;

/**
 * Vérifie si les options sont dans le nouveau format enrichi
 *
 * @param selectedOptions - Options à vérifier
 * @returns true si format enrichi, false si ancien format (IDs seulement)
 *
 * @example
 * ```typescript
 * // Ancien format (IDs seulement)
 * isEnrichedFormat({ "opt1": "val1" }) // false
 *
 * // Nouveau format (enrichi)
 * isEnrichedFormat({
 *   "opt1": { optionId: "opt1", optionName: "...", ... }
 * }) // true
 * ```
 */
export function isEnrichedFormat(
  selectedOptions: SelectedPricingOptions | null | undefined
): boolean {
  if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
    return false;
  }

  const firstKey = Object.keys(selectedOptions)[0];
  const firstValue = selectedOptions[firstKey];

  // Si c'est un array, vérifier le premier élément
  if (Array.isArray(firstValue) && firstValue.length > 0) {
    const firstItem = firstValue[0];
    return (
      typeof firstItem === "object" &&
      firstItem !== null &&
      "optionName" in firstItem &&
      "valueLabel" in firstItem &&
      "priceModifier" in firstItem
    );
  }

  // Si c'est un objet, vérifier directement
  return (
    typeof firstValue === "object" &&
    firstValue !== null &&
    "optionName" in firstValue &&
    "valueLabel" in firstValue &&
    "priceModifier" in firstValue
  );
}

/**
 * Récupère toutes les options enrichies sous forme de tableau plat
 * Utile pour l'affichage dans les factures et récapitulatifs
 *
 * @param selectedOptions - Options enrichies ou ancien format
 * @returns Tableau plat d'options enrichies
 *
 * @example
 * ```typescript
 * const options = getFlatEnrichedOptions(booking.selectedPricingOptions);
 * options.forEach(opt => {
 *   console.log(`${opt.optionName}: ${opt.valueLabel} (+${opt.priceModifier} CHF)`);
 * });
 * ```
 */
export function getFlatEnrichedOptions(
  selectedOptions: SelectedPricingOptions | null | undefined
): EnrichedPricingOption[] {
  if (!selectedOptions || !isEnrichedFormat(selectedOptions)) {
    return [];
  }

  const flatOptions: EnrichedPricingOption[] = [];

  Object.values(selectedOptions).forEach((value) => {
    if (Array.isArray(value)) {
      // Checkbox: plusieurs valeurs - vérifier que ce sont bien des objets enrichis
      value.forEach((item) => {
        if (typeof item === "object" && item !== null && "optionName" in item) {
          flatOptions.push(item as EnrichedPricingOption);
        }
      });
    } else if (value && typeof value === "object" && "optionName" in value) {
      // Radio/Select: une seule valeur
      flatOptions.push(value as EnrichedPricingOption);
    }
  });

  return flatOptions;
}

/**
 * Calcule le total des options à partir du format enrichi
 *
 * @param selectedOptions - Options enrichies
 * @returns Montant total des options
 */
export function calculateEnrichedOptionsTotal(
  selectedOptions: SelectedPricingOptions | null | undefined
): number {
  const options = getFlatEnrichedOptions(selectedOptions);
  return options.reduce((sum, opt) => sum + opt.priceModifier, 0);
}

/**
 * Formate les options enrichies pour l'affichage
 *
 * @param selectedOptions - Options enrichies
 * @returns Tableau d'objets formatés pour l'affichage
 */
export function formatEnrichedOptionsForDisplay(
  selectedOptions: SelectedPricingOptions | null | undefined
): Array<{ name: string; label: string; price: number }> {
  const options = getFlatEnrichedOptions(selectedOptions);
  return options.map((opt) => ({
    name: opt.optionName,
    label: opt.valueLabel,
    price: opt.priceModifier,
  }));
}
