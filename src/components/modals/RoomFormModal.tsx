// src/components/modals/RoomFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Plus, Loader2 } from "lucide-react";
import { useEstablishmentFees } from "@/hooks/useEstablishmentFees";
import { calculateFees } from "@/lib/fee-calculator";
import { toastUtils } from "@/lib/toast-utils";

interface Room {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  allowDogs: boolean;
  createdAt: string;
}

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingRoom?: Room | null;
  hotelSlug: string;
  currency: string;
  establishmentSettings: {
    enableDogOption?: boolean;
  };
}

export function RoomFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingRoom,
  hotelSlug,
  currency,
  establishmentSettings,
}: RoomFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    allowDogs: false,
  });

  // Hook pour récupérer les frais de l'établissement
  const {
    commissionRate,
    fixedFee,
    loading: feesLoading,
  } = useEstablishmentFees(hotelSlug);

  // Réinitialiser le formulaire quand la modal s'ouvre/ferme ou que editingRoom change
  useEffect(() => {
    if (isOpen) {
      if (editingRoom) {
        setFormData({
          name: editingRoom.name,
          price: editingRoom.price.toString(),
          allowDogs: editingRoom.allowDogs || false,
        });
      } else {
        setFormData({ name: "", price: "", allowDogs: false });
      }
    }
  }, [isOpen, editingRoom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loadingToast = toastUtils.loading(
      editingRoom ? "Modification en cours..." : "Création en cours..."
    );

    try {
      const url = editingRoom
        ? `/api/admin/rooms/${editingRoom.id}`
        : "/api/admin/rooms";
      const method = editingRoom ? "PUT" : "POST";

      const body = editingRoom ? formData : { ...formData, hotelSlug };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      toastUtils.dismiss(loadingToast);

      if (data.success) {
        const entity = editingRoom ? "Place modifiée" : "Place créée";
        toastUtils.crud.created(entity);
        onSuccess();
        onClose();
      } else {
        toastUtils.error(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la sauvegarde");
      console.error("Erreur sauvegarde:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingRoom ? (
              <Edit className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {editingRoom ? "Modifier la place" : "Ajouter une nouvelle place"}
          </DialogTitle>
          <DialogDescription>
            {editingRoom
              ? "Modifiez les informations de cette place."
              : "Configurez les détails de votre nouvelle place."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom de la place */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la place *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Place 1, Emplacement A..."
              required
              disabled={isLoading}
            />
          </div>

          {/* Prix */}
          <div className="space-y-2">
            <Label htmlFor="price">Prix par nuit ({currency}) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="Ex: 25.00"
              required
              disabled={isLoading}
            />
          </div>

          {/* Option chien */}
          <div className="space-y-2">
            <Label>Options</Label>
            {establishmentSettings.enableDogOption ? (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowDogs"
                  checked={formData.allowDogs}
                  onChange={(e) =>
                    setFormData({ ...formData, allowDogs: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={isLoading}
                />
                <Label htmlFor="allowDogs" className="text-sm font-normal">
                  🐕 Autoriser les chiens
                </Label>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-gray-500">
                  <input
                    type="checkbox"
                    disabled
                    className="h-4 w-4 rounded border-gray-300 cursor-not-allowed opacity-50"
                  />
                  <Label className="text-sm opacity-50 cursor-not-allowed">
                    🐕 Option chien désactivée
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  L&apos;option chien n&apos;est pas activée pour cet
                  établissement. Allez dans les paramètres pour l&apos;activer.
                </p>
              </div>
            )}
          </div>

          {/* Aperçu des frais */}
          {formData.price && parseFloat(formData.price) > 0 && !feesLoading && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  💰 Aperçu de la répartition des revenus
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prix affiché :</span>
                    <span className="font-medium">
                      {parseFloat(formData.price).toFixed(2)} {currency}
                    </span>
                  </div>

                  {/* Commission - seulement si > 0 */}
                  {commissionRate > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Commission SelfKey ({commissionRate}%) :</span>
                      <span>
                        -
                        {(
                          (parseFloat(formData.price) * commissionRate) /
                          100
                        ).toFixed(2)}{" "}
                        {currency}
                      </span>
                    </div>
                  )}

                  {/* Frais fixes - seulement si > 0 */}
                  {fixedFee > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Frais fixes SelfKey :</span>
                      <span>
                        -{fixedFee.toFixed(2)} {currency}
                      </span>
                    </div>
                  )}

                  {/* Si aucun frais SelfKey, afficher un message contextuel */}
                  {commissionRate === 0 && fixedFee === 0 && (
                    <div className="text-center text-muted-foreground italic py-2">
                      (Aucun frais SelfKey configuré)
                    </div>
                  )}

                  <div className="border-t pt-2 flex justify-between font-medium text-green-600">
                    <span>Montant net :</span>
                    <span>
                      {(() => {
                        const calculation = calculateFees(
                          parseFloat(formData.price),
                          commissionRate / 100,
                          fixedFee
                        );
                        return calculation.netAmount.toFixed(2);
                      })()}{" "}
                      {currency}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingRoom ? "Modification..." : "Création..."}
                </>
              ) : editingRoom ? (
                "Modifier"
              ) : (
                "Ajouter"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
