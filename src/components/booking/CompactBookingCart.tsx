"use client";

import { ShoppingCart, ChevronDown } from "lucide-react";
import { calculateStayDuration } from "@/lib/availability";
import {
  calculatePricingOptionsTotal,
  type PricingOption,
} from "@/lib/pricing-options-calculator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    pricingOptions,
    duration
  );

  const total = basePrice + pricingOptionsTotal + touristTaxTotal;

  const getOptionDisplayName = (
    optionId: string,
    valueId: string | string[]
  ): string => {
    const option = pricingOptions.find((opt) => opt.id === optionId);
    if (!option) return "";

    if (Array.isArray(valueId)) {
      const values = valueId
        .map((id) => option.values.find((val) => val.id === id)?.label)
        .filter(Boolean);
      return `${option.name}: ${values.join(", ")}`;
    } else {
      const value = option.values.find((val) => val.id === valueId);
      return `${option.name}: ${value ? value.label : valueId}`;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`flex flex-col items-center gap-0.5 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer ${className}`}
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            {Object.keys(selectedPricingOptions).length > 0 && (
              <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-xs rounded-full h-3.5 w-3.5 flex items-center justify-center font-medium">
                {Object.keys(selectedPricingOptions).length}
              </div>
            )}
            <ChevronDown className="h-3 w-3 text-gray-400 absolute -bottom-1 -right-1" />
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-900">
              {total.toFixed(2)} {currency}
            </div>
            <div className="text-xs text-gray-500 leading-tight">
              {duration} night{duration > 1 ? "s" : ""}
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Détails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Chambre */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {room.name} ({duration} nuit{duration > 1 ? "s" : ""})
              </span>
              <span className="text-sm font-medium">
                {basePrice.toFixed(2)} {currency}
              </span>
            </div>

            {/* Options sélectionnées */}
            {Object.keys(selectedPricingOptions).length > 0 && (
              <>
                {Object.entries(selectedPricingOptions).map(([key, value]) => {
                  const option = pricingOptions.find((opt) => opt.id === key);
                  let optionPrice = 0;

                  if (option) {
                    if (Array.isArray(value)) {
                      optionPrice = value.reduce((total, valueId) => {
                        const optionValue = option.values.find(
                          (val) => val.id === valueId
                        );
                        if (!optionValue) return total;
                        // Multiplier par duration si isPerNight=true
                        const multiplier = optionValue.isPerNight
                          ? duration
                          : 1;
                        return total + optionValue.priceModifier * multiplier;
                      }, 0);
                    } else {
                      const optionValue = option.values.find(
                        (val) => val.id === value
                      );
                      if (optionValue) {
                        // Multiplier par duration si isPerNight=true
                        const multiplier = optionValue.isPerNight
                          ? duration
                          : 1;
                        optionPrice = optionValue.priceModifier * multiplier;
                      }
                    }
                  }

                  return (
                    <div
                      key={key}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600">
                        {getOptionDisplayName(key, value)}
                      </span>
                      {optionPrice > 0 && (
                        <span className="text-sm font-medium">
                          +{optionPrice.toFixed(2)} {currency}
                        </span>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* Taxe de séjour */}
            {touristTaxTotal > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taxe de séjour</span>
                <span className="text-sm font-medium">
                  {touristTaxTotal.toFixed(2)} {currency}
                </span>
              </div>
            )}

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold">Total</span>
              <span className="text-base font-bold text-gray-900">
                {total.toFixed(2)} {currency}
              </span>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
