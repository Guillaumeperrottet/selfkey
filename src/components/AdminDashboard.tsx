"use client";

import { useState } from "react";
import { QRCodePreview } from "./QRCodePreview";

interface RoomWithInventory {
  id: string;
  name: string;
  price: number;
  inventory: number;
  isActive: boolean;
}

interface Booking {
  id: string;
  roomId: string;
  clientName: string;
  clientEmail: string;
  phone: string;
  guests: number;
  amount: number;
  currency: string;
  bookingDate: Date;
  stripePaymentIntentId: string | null;
  room: {
    name: string;
  };
}

interface Establishment {
  id: string;
  name: string;
  slug: string;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
  commissionRate: number;
  fixedFee: number;
  createdAt: Date;
}

interface Props {
  establishment: Establishment;
  rooms: RoomWithInventory[];
  bookings: Booking[];
}

export function AdminDashboard({ establishment, rooms, bookings }: Props) {
  const [roomsState, setRoomsState] = useState(rooms);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  const confirmedBookings = bookings.filter((b) => b.stripePaymentIntentId);
  const bookingsByRoom = Object.groupBy(confirmedBookings, (b) => b.roomId);

  const handleToggleRoom = async (roomId: string, currentStatus: boolean) => {
    setToggleLoading(roomId);

    try {
      const response = await fetch(`/api/admin/rooms/${roomId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        // Mettre à jour l'état local
        setRoomsState((prevRooms) =>
          prevRooms.map((room) =>
            room.id === roomId ? { ...room, isActive: !currentStatus } : room
          )
        );
      } else {
        console.error("Erreur lors du toggle de la chambre");
        // Optionnel: afficher un message d'erreur à l'utilisateur
      }
    } catch (error) {
      console.error("Erreur lors du toggle de la chambre:", error);
    } finally {
      setToggleLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header moderne avec gradient */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3">Dashboard Admin</h1>
            <h2 className="text-xl font-medium text-blue-100 mb-2">
              {establishment.name}
            </h2>
            <p className="text-blue-100/80 text-lg">
              Vue d&apos;ensemble des chambres et réservations
            </p>
          </div>
          {/* Effet de particules/vague */}
          <div className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-indigo-400/30 rounded-full blur-sm"></div>
        </div>

        {/* Statut des chambres avec design moderne */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 p-2 mr-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 4h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Statut des chambres aujourd&apos;hui
            </h2>
          </div>

          <div className="grid gap-4">
            {roomsState.map((room) => (
              <div
                key={room.id}
                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                  room.isActive
                    ? "border-transparent bg-gradient-to-r from-white to-blue-50 hover:from-blue-50 hover:to-indigo-50"
                    : "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100"
                }`}
              >
                <div className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3
                        className={`text-xl font-semibold ${
                          room.isActive ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {room.name}
                      </h3>
                      {!room.isActive && (
                        <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full">
                          Désactivée
                        </span>
                      )}
                      {room.isActive && room.inventory > 0 && (
                        <span className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">
                          Disponible
                        </span>
                      )}
                      {room.isActive && room.inventory === 0 && (
                        <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                          Réservée
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mb-3">
                      <p
                        className={`text-lg font-bold ${
                          room.isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      >
                        {room.price} CHF
                      </p>
                      <span className="text-sm text-gray-500">par nuit</span>
                    </div>
                    {bookingsByRoom[room.id] && room.isActive && (
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                        <p className="text-sm font-semibold text-blue-800 mb-1">
                          Réservée par:{" "}
                          {bookingsByRoom[room.id]?.[0]?.clientName}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-blue-600">
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            {bookingsByRoom[room.id]?.[0]?.guests} personne(s)
                          </span>
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {bookingsByRoom[room.id]?.[0]?.clientEmail}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Bouton de toggle moderne */}
                    <button
                      onClick={() => handleToggleRoom(room.id, room.isActive)}
                      disabled={toggleLoading === room.id}
                      className={`relative px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        room.isActive
                          ? "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
                          : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                      }`}
                    >
                      {toggleLoading === room.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                          <span>Chargement...</span>
                        </div>
                      ) : room.isActive ? (
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>Désactiver</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>Activer</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
                {/* Indicateur visuel subtil */}
                <div
                  className={`h-1 w-full ${
                    room.isActive
                      ? "bg-gradient-to-r from-blue-400 to-indigo-400"
                      : "bg-gray-300"
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Réservations du jour avec design moderne */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 p-2 mr-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 2h6m6 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Réservations d&apos;aujourd&apos;hui
              </h2>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              {confirmedBookings.length} réservation
              {confirmedBookings.length !== 1 ? "s" : ""}
            </div>
          </div>

          {confirmedBookings.length > 0 ? (
            <div className="grid gap-4">
              {confirmedBookings.map((booking) => {
                const room = roomsState.find((r) => r.id === booking.roomId);
                return (
                  <div
                    key={booking.id}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-amber-50 border border-amber-200 p-6 transition-all duration-200 hover:shadow-lg hover:from-amber-50 hover:to-orange-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {booking.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {booking.clientName}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              {booking.clientEmail}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            {booking.phone}
                          </div>
                          <div className="flex items-center text-blue-600 font-medium">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            {booking.guests} personne
                            {booking.guests !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="bg-white rounded-lg p-3 shadow-sm border">
                          <p className="font-bold text-gray-900 text-lg">
                            {room?.name}
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {booking.amount} {booking.currency}
                          </p>
                        </div>
                        <div className="flex items-center justify-end text-xs text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {new Date(booking.bookingDate).toLocaleTimeString(
                            "fr-CH",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Barre de couleur décorative */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-400"></div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 2h6m6 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                Aucune réservation confirmée pour aujourd&apos;hui
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Les nouvelles réservations apparaîtront ici
              </p>
            </div>
          )}
        </div>

        {/* Statistiques et actions avec design moderne */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Statistiques modernes */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2 mr-3">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 00-2 2L13 19"
                  />
                </svg>
              </div>
              Statistiques rapides
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold mb-2">
                    {
                      roomsState.filter(
                        (room) => room.isActive && room.inventory > 0
                      ).length
                    }
                  </div>
                  <div className="text-blue-100 text-sm font-medium">
                    Chambres disponibles
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold mb-2">
                    {confirmedBookings.length}
                  </div>
                  <div className="text-emerald-100 text-sm font-medium">
                    Réservations confirmées
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold mb-2">
                    {confirmedBookings.reduce(
                      (sum, booking) => sum + booking.amount,
                      0
                    )}{" "}
                    CHF
                  </div>
                  <div className="text-purple-100 text-sm font-medium">
                    Revenus du jour
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold mb-2">
                    {roomsState.filter((room) => !room.isActive).length}
                  </div>
                  <div className="text-gray-100 text-sm font-medium">
                    Chambres désactivées
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Preview moderne */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 h-full">
              <QRCodePreview hotelSlug={establishment.slug} />
            </div>
          </div>

          {/* Actions rapides modernes */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 p-2 mr-3">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              Actions rapides
            </h3>
            <div className="space-y-4">
              <a
                href={`/${establishment.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <span className="font-semibold">
                  Voir la page de réservation
                </span>
              </a>

              <a
                href={`/admin/${establishment.slug}/qr-code`}
                className="group w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-indigo-600 flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                <span className="font-semibold">Code QR imprimable</span>
              </a>

              {/* Nouvelle action : Accès Stripe Dashboard */}
              {establishment.stripeAccountId && (
                <a
                  href="/api/stripe/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg
                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 00-2 2L13 19"
                    />
                  </svg>
                  <span className="font-semibold">Dashboard Stripe</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
