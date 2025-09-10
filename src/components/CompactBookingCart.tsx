"use client";

import { ShoppingCart } from "lucide-react";
import { calculateStayDuration } from "@/lib/availability";
import {
  calculatePricingOptionsTotal,
  type PricingOption,
} from "@/lib/pricing-options-calculator";

interface Room {
  id: string;
  name: string;
  price: number;
}

interface CompactBookingCartProps {
  room: Room;
  checkInDate: string;
  checkOutDate: string;
  currency?: string;
  selectedPricingOptions?: Record<string, string | string[]>;
  pricingOptions?: PricingOption[];
  touristTaxTotal?: number;
  className?: string;
}

export function CompactBookingCart({
  room,
  checkInDate,
  checkOutDate,
  currency = "CHF",
  selectedPricingOptions = {},
  pricingOptions = [],
  touristTaxTotal = 0,
  className = "",
}: CompactBookingCartProps) {
  // Calculs
  const duration = calculateStayDuration(
    new Date(checkInDate),
    new Date(checkOutDate)
  );

  const basePrice = room.price * duration;

  const pricingOptionsTotal = calculatePricingOptionsTotal(
    selectedPricingOptions,
    pricingOptions
  );

  const total = basePrice + pricingOptionsTotal + touristTaxTotal;

  return (
    <div className={`flex flex-col items-center gap-0.5 ${className}`}>
      <div className="relative">
        <ShoppingCart className="h-5 w-5 text-gray-600" />
        {Object.keys(selectedPricingOptions).length > 0 && (
          <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-xs rounded-full h-3.5 w-3.5 flex items-center justify-center font-medium">
            {Object.keys(selectedPricingOptions).length}
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold text-gray-900">
          {total.toFixed(2)} {currency}
        </div>
        <div className="text-xs text-gray-500 leading-tight">
          {duration} night{duration > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
