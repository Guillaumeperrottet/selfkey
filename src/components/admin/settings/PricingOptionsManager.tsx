"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  X,
  GripVertical,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toastUtils } from "@/lib/toast-utils";

interface PricingOptionValue {
  id?: string;
  label: string;
  priceModifier: number;
  isDefault: boolean;
  displayOrder: number;
  isPerNight?: boolean;
}

interface PricingOption {
  id?: string;
  name: string;
  type: "select" | "checkbox" | "radio";
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
  values: PricingOptionValue[];
}

interface PricingOptionsManagerProps {
  hotelSlug: string;
}

export function PricingOptionsManager({
  hotelSlug,
}: PricingOptionsManagerProps) {
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [previewSelections, setPreviewSelections] = useState<
    Record<string, string | string[]>
  >({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/api/admin/${hotelSlug}/pricing-options`);
        if (response.ok) {
          const data = await response.json();
          setPricingOptions(data.pricingOptions || []);
        }
      } catch (error) {
        toastUtils.error("Erreur lors du chargement des options de prix");
        console.error("Erreur chargement pricing options:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [hotelSlug]);

  const loadPricingOptions = async () => {
    try {
      const response = await fetch(`/api/admin/${hotelSlug}/pricing-options`);
      if (response.ok) {
        const data = await response.json();
        setPricingOptions(data.pricingOptions || []);
      }
    } catch (error) {
      toastUtils.error("Erreur lors du chargement des options de prix");
      console.error("Erreur chargement pricing options:", error);
    }
  };

  const addPricingOption = () => {
    const newOption: PricingOption = {
      name: "",
      type: "select",
      isRequired: false,
      isActive: true,
      displayOrder: pricingOptions.length,
      values: [
        {
          label: "Option 1",
          priceModifier: 0,
          isDefault: false,
          displayOrder: 0,
        },
      ],
    };
    setPricingOptions([...pricingOptions, newOption]);
  };

  const updatePricingOption = (
    index: number,
    updates: Partial<PricingOption>
  ) => {
    const updated = [...pricingOptions];
    updated[index] = { ...updated[index], ...updates };
    setPricingOptions(updated);
  };

  const deletePricingOption = (index: number) => {
    const updated = pricingOptions.filter((_, i) => i !== index);
    setPricingOptions(updated);
  };

  const addValue = (optionIndex: number) => {
    const updated = [...pricingOptions];
    const currentOption = updated[optionIndex];
    const newValue: PricingOptionValue = {
      label: `Option ${currentOption.values.length + 1}`,
      priceModifier: 0,
      isDefault: false,
      displayOrder: currentOption.values.length,
      isPerNight: false,
    };
    updated[optionIndex].values.push(newValue);
    setPricingOptions(updated);
  };

  const updateValue = (
    optionIndex: number,
    valueIndex: number,
    updates: Partial<PricingOptionValue>
  ) => {
    const updated = [...pricingOptions];

    // Si on coche "isDefault", il faut gérer la logique selon le type d'option
    if (updates.isDefault === true) {
      const option = updated[optionIndex];

      if (option.type === "select" || option.type === "radio") {
        // Pour select et radio, une seule valeur peut être par défaut
        // Décocher toutes les autres valeurs par défaut
        updated[optionIndex].values.forEach((value, idx) => {
          if (idx !== valueIndex) {
            value.isDefault = false;
          }
        });
      }
      // Pour checkbox, plusieurs valeurs peuvent être par défaut
    }

    updated[optionIndex].values[valueIndex] = {
      ...updated[optionIndex].values[valueIndex],
      ...updates,
    };
    setPricingOptions(updated);
  };

  const deleteValue = (optionIndex: number, valueIndex: number) => {
    const updated = [...pricingOptions];
    updated[optionIndex].values = updated[optionIndex].values.filter(
      (_, i) => i !== valueIndex
    );
    setPricingOptions(updated);
  };

  const savePricingOptions = async () => {
    setSaving(true);

    // Validation avant sauvegarde
    const invalidOptions = pricingOptions.filter((option) => {
      if (!option.name.trim()) return true;
      if (option.values.length === 0) return true;
      if (!option.values.some((value) => value.label.trim())) return true;
      return false;
    });

    if (invalidOptions.length > 0) {
      setSaving(false);
      toastUtils.error(
        "Veuillez compléter toutes les options (nom et au moins une valeur avec un label)"
      );
      return;
    }

    const loadingToast = toastUtils.loading("Sauvegarde en cours...");

    try {
      const response = await fetch(`/api/admin/${hotelSlug}/pricing-options`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pricingOptions }),
      });

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        toastUtils.success("Options de prix sauvegardées avec succès");
        await loadPricingOptions();
      } else {
        const data = await response.json();
        toastUtils.error(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la sauvegarde");
      console.error("Erreur sauvegarde pricing options:", error);
    } finally {
      setSaving(false);
    }
  };

  // Fonctions pour gérer la prévisualisation interactive
  const handlePreviewSelect = (optionName: string, value: string) => {
    setPreviewSelections((prev) => ({ ...prev, [optionName]: value }));
  };

  const handlePreviewRadio = (optionName: string, value: string) => {
    setPreviewSelections((prev) => ({ ...prev, [optionName]: value }));
  };

  const handlePreviewCheckbox = (
    optionName: string,
    value: string,
    checked: boolean
  ) => {
    setPreviewSelections((prev) => {
      const current = (prev[optionName] as string[]) || [];
      if (checked) {
        return { ...prev, [optionName]: [...current, value] };
      } else {
        return { ...prev, [optionName]: current.filter((v) => v !== value) };
      }
    });
  };

  // Calculer le prix total avec les sélections
  const calculatePreviewTotal = () => {
    let total = 0;

    pricingOptions
      .filter(
        (option) =>
          option.isActive && option.name && option.values.some((v) => v.label)
      )
      .forEach((option) => {
        const selection = previewSelections[option.name];

        if (option.type === "checkbox" && Array.isArray(selection)) {
          selection.forEach((selectedValue) => {
            const value = option.values.find((v) => v.label === selectedValue);
            if (value) total += value.priceModifier;
          });
        } else if (typeof selection === "string" && selection) {
          const value = option.values.find((v) => v.label === selection);
          if (value) total += value.priceModifier;
        }
      });

    return total;
  };

  // Initialiser les sélections par défaut
  useEffect(() => {
    const defaultSelections: Record<string, string | string[]> = {};

    pricingOptions
      .filter(
        (option) =>
          option.isActive && option.name && option.values.some((v) => v.label)
      )
      .forEach((option) => {
        const defaultValues = option.values.filter(
          (v) => v.isDefault && v.label
        );

        if (option.type === "checkbox") {
          defaultSelections[option.name] = defaultValues.map((v) => v.label);
        } else if (defaultValues.length > 0) {
          defaultSelections[option.name] = defaultValues[0].label;
        }
      });

    setPreviewSelections(defaultSelections);
  }, [pricingOptions]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Options de Prix Personnalisées
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Guide d'utilisation discret */}
        <Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              {isGuideOpen ? (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Masquer le guide d&apos;utilisation
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Afficher le guide d&apos;utilisation
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="bg-blue-50 border-blue-200 mt-2">
              <CardContent className="space-y-4 text-sm text-blue-700 pt-6">
                <div>
                  <h4 className="font-medium mb-2">
                    📝 Comment créer des options de prix :
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Cliquez sur &quot;Ajouter une option de prix&quot;</li>
                    <li>
                      Donnez un nom à votre option (ex: &quot;Petit
                      déjeuner&quot;)
                    </li>
                    <li>Choisissez le type d&apos;affichage</li>
                    <li>Ajoutez les valeurs possibles avec leurs prix</li>
                    <li>
                      Cochez &quot;Actif&quot; pour l&apos;afficher aux clients
                    </li>
                    <li>Cliquez sur &quot;Sauvegarder&quot;</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-blue-800 mb-2">
                      📋 Menu déroulant
                    </h4>
                    <p className="text-xs">
                      Pour choisir UNE option parmi plusieurs.
                    </p>
                    <p className="text-xs mt-1">
                      <strong>Exemple :</strong> Hauteur véhicule
                    </p>
                    <p className="text-xs">• Moins de 2m: +0 CHF</p>
                    <p className="text-xs">• Plus de 2m: +15 CHF</p>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-blue-800 mb-2">
                      ○ Boutons radio
                    </h4>
                    <p className="text-xs">
                      Pour choisir UNE option parmi plusieurs.
                    </p>
                    <p className="text-xs mt-1">
                      <strong>Exemple :</strong> Petit déjeuner
                    </p>
                    <p className="text-xs">○ Sans: +0 CHF</p>
                    <p className="text-xs">● Continental: +15 CHF</p>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-blue-800 mb-2">
                      ☑ Cases à cocher
                    </h4>
                    <p className="text-xs">Pour choisir PLUSIEURS options.</p>
                    <p className="text-xs mt-1">
                      <strong>Exemple :</strong> Services
                    </p>
                    <p className="text-xs">☑ WiFi: +5 CHF</p>
                    <p className="text-xs">☑ Parking: +10 CHF</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-blue-800 mb-2">
                    💡 Conseils :
                  </h4>
                  <ul className="text-xs space-y-1 ml-2">
                    <li>
                      • Utilisez des prix négatifs pour des réductions (ex: -10
                      CHF)
                    </li>
                    <li>
                      • Marquez une valeur comme &quot;Défaut&quot; pour
                      qu&apos;elle soit pré-sélectionnée
                    </li>
                    <li>
                      • Pour les options non-obligatoires, les clients peuvent
                      décocher toutes les valeurs
                    </li>
                    <li>
                      • Pour les menus déroulants et boutons radio, une seule
                      valeur peut être par défaut
                    </li>
                    <li>
                      • Cochez &quot;Obligatoire&quot; si le client doit
                      absolument choisir
                    </li>
                    <li>
                      • Désactivez une option pour la cacher temporairement
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Prévisualisation des options */}
        {pricingOptions.filter(
          (option) =>
            option.isActive && option.name && option.values.some((v) => v.label)
        ).length > 0 && (
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  👀 Aperçu - Vue client lors de la réservation
                </span>
                {calculatePreviewTotal() !== 0 && (
                  <span className="text-sm font-normal bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Total options: {calculatePreviewTotal() > 0 ? "+" : ""}
                    {calculatePreviewTotal()} CHF
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pricingOptions
                .filter(
                  (option) =>
                    option.isActive &&
                    option.name &&
                    option.values.some((v) => v.label)
                )
                .map((option, index) => (
                  <div key={index} className="bg-white p-4 rounded border">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-medium text-gray-900">
                        {option.name}
                      </h4>
                      {option.isRequired && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Obligatoire
                        </span>
                      )}
                    </div>

                    {option.type === "select" && (
                      <select
                        className="w-full p-2 border rounded-md bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={(previewSelections[option.name] as string) || ""}
                        onChange={(e) =>
                          handlePreviewSelect(option.name, e.target.value)
                        }
                      >
                        <option value="">Choisissez une option...</option>
                        {option.values
                          .filter((value) => value.label)
                          .map((value, idx) => (
                            <option key={idx} value={value.label}>
                              {value.label}
                              {value.priceModifier !== 0 &&
                                ` (${value.priceModifier > 0 ? "+" : ""}${value.priceModifier} CHF)`}
                            </option>
                          ))}
                      </select>
                    )}

                    {option.type === "radio" && (
                      <div className="space-y-2">
                        {option.values
                          .filter((value) => value.label)
                          .map((value, idx) => (
                            <label
                              key={idx}
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                            >
                              <input
                                type="radio"
                                name={`preview-${option.name}-${index}`}
                                value={value.label}
                                checked={
                                  previewSelections[option.name] === value.label
                                }
                                onChange={(e) =>
                                  handlePreviewRadio(
                                    option.name,
                                    e.target.value
                                  )
                                }
                                className="text-blue-600"
                              />
                              <span className="text-gray-700">
                                {value.label}
                                {value.priceModifier !== 0 && (
                                  <span className="text-gray-500 ml-1">
                                    ({value.priceModifier > 0 ? "+" : ""}
                                    {value.priceModifier} CHF)
                                  </span>
                                )}
                              </span>
                            </label>
                          ))}
                      </div>
                    )}

                    {option.type === "checkbox" && (
                      <div className="space-y-2">
                        {option.values
                          .filter((value) => value.label)
                          .map((value, idx) => (
                            <label
                              key={idx}
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={(
                                  (previewSelections[
                                    option.name
                                  ] as string[]) || []
                                ).includes(value.label)}
                                onChange={(e) =>
                                  handlePreviewCheckbox(
                                    option.name,
                                    value.label,
                                    e.target.checked
                                  )
                                }
                                className="text-blue-600"
                              />
                              <span className="text-gray-700">
                                {value.label}
                                {value.priceModifier !== 0 && (
                                  <span className="text-gray-500 ml-1">
                                    ({value.priceModifier > 0 ? "+" : ""}
                                    {value.priceModifier} CHF)
                                  </span>
                                )}
                              </span>
                            </label>
                          ))}
                      </div>
                    )}
                  </div>
                ))}

              <div className="text-xs text-gray-500 italic mt-3">
                💡 Cette prévisualisation est interactive ! Testez vos options
                pour voir comment elles fonctionneront pour vos clients. Le
                total des options sélectionnées s&apos;affiche en temps réel.
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {pricingOptions.map((option, optionIndex) => (
            <Card key={optionIndex} className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`option-name-${optionIndex}`}>
                        Nom de l&apos;option
                      </Label>
                      <Input
                        id={`option-name-${optionIndex}`}
                        value={option.name}
                        onChange={(e) =>
                          updatePricingOption(optionIndex, {
                            name: e.target.value,
                          })
                        }
                        placeholder="ex: Hauteur du véhicule"
                        className={
                          !option.name.trim() ? "border-red-300 bg-red-50" : ""
                        }
                      />
                      {!option.name.trim() && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Nom requis pour sauvegarder
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`option-type-${optionIndex}`}>Type</Label>
                      <Select
                        value={option.type}
                        onValueChange={(value: string) =>
                          updatePricingOption(optionIndex, {
                            type: value as "select" | "checkbox" | "radio",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select">Menu déroulant</SelectItem>
                          <SelectItem value="radio">Boutons radio</SelectItem>
                          <SelectItem value="checkbox">
                            Cases à cocher
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={option.isRequired}
                          onChange={(e) =>
                            updatePricingOption(optionIndex, {
                              isRequired: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm">Obligatoire</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={option.isActive}
                          onChange={(e) =>
                            updatePricingOption(optionIndex, {
                              isActive: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm">Actif</span>
                      </label>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePricingOption(optionIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Valeurs possibles</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addValue(optionIndex)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une valeur
                    </Button>
                  </div>

                  {option.values.map((value, valueIndex) => (
                    <div key={valueIndex} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          value={value.label}
                          onChange={(e) =>
                            updateValue(optionIndex, valueIndex, {
                              label: e.target.value,
                            })
                          }
                          placeholder="ex: Moins de 2m"
                          className={
                            !value.label.trim()
                              ? "border-red-300 bg-red-50"
                              : ""
                          }
                        />
                        {!value.label.trim() && (
                          <p className="text-xs text-red-600 mt-1">
                            ⚠️ Label requis pour sauvegarder
                          </p>
                        )}
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          step="0.01"
                          value={value.priceModifier}
                          onChange={(e) =>
                            updateValue(optionIndex, valueIndex, {
                              priceModifier: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Prix (CHF)"
                        />
                      </div>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={value.isDefault}
                          onChange={(e) =>
                            updateValue(optionIndex, valueIndex, {
                              isDefault: e.target.checked,
                            })
                          }
                        />
                        <span className="text-xs">Défaut</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={value.isPerNight || false}
                          onChange={(e) =>
                            updateValue(optionIndex, valueIndex, {
                              isPerNight: e.target.checked,
                            })
                          }
                        />
                        <span className="text-xs">Par nuit</span>
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteValue(optionIndex, valueIndex)}
                        disabled={option.values.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={addPricingOption}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une option de prix
          </Button>

          <Button onClick={savePricingOptions} disabled={saving}>
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
