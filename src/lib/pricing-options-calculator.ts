// src/lib/pricing-options-calculator.ts

export interface PricingOptionValue {
  id: string;
  label: string;
  priceModifier: number;
  isDefault: boolean;
  displayOrder: number;
}

export interface PricingOption {
  id: string;
  name: string;
  description: string | null;
  type: "select" | "radio" | "checkbox";
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
  values: PricingOptionValue[];
}

/**
 * Calcule le total des options de prix sélectionnées
 */
export function calculatePricingOptionsTotal(
  selectedOptions: Record<string, string | string[]>,
  pricingOptions: PricingOption[]
): number {
  let total = 0;

  // Parcourir toutes les options sélectionnées
  Object.entries(selectedOptions).forEach(([optionId, selectedValue]) => {
    // Trouver l'option correspondante
    const option = pricingOptions.find((opt) => opt.id === optionId);

    if (!option) return;

    if (Array.isArray(selectedValue)) {
      // Pour les checkboxes - plusieurs valeurs possibles
      selectedValue.forEach((valueId) => {
        const value = option.values.find((v) => v.id === valueId);
        if (value) {
          total += value.priceModifier;
        }
      });
    } else {
      // Pour select et radio - une seule valeur
      const value = option.values.find((v) => v.id === selectedValue);
      if (value) {
        total += value.priceModifier;
      }
    }
  });

  return total;
}

/**
 * Récupère les options de prix actives pour un établissement
 */
export async function fetchPricingOptions(
  hotelSlug: string
): Promise<PricingOption[]> {
  try {
    const response = await fetch(
      `/api/establishments/${hotelSlug}/pricing-options`
    );

    if (response.ok) {
      const data = await response.json();
      return data.pricingOptions || [];
    }

    return [];
  } catch (error) {
    console.error("Erreur lors du chargement des options de prix:", error);
    return [];
  }
}
