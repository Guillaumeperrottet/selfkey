"use client";

import { QRCodePreview } from "./QRCodePreview";

interface RoomWithInventory {
  id: string;
  name: string;
  price: number;
  inventory: number;
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
  const confirmedBookings = bookings.filter((b) => b.stripePaymentIntentId);
  const bookingsByRoom = Object.groupBy(confirmedBookings, (b) => b.roomId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Admin - {establishment.name}
          </h1>
          <p className="text-gray-600">
            Vue d&apos;ensemble des chambres et réservations
          </p>
        </div>

        {/* Statut des chambres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Statut des chambres aujourd&apos;hui
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
                    {room.price} CHF par nuit
                  </p>
                  {bookingsByRoom[room.id] && (
                    <div className="mt-2">
                      <p className="text-sm text-blue-600">
                        Réservée par: {bookingsByRoom[room.id]?.[0]?.clientName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {bookingsByRoom[room.id]?.[0]?.guests} personne(s) •{" "}
                        {bookingsByRoom[room.id]?.[0]?.clientEmail}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        room.inventory > 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span
                      className={`font-medium ${
                        room.inventory > 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {room.inventory > 0 ? "Disponible" : "Réservée"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
                        <p className="text-sm text-blue-600">
                          {booking.guests} personne(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {room?.name}
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

        {/* Statistiques et actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Statistiques */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistiques rapides
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {rooms.filter((room) => room.inventory > 0).length}
                </div>
                <div className="text-sm text-gray-600">
                  Chambres disponibles
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {confirmedBookings.length}
                </div>
                <div className="text-sm text-gray-600">
                  Réservations confirmées
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {confirmedBookings.reduce(
                    (sum, booking) => sum + booking.amount,
                    0
                  )}{" "}
                  CHF
                </div>
                <div className="text-sm text-gray-600">Revenus du jour</div>
              </div>
            </div>
          </div>

          {/* QR Code Preview */}
          <div>
            <QRCodePreview hotelSlug={establishment.slug} />
          </div>

          {/* Actions supplémentaires */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="space-y-3">
              <a
                href={`/${establishment.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
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
                <span>Voir la page de réservation</span>
              </a>

              <a
                href={`/admin/${establishment.slug}/qr-code`}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
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
                <span>Code QR imprimable</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
