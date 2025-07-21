// src/components/RoomManagement.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit,
  Bed,
  Plus,
  Power,
  PowerOff,
  AlertTriangle,
  X,
} from "lucide-react";
import { useEstablishmentFees } from "@/hooks/useEstablishmentFees";
import { calculateFees } from "@/lib/fee-calculator";
import { toastUtils } from "@/lib/toast-utils";

interface Room {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
}

interface RoomBookingInfo {
  id: string;
  hasActiveBookings: boolean;
  hasFutureBookings: boolean;
  nextBookingDate?: string;
  currentBookingEndDate?: string;
}

interface Props {
  hotelSlug: string;
  currency: string;
}

export function RoomManagement({ hotelSlug, currency }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Hook pour récupérer les frais de l'établissement
  const {
    commissionRate,
    fixedFee,
    loading: feesLoading,
  } = useEstablishmentFees(hotelSlug);

  // États pour la confirmation de désactivation
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [roomToToggle, setRoomToToggle] = useState<{
    room: Room;
    bookingInfo: RoomBookingInfo | null;
  } | null>(null);

  // Formulaire d'ajout/édition
  const [formData, setFormData] = useState({
    name: "",
    price: "",
  });

  const loadRooms = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/rooms?hotel=${hotelSlug}`);
      const data = await response.json();

      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error("Erreur chargement places:", error);
    }
  }, [hotelSlug]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const resetForm = () => {
    setFormData({ name: "", price: "" });
    setShowAddForm(false);
    setEditingRoom(null);
  };

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
        resetForm();
        loadRooms();
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

  const checkRoomBookings = async (
    roomId: string
  ): Promise<RoomBookingInfo> => {
    try {
      const response = await fetch(
        `/api/admin/rooms/${roomId}/bookings-status`
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Erreur vérification réservations:", error);
    }

    return {
      id: roomId,
      hasActiveBookings: false,
      hasFutureBookings: false,
    };
  };

  const handleToggleRequest = async (room: Room) => {
    if (room.isActive) {
      // Vérifier les réservations avant de désactiver
      const bookingInfo = await checkRoomBookings(room.id);
      setRoomToToggle({ room, bookingInfo });
      setShowToggleDialog(true);
    } else {
      // Réactiver directement
      await executeToggle(room.id, room.isActive);
    }
  };

  const executeToggle = async (roomId: string, currentStatus: boolean) => {
    const loadingToast = toastUtils.loading(
      currentStatus ? "Désactivation en cours..." : "Activation en cours..."
    );

    try {
      const response = await fetch(`/api/admin/rooms/${roomId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      toastUtils.dismiss(loadingToast);

      if (data.success) {
        const entity = `Place ${currentStatus ? "désactivée" : "activée"}`;

        // Fonction d'annulation pour revenir en arrière
        const undoAction = async () => {
          await fetch(`/api/admin/rooms/${roomId}/toggle`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ isActive: currentStatus }),
          });
          loadRooms();
        };

        if (currentStatus) {
          toastUtils.crud.deactivated(entity, undoAction);
        } else {
          toastUtils.crud.activated(entity, undoAction);
        }

        loadRooms();
      } else {
        toastUtils.error(data.error || "Erreur lors de la modification");
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la modification");
      console.error("Erreur toggle:", error);
    } finally {
      setShowToggleDialog(false);
      setRoomToToggle(null);
    }
  };

  const handleConfirmToggle = () => {
    if (roomToToggle) {
      executeToggle(roomToToggle.room.id, roomToToggle.room.isActive);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      price: room.price.toString(),
    });
    setShowAddForm(true);
  };

  const handleDelete = async (roomId: string, roomName: string) => {
    // Utilisation du toast de confirmation de Sonner
    toastUtils.confirm(
      `Supprimer "${roomName}" définitivement ?`,
      async () => {
        const loadingToast = toastUtils.loading("Suppression en cours...");

        try {
          const response = await fetch(`/api/admin/rooms/${roomId}`, {
            method: "DELETE",
          });

          const data = await response.json();

          toastUtils.dismiss(loadingToast);

          if (data.success) {
            // Pas de fonction d'annulation pour une suppression définitive
            toastUtils.success(`Place "${roomName}" supprimée définitivement`);
            loadRooms();
          } else {
            toastUtils.error(data.error || "Erreur lors de la suppression");
          }
        } catch (error) {
          toastUtils.dismiss(loadingToast);
          toastUtils.error("Erreur lors de la suppression");
          console.error("Erreur suppression:", error);
        }
      },
      {
        confirmLabel: "Oui",
        cancelLabel: "Annuler",
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Places disponibles
          </h3>
          <p className="text-sm text-muted-foreground">
            {rooms.length} place{rooms.length > 1 ? "s" : ""} configurée
            {rooms.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une place
        </Button>
      </div>

      {/* Dialog de confirmation pour désactivation */}
      <Dialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Désactiver la place
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                Vous êtes sur le point de désactiver la place{" "}
                <strong>{roomToToggle?.room.name}</strong>.
              </p>

              {roomToToggle?.bookingInfo?.hasActiveBookings && (
                <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong>Réservation en cours :</strong> Cette place a une
                    réservation active qui se termine le{" "}
                    {roomToToggle.bookingInfo.currentBookingEndDate &&
                      new Date(
                        roomToToggle.bookingInfo.currentBookingEndDate
                      ).toLocaleDateString("fr-FR")}
                    .
                  </div>
                </div>
              )}

              {roomToToggle?.bookingInfo?.hasFutureBookings && (
                <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong>Réservations futures :</strong> Cette place a des
                    réservations à venir. La prochaine commence le{" "}
                    {roomToToggle.bookingInfo.nextBookingDate &&
                      new Date(
                        roomToToggle.bookingInfo.nextBookingDate
                      ).toLocaleDateString("fr-FR")}
                    .
                  </div>
                </div>
              )}

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Conséquences de la désactivation :</strong>
                </p>
                <ul className="text-sm mt-1 space-y-1 list-disc list-inside">
                  <li>
                    La place n&apos;apparaîtra plus dans les nouvelles
                    réservations
                  </li>
                  <li>Les réservations existantes ne seront pas affectées</li>
                  <li>
                    La place restera désactivée jusqu&apos;à ce que vous la
                    réactiviez manuellement
                  </li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowToggleDialog(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmToggle}>
              Désactiver malgré tout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulaire d'ajout/édition */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingRoom ? (
                <Edit className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
              {editingRoom ? "Modifier la place" : "Ajouter une nouvelle place"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la place *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Ex: Place Standard, Suite Deluxe..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Prix ({currency}) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    placeholder="120"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Aperçu en temps réel des frais */}
              {formData.price &&
                parseFloat(formData.price) > 0 &&
                !feesLoading && (
                  <div className="bg-muted/30 border border-muted rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                      <span className="text-muted-foreground">💰</span>
                      Aperçu des frais et revenus
                    </h4>

                    {(() => {
                      const price = parseFloat(formData.price);
                      const calculation = calculateFees(
                        price,
                        commissionRate / 100,
                        fixedFee
                      );

                      // Calcul des frais Stripe (2.9% + 0.30 CHF)
                      const stripeRate = 0.029; // 2.9%
                      const stripeFixedFee = 0.3; // 0.30 CHF
                      const stripeFees = price * stripeRate + stripeFixedFee;

                      // Montant final après déduction de tous les frais
                      const finalAmount = calculation.netAmount - stripeFees;

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          {/* Prix affiché au client */}
                          <div className="bg-background border border-border rounded-md p-3">
                            <div className="font-medium text-foreground mb-1 flex items-center gap-1">
                              <span className="text-muted-foreground">💳</span>
                              Prix client
                            </div>
                            <div className="text-lg font-bold text-foreground">
                              {price.toFixed(2)} {currency}
                            </div>
                            <div className="text-muted-foreground text-xs mt-1">
                              Montant facturé
                            </div>
                          </div>

                          {/* Frais SelfKey - Seulement si il y a des frais */}
                          <div className="bg-background border border-border rounded-md p-3">
                            <div className="font-medium text-foreground mb-1 flex items-center gap-1">
                              <span className="text-muted-foreground">🏢</span>
                              Frais SelfKey
                            </div>
                            {calculation.totalFees > 0 ? (
                              <div className="space-y-1 text-muted-foreground">
                                {/* Commission - seulement si > 0 */}
                                {calculation.commission > 0 && (
                                  <div className="flex justify-between">
                                    <span>Commission ({commissionRate}%):</span>
                                    <span>
                                      {calculation.commission.toFixed(2)}{" "}
                                      {currency}
                                    </span>
                                  </div>
                                )}
                                {/* Frais fixes - seulement si > 0 */}
                                {calculation.fixedFee > 0 && (
                                  <div className="flex justify-between">
                                    <span>Frais fixes:</span>
                                    <span>
                                      {calculation.fixedFee.toFixed(2)}{" "}
                                      {currency}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium text-foreground border-t border-border pt-1">
                                  <span>Total:</span>
                                  <span>
                                    {calculation.totalFees.toFixed(2)}{" "}
                                    {currency}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-lg font-bold text-foreground">
                                0.00 {currency}
                              </div>
                            )}
                          </div>

                          {/* Frais Stripe */}
                          <div className="bg-background border border-amber-500/20 rounded-md p-3">
                            <div className="font-medium text-foreground mb-1 flex items-center gap-1">
                              <span className="text-amber-600">⚡</span>
                              Frais Stripe
                            </div>
                            <div className="space-y-1 text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Commission (2.9%):</span>
                                <span>
                                  {(price * stripeRate).toFixed(2)} {currency}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Frais fixes:</span>
                                <span>
                                  {stripeFixedFee.toFixed(2)} {currency}
                                </span>
                              </div>
                              <div className="flex justify-between font-medium text-foreground border-t border-border pt-1">
                                <span>Total:</span>
                                <span>
                                  {stripeFees.toFixed(2)} {currency}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Montant final reçu */}
                          <div className="bg-background border border-emerald-500/20 rounded-md p-3">
                            <div className="font-medium text-foreground mb-1 flex items-center gap-1">
                              <span className="text-emerald-600">✓</span>
                              Montant final
                            </div>
                            <div className="text-xl font-bold text-emerald-600">
                              {finalAmount.toFixed(2)} {currency}
                            </div>
                            <div className="text-muted-foreground text-xs mt-1">
                              Après tous frais
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {(() => {
                      return (
                        <div className="text-xs text-muted-foreground bg-muted/20 rounded p-2 border border-muted">
                          💡 <strong>Calcul complet :</strong> Ce montant final
                          inclut la déduction automatique de tous les frais
                          (SelfKey + Stripe). C&apos;est exactement ce que vous
                          recevrez sur votre compte.
                        </div>
                      );
                    })()}
                  </div>
                )}

              {/* Information sur les frais Stripe */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-blue-700">
                      <strong>Frais de paiement :</strong> Les frais Stripe
                      (2,9% + 0,30 CHF) sont maintenant inclus dans le calcul
                      ci-dessus pour vous donner une vision complète de vos
                      revenus.{" "}
                      <a
                        href="https://stripe.com/fr/pricing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Plus d&apos;infos
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? "Sauvegarde..."
                    : editingRoom
                      ? "Modifier"
                      : "Ajouter"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des places */}
      {rooms.length > 0 ? (
        <div className="space-y-4">
          {/* Légende des statuts */}
          <Card className="bg-muted/30 border-muted">
            <CardContent className="p-4">
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span className="font-medium">Statut des chambres :</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm ring-2 ring-emerald-500/20"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 shadow-sm ring-2 ring-slate-400/20"></div>
                  <span>Désactivée</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {rooms.map((room) => (
            <Card
              key={room.id}
              className={`transition-all hover:shadow-sm ${!room.isActive ? "opacity-70" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {/* Icône de lit */}
                      <div className="p-2 bg-muted rounded-lg">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                      </div>

                      {/* Pastille de statut brillante mais discrète */}
                      <div className="relative">
                        <div
                          className={`w-3 h-3 rounded-full shadow-sm transition-all ${
                            room.isActive
                              ? "bg-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/25"
                              : "bg-slate-400 ring-2 ring-slate-400/20 shadow-slate-400/25"
                          }`}
                        />
                        {room.isActive && (
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-pulse opacity-75" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">
                        {room.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span>
                            {room.price} {currency}
                          </span>
                        </div>
                        {!feesLoading && (
                          <>
                            <Separator orientation="vertical" className="h-4" />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-emerald-600 cursor-help">
                                  <span className="font-medium">
                                    Net:{" "}
                                    {calculateFees(
                                      room.price,
                                      commissionRate / 100,
                                      fixedFee
                                    ).netAmount.toFixed(2)}{" "}
                                    {currency}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <div className="font-medium mb-1">
                                    Calcul des frais :
                                  </div>
                                  <div>
                                    Prix affiché: {room.price.toFixed(2)}{" "}
                                    {currency}
                                  </div>
                                  {/* Commission - seulement si > 0 */}
                                  {commissionRate > 0 && (
                                    <div>
                                      Commission ({commissionRate}%): -
                                      {(
                                        (room.price * commissionRate) /
                                        100
                                      ).toFixed(2)}{" "}
                                      {currency}
                                    </div>
                                  )}
                                  {/* Frais fixes - seulement si > 0 */}
                                  {fixedFee > 0 && (
                                    <div>
                                      Frais fixes: -{fixedFee.toFixed(2)}{" "}
                                      {currency}
                                    </div>
                                  )}
                                  {/* Si aucun frais, afficher un message contextuel */}
                                  {commissionRate === 0 && fixedFee === 0 && (
                                    <div className="text-muted-foreground">
                                      Aucun frais appliqué
                                    </div>
                                  )}
                                  <div className="border-t pt-1 mt-1 font-medium text-emerald-600">
                                    Montant net:{" "}
                                    {calculateFees(
                                      room.price,
                                      commissionRate / 100,
                                      fixedFee
                                    ).netAmount.toFixed(2)}{" "}
                                    {currency}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-xs">
                          {room.isActive ? "Active" : "Désactivée"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bouton d'activation/désactivation */}
                    <Button
                      variant={room.isActive ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleRequest(room)}
                      className={
                        room.isActive
                          ? "text-muted-foreground hover:text-foreground border-muted hover:border-border"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }
                    >
                      {room.isActive ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Bouton de modification */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(room)}
                      className="text-muted-foreground hover:text-foreground border-muted hover:border-border"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    {/* Bouton de suppression définitive */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(room.id, room.name)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 border-muted hover:border-red-500/50"
                      title="Supprimer définitivement cette place"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Bed className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Aucune chambre configurée
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par ajouter vos premières chambres
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une chambre
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
