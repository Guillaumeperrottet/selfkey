"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar as CalendarIcon,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  addDays,
  isSameDay,
  addMonths,
  startOfMonth,
  getMonth,
  getYear,
  setMonth,
  setYear,
  getDaysInMonth,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Booking {
  id: string;
  bookingNumber: number;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone?: string;
  amount: number;
  guests: number;
  checkInDate: Date;
  checkOutDate: Date;
  bookingDate: Date;
  paymentStatus?: string;
  bookingType?: string;
  room: {
    name: string;
  } | null;
}

interface Room {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

interface BookingPlanningProps {
  bookings: Booking[];
  rooms: Room[];
}

export function BookingPlanning({ bookings, rooms }: BookingPlanningProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Générer tous les jours du mois courant
  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    return Array.from({ length: daysInMonth }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // Fonction pour vérifier si une réservation est active un jour donné
  const isBookingActiveOnDay = (booking: Booking, day: Date): boolean => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);

    // Normaliser les dates à minuit
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    const currentDay = new Date(day);
    currentDay.setHours(0, 0, 0, 0);

    return currentDay >= checkIn && currentDay < checkOut;
  };

  // Fonction pour trouver la réservation active pour une chambre un jour donné
  const getBookingForRoomAndDay = (
    roomName: string,
    day: Date
  ): Booking | null => {
    return (
      bookings.find(
        (booking) =>
          booking.room?.name === roomName && isBookingActiveOnDay(booking, day)
      ) || null
    );
  };

  // Fonction pour vérifier si c'est le premier jour d'une réservation dans la vue actuelle
  const isFirstDayOfBooking = (booking: Booking, day: Date): boolean => {
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    const currentDay = new Date(day);
    currentDay.setHours(0, 0, 0, 0);

    // Premier jour de la réservation OU premier jour de la vue si la réservation a commencé avant
    return (
      isSameDay(checkIn, currentDay) ||
      (checkIn < days[0] && isSameDay(currentDay, days[0]))
    );
  };

  // Fonction pour calculer combien de jours consécutifs afficher pour une réservation
  const getBookingSpan = (booking: Booking, startDay: Date): number => {
    const checkOut = new Date(booking.checkOutDate);
    checkOut.setHours(0, 0, 0, 0);

    let span = 0;
    let currentDay = new Date(startDay);

    for (let i = days.indexOf(startDay); i < days.length; i++) {
      currentDay = new Date(days[i]);
      currentDay.setHours(0, 0, 0, 0);

      if (currentDay >= checkOut) break;
      if (!isBookingActiveOnDay(booking, currentDay)) break;

      span++;
    }

    return span;
  };

  // Navigation
  const handlePreviousMonth = () => {
    setCurrentDate((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handlePrint = () => {
    window.print();
  };

  const activeRooms = rooms.filter((room) => room.isActive);

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <Card className="no-print">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Planning des réservations
              </CardTitle>
              <CardDescription>
                Vue mensuelle complète -{" "}
                {format(currentDate, "MMMM yyyy", { locale: fr })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Navigation style Google Calendar */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousMonth}
                  className="h-9 w-9 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToday}
                  className="h-9 px-3 font-medium"
                >
                  Aujourd&apos;hui
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                  className="h-9 w-9 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="h-6 w-px bg-gray-300" />

              {/* Affichage du mois et année - Cliquable pour sélection rapide */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-xl font-semibold text-gray-900 hover:bg-gray-100 h-auto px-4 py-2"
                  >
                    {format(currentDate, "MMMM yyyy", { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="center">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Mois
                      </label>
                      <Select
                        value={getMonth(currentDate).toString()}
                        onValueChange={(value) => {
                          setCurrentDate((prev) =>
                            setMonth(prev, parseInt(value))
                          );
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {format(new Date(2000, i, 1), "MMMM", {
                                locale: fr,
                              })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Année
                      </label>
                      <Select
                        value={getYear(currentDate).toString()}
                        onValueChange={(value) => {
                          setCurrentDate((prev) =>
                            setYear(prev, parseInt(value))
                          );
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() - 2 + i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="h-6 w-px bg-gray-300" />

              <Button
                variant="default"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2 h-9"
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Planning */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="planning-table w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 bg-gray-50 border border-gray-300 p-1 w-20 min-w-20 max-w-20 font-semibold text-xs">
                    Places
                  </th>
                  {days.map((day, index) => {
                    const isToday = isSameDay(day, new Date());
                    return (
                      <th
                        key={index}
                        className={`border border-gray-300 p-1.5 min-w-[65px] text-xs font-medium ${
                          isToday ? "bg-yellow-100" : "bg-gray-50"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold text-xs">
                            {format(day, "EEE", { locale: fr })}
                          </div>
                          <div className="text-xs">
                            {format(day, "dd/MM", { locale: fr })}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {activeRooms.map((room) => {
                  // Pour chaque chambre, on génère les cellules en tenant compte des réservations continues
                  const renderedDays = new Set<number>();

                  return (
                    <tr key={room.id}>
                      <td className="sticky left-0 z-10 bg-gray-50 border border-gray-300 p-2 w-20 min-w-20 max-w-20 font-medium text-xs h-10">
                        <TooltipProvider>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <div className="truncate cursor-default">
                                {room.name}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{room.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                      {days.map((day, dayIndex) => {
                        // Si ce jour a déjà été rendu (faisant partie d'une réservation avec colspan), on le saute
                        if (renderedDays.has(dayIndex)) {
                          return null;
                        }

                        const booking = getBookingForRoomAndDay(room.name, day);
                        const isToday = isSameDay(day, new Date());

                        if (!booking) {
                          // Pas de réservation : cellule vide normale
                          return (
                            <td
                              key={dayIndex}
                              className={`border border-gray-300 p-2 h-10 ${
                                isToday ? "bg-yellow-50" : "bg-white"
                              }`}
                            />
                          );
                        }

                        // Il y a une réservation : vérifier si c'est le début
                        const isFirstDay = isFirstDayOfBooking(booking, day);

                        if (isFirstDay) {
                          // Calculer le colspan (nombre de jours consécutifs)
                          const span = getBookingSpan(booking, day);

                          // Marquer les jours suivants comme déjà rendus
                          for (let i = 1; i < span; i++) {
                            renderedDays.add(dayIndex + i);
                          }

                          return (
                            <td
                              key={dayIndex}
                              colSpan={span}
                              className={`border border-gray-300 p-1 relative h-10 ${
                                isToday ? "bg-yellow-50" : "bg-white"
                              }`}
                            >
                              <TooltipProvider>
                                <Tooltip delayDuration={100}>
                                  <TooltipTrigger asChild>
                                    <div className="h-8 rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white cursor-pointer flex items-center justify-center w-full">
                                      {`${booking.clientFirstName} ${booking.clientLastName[0]}.`}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs"
                                  >
                                    <div className="space-y-1 text-sm">
                                      <div className="font-semibold border-b pb-1">
                                        Réservation #{booking.bookingNumber}
                                      </div>
                                      <div>
                                        <strong>Client:</strong>{" "}
                                        {booking.clientFirstName}{" "}
                                        {booking.clientLastName}
                                      </div>
                                      <div>
                                        <strong>Email:</strong>{" "}
                                        {booking.clientEmail}
                                      </div>
                                      {booking.clientPhone && (
                                        <div>
                                          <strong>Tél:</strong>{" "}
                                          {booking.clientPhone}
                                        </div>
                                      )}
                                      <div>
                                        <strong>Arrivée:</strong>{" "}
                                        {format(
                                          new Date(booking.checkInDate),
                                          "dd/MM/yyyy",
                                          { locale: fr }
                                        )}
                                      </div>
                                      <div>
                                        <strong>Départ:</strong>{" "}
                                        {format(
                                          new Date(booking.checkOutDate),
                                          "dd/MM/yyyy",
                                          { locale: fr }
                                        )}
                                      </div>
                                      <div>
                                        <strong>Personnes:</strong>{" "}
                                        {booking.guests}
                                      </div>
                                      <div>
                                        <strong>Montant:</strong>{" "}
                                        {booking.amount.toFixed(2)} CHF
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                          );
                        }

                        // Si on arrive ici, c'est une cellule qui fait partie d'une réservation
                        // mais qui n'est pas le premier jour. Elle sera sautée grâce à renderedDays.
                        return null;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.3cm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Masquer tout sauf le planning */
          body * {
            visibility: hidden;
          }

          .planning-table,
          .planning-table * {
            visibility: visible;
          }

          .planning-table {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            font-size: 9px;
          }

          /* Masquer tous les Cards et leurs contenus sauf le planning */
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }

          /* Styles du tableau pour l'impression */
          .planning-table th,
          .planning-table td {
            padding: 3px 2px !important;
            border: 1px solid #000 !important;
          }

          .planning-table th {
            background-color: #f3f4f6 !important;
            font-weight: 600 !important;
          }

          /* Assurer que les noms de clients restent visibles */
          .planning-table .bg-indigo-600,
          .planning-table .bg-indigo-500 {
            background-color: #4f46e5 !important;
            color: white !important;
          }

          /* Colonne sticky visible à l'impression */
          .planning-table .sticky {
            position: static !important;
          }
        }

        .planning-table {
          border-collapse: collapse;
        }

        .planning-table th,
        .planning-table td {
          border: 1px solid #d1d5db;
        }

        .sticky {
          position: sticky;
        }

        .left-0 {
          left: 0;
        }
      `}</style>
    </div>
  );
}
