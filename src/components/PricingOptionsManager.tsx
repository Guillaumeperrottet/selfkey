"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

interface PricingOptionValue {
  id?: string;
  label: string;
  priceModifier: number;
  isDefault: boolean;
  displayOrder: number;
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/api/admin/${hotelSlug}/pricing-options`);
        if (response.ok) {
          const data = await response.json();
          setPricingOptions(data.pricingOptions || []);
        }
      } catch {
        setError("Erreur lors du chargement des options de prix");
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
    } catch {
      setError("Erreur lors du chargement des options de prix");
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
          label: "",
          priceModifier: 0,
          isDefault: false, // Ne pas marquer comme défaut automatiquement
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
    const newValue: PricingOptionValue = {
      label: "",
      priceModifier: 0,
      isDefault: false, // Ne pas marquer comme défaut automatiquement
      displayOrder: updated[optionIndex].values.length,
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
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/${hotelSlug}/pricing-options`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pricingOptions }),
      });

      if (response.ok) {
        setSuccess("Options de prix sauvegardées avec succès");
        await loadPricingOptions();
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la sauvegarde");
      }
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

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
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
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
                      />
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
                        />
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
