"use client";

import { useState } from "react";
import { HotelConfig, Room } from "@/types/hotel";

interface RoomWithInventory extends Room {
  inventory: number;
}

interface Booking {
  id: string;
  roomId: string;
  clientName: string;
  clientEmail: string;
  phone: string;
  amount: number;
  currency: string;
  bookingDate: Date;
  stripePaymentIntentId: string | null;
}

interface Props {
  hotelSlug: string;
  hotelConfig: HotelConfig;
  rooms: RoomWithInventory[];
  bookings: Booking[];
}

export function AdminDashboard({
  hotelSlug,
  hotelConfig,
  rooms,
  bookings,
}: Props) {
  const [inventory, setInventory] = useState<Record<string, number>>(
    Object.fromEntries(rooms.map((room) => [room.id, room.inventory]))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const updateRoomInventory = (roomId: string, change: number) => {
    setInventory((prev) => ({
      ...prev,
      [roomId]: Math.max(0, (prev[roomId] || 0) + change),
    }));
  };

  const saveInventory = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotelSlug,
          inventory,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      setMessage({
        type: "success",
        text: "Inventaire sauvegardé avec succès !",
      });
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForTomorrow = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir réinitialiser l'inventaire pour demain ?"
      )
    ) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hotelSlug }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la réinitialisation");
      }

      setMessage({
        type: "success",
        text: "Inventaire réinitialisé pour demain !",
      });
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la réinitialisation" });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmedBookings = bookings.filter((b) => b.stripePaymentIntentId);
  const bookingsByRoom = Object.groupBy(confirmedBookings, (b) => b.roomId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          {hotelConfig.logo && (
            <img
              src={hotelConfig.logo}
              alt={hotelConfig.name}
              className="h-16 mx-auto mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Staff - {hotelConfig.name}
          </h1>
          <p className="text-gray-600">
            Gestion des chambres disponibles pour ce soir
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Inventaire des chambres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Chambres disponibles ce soir
          </h2>

          <div className="space-y-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Chambre {room.id} • {room.price} {hotelConfig.currency}
                  </p>
                  {bookingsByRoom[room.id] && (
                    <p className="text-sm text-green-600 mt-1">
                      {bookingsByRoom[room.id]?.length} réservation(s)
                      confirmée(s)
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => updateRoomInventory(room.id, -1)}
                    disabled={inventory[room.id] <= 0}
                    className="w-10 h-10 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                  >
                    -
                  </button>

                  <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                    {inventory[room.id] || 0}
                  </span>

                  <button
                    onClick={() => updateRoomInventory(room.id, 1)}
                    className="w-10 h-10 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={saveInventory}
              disabled={isLoading}
              style={{ backgroundColor: hotelConfig.colors.primary }}
              className="flex-1 py-3 px-4 text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? "Sauvegarde..." : "Sauvegarder l'inventaire"}
            </button>

            <button
              onClick={resetForTomorrow}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset pour demain
            </button>
          </div>
        </div>

        {/* Réservations du jour */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Réservations d&apos;aujourd&apos;hui ({confirmedBookings.length})
          </h2>

          {confirmedBookings.length > 0 ? (
            <div className="space-y-4">
              {confirmedBookings.map((booking) => {
                const room = rooms.find((r) => r.id === booking.roomId);
                return (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {booking.clientName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.clientEmail}
                        </p>
                        <p className="text-sm text-gray-600">{booking.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {room?.name} - Chambre {booking.roomId}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.amount} {booking.currency}
                        </p>
                        <p className="text-xs text-green-600">
                          {new Date(booking.bookingDate).toLocaleTimeString(
                            "fr-CH",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune réservation confirmée pour aujourd&apos;hui</p>
            </div>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(inventory).reduce((sum, count) => sum + count, 0)}
            </div>
            <div className="text-sm text-gray-600">Chambres disponibles</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {confirmedBookings.length}
            </div>
            <div className="text-sm text-gray-600">Réservations confirmées</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {confirmedBookings.reduce(
                (sum, booking) => sum + booking.amount,
                0
              )}{" "}
              {hotelConfig.currency}
            </div>
            <div className="text-sm text-gray-600">Revenus du jour</div>
          </div>
        </div>
      </div>
    </div>
  );
}
