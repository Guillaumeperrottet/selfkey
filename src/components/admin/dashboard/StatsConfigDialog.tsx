"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AVAILABLE_STATS,
  CATEGORY_LABELS,
  type StatCategory,
  type DashboardPreferences,
} from "@/types/dashboard-stats";
import { Settings2, Info } from "lucide-react";
import { toast } from "sonner";

interface StatsConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPreferences: DashboardPreferences;
  onSave: (preferences: DashboardPreferences) => Promise<void>;
}

export function StatsConfigDialog({
  open,
  onOpenChange,
  currentPreferences,
  onSave,
}: StatsConfigDialogProps) {
  const [localPreferences, setLocalPreferences] =
    useState<DashboardPreferences>(currentPreferences);
  const [isSaving, setIsSaving] = useState(false);

  // Mettre à jour les préférences locales quand les props changent
  useEffect(() => {
    setLocalPreferences(currentPreferences);
  }, [currentPreferences]);

  const handleToggleStat = (category: StatCategory, statId: string) => {
    setLocalPreferences((prev) => {
      const categoryStats = prev.visibleStats[category] || [];
      const isCurrentlyVisible = categoryStats.includes(statId);

      return {
        ...prev,
        visibleStats: {
          ...prev.visibleStats,
          [category]: isCurrentlyVisible
            ? categoryStats.filter((id) => id !== statId)
            : [...categoryStats, statId],
        },
      };
    });
  };

  const handleToggleCategory = (category: StatCategory, checked: boolean) => {
    setLocalPreferences((prev) => {
      if (checked) {
        // Activer toutes les stats de la catégorie
        const allStatIds = AVAILABLE_STATS[category].map((stat) => stat.id);
        return {
          ...prev,
          visibleStats: {
            ...prev.visibleStats,
            [category]: allStatIds,
          },
        };
      } else {
        // Désactiver toutes les stats de la catégorie
        return {
          ...prev,
          visibleStats: {
            ...prev.visibleStats,
            [category]: [],
          },
        };
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(localPreferences);
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde des préférences");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalSelectedStats = () => {
    return Object.values(localPreferences.visibleStats).reduce(
      (sum, stats) => sum + (stats?.length || 0),
      0
    );
  };

  const isCategoryFullySelected = (category: StatCategory) => {
    const categoryStats = localPreferences.visibleStats[category] || [];
    const totalStats = AVAILABLE_STATS[category].length;
    return categoryStats.length === totalStats && totalStats > 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Settings2 className="h-6 w-6 text-blue-600" />
            Personnaliser les statistiques
          </DialogTitle>
          <DialogDescription>
            Choisissez les statistiques que vous souhaitez afficher sur votre
            dashboard. Vos préférences seront sauvegardées automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1">
          {/* Compteur de stats sélectionnées */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                {getTotalSelectedStats()} statistique
                {getTotalSelectedStats() > 1 ? "s" : ""} sélectionnée
                {getTotalSelectedStats() > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Vous pouvez sélectionner autant de statistiques que vous le
                souhaitez
              </p>
            </div>
          </div>

          {/* Catégories et statistiques */}
          {(Object.keys(AVAILABLE_STATS) as StatCategory[]).map(
            (category, categoryIndex) => {
              const stats = AVAILABLE_STATS[category];
              const categoryLabel = CATEGORY_LABELS[category];
              const selectedStats =
                localPreferences.visibleStats[category] || [];

              return (
                <div key={category} className="space-y-3">
                  {categoryIndex > 0 && <Separator className="my-6" />}

                  {/* En-tête de catégorie */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`category-${category}`}
                        checked={isCategoryFullySelected(category)}
                        onCheckedChange={(checked) =>
                          handleToggleCategory(category, checked as boolean)
                        }
                        className="h-5 w-5"
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-lg font-semibold cursor-pointer"
                      >
                        {categoryLabel}
                      </Label>
                    </div>
                    <Badge variant="secondary">
                      {selectedStats.length} / {stats.length}
                    </Badge>
                  </div>

                  {/* Liste des statistiques */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-8">
                    {stats.map((stat) => {
                      const isSelected = selectedStats.includes(stat.id);

                      return (
                        <div
                          key={stat.id}
                          className={`border rounded-lg p-3 transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={stat.id}
                              checked={isSelected}
                              onCheckedChange={() =>
                                handleToggleStat(category, stat.id)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={stat.id}
                                className="font-medium cursor-pointer"
                              >
                                {stat.label}
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>

        <DialogFooter className="gap-2 sticky bottom-0 bg-white border-t pt-4 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
