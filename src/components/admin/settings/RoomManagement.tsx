// src/components/RoomManagement.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useEstablishmentFees } from "@/hooks/useEstablishmentFees";
import { calculateFees } from "@/lib/fee-calculator";
import { toastUtils } from "@/lib/toast-utils";
import { RoomFormModal } from "@/components/modals/RoomFormModal";

interface Room {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  allowDogs: boolean;
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
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [establishmentSettings, setEstablishmentSettings] = useState<{
    enableDogOption?: boolean;
  }>({});

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

  // États pour la recherche et le tri
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<
    "name" | "price" | "status" | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

  const loadEstablishmentSettings = useCallback(async () => {
    try {
      const response = await fetch(`/api/establishments/${hotelSlug}/settings`);

      if (response.ok) {
        const data = await response.json();
        setEstablishmentSettings({
          enableDogOption: data.enableDogOption,
        });
      }
    } catch (error) {
      console.error("Erreur chargement paramètres établissement:", error);
    }
  }, [hotelSlug]);

  useEffect(() => {
    loadRooms();
    loadEstablishmentSettings();
  }, [loadRooms, loadEstablishmentSettings]);

  // Fonctions pour gérer les modales
  const handleAddRoom = () => {
    setEditingRoom(null);
    setShowRoomModal(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setShowRoomModal(true);
  };

  const handleModalClose = () => {
    setShowRoomModal(false);
    setEditingRoom(null);
  };

  const handleModalSuccess = () => {
    loadRooms(); // Recharger la liste des places
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
    handleEditRoom(room);
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

  // Fonction de tri
  const handleSort = (field: "name" | "price" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Fonction pour obtenir l'icône de tri
  const getSortIcon = (field: "name" | "price" | "status") => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  // Filtrage et tri des places
  const filteredAndSortedRooms = rooms
    .filter((room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField) return 0;

      const multiplier = sortDirection === "asc" ? 1 : -1;

      switch (sortField) {
        case "name":
          return a.name.localeCompare(b.name) * multiplier;
        case "price":
          return (a.price - b.price) * multiplier;
        case "status":
          return (Number(a.isActive) - Number(b.isActive)) * multiplier;
        default:
          return 0;
      }
    });

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
            {searchTerm && (
              <span className="ml-2">
                • {filteredAndSortedRooms.length} résultat
                {filteredAndSortedRooms.length > 1 ? "s" : ""} trouvé
                {filteredAndSortedRooms.length > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une place..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            onClick={handleAddRoom}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une place
          </Button>
        </div>
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

      {/* Modal pour l'ajout/modification de place */}
      <RoomFormModal
        isOpen={showRoomModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editingRoom={editingRoom}
        hotelSlug={hotelSlug}
        currency={currency}
        establishmentSettings={establishmentSettings}
      />

      {/* Liste des places */}
      {rooms.length > 0 ? (
        filteredAndSortedRooms.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Places configurées</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredAndSortedRooms.length} place
                    {filteredAndSortedRooms.length > 1 ? "s" : ""} affichée
                    {filteredAndSortedRooms.length > 1 ? "s" : ""}
                    {searchTerm && (
                      <span className="text-muted-foreground/70">
                        {" "}
                        sur {rooms.length} au total
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm ring-2 ring-emerald-500/20"></div>
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 shadow-sm ring-2 ring-slate-400/20"></div>
                    <span>Désactivée</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="w-12 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        Statut
                        {getSortIcon("status")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Nom de la place
                        {getSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Prix ({currency}){getSortIcon("price")}
                      </div>
                    </TableHead>
                    <TableHead className="text-center">🐕 Chiens</TableHead>
                    {!feesLoading && (
                      <TableHead className="text-right">Montant net</TableHead>
                    )}
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedRooms.map((room) => (
                    <TableRow
                      key={room.id}
                      className={`${!room.isActive ? "opacity-70" : ""}`}
                    >
                      {/* Statut */}
                      <TableCell>
                        <div className="flex items-center justify-center">
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
                      </TableCell>

                      {/* Nom de la place */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <Bed className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {room.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {room.isActive ? "Active" : "Désactivée"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Prix */}
                      <TableCell className="text-right">
                        <div className="font-medium">
                          {room.price.toFixed(2)} {currency}
                        </div>
                      </TableCell>

                      {/* Chiens autorisés */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          {room.allowDogs ? (
                            <span className="text-green-600 font-medium">
                              🐕 Oui
                            </span>
                          ) : (
                            <span className="text-gray-400">❌ Non</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Montant net */}
                      {!feesLoading && (
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-emerald-600 font-medium cursor-help">
                                {(() => {
                                  const calculation = calculateFees(
                                    room.price,
                                    commissionRate / 100,
                                    fixedFee
                                  );
                                  return calculation.netAmount.toFixed(2);
                                })()}{" "}
                                {currency}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <div className="font-medium mb-1">
                                  Calcul des frais SelfKey :
                                </div>
                                <div>
                                  Prix affiché: {room.price.toFixed(2)}{" "}
                                  {currency}
                                </div>
                                {/* Commission - seulement si > 0 */}
                                {commissionRate > 0 && (
                                  <div>
                                    Commission SelfKey ({commissionRate}%): -
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
                                    Frais fixes SelfKey: -{fixedFee.toFixed(2)}{" "}
                                    {currency}
                                  </div>
                                )}
                                {/* Si aucun frais SelfKey, afficher un message contextuel */}
                                {commissionRate === 0 && fixedFee === 0 && (
                                  <div className="text-muted-foreground italic">
                                    (Aucun frais SelfKey configuré)
                                  </div>
                                )}
                                <div className="border-t pt-1 mt-1 font-medium text-emerald-600">
                                  Montant net:{" "}
                                  {(() => {
                                    const calculation = calculateFees(
                                      room.price,
                                      commissionRate / 100,
                                      fixedFee
                                    );
                                    return calculation.netAmount.toFixed(2);
                                  })()}{" "}
                                  {currency}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      )}

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
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
                            className="text-red-600 hover:text-red-700 border-muted hover:border-red-500/50"
                            title="Supprimer définitivement cette place"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Aucune place ne correspond à votre recherche &ldquo;{searchTerm}
                &rdquo;
              </p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Effacer la recherche
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Bed className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Aucune place configurée
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par ajouter vos premières places
            </p>
            <Button onClick={handleAddRoom}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une place
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
