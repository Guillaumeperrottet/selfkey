"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save } from "lucide-react";

interface SettingsManagerProps {
  hotelSlug: string;
}

export function SettingsManager({ hotelSlug }: SettingsManagerProps) {
  const [maxBookingDays, setMaxBookingDays] = useState<number>(4);
  const [allowFutureBookings, setAllowFutureBookings] =
    useState<boolean>(false);
  const [enableCutoffTime, setEnableCutoffTime] = useState<boolean>(false);
  const [cutoffTime, setCutoffTime] = useState<string>("22:00");
  const [reopenTime, setReopenTime] = useState<string>("00:00");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(
          `/api/establishments/${hotelSlug}/settings`
        );
        if (response.ok) {
          const data = await response.json();
          setMaxBookingDays(data.maxBookingDays || 4);
          setAllowFutureBookings(data.allowFutureBookings || false);
          setEnableCutoffTime(data.enableCutoffTime || false);
          setCutoffTime(data.cutoffTime || "22:00");
          setReopenTime(data.reopenTime || "00:00");
        } else {
          alert("Erreur lors du chargement des paramètres");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        alert("Erreur lors du chargement des paramètres");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [hotelSlug]);

  const handleSave = async () => {
    if (maxBookingDays < 1 || maxBookingDays > 365) {
      alert("La durée doit être entre 1 et 365 jours");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/establishments/${hotelSlug}/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            maxBookingDays,
            allowFutureBookings,
            enableCutoffTime,
            cutoffTime,
            reopenTime,
          }),
        }
      );

      if (response.ok) {
        alert("Paramètres sauvegardés avec succès");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Erreur lors de la sauvegarde");
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
          <CardTitle>Paramètres de réservation</CardTitle>
          <CardDescription>
            Configurez les paramètres de réservation pour votre établissement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxBookingDays">
              Durée maximale de séjour (en nuits)
            </Label>
            <Input
              id="maxBookingDays"
              type="number"
              min="1"
              max="365"
              value={maxBookingDays}
              onChange={(e) => setMaxBookingDays(parseInt(e.target.value) || 1)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Les clients pourront réserver pour un maximum de {maxBookingDays}{" "}
              nuit{maxBookingDays > 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowFutureBookings"
                checked={allowFutureBookings}
                onCheckedChange={(checked) =>
                  setAllowFutureBookings(checked as boolean)
                }
              />
              <Label
                htmlFor="allowFutureBookings"
                className="text-sm font-medium"
              >
                Autoriser les réservations dans le futur
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {allowFutureBookings
                ? "Les clients peuvent réserver pour des dates futures"
                : "Les clients ne peuvent réserver que pour aujourd'hui"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableCutoffTime"
                checked={enableCutoffTime}
                onCheckedChange={(checked) =>
                  setEnableCutoffTime(checked as boolean)
                }
              />
              <Label htmlFor="enableCutoffTime" className="text-sm font-medium">
                Activer une heure limite pour les réservations
              </Label>
            </div>

            {enableCutoffTime && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="cutoffTime">Heure limite (format 24h)</Label>
                <Input
                  id="cutoffTime"
                  type="time"
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="w-32"
                />

                <Label htmlFor="reopenTime">
                  Heure de réouverture (format 24h)
                </Label>
                <Input
                  id="reopenTime"
                  type="time"
                  value={reopenTime}
                  onChange={(e) => setReopenTime(e.target.value)}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Les réservations redeviendront disponibles à partir de cette
                  heure le lendemain
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {enableCutoffTime
                ? `Après ${cutoffTime}, les clients verront un message indiquant qu'il est trop tard pour réserver. Les réservations redeviendront disponibles à ${reopenTime} le lendemain.`
                : "Les réservations sont acceptées 24h/24"}
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Les clients verront cette limitation lors de la sélection des
            dates
          </p>
          <p>
            • Les réservations existantes ne sont pas affectées par ce
            changement
          </p>
          <p>
            • Cette limite s&apos;applique à toutes les places de
            l&apos;établissement
          </p>
          <p>
            • Les réservations futures peuvent être activées ou désactivées
            selon vos besoins
          </p>
          <p>
            • Si les réservations futures sont désactivées, les clients ne
            pourront réserver que pour aujourd&apos;hui
          </p>
          <p>
            • L&apos;heure limite empêche les nouvelles réservations après
            l&apos;heure définie (utile pour éviter les arrivées tardives)
          </p>
          <p>
            • Le message &quot;trop tard&quot; s&apos;affiche automatiquement
            quand l&apos;heure limite est dépassée
          </p>
          <p>
            • Les réservations redeviennent disponibles à l&apos;heure de
            réouverture définie (par défaut minuit)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
