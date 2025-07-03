"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, CalendarDays, Clock, Info } from "lucide-react";
import {
  calculateStayDuration,
  validateBookingDates,
} from "@/lib/availability";

interface Room {
  id: string;
  name: string;
  price: number;
}

interface Establishment {
  name: string;
  maxBookingDays: number;
}

interface BookingFormProps {
  hotelSlug: string;
  establishment: Establishment;
}

export function BookingForm({ hotelSlug, establishment }: BookingFormProps) {
  const router = useRouter();
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  // Informations client détaillées
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientBirthDate, setClientBirthDate] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPostalCode, setClientPostalCode] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientCountry, setClientCountry] = useState("Suisse");
  const [clientIdNumber, setClientIdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Date minimale : aujourd'hui
  const today = new Date().toISOString().split("T")[0];

  // Date maximale : aujourd'hui + 1 an
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const handleSearchRooms = async () => {
    if (!checkInDate || !checkOutDate) {
      setError("Veuillez sélectionner les dates d'arrivée et de départ");
      return;
    }

    if (checkInDate >= checkOutDate) {
      setError("La date de départ doit être après la date d'arrivée");
      return;
    }

    // Vérifier la durée maximale
    const validation = validateBookingDates(
      new Date(checkInDate),
      new Date(checkOutDate),
      establishment.maxBookingDays
    );

    if (!validation.isValid) {
      setError(validation.error || "Dates invalides");
      return;
    }

    setLoading(true);
    setError("");
    setSelectedRoom(null);

    try {
      const response = await fetch(
        `/api/establishments/${hotelSlug}/availability?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche des chambres disponibles");
      }

      const data = await response.json();
      setAvailableRooms(data.availableRooms || []);
      setSearchPerformed(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la recherche des chambres"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleConfirmBooking = async () => {
    // Validation des champs obligatoires
    if (!selectedRoom) {
      setError("Veuillez sélectionner une chambre");
      return;
    }

    if (
      !clientFirstName.trim() ||
      !clientLastName.trim() ||
      !clientEmail.trim() ||
      !clientPhone.trim() ||
      !clientBirthDate ||
      !clientAddress.trim() ||
      !clientPostalCode.trim() ||
      !clientCity.trim() ||
      !clientCountry.trim() ||
      !clientIdNumber.trim()
    ) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      setError("Veuillez saisir une adresse email valide");
      return;
    }

    setBookingInProgress(true);
    setError("");

    try {
      const duration = calculateStayDuration(
        new Date(checkInDate),
        new Date(checkOutDate)
      );
      const totalPrice = selectedRoom.price * duration;

      const response = await fetch(
        `/api/establishments/${hotelSlug}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: selectedRoom.id,
            checkInDate,
            checkOutDate,
            clientFirstName: clientFirstName.trim(),
            clientLastName: clientLastName.trim(),
            clientEmail: clientEmail.trim(),
            clientPhone: clientPhone.trim(),
            clientBirthDate,
            clientAddress: clientAddress.trim(),
            clientPostalCode: clientPostalCode.trim(),
            clientCity: clientCity.trim(),
            clientCountry: clientCountry.trim(),
            clientIdNumber: clientIdNumber.trim(),
            expectedPrice: totalPrice,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création de la réservation"
        );
      }

      const data = await response.json();

      // Rediriger vers la page de paiement
      router.push(`/${hotelSlug}/payment?booking=${data.bookingId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de la réservation"
      );
    } finally {
      setBookingInProgress(false);
    }
  };

  const duration =
    checkInDate && checkOutDate
      ? calculateStayDuration(new Date(checkInDate), new Date(checkOutDate))
      : 0;

  return (
    <div className="space-y-6">
      {/* Sélection des dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dates de séjour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkIn">Date d&apos;arrivée</Label>
              <Input
                id="checkIn"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={today}
                max={maxDateStr}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="checkOut">Date de départ</Label>
              <Input
                id="checkOut"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate || today}
                max={maxDateStr}
                className="mt-1"
              />
            </div>
          </div>

          {duration > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                Durée du séjour : {duration} nuit{duration > 1 ? "s" : ""}
              </span>
            </div>
          )}

          {establishment.maxBookingDays && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Durée maximale de séjour : {establishment.maxBookingDays} jour
                {establishment.maxBookingDays > 1 ? "s" : ""}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSearchRooms}
            disabled={loading || !checkInDate || !checkOutDate}
            className="w-full"
          >
            {loading
              ? "Recherche en cours..."
              : "Rechercher les chambres disponibles"}
          </Button>
        </CardContent>
      </Card>

      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Liste des chambres disponibles */}
      {searchPerformed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Chambres disponibles
              {duration > 0 && (
                <Badge variant="secondary">
                  {duration} nuit{duration > 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableRooms.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">😔</div>
                <p className="text-gray-600">
                  Aucune chambre disponible pour ces dates
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableRooms.map((room) => {
                  const totalPrice = room.price * duration;
                  const isSelected = selectedRoom?.id === room.id;

                  return (
                    <div
                      key={room.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleRoomSelect(room)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{room.name}</h3>
                          <p className="text-sm text-gray-600">
                            {room.price} CHF / nuit
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {totalPrice} CHF
                          </div>
                          <div className="text-sm text-gray-600">total</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informations du client */}
      {selectedRoom && (
        <Card>
          <CardHeader>
            <CardTitle>Informations du client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientLastName">Nom *</Label>
                <Input
                  id="clientLastName"
                  type="text"
                  value={clientLastName}
                  onChange={(e) => setClientLastName(e.target.value)}
                  placeholder="Nom de famille"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientFirstName">Prénom *</Label>
                <Input
                  id="clientFirstName"
                  type="text"
                  value={clientFirstName}
                  onChange={(e) => setClientFirstName(e.target.value)}
                  placeholder="Prénom"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* Date de naissance */}
            <div>
              <Label htmlFor="clientBirthDate">Date de naissance *</Label>
              <Input
                id="clientBirthDate"
                type="date"
                value={clientBirthDate}
                onChange={(e) => setClientBirthDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            {/* Adresse */}
            <div>
              <Label htmlFor="clientAddress">Adresse *</Label>
              <Input
                id="clientAddress"
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Rue et numéro"
                className="mt-1"
                required
              />
            </div>

            {/* Code postal et Localité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPostalCode">Code postal *</Label>
                <Input
                  id="clientPostalCode"
                  type="text"
                  value={clientPostalCode}
                  onChange={(e) => setClientPostalCode(e.target.value)}
                  placeholder="1234"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientCity">Localité *</Label>
                <Input
                  id="clientCity"
                  type="text"
                  value={clientCity}
                  onChange={(e) => setClientCity(e.target.value)}
                  placeholder="Ville"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* Pays */}
            <div>
              <Label htmlFor="clientCountry">Pays *</Label>
              <Input
                id="clientCountry"
                type="text"
                value={clientCountry}
                onChange={(e) => setClientCountry(e.target.value)}
                placeholder="Pays"
                className="mt-1"
                required
              />
            </div>

            {/* N° de permis ou carte d'identité */}
            <div>
              <Label htmlFor="clientIdNumber">
                N° de permis ou de carte d&apos;identité *
              </Label>
              <Input
                id="clientIdNumber"
                type="text"
                value={clientIdNumber}
                onChange={(e) => setClientIdNumber(e.target.value)}
                placeholder="Numéro d'identification"
                className="mt-1"
                required
              />
            </div>

            {/* Email et Téléphone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Téléphone mobile *</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+41 79 123 45 67"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-medium">{selectedRoom.name}</h4>
                  <p className="text-sm text-gray-600">
                    Du {new Date(checkInDate).toLocaleDateString()} au{" "}
                    {new Date(checkOutDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-xl">
                    {selectedRoom.price * duration} CHF
                  </div>
                  <div className="text-sm text-gray-600">
                    {duration} nuit{duration > 1 ? "s" : ""} ×{" "}
                    {selectedRoom.price} CHF
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConfirmBooking}
                disabled={bookingInProgress}
                className="w-full"
                size="lg"
              >
                {bookingInProgress
                  ? "Création de la réservation..."
                  : "Confirmer la réservation"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
