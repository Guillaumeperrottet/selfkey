// src/components/RoomManagement.tsx
"use client";

import { useState, useEffect, useCallback } from "react";

interface Room {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Chambres disponibles
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {rooms.length}{" "}
            {rooms.length > 1 ? "chambres configurées" : "chambre configurée"}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
        >
          <span className="text-lg">+</span>
          <span className="font-medium">Ajouter une chambre</span>
        </button>
      </div>

      {/* Messages avec design amélioré */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl border-l-4 ${
            message.type === "success"
              ? "bg-green-50 border-green-400 text-green-800"
              : "bg-red-50 border-red-400 text-red-800"
          }`}
        >
          <div className="flex items-center">
            <span className="mr-2">
              {message.type === "success" ? "✅" : "❌"}
            </span>
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Formulaire d'ajout/édition avec design moderne */}
      {showAddForm && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl mb-8 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              {editingRoom ? "✏️" : "➕"}
            </span>
            {editingRoom
              ? "Modifier la chambre"
              : "Ajouter une nouvelle chambre"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Nom de la chambre *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Chambre Standard, Suite Deluxe..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Prix ({currency}) *
                </label>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="120"
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                {isLoading
                  ? "Sauvegarde..."
                  : editingRoom
                    ? "💾 Modifier"
                    : "➕ Ajouter"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
              >
                ❌ Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des chambres avec design moderne */}
      {rooms.length > 0 ? (
        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <h3 className="font-medium text-gray-900">{room.name}</h3>
                <p className="text-sm text-gray-500">
                  {room.price} {currency} par nuit
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(room)}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(room.id, room.name)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-800 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">Aucune chambre configurée</p>
          <p className="text-sm">
            Commencez par ajouter vos premières chambres
          </p>
        </div>
      )}
    </div>
  );
}
