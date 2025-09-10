import { useState, useEffect } from "react";
import {
  calculatePricingOptionsTotal,
  type PricingOption,
} from "@/lib/pricing-options-calculator";
import { calculateTouristTax } from "@/lib/fee-calculator";
import { calculateStayDuration } from "@/lib/availability";

interface Room {
  id: string;
  name: string;
  price: number;
}

interface UseBookingCartProps {
  room: Room;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
  selectedPricingOptions?: Record<string, string | string[]>;
  pricingOptions?: PricingOption[];
  touristTaxEnabled?: boolean;
  touristTaxAmount?: number;
  currency?: string;
}

export function useBookingCart({
  room,
  checkInDate,
  checkOutDate,
  adults,
  children = 0,
  selectedPricingOptions = {},
  pricingOptions = [],
  touristTaxEnabled = false,
  touristTaxAmount = 0,
  currency = "CHF",
}: UseBookingCartProps) {
  const [cartTotal, setCartTotal] = useState(0);
  const [breakdown, setBreakdown] = useState({
    basePrice: 0,
    pricingOptionsTotal: 0,
    touristTaxTotal: 0,
    subtotal: 0,
    total: 0,
    duration: 0,
  });

  useEffect(() => {
    // Calculer la durée du séjour
    const duration = calculateStayDuration(
      new Date(checkInDate),
      new Date(checkOutDate)
    );

    // Prix de base (chambre × nuits)
    const basePrice = room.price * duration;

    // Total des options de prix
    const pricingOptionsTotal = calculatePricingOptionsTotal(
      selectedPricingOptions,
      pricingOptions
    );

    // Taxe de séjour
    const touristTaxCalculation = calculateTouristTax(
      adults,
      duration,
      touristTaxAmount,
      touristTaxEnabled
    );
    const touristTaxTotal = touristTaxCalculation.totalTax;

    // Sous-total et total
    const subtotal = basePrice + pricingOptionsTotal;
    const total = subtotal + touristTaxTotal;

    const newBreakdown = {
      basePrice,
      pricingOptionsTotal,
      touristTaxTotal,
      subtotal,
      total,
      duration,
    };

    setBreakdown(newBreakdown);
    setCartTotal(total);
  }, [
    room.price,
    checkInDate,
    checkOutDate,
    adults,
    children,
    selectedPricingOptions,
    pricingOptions,
    touristTaxEnabled,
    touristTaxAmount,
  ]);

  // Fonction pour formater les prix
  const formatPrice = (amount: number) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  // Fonction pour obtenir le nom d'affichage des options
  const getOptionDisplayName = (optionId: string, value: string | string[]) => {
    const option = pricingOptions.find((opt) => opt.id === optionId);
    if (!option) return "";

    if (Array.isArray(value)) {
      return value
        .map((valueId) => {
          const optionValue = option.values.find((v) => v.id === valueId);
          return optionValue ? optionValue.label : "";
        })
        .filter(Boolean)
        .join(", ");
    } else {
      const optionValue = option.values.find((v) => v.id === value);
      return optionValue ? optionValue.label : "";
    }
  };

  // Fonction pour obtenir le prix d'une option
  const getOptionPrice = (optionId: string, value: string | string[]) => {
    const option = pricingOptions.find((opt) => opt.id === optionId);
    if (!option) return 0;

    if (Array.isArray(value)) {
      return value.reduce((total, valueId) => {
        const optionValue = option.values.find((v) => v.id === valueId);
        return total + (optionValue ? optionValue.priceModifier : 0);
      }, 0);
    } else {
      const optionValue = option.values.find((v) => v.id === value);
      return optionValue ? optionValue.priceModifier : 0;
    }
  };

  return {
    total: cartTotal,
    breakdown,
    formatPrice,
    getOptionDisplayName,
    getOptionPrice,
    currency,
  };
}
