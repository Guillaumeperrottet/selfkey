"use client";

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

        {/* Statistiques rapides */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {rooms.filter((room) => room.inventory > 0).length}
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
              CHF
            </div>
            <div className="text-sm text-gray-600">Revenus du jour</div>
          </div>
        </div>
      </div>
    </div>
  );
}
