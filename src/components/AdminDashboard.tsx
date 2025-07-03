"use client";

import { useState } from "react";
import { QRCodePreview } from "./QRCodePreview";

// Types
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
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  clientBirthDate: Date;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  clientCountry: string;
  clientIdNumber: string;
  guests: number;
  amount: number;
  currency: string;
  bookingDate: Date;
  checkInDate: Date;
  checkOutDate: Date;
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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const confirmedBookings = bookings.filter((b) => b.stripePaymentIntentId);
  const bookingsByRoom = Object.groupBy(confirmedBookings, (b) => b.roomId);

  const handleToggleRoom = async (roomId: string, currentStatus: boolean) => {
    setToggleLoading(roomId);
    try {
      const response = await fetch(`/api/admin/rooms/${roomId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setRoomsState((prevRooms) =>
          prevRooms.map((room) =>
            room.id === roomId ? { ...room, isActive: !currentStatus } : room
          )
        );
      }
    } catch (error) {
      console.error("Erreur lors du toggle de la chambre:", error);
    } finally {
      setToggleLoading(null);
    }
  };

  const availableRooms = roomsState.filter(
    (room) => room.isActive && room.inventory > 0
  ).length;
  const totalRevenue = confirmedBookings.reduce(
    (sum, booking) => sum + booking.amount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {availableRooms}
          </div>
          <div className="text-xs text-gray-600">Disponibles</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {totalRevenue} CHF
          </div>
          <div className="text-xs text-gray-600">Revenus</div>
        </div>
      </div>

      {/* Room Status */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Chambres</h4>
        <div className="space-y-2">
          {roomsState.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {room.name}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      room.isActive
                        ? room.inventory > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {!room.isActive
                      ? "OFF"
                      : room.inventory > 0
                        ? "OK"
                        : "RÉSERVÉE"}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{room.price} CHF</p>
                {bookingsByRoom[room.id] && (
                  <p className="text-xs text-blue-600 truncate">
                    {bookingsByRoom[room.id]?.[0]
                      ? `${bookingsByRoom[room.id]![0]!.clientFirstName} ${bookingsByRoom[room.id]![0]!.clientLastName}`
                      : null}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleToggleRoom(room.id, room.isActive)}
                disabled={toggleLoading === room.id}
                className={`ml-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  room.isActive
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                } disabled:opacity-50`}
              >
                {toggleLoading === room.id
                  ? "..."
                  : room.isActive
                    ? "OFF"
                    : "ON"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Réservations ({confirmedBookings.length})
        </h4>
        {confirmedBookings.length > 0 ? (
          <div className="space-y-2">
            {confirmedBookings.map((booking) => {
              const room = roomsState.find((r) => r.id === booking.roomId);
              return (
                <div
                  key={booking.id}
                  className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-medium text-xs">
                        {booking.clientFirstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {`${booking.clientFirstName} ${booking.clientLastName}`}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{room?.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {booking.guests} pers.
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      {booking.amount} CHF
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <svg
              className="w-8 h-8 mx-auto mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 2h6"
              />
            </svg>
            <p className="text-xs">Aucune réservation</p>
          </div>
        )}
      </div>

      {/* QR Code */}
      <div>
        <QRCodePreview hotelSlug={establishment.slug} />
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <a
          href={`/${establishment.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
        >
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
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Page de réservation
        </a>

        <a
          href={`/admin/${establishment.slug}/qr-code`}
          className="w-full bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
        >
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
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01"
            />
          </svg>
          Code QR
        </a>

        {establishment.stripeAccountId && (
          <a
            href="/api/stripe/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 00-2 2L13 19"
              />
            </svg>
            Stripe
          </a>
        )}
      </div>

      {/* Modal de détails de réservation */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Détails de la réservation
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Informations client
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Nom:</span>{" "}
                    {selectedBooking.clientLastName}
                  </p>
                  <p>
                    <span className="font-medium">Prénom:</span>{" "}
                    {selectedBooking.clientFirstName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedBooking.clientEmail}
                  </p>
                  <p>
                    <span className="font-medium">Téléphone:</span>{" "}
                    {selectedBooking.clientPhone}
                  </p>
                  <p>
                    <span className="font-medium">Date de naissance:</span>{" "}
                    {new Date(
                      selectedBooking.clientBirthDate
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">N° ID:</span>{" "}
                    {selectedBooking.clientIdNumber}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Adresse</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Adresse:</span>{" "}
                    {selectedBooking.clientAddress}
                  </p>
                  <p>
                    <span className="font-medium">Code postal:</span>{" "}
                    {selectedBooking.clientPostalCode}
                  </p>
                  <p>
                    <span className="font-medium">Localité:</span>{" "}
                    {selectedBooking.clientCity}
                  </p>
                  <p>
                    <span className="font-medium">Pays:</span>{" "}
                    {selectedBooking.clientCountry}
                  </p>
                </div>

                <h4 className="font-medium text-gray-900 mb-2 mt-4">
                  Réservation
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Chambre:</span>{" "}
                    {
                      roomsState.find((r) => r.id === selectedBooking.roomId)
                        ?.name
                    }
                  </p>
                  <p>
                    <span className="font-medium">Check-in:</span>{" "}
                    {new Date(selectedBooking.checkInDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Check-out:</span>{" "}
                    {new Date(
                      selectedBooking.checkOutDate
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Invités:</span>{" "}
                    {selectedBooking.guests}
                  </p>
                  <p>
                    <span className="font-medium">Montant:</span>{" "}
                    {selectedBooking.amount} {selectedBooking.currency}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
