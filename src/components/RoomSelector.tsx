"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";
import { calculateStayDuration } from "@/lib/availability";

interface Room {
  id: string;
  name: string;
  price: number;
}

interface RoomSelectorProps {
  hotelSlug: string;
  checkInDate: string;
  checkOutDate: string;
  hasDog?: boolean;
  onRoomSelected: (room: Room) => void;
  onBack: () => void;
}

export function RoomSelector({
  hotelSlug,
  checkInDate,
  checkOutDate,
  hasDog,
  onRoomSelected,
  onBack,
}: RoomSelectorProps) {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  const duration = calculateStayDuration(
    new Date(checkInDate),
    new Date(checkOutDate)
  );

  // Rechercher les chambres disponibles au montage du composant
  useEffect(() => {
    // Protection contre les valeurs vides ou invalides
    if (!hotelSlug || !checkInDate || !checkOutDate) {
      return;
    }

    // Debounce pour éviter les appels trop rapides
    const timeoutId = setTimeout(() => {
      const searchRooms = async () => {
        setLoading(true);

        try {
          const response = await fetch(
            `/api/establishments/${hotelSlug}/availability?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}${hasDog !== undefined ? `&hasDog=${hasDog}` : ""}`
          );

          if (!response.ok) {
            throw new Error(
              "Erreur lors de la recherche des chambres disponibles"
            );
          }

          const data = await response.json();
          console.log("DEBUG: API response:", data);

          // Trier les chambres par ordre naturel (comprend les numéros)
          const sortedRooms = (data.availableRooms || []).sort(
            (a: Room, b: Room) => {
              return a.name.localeCompare(b.name, undefined, {
                numeric: true,
                sensitivity: "base",
              });
            }
          );

          setAvailableRooms(sortedRooms);

          // Afficher le message informatif si aucune chambre n'est disponible
          if (data.message) {
            console.log("DEBUG: Setting info message:", data.message);
            toastUtils.info(data.message);
          }
        } catch (err) {
          toastUtils.error(
            err instanceof Error
              ? err.message
              : "Erreur lors de la recherche des chambres"
          );
        } finally {
          setLoading(false);
        }
      };

      searchRooms();
    }, 100); // Délai de 100ms

    // Cleanup function pour annuler le timeout si les dépendances changent
    return () => clearTimeout(timeoutId);
  }, [hotelSlug, checkInDate, checkOutDate, hasDog]);

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleContinue = () => {
    if (selectedRoom) {
      onRoomSelected(selectedRoom);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Recherche des places disponibles...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Available Places
            {duration > 0 && (
              <Badge variant="secondary">
                {duration} night{duration > 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
          <Button variant="outline" onClick={onBack}>
            Change dates
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {availableRooms.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">😔</div>
            <p className="text-gray-600 mb-4">
              No place available for these dates
            </p>
            <Button variant="outline" onClick={onBack}>
              Choose different dates
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {availableRooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;

              return (
                <div
                  key={room.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-base text-gray-900">
                          {room.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {selectedRoom && (
              <div className="pt-4 border-t">
                <Button onClick={handleContinue} className="w-full" size="lg">
                  Continue with {selectedRoom.name}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
