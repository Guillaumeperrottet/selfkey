"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DollarSign, Percent } from "lucide-react";

interface EditCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishment: {
    id: string;
    name: string;
    commissionRate: number;
    fixedFee: number;
  };
  onUpdate: (updatedEstablishment: {
    id: string;
    commissionRate: number;
    fixedFee: number;
  }) => void;
}

export function EditCommissionModal({
  isOpen,
  onClose,
  establishment,
  onUpdate,
}: EditCommissionModalProps) {
  const [commissionRate, setCommissionRate] = useState(
    establishment.commissionRate.toString()
  );
  const [fixedFee, setFixedFee] = useState(establishment.fixedFee.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const commissionRateValue = parseFloat(commissionRate);
      const fixedFeeValue = parseFloat(fixedFee);

      // Validation
      if (
        isNaN(commissionRateValue) ||
        commissionRateValue < 0 ||
        commissionRateValue > 100
      ) {
        setError("Le taux de commission doit être entre 0 et 100%");
        return;
      }

      if (isNaN(fixedFeeValue) || fixedFeeValue < 0) {
        setError("Les frais fixes ne peuvent pas être négatifs");
        return;
      }

      const response = await fetch("/api/admin/update-commission", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          establishmentId: establishment.id,
          commissionRate: commissionRateValue,
          fixedFee: fixedFeeValue,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      // Mettre à jour les données locales
      onUpdate({
        id: establishment.id,
        commissionRate: commissionRateValue,
        fixedFee: fixedFeeValue,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setCommissionRate(establishment.commissionRate.toString());
    setFixedFee(establishment.fixedFee.toString());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Modifier les Commissions
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Établissement :{" "}
            <span className="font-medium">{establishment.name}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="commissionRate">Taux de Commission (%)</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="commissionRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="pl-10"
                placeholder="Ex: 5.00"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Pourcentage prélevé sur chaque réservation (0-100%)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fixedFee">Frais Fixes (CHF)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="fixedFee"
                type="number"
                step="0.01"
                min="0"
                value={fixedFee}
                onChange={(e) => setFixedFee(e.target.value)}
                className="pl-10"
                placeholder="Ex: 2.50"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Montant fixe ajouté à chaque réservation (en CHF)
            </p>
          </div>

          {/* Aperçu du calcul */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Aperçu du calcul (exemple avec réservation de 100 CHF) :
            </p>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Commission ({commissionRate || 0}%) :</span>
                <span>
                  {(((parseFloat(commissionRate) || 0) * 100) / 100).toFixed(2)}{" "}
                  CHF
                </span>
              </div>
              <div className="flex justify-between">
                <span>Frais fixes :</span>
                <span>{(parseFloat(fixedFee) || 0).toFixed(2)} CHF</span>
              </div>
              <hr className="my-1" />
              <div className="flex justify-between font-medium">
                <span>Total commission :</span>
                <span>
                  {(
                    ((parseFloat(commissionRate) || 0) * 100) / 100 +
                    (parseFloat(fixedFee) || 0)
                  ).toFixed(2)}{" "}
                  CHF
                </span>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
