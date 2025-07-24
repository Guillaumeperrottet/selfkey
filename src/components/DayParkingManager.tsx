"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Car, Clock, Info } from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface DayParkingManagerProps {
  hotelSlug: string;
}

interface DayParkingSettings {
  dayParkingTarif1h: number;
  dayParkingTarif2h: number;
  dayParkingTarif3h: number;
  dayParkingTarif4h: number;
  dayParkingTarifHalfDay: number;
  dayParkingTarifFullDay: number;
}

export function DayParkingManager({ hotelSlug }: DayParkingManagerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<DayParkingSettings>({
    dayParkingTarif1h: 5.0,
    dayParkingTarif2h: 8.0,
    dayParkingTarif3h: 12.0,
    dayParkingTarif4h: 15.0,
    dayParkingTarifHalfDay: 20.0,
    dayParkingTarifFullDay: 35.0,
  });

  // Charger les paramètres actuels
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(
          `/api/admin/${hotelSlug}/day-parking-settings`
        );
        if (response.ok) {
          const data = await response.json();
          setSettings({
            dayParkingTarif1h: data.dayParkingTarif1h || 5.0,
            dayParkingTarif2h: data.dayParkingTarif2h || 8.0,
            dayParkingTarif3h: data.dayParkingTarif3h || 12.0,
            dayParkingTarif4h: data.dayParkingTarif4h || 15.0,
            dayParkingTarifHalfDay: data.dayParkingTarifHalfDay || 20.0,
            dayParkingTarifFullDay: data.dayParkingTarifFullDay || 35.0,
          });
        }
      } catch (error) {
        console.error("Error loading day parking settings:", error);
        toastUtils.error("Erreur lors du chargement des paramètres");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [hotelSlug]);

  const handleSave = async () => {
    // Validation des tarifs
    if (
      settings.dayParkingTarif1h < 0 ||
      settings.dayParkingTarif2h < 0 ||
      settings.dayParkingTarif3h < 0 ||
      settings.dayParkingTarif4h < 0 ||
      settings.dayParkingTarifHalfDay < 0 ||
      settings.dayParkingTarifFullDay < 0
    ) {
      toastUtils.warning("Les tarifs ne peuvent pas être négatifs");
      return;
    }

    // Validation de logique des tarifs croissants
    if (
      settings.dayParkingTarif1h >= settings.dayParkingTarif2h ||
      settings.dayParkingTarif2h >= settings.dayParkingTarif3h ||
      settings.dayParkingTarif3h >= settings.dayParkingTarif4h ||
      settings.dayParkingTarif4h >= settings.dayParkingTarifHalfDay ||
      settings.dayParkingTarifHalfDay >= settings.dayParkingTarifFullDay
    ) {
      toastUtils.warning(
        "Les tarifs doivent être croissants (1h < 2h < 3h < 4h < demi-journée < journée complète)"
      );
      return;
    }

    const loadingToast = toastUtils.loading("Sauvegarde des paramètres...");
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/admin/${hotelSlug}/day-parking-settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enableDayParking: true, // Toujours true car le composant n'est accessible que si activé
            ...settings,
          }),
        }
      );

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        toastUtils.success(
          "Paramètres de parking jour sauvegardés avec succès"
        );
      } else {
        const errorData = await response.json();
        toastUtils.error(errorData.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la sauvegarde");
      console.error("Error saving day parking settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Gestion des Tarifs - Parking Jour
          </CardTitle>
          <p className="text-muted-foreground">
            Configurez les tarifs pour les différentes durées de parking jour.
            Les tarifs doivent être croissants.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration des tarifs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-medium">Tarifs par durée</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1 heure */}
              <div className="space-y-2">
                <Label htmlFor="tarif1h">
                  1 heure
                  <Badge variant="outline" className="ml-2">
                    Base
                  </Badge>
                </Label>
                <div className="flex items-center">
                  <Input
                    id="tarif1h"
                    type="number"
                    step="0.50"
                    min="0"
                    value={settings.dayParkingTarif1h}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        dayParkingTarif1h: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-24"
                  />
                  <span className="ml-2 text-sm text-gray-500">CHF</span>
                </div>
              </div>

              {/* 2 heures */}
              <div className="space-y-2">
                <Label htmlFor="tarif2h">2 heures</Label>
                <div className="flex items-center">
                  <Input
                    id="tarif2h"
                    type="number"
                    step="0.50"
                    min="0"
                    value={settings.dayParkingTarif2h}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        dayParkingTarif2h: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-24"
                  />
                  <span className="ml-2 text-sm text-gray-500">CHF</span>
                </div>
              </div>

              {/* 3 heures */}
              <div className="space-y-2">
                <Label htmlFor="tarif3h">3 heures</Label>
                <div className="flex items-center">
                  <Input
                    id="tarif3h"
                    type="number"
                    step="0.50"
                    min="0"
                    value={settings.dayParkingTarif3h}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        dayParkingTarif3h: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-24"
                  />
                  <span className="ml-2 text-sm text-gray-500">CHF</span>
                </div>
              </div>

              {/* 4 heures */}
              <div className="space-y-2">
                <Label htmlFor="tarif4h">4 heures</Label>
                <div className="flex items-center">
                  <Input
                    id="tarif4h"
                    type="number"
                    step="0.50"
                    min="0"
                    value={settings.dayParkingTarif4h}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        dayParkingTarif4h: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-24"
                  />
                  <span className="ml-2 text-sm text-gray-500">CHF</span>
                </div>
              </div>

              {/* Demi-journée */}
              <div className="space-y-2">
                <Label htmlFor="tarifHalfDay">Demi-journée (6h)</Label>
                <div className="flex items-center">
                  <Input
                    id="tarifHalfDay"
                    type="number"
                    step="0.50"
                    min="0"
                    value={settings.dayParkingTarifHalfDay}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        dayParkingTarifHalfDay: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-24"
                  />
                  <span className="ml-2 text-sm text-gray-500">CHF</span>
                </div>
              </div>

              {/* Journée complète */}
              <div className="space-y-2">
                <Label htmlFor="tarifFullDay">
                  Journée complète (12h)
                  <Badge variant="secondary" className="ml-2">
                    Populaire
                  </Badge>
                </Label>
                <div className="flex items-center">
                  <Input
                    id="tarifFullDay"
                    type="number"
                    step="0.50"
                    min="0"
                    value={settings.dayParkingTarifFullDay}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        dayParkingTarifFullDay: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-24"
                  />
                  <span className="ml-2 text-sm text-gray-500">CHF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informations importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Les clients pourront choisir entre &quot;parking nuit&quot;
            (réservation traditionnelle) et &quot;parking jour&quot; (tarifs
            horaires)
          </p>
          <p>
            • Pour le parking jour, les tarifs utilisent le système de
            commission au lieu de frais fixes
          </p>
          <p>
            • Le temps de stationnement commence dès la confirmation du paiement
          </p>
          <p>
            • Les tarifs doivent être croissants pour encourager les durées plus
            longues
          </p>
          <p>
            • Une fois activé, l&apos;option apparaîtra immédiatement sur votre
            page de réservation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
