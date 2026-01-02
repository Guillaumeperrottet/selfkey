"use client";

import { useMemo, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Event, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Configuration du localizer avec date-fns
const locales = {
  fr: fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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

interface BookingCalendarProps {
  bookings: Booking[];
  rooms: Room[];
}

interface CalendarEvent extends Event {
  booking: Booking;
  resourceId?: string;
}

export function BookingCalendar({ bookings, rooms }: BookingCalendarProps) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<string>("all");

  // Filtrer les réservations par chambre
  const filteredBookings = useMemo(() => {
    if (selectedRoom === "all") return bookings;
    return bookings.filter((booking) => booking.room?.name === selectedRoom);
  }, [bookings, selectedRoom]);

  // Transformer les réservations en événements pour le calendrier
  const events: CalendarEvent[] = useMemo(() => {
    return filteredBookings.map((booking) => ({
      title: `${booking.room?.name || "N/A"} - ${booking.clientFirstName} ${booking.clientLastName}`,
      start: new Date(booking.checkInDate),
      end: new Date(booking.checkOutDate),
      booking: booking,
      resourceId: booking.room?.name,
    }));
  }, [filteredBookings]);

  // Composant personnalisé pour l'affichage d'un événement
  const EventComponent = useCallback(({ event }: { event: CalendarEvent }) => {
    const booking = event.booking;
    const duration = Math.ceil(
      (new Date(booking.checkOutDate).getTime() -
        new Date(booking.checkInDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div className="text-xs truncate px-1 cursor-pointer">
              <strong>{booking.room?.name || "N/A"}</strong>
              <br />
              {booking.clientFirstName} {booking.clientLastName}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1 text-sm">
              <div className="font-semibold border-b pb-1">
                Réservation #{booking.bookingNumber}
              </div>
              <div>
                <strong>Client:</strong> {booking.clientFirstName}{" "}
                {booking.clientLastName}
              </div>
              <div>
                <strong>Email:</strong> {booking.clientEmail}
              </div>
              {booking.clientPhone && (
                <div>
                  <strong>Tél:</strong> {booking.clientPhone}
                </div>
              )}
              <div>
                <strong>Chambre/Place:</strong> {booking.room?.name || "N/A"}
              </div>
              <div>
                <strong>Arrivée:</strong>{" "}
                {format(new Date(booking.checkInDate), "dd/MM/yyyy", {
                  locale: fr,
                })}
              </div>
              <div>
                <strong>Départ:</strong>{" "}
                {format(new Date(booking.checkOutDate), "dd/MM/yyyy", {
                  locale: fr,
                })}
              </div>
              <div>
                <strong>Durée:</strong> {duration} nuit{duration > 1 ? "s" : ""}
              </div>
              <div>
                <strong>Personnes:</strong> {booking.guests}
              </div>
              <div>
                <strong>Montant:</strong> {booking.amount.toFixed(2)} CHF
              </div>
              <div>
                <strong>Type:</strong>{" "}
                {booking.bookingType === "day" ? "Parking jour" : "Nuitée"}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }, []);

  // Fonction d'impression
  const handlePrint = () => {
    window.print();
  };

  // Navigation mois précédent/suivant
  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    const newDate = new Date(date);
    if (action === "PREV") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (action === "NEXT") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      return new Date();
    }
    setDate(newDate);
  };

  // Messages personnalisés en français
  const messages = {
    today: "Aujourd'hui",
    previous: "Précédent",
    next: "Suivant",
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    agenda: "Agenda",
    date: "Date",
    time: "Heure",
    event: "Événement",
    noEventsInRange: "Aucune réservation dans cette période",
    showMore: (total: number) => `+ ${total} de plus`,
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec contrôles */}
      <Card className="no-print">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Planning des réservations
              </CardTitle>
              <CardDescription>
                Vue mensuelle de toutes les réservations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate("PREV")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDate(new Date())}
              >
                Aujourd&apos;hui
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate("NEXT")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Toutes les chambres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les chambres</SelectItem>
                  {rooms
                    .filter((room) => room.isActive)
                    .map((room) => (
                      <SelectItem key={room.id} value={room.name}>
                        {room.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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

      {/* Calendrier */}
      <Card>
        <CardContent className="p-6">
          <div className="calendar-container">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 700 }}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              messages={messages}
              culture="fr"
              components={{
                event: EventComponent,
              }}
              popup
              selectable={false}
              className="booking-calendar"
            />
          </div>
        </CardContent>
      </Card>

      {/* Légende */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle className="text-sm">Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong>Total réservations affichées:</strong>{" "}
              {filteredBookings.length}
            </div>
            <div>
              <strong>Chambres actives:</strong>{" "}
              {rooms.filter((r) => r.isActive).length}
            </div>
            <div>
              <strong>Période:</strong>{" "}
              {format(date, "MMMM yyyy", { locale: fr })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Styles d'impression */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html,
          body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          .no-print {
            display: none !important;
          }

          .calendar-container {
            width: 100% !important;
            height: 100vh !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .rbc-calendar {
            height: 95vh !important;
            max-height: 95vh !important;
            font-size: 8px !important;
          }

          .rbc-month-view {
            height: 100% !important;
            max-height: 100% !important;
          }

          .rbc-month-row {
            min-height: 60px !important;
            max-height: 80px !important;
          }

          .rbc-row-segment {
            padding: 0 1px !important;
          }

          .rbc-event {
            font-size: 7px !important;
            line-height: 1.1 !important;
            padding: 1px 2px !important;
            margin: 0 !important;
          }

          .rbc-header {
            padding: 2px !important;
            font-size: 9px !important;
            font-weight: 600 !important;
          }

          .rbc-date-cell {
            padding: 2px !important;
            font-size: 8px !important;
          }

          .rbc-day-bg {
            min-height: 60px !important;
          }

          .rbc-toolbar {
            display: none !important;
          }

          .rbc-month-header {
            height: auto !important;
          }

          .rbc-row-content {
            min-height: 50px !important;
          }
        }

        .booking-calendar .rbc-event {
          background-color: #6366f1;
          border: none;
          border-radius: 4px;
          padding: 2px 4px;
        }

        .booking-calendar .rbc-event:hover {
          background-color: #4f46e5;
        }

        .booking-calendar .rbc-today {
          background-color: #fef3c7;
        }

        .booking-calendar .rbc-header {
          padding: 8px 4px;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
        }

        .booking-calendar .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .booking-calendar .rbc-day-bg:hover {
          background-color: #f9fafb;
        }

        .booking-calendar .rbc-off-range-bg {
          background-color: #f9fafb;
        }

        .booking-calendar .rbc-toolbar {
          padding: 12px 0;
          margin-bottom: 16px;
        }

        .booking-calendar .rbc-toolbar button {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: white;
          font-size: 14px;
        }

        .booking-calendar .rbc-toolbar button:hover {
          background-color: #f3f4f6;
        }

        .booking-calendar .rbc-toolbar button.rbc-active {
          background-color: #6366f1;
          color: white;
          border-color: #6366f1;
        }
      `}</style>
    </div>
  );
}
