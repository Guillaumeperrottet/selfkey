// src/components/RoomManagement.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Edit,
  Trash2,
  Bed,
  DollarSign,
  Plus,
  Power,
  PowerOff,
  AlertTriangle,
} from "lucide-react";

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
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
      console.error("Erreur chargement chambres:", error);
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
    setMessage(null);

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

      if (data.success) {
        setMessage({
          type: "success",
          text: editingRoom
            ? "Chambre modifiée avec succès"
            : "Chambre créée avec succès",
        });
        resetForm();
        loadRooms();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde" });
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
    try {
      const response = await fetch(`/api/admin/rooms/${roomId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `Chambre ${currentStatus ? "désactivée" : "activée"} avec succès`,
        });
        loadRooms();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la modification" });
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
    if (
      !confirm(`Êtes-vous sûr de vouloir supprimer la chambre "${roomName}" ?`)
    ) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Chambre supprimée avec succès" });
        loadRooms();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la suppression" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Chambres disponibles
          </h3>
          <p className="text-sm text-muted-foreground">
            {rooms.length} chambre{rooms.length > 1 ? "s" : ""} configurée
            {rooms.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une chambre
        </Button>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Dialog de confirmation pour désactivation */}
      <Dialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Désactiver la chambre
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                Vous êtes sur le point de désactiver la chambre{" "}
                <strong>{roomToToggle?.room.name}</strong>.
              </p>

              {roomToToggle?.bookingInfo?.hasActiveBookings && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Réservation en cours :</strong> Cette chambre a une
                    réservation active qui se termine le{" "}
                    {roomToToggle.bookingInfo.currentBookingEndDate &&
                      new Date(
                        roomToToggle.bookingInfo.currentBookingEndDate
                      ).toLocaleDateString("fr-FR")}
                    .
                  </AlertDescription>
                </Alert>
              )}

              {roomToToggle?.bookingInfo?.hasFutureBookings && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Réservations futures :</strong> Cette chambre a des
                    réservations à venir. La prochaine commence le{" "}
                    {roomToToggle.bookingInfo.nextBookingDate &&
                      new Date(
                        roomToToggle.bookingInfo.nextBookingDate
                      ).toLocaleDateString("fr-FR")}
                    .
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Conséquences de la désactivation :</strong>
                </p>
                <ul className="text-sm mt-1 space-y-1 list-disc list-inside">
                  <li>
                    La chambre n&apos;apparaîtra plus dans les nouvelles
                    réservations
                  </li>
                  <li>Les réservations existantes ne seront pas affectées</li>
                  <li>
                    La chambre restera désactivée jusqu&apos;à ce que vous la
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
              {editingRoom
                ? "Modifier la chambre"
                : "Ajouter une nouvelle chambre"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la chambre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Ex: Chambre Standard, Suite Deluxe..."
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

      {/* Liste des chambres */}
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
                          <DollarSign className="h-3 w-3" />
                          <span>
                            {room.price} {currency}
                          </span>
                        </div>
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

                    {/* Bouton de suppression */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(room.id, room.name)}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive border-muted hover:border-destructive/50"
                    >
                      <Trash2 className="h-4 w-4" />
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
