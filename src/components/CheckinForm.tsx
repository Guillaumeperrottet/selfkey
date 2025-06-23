"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HotelConfig, AvailableRoom } from "@/types/hotel";

interface Props {
  hotelSlug: string;
  hotelConfig: HotelConfig;
  availableRooms: AvailableRoom[];
}

export function CheckinForm({ hotelSlug, hotelConfig, availableRooms }: Props) {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    phone: "",
    guests: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedRoomData = availableRooms.find(
    (room) => room.id === selectedRoom
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedRoom) newErrors.room = "Veuillez sélectionner une chambre";
    if (!formData.clientName.trim()) newErrors.clientName = "Le nom est requis";
    if (!formData.clientEmail.trim())
      newErrors.clientEmail = "L'email est requis";
    if (!formData.phone.trim()) newErrors.phone = "Le téléphone est requis";
    if (formData.guests < 1) newErrors.guests = "Au moins 1 personne";

    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.clientEmail && !emailRegex.test(formData.clientEmail)) {
      newErrors.clientEmail = "Email invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedRoomData) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotelSlug,
          roomId: selectedRoom,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          phone: formData.phone,
          guests: formData.guests,
          amount: selectedRoomData.price,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la réservation");
      }

      const { bookingId } = await response.json();

      // Rediriger vers la page de paiement
      router.push(`/${hotelSlug}/payment?booking=${bookingId}`);
    } catch (error) {
      console.error("Erreur:", error);
      setErrors({ submit: "Une erreur est survenue. Veuillez réessayer." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Sélection de chambre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choisissez votre chambre
          </label>
          <div className="space-y-3">
            {availableRooms.map((room) => (
              <label
                key={room.id}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRoom === room.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="room"
                    value={room.id}
                    checked={selectedRoom === room.id}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{room.name}</div>
                    <div className="text-sm text-gray-500">
                      Chambre {room.id} • {room.available} disponible(s)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {room.price} {hotelConfig.currency}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.room && (
            <p className="mt-1 text-sm text-red-600">{errors.room}</p>
          )}
        </div>

        {/* Informations client */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Vos informations
          </h3>

          <div>
            <label
              htmlFor="clientName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom complet *
            </label>
            <input
              type="text"
              id="clientName"
              value={formData.clientName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, clientName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jean Dupont"
            />
            {errors.clientName && (
              <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="clientEmail"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email *
            </label>
            <input
              type="email"
              id="clientEmail"
              value={formData.clientEmail}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  clientEmail: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="jean.dupont@email.com"
            />
            {errors.clientEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Téléphone *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+41 79 123 45 67"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="guests"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre de personnes *
            </label>
            <select
              id="guests"
              value={formData.guests}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  guests: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "personne" : "personnes"}
                </option>
              ))}
            </select>
            {errors.guests && (
              <p className="mt-1 text-sm text-red-600">{errors.guests}</p>
            )}
          </div>
        </div>

        {/* Résumé et bouton */}
        {selectedRoomData && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total à payer :</span>
              <span className="text-xl font-bold text-gray-900">
                {selectedRoomData.price} {hotelConfig.currency}
              </span>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !selectedRoom}
          style={{ backgroundColor: hotelConfig.colors.primary }}
          className="w-full py-3 px-4 text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isLoading
            ? "Création de la réservation..."
            : "Continuer vers le paiement"}
        </button>
      </form>
    </div>
  );
}
