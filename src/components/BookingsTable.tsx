"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowUpDown, Users, Calendar, Euro } from "lucide-react";

interface Booking {
  id: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  amount: number;
  guests: number;
  checkInDate: Date;
  checkOutDate: Date;
  bookingDate: Date;
  room: {
    name: string;
  };
}

interface BookingsTableProps {
  bookings: Booking[];
}

type SortField =
  | "name"
  | "email"
  | "room"
  | "checkIn"
  | "checkOut"
  | "amount"
  | "bookingDate";
type SortDirection = "asc" | "desc";

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("checkIn");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getBookingStatus = (booking: Booking) => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkOut = new Date(booking.checkOutDate);
    const checkIn = new Date(booking.checkInDate);

    if (
      checkOut.toDateString() === today.toDateString() &&
      now.getHours() < 12
    ) {
      return {
        status: "checkout",
        label: "Départ aujourd'hui",
        color: "bg-orange-100 text-orange-800",
      };
    } else if (
      checkOut.toDateString() === today.toDateString() &&
      now.getHours() >= 12
    ) {
      return {
        status: "liberated",
        label: "Chambre libérée",
        color: "bg-green-100 text-green-800",
      };
    } else if (checkIn.toDateString() === today.toDateString()) {
      return {
        status: "checkin",
        label: "Arrivée aujourd'hui",
        color: "bg-blue-100 text-blue-800",
      };
    } else if (checkIn < today && checkOut > today) {
      return {
        status: "current",
        label: "En cours",
        color: "bg-red-100 text-red-800",
      };
    } else if (checkIn > today) {
      return {
        status: "future",
        label: "À venir",
        color: "bg-gray-100 text-gray-800",
      };
    } else {
      return {
        status: "past",
        label: "Terminé",
        color: "bg-gray-100 text-gray-600",
      };
    }
  };

  const filteredAndSortedBookings = useMemo(() => {
    const filtered = bookings.filter((booking) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        `${booking.clientFirstName} ${booking.clientLastName}`
          .toLowerCase()
          .includes(searchLower) ||
        booking.clientEmail.toLowerCase().includes(searchLower) ||
        booking.room.name.toLowerCase().includes(searchLower);

      if (statusFilter === "all") return matchesSearch;

      const status = getBookingStatus(booking).status;
      return matchesSearch && status === statusFilter;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case "name":
          aValue = `${a.clientFirstName} ${a.clientLastName}`;
          bValue = `${b.clientFirstName} ${b.clientLastName}`;
          break;
        case "email":
          aValue = a.clientEmail;
          bValue = b.clientEmail;
          break;
        case "room":
          aValue = a.room.name;
          bValue = b.room.name;
          break;
        case "checkIn":
          aValue = new Date(a.checkInDate);
          bValue = new Date(b.checkInDate);
          break;
        case "checkOut":
          aValue = new Date(a.checkOutDate);
          bValue = new Date(b.checkOutDate);
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "bookingDate":
          aValue = new Date(a.bookingDate);
          bValue = new Date(b.bookingDate);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [bookings, searchTerm, sortField, sortDirection, statusFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 p-0 hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-2">
        {children}
        <ArrowUpDown
          className={`h-3 w-3 ${
            sortField === field ? "text-primary" : "text-muted-foreground"
          }`}
        />
        {sortField === field && (
          <span className="text-xs text-primary">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </span>
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou chambre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredAndSortedBookings.length} résultat
              {filteredAndSortedBookings.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Filtres par statut */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Toutes
          </Button>
          <Button
            variant={statusFilter === "checkin" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("checkin")}
          >
            Arrivées aujourd&apos;hui
          </Button>
          <Button
            variant={statusFilter === "checkout" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("checkout")}
          >
            Départs aujourd&apos;hui
          </Button>
          <Button
            variant={statusFilter === "current" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("current")}
          >
            En cours
          </Button>
          <Button
            variant={statusFilter === "future" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("future")}
          >
            À venir
          </Button>
          <Button
            variant={statusFilter === "past" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("past")}
          >
            Terminées
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <SortableHeader field="name">Client</SortableHeader>
              </TableHead>
              <TableHead className="w-[200px]">
                <SortableHeader field="email">Email</SortableHeader>
              </TableHead>
              <TableHead className="w-[150px]">
                <SortableHeader field="room">Chambre</SortableHeader>
              </TableHead>
              <TableHead className="w-[120px]">
                <SortableHeader field="checkIn">Arrivée</SortableHeader>
              </TableHead>
              <TableHead className="w-[120px]">
                <SortableHeader field="checkOut">Départ</SortableHeader>
              </TableHead>
              <TableHead className="w-[100px]">
                <SortableHeader field="amount">Montant</SortableHeader>
              </TableHead>
              <TableHead className="w-[80px]">
                <Users className="h-4 w-4" />
              </TableHead>
              <TableHead className="w-[120px]">
                <SortableHeader field="bookingDate">Réservé le</SortableHeader>
              </TableHead>
              <TableHead className="w-[140px]">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all"
                        ? "Aucune réservation trouvée pour ces critères"
                        : "Aucune réservation pour le moment"}
                    </p>
                    {searchTerm && (
                      <p className="text-sm text-muted-foreground">
                        Essayez de modifier votre recherche ou les filtres
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedBookings.map((booking) => {
                const bookingStatus = getBookingStatus(booking);
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {`${booking.clientFirstName} ${booking.clientLastName}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.clientEmail}
                    </TableCell>
                    <TableCell>{booking.room.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(booking.checkInDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(booking.checkOutDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{booking.amount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{booking.guests}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(booking.bookingDate).toLocaleDateString(
                        "fr-FR"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={bookingStatus.color}
                      >
                        {bookingStatus.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
