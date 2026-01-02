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
  startOfWeek,
  isSameDay,
  addMonths,
  startOfMonth,
  getMonth,
  getYear,
  setMonth,
  setYear,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [startDate, setStartDate] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // Générer 14 jours à partir de startDate
  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => addDays(startDate, i));
  }, [startDate]);

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

  // Fonction pour vérifier si c'est le premier jour d'une réservation
  const isFirstDayOfBooking = (booking: Booking, day: Date): boolean => {
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    const currentDay = new Date(day);
    currentDay.setHours(0, 0, 0, 0);
    return isSameDay(checkIn, currentDay);
  };

  // Navigation
  const handlePrevious = () => {
    setStartDate((prev) => addDays(prev, -7));
  };

  const handleNext = () => {
    setStartDate((prev) => addDays(prev, 7));
  };

  const handlePreviousMonth = () => {
    setStartDate((prev) => {
      const newDate = addMonths(prev, -1);
      return startOfWeek(startOfMonth(newDate), { weekStartsOn: 1 });
    });
  };

  const handleNextMonth = () => {
    setStartDate((prev) => {
      const newDate = addMonths(prev, 1);
      return startOfWeek(startOfMonth(newDate), { weekStartsOn: 1 });
    });
  };

  const handleToday = () => {
    setStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleMonthChange = (month: number) => {
    setStartDate((prev) => {
      const newDate = setMonth(prev, month);
      return startOfWeek(startOfMonth(newDate), { weekStartsOn: 1 });
    });
  };

  const handleYearChange = (year: number) => {
    setStartDate((prev) => {
      const newDate = setYear(prev, year);
      return startOfWeek(startOfMonth(newDate), { weekStartsOn: 1 });
    });
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
                Vue planning sur 2 semaines - Places à gauche, dates en haut
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Navigation par mois */}
              <div className="flex items-center gap-1 border-r pr-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousMonth}
                  title="Mois précédent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronLeft className="h-4 w-4 -ml-2" />
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              {/* Sélecteurs Mois/Année */}
              <Select
                value={getMonth(startDate).toString()}
                onValueChange={(value) => handleMonthChange(parseInt(value))}
              >
                <SelectTrigger className="w-[130px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {format(new Date(2000, i, 1), "MMMM", { locale: fr })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={getYear(startDate).toString()}
                onValueChange={(value) => handleYearChange(parseInt(value))}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 1 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Navigation par semaine */}
              <div className="flex items-center gap-1 border-l pl-2">
                <Button variant="outline" size="sm" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                  title="Mois suivant"
                >
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4 -ml-2" />
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={handleToday}>
                Aujourd&apos;hui
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
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
                  <th className="sticky left-0 z-20 bg-gray-50 border border-gray-300 p-2 min-w-[120px] font-semibold">
                    Places
                  </th>
                  {days.map((day, index) => {
                    const isToday = isSameDay(day, new Date());
                    return (
                      <th
                        key={index}
                        className={`border border-gray-300 p-2 min-w-[80px] text-xs font-medium ${
                          isToday ? "bg-yellow-100" : "bg-gray-50"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold">
                            {format(day, "EEE", { locale: fr })}
                          </div>
                          <div>{format(day, "dd/MM", { locale: fr })}</div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {activeRooms.map((room) => (
                  <tr key={room.id}>
                    <td className="sticky left-0 z-10 bg-gray-50 border border-gray-300 p-2 font-medium">
                      {room.name}
                    </td>
                    {days.map((day, dayIndex) => {
                      const booking = getBookingForRoomAndDay(room.name, day);
                      const isToday = isSameDay(day, new Date());
                      const isFirstDay = booking
                        ? isFirstDayOfBooking(booking, day)
                        : false;

                      return (
                        <td
                          key={dayIndex}
                          className={`border border-gray-300 p-1 ${
                            isToday ? "bg-yellow-50" : "bg-white"
                          }`}
                        >
                          {booking ? (
                            <TooltipProvider>
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`h-8 rounded px-2 py-1 text-xs font-medium text-white cursor-pointer flex items-center justify-center ${
                                      isFirstDay
                                        ? "bg-indigo-600"
                                        : "bg-indigo-500"
                                    }`}
                                  >
                                    {isFirstDay &&
                                      `${booking.clientFirstName} ${booking.clientLastName[0]}.`}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
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
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Infos */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle className="text-sm">Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong>Total réservations:</strong> {bookings.length}
            </div>
            <div>
              <strong>Places actives:</strong> {activeRooms.length}
            </div>
            <div>
              <strong>Période:</strong>{" "}
              {format(days[0], "dd MMM", { locale: fr })} -{" "}
              {format(days[days.length - 1], "dd MMM yyyy", { locale: fr })}
            </div>
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
