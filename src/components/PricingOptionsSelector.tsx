"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, ChevronLeft } from "lucide-react";

interface PricingOptionValue {
  id: string;
  label: string;
  priceModifier: number;
  isDefault: boolean;
  displayOrder: number;
}

interface PricingOption {
  id: string;
  name: string;
  description: string | null;
  type: "select" | "radio" | "checkbox";
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
  values: PricingOptionValue[];
}

interface PricingOptionsSelectorProps {
  hotelSlug: string;
  checkInDate: string;
  checkOutDate: string;
  hasDog?: boolean;
  onOptionsConfirmed: (options: Record<string, string | string[]>) => void;
  onBack: () => void;
  initialOptions?: Record<string, string | string[]>;
}

export function PricingOptionsSelector({
  hotelSlug,
  checkInDate,
  checkOutDate,
  hasDog,
  onOptionsConfirmed,
  onBack,
  initialOptions = {},
}: PricingOptionsSelectorProps) {
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [selectedOptions, setSelectedOptions] =
    useState<Record<string, string | string[]>>(initialOptions);
  const [loading, setLoading] = useState(true);

  // Charger les options de prix
  useEffect(() => {
    const loadPricingOptions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/establishments/${hotelSlug}/pricing-options`
        );

        if (response.ok) {
          const data = await response.json();
          setPricingOptions(data.pricingOptions || []);

          // Initialiser les valeurs par défaut seulement si aucune option initiale n'est fournie
          if (Object.keys(initialOptions).length === 0) {
            const defaultSelections: Record<string, string | string[]> = {};
            data.pricingOptions?.forEach((option: PricingOption) => {
              const defaultValue = option.values.find((v) => v.isDefault);
              if (defaultValue) {
                if (option.type === "checkbox") {
                  defaultSelections[option.id] = [defaultValue.id];
                } else {
                  defaultSelections[option.id] = defaultValue.id;
                }
              }
            });
            setSelectedOptions(defaultSelections);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des options de prix:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPricingOptions();
  }, [hotelSlug, initialOptions]);

  const handleOptionChange = (optionId: string, value: string | string[]) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }));
  };

  const handleContinue = () => {
    // Vérifier que toutes les options obligatoires sont sélectionnées
    const missingRequired = pricingOptions
      .filter((option) => option.isRequired && option.isActive)
      .find((option) => {
        const selected = selectedOptions[option.id];
        return (
          !selected ||
          (Array.isArray(selected) && selected.length === 0) ||
          (!Array.isArray(selected) && selected === "")
        );
      });

    if (missingRequired) {
      alert(`Veuillez sélectionner une option pour "${missingRequired.name}"`);
      return;
    }

    onOptionsConfirmed(selectedOptions);
  };

  const formatDates = (checkIn: string, checkOut: string) => {
    const checkInFormatted = new Date(checkIn).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const checkOutFormatted = new Date(checkOut).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return `${checkInFormatted} → ${checkOutFormatted}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des options...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeOptions = pricingOptions.filter(
    (option) => option.isActive && option.values?.length > 0
  );

  // Si aucune option n'est disponible, passer directement à l'étape suivante
  if (activeOptions.length === 0) {
    onOptionsConfirmed({});
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Additional Options
            <Badge variant="secondary" className="ml-2">
              {formatDates(checkInDate, checkOutDate)}
              {hasDog && <span className="ml-1">🐕</span>}
            </Badge>
          </CardTitle>
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Personnalisez votre séjour avec nos options supplémentaires
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activeOptions
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((option) => (
              <div
                key={option.id}
                className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {option.name}
                    {option.isRequired && (
                      <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded-full">
                        Obligatoire
                      </span>
                    )}
                  </Label>
                </div>

                {option.description && (
                  <p className="text-sm text-gray-600">{option.description}</p>
                )}

                {option.type === "select" && (
                  <Select
                    value={
                      (selectedOptions[option.id] as string) ||
                      (option.isRequired ? "" : "__none__")
                    }
                    onValueChange={(value) =>
                      handleOptionChange(
                        option.id,
                        value === "__none__" ? "" : value
                      )
                    }
                  >
                    <SelectTrigger className="h-12 bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500">
                      <SelectValue placeholder="Sélectionnez une option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {!option.isRequired && (
                        <SelectItem value="__none__">
                          <span className="text-gray-500">Aucune option</span>
                        </SelectItem>
                      )}
                      {option.values
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((value) => (
                          <SelectItem key={value.id} value={value.id}>
                            {value.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}

                {option.type === "checkbox" && (
                  <div className="space-y-2">
                    {option.values
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((value) => (
                        <div
                          key={value.id}
                          className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                          onClick={() => {
                            const currentValues =
                              (selectedOptions[option.id] as string[]) || [];
                            const isChecked = currentValues.includes(value.id);
                            const newValues = isChecked
                              ? currentValues.filter((v) => v !== value.id)
                              : [...currentValues, value.id];

                            if (newValues.length === 0 && option.isRequired) {
                              return;
                            }

                            handleOptionChange(option.id, newValues);
                          }}
                        >
                          <Checkbox
                            id={`${option.id}-${value.id}`}
                            checked={
                              (
                                selectedOptions[option.id] as string[]
                              )?.includes(value.id) || false
                            }
                            onChange={() => {}} // Géré par le onClick du div parent
                          />
                          <Label
                            htmlFor={`${option.id}-${value.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {value.label}
                          </Label>
                        </div>
                      ))}
                  </div>
                )}

                {option.type === "radio" && (
                  <div className="space-y-2">
                    {option.values
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((value) => (
                        <div
                          key={value.id}
                          className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                          onClick={() =>
                            handleOptionChange(option.id, value.id)
                          }
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              selectedOptions[option.id] === value.id
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedOptions[option.id] === value.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <Label className="text-sm cursor-pointer flex-1">
                            {value.label}
                          </Label>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}

          <div className="pt-4 border-t">
            <Button onClick={handleContinue} className="w-full" size="lg">
              Continue to Room Selection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
