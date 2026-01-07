"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Users,
  Bed,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

interface BookingCartProps {
  // Données obligatoires
  room: Room;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  childrenCount?: number;
  currency?: string;

  // Options de prix
  selectedPricingOptions?: Record<string, string | string[]>;
  pricingOptions?: PricingOption[];

  // Frais supplémentaires
  touristTaxTotal?: number;
  touristTaxPerPersonPerNight?: number;

  // Configuration
  className?: string;
  isSticky?: boolean;
  showMinimized?: boolean;
  onContinue?: () => void;
  continueText?: string;
  showContinueButton?: boolean;
}

export function BookingCart({
  room,
  checkInDate,
  checkOutDate,
  adults,
  childrenCount = 0,
  currency = "CHF",
  selectedPricingOptions = {},
  pricingOptions = [],
  touristTaxTotal = 0,
  touristTaxPerPersonPerNight = 0,
  className = "",
  isSticky = true,
  showMinimized = false,
  onContinue,
  continueText = "Continue",
  showContinueButton = false,
}: BookingCartProps) {
  const [isMinimized, setIsMinimized] = useState(showMinimized);

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

  const subtotal = basePrice + pricingOptionsTotal;
  const total = subtotal + touristTaxTotal;

  // Format dates
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Obtenir le nom d'affichage des options sélectionnées
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

  const getOptionPrice = (optionId: string, value: string | string[]) => {
    const option = pricingOptions.find((opt) => opt.id === optionId);
    if (!option) return 0;

    if (Array.isArray(value)) {
      return value.reduce((total, valueId) => {
        const optionValue = option.values.find((v) => v.id === valueId);
        if (!optionValue) return total;
        // Multiplier par duration si isPerNight=true
        const multiplier = optionValue.isPerNight ? duration : 1;
        return total + optionValue.priceModifier * multiplier;
      }, 0);
    } else {
      const optionValue = option.values.find((v) => v.id === value);
      if (!optionValue) return 0;
      // Multiplier par duration si isPerNight=true
      const multiplier = optionValue.isPerNight ? duration : 1;
      return optionValue.priceModifier * multiplier;
    }
  };

  const CartContent = () => (
    <div className="space-y-4">
      {/* En-tête avec dates et invités */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">
            {formatDate(checkInDate)} → {formatDate(checkOutDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">
            {adults + childrenCount} guest
            {adults + childrenCount > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <Separator />

      {/* Détail des coûts */}
      <div className="space-y-3">
        {/* Chambre */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {room.name} ({duration} night{duration > 1 ? "s" : ""})
            </span>
          </div>
          {basePrice > 0 && (
            <span className="text-sm font-medium">
              {basePrice.toFixed(2)} {currency}
            </span>
          )}
        </div>

        {/* Options de prix */}
        {Object.keys(selectedPricingOptions).length > 0 && (
          <>
            {Object.entries(selectedPricingOptions).map(([optionId, value]) => {
              const optionPrice = getOptionPrice(optionId, value);
              const displayName = getOptionDisplayName(optionId, value);

              if (!displayName) return null;

              return (
                <div
                  key={optionId}
                  className="flex justify-between items-center pl-6"
                >
                  <span className="text-sm text-gray-600">{displayName}</span>
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
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">Tourist tax</span>
              {touristTaxPerPersonPerNight > 0 && (
                <Info className="h-3 w-3 text-gray-400" />
              )}
            </div>
            <span className="text-sm font-medium">
              {touristTaxTotal.toFixed(2)} {currency}
            </span>
          </div>
        )}
      </div>

      <Separator />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-base font-semibold">Total</span>
        <span className="text-xl font-bold text-blue-600">
          {total.toFixed(2)} {currency}
        </span>
      </div>

      {/* Bouton de continuation */}
      {showContinueButton && onContinue && (
        <Button onClick={onContinue} className="w-full" size="lg">
          {continueText}
        </Button>
      )}
    </div>
  );

  return (
    <Card
      className={`${isSticky ? "sticky top-4" : ""} ${className} border border-gray-200 shadow-sm bg-white`}
    >
      <Collapsible
        open={!isMinimized}
        onOpenChange={() => setIsMinimized(!isMinimized)}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                Your Booking
                {total > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {total.toFixed(2)} {currency}
                  </Badge>
                )}
              </CardTitle>
              {isMinimized ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <CartContent />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
