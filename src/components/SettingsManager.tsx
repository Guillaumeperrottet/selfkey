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
import { Loader2, Save } from "lucide-react";

interface SettingsManagerProps {
  hotelSlug: string;
}

export function SettingsManager({ hotelSlug }: SettingsManagerProps) {
  const [maxBookingDays, setMaxBookingDays] = useState<number>(4);
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
          body: JSON.stringify({ maxBookingDays }),
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
              Durée maximale de séjour (en jours)
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
              jour{maxBookingDays > 1 ? "s" : ""}
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
            • Cette limite s&apos;applique à toutes les chambres de
            l&apos;établissement
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
