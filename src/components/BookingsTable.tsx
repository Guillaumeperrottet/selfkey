"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePrint } from "@/hooks/use-print";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  ArrowUpDown,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  Clock,
  Printer,
  Calculator,
} from "lucide-react";
import { calculateStayDuration } from "@/lib/availability";
import { formatCHF, calculateFees } from "@/lib/fee-calculator";
import { InvoiceDownload } from "@/components/InvoiceDownload";

interface Booking {
  id: string;
  bookingNumber: number;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone?: string;
  clientBirthDate?: Date;
  clientBirthPlace?: string;
  clientAddress?: string;
  clientPostalCode?: string;
  clientCity?: string;
  clientCountry?: string;
  clientIdNumber?: string;
  clientVehicleNumber?: string;
  amount: number;
  guests: number;
  checkInDate: Date;
  checkOutDate: Date;
  bookingDate: Date;
  currency?: string;
  selectedPricingOptions?: Record<string, string | string[]>;
  pricingOptionsTotal?: number;
  stripePaymentIntentId?: string | null;
  paymentStatus?: string;
  confirmationSent?: boolean;
  confirmationSentAt?: Date | null;
  confirmationMethod?: string | null;
  touristTaxTotal?: number;
  adults?: number;
  children?: number;
  room: {
    name: string;
    price?: number;
  } | null;
  establishment?: {
    name: string;
    slug?: string;
    commissionRate?: number;
    fixedFee?: number;
  };
}

interface BookingsTableProps {
  bookings: Booking[];
  establishment?: {
    name: string;
    slug: string;
    commissionRate: number;
    fixedFee: number;
  };
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

export function BookingsTable({ bookings, establishment }: BookingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("bookingDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { printTable, print } = usePrint();

  const getBookingStatus = (booking: Booking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkOut = new Date(booking.checkOutDate);
    checkOut.setHours(0, 0, 0, 0); // Normaliser la date de départ
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0); // Normaliser la date d'arrivée

    if (checkIn.getTime() === today.getTime()) {
      return {
        status: "checkin",
        label: "Arrivée aujourd'hui",
        color: "bg-blue-100 text-blue-800",
      };
    } else if (
      checkIn.getTime() < today.getTime() &&
      checkOut.getTime() > today.getTime()
    ) {
      return {
        status: "current",
        label: "En cours",
        color: "bg-red-100 text-red-800",
      };
    } else if (checkIn.getTime() > today.getTime()) {
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
        (booking.room
          ? booking.room.name.toLowerCase().includes(searchLower)
          : false);

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
          aValue = a.room ? a.room.name : "Parking jour";
          bValue = b.room ? b.room.name : "Parking jour";
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

  const handleRowClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("fr-FR");
  };

  // Fonction pour calculer les détails de facturation d'une réservation
  const calculateBookingFinancials = (booking: Booking) => {
    const duration = calculateStayDuration(
      booking.checkInDate,
      booking.checkOutDate
    );
    const roomPrice = booking.room?.price || 0;
    const baseRoomCost = roomPrice * duration;
    const pricingOptionsTotal = booking.pricingOptionsTotal || 0;
    const touristTaxTotal = booking.touristTaxTotal || 0;

    // Montant avant frais de plateforme
    const subtotal = baseRoomCost + pricingOptionsTotal + touristTaxTotal;

    // Calcul des frais de plateforme si on a les infos de l'établissement
    let platformFees = null;
    if (establishment) {
      platformFees = calculateFees(
        subtotal,
        establishment.commissionRate / 100,
        establishment.fixedFee
      );
    }

    return {
      duration,
      roomPrice,
      baseRoomCost,
      pricingOptionsTotal,
      touristTaxTotal,
      subtotal,
      platformFees,
      finalAmount: booking.amount,
    };
  };

  const handlePrintBooking = (booking: Booking) => {
    const duration = calculateStayDuration(
      booking.checkInDate,
      booking.checkOutDate
    );
    const status = getBookingStatus(booking);

    const bookingHTML = `
      <div class="booking-details">
        <div class="print-header">
          <h1>Détails de la réservation</h1>
          <p>Généré le ${new Date().toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}</p>
        </div>
        
        <div class="booking-info">
          <div class="card">
            <div class="card-header">
              <h2>Informations du séjour</h2>
            </div>
            <div class="grid">
              <div class="flex">
                <span>N° de réservation :</span>
                <span class="font-medium">${booking.bookingNumber}</span>
              </div>
              <div class="flex">
                <span>Chambre :</span>
                <span class="font-medium">${booking.room ? booking.room.name : "Parking jour"}</span>
              </div>
              <div class="flex">
                <span>Arrivée :</span>
                <span class="font-medium">${formatDate(booking.checkInDate)}</span>
              </div>
              <div class="flex">
                <span>Départ :</span>
                <span class="font-medium">${formatDate(booking.checkOutDate)}</span>
              </div>
              <div class="flex">
                <span>Durée :</span>
                <span class="font-medium">${duration} nuit${duration > 1 ? "s" : ""}</span>
              </div>
              <div class="flex">
                <span>Invités :</span>
                <span class="font-medium">${booking.guests} personne${booking.guests > 1 ? "s" : ""}</span>
              </div>
              <div class="flex">
                <span>Statut :</span>
                <span class="badge">${status.label}</span>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h2>Informations client</h2>
            </div>
            <div class="grid">
              <div class="flex">
                <span>Nom :</span>
                <span class="font-medium">${booking.clientFirstName} ${booking.clientLastName}</span>
              </div>
              <div class="flex">
                <span>Email :</span>
                <span class="font-medium">${booking.clientEmail}</span>
              </div>
              ${
                booking.clientPhone
                  ? `
                <div class="flex">
                  <span>Téléphone :</span>
                  <span class="font-medium">${booking.clientPhone}</span>
                </div>
              `
                  : ""
              }
              ${
                booking.clientBirthDate
                  ? `
                <div class="flex">
                  <span>Naissance :</span>
                  <span class="font-medium">${new Date(booking.clientBirthDate).toLocaleDateString("fr-FR")}</span>
                </div>
              `
                  : ""
              }
              ${
                booking.clientAddress
                  ? `
                <div class="flex">
                  <span>Adresse :</span>
                  <span class="font-medium">${booking.clientAddress}</span>
                </div>
              `
                  : ""
              }
              ${
                booking.clientPostalCode || booking.clientCity
                  ? `
                <div class="flex">
                  <span>Ville :</span>
                  <span class="font-medium">${booking.clientPostalCode || ""} ${booking.clientCity || ""}</span>
                </div>
              `
                  : ""
              }
              ${
                booking.clientCountry
                  ? `
                <div class="flex">
                  <span>Pays :</span>
                  <span class="font-medium">${booking.clientCountry}</span>
                </div>
              `
                  : ""
              }
              ${
                booking.clientIdNumber
                  ? `
                <div class="flex">
                  <span>ID :</span>
                  <span class="font-medium">${booking.clientIdNumber}</span>
                </div>
              `
                  : ""
              }
              ${
                booking.clientAddress
                  ? `
                <div class="flex">
                  <span>Adresse :</span>
                  <span class="font-medium">${booking.clientAddress}</span>
                </div>
              `
                  : ""
              }
              ${
                booking.clientPostalCode || booking.clientCity
                  ? `
                <div class="flex">
                  <span>Ville :</span>
                  <span class="font-medium">${booking.clientPostalCode || ""} ${booking.clientCity || ""}</span>
                </div>
              `
                  : ""
              }
              ${
                booking.clientCountry
                  ? `
                <div class="flex">
                  <span>Pays :</span>
                  <span class="font-medium">${booking.clientCountry}</span>
                </div>
              `
                  : ""
              }
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h2>Paiement</h2>
            </div>
            <div class="grid">
              <div class="flex">
                <span>Total :</span>
                <span class="font-semibold text-lg">${booking.amount} ${booking.currency || "CHF"}</span>
              </div>
              ${
                booking.pricingOptionsTotal && booking.pricingOptionsTotal > 0
                  ? `
                <div class="flex">
                  <span>Options :</span>
                  <span class="font-medium">+${booking.pricingOptionsTotal} ${booking.currency || "CHF"}</span>
                </div>
              `
                  : ""
              }
              <div class="flex">
                <span>Statut :</span>
                <span class="font-medium">${booking.stripePaymentIntentId ? "✓ Payé" : "⏳ En attente"}</span>
              </div>
              <div class="flex">
                <span>Réservé le :</span>
                <span class="font-medium">${formatDateTime(booking.bookingDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    print(bookingHTML, {
      title: `Réservation - ${booking.clientFirstName} ${booking.clientLastName}`,
    });
  };

  const handlePrintTable = () => {
    const tableData = filteredAndSortedBookings.map((booking) => {
      const status = getBookingStatus(booking);
      return {
        Nom: `${booking.clientFirstName} ${booking.clientLastName}`,
        Email: booking.clientEmail,
        Téléphone: booking.clientPhone || "-",
        Chambre: booking.room ? booking.room.name : "Parking jour",
        Arrivée: formatDate(booking.checkInDate),
        Départ: formatDate(booking.checkOutDate),
        Invités: booking.guests.toString(),
        Montant: `${booking.amount} ${booking.currency || "CHF"}`,
        Statut: status.label,
        "Réservé le": formatDateTime(booking.bookingDate),
      };
    });

    const columns = [
      { key: "Nom" as const, label: "Nom" },
      { key: "Email" as const, label: "Email" },
      { key: "Téléphone" as const, label: "Téléphone" },
      { key: "Chambre" as const, label: "Chambre" },
      { key: "Arrivée" as const, label: "Arrivée" },
      { key: "Départ" as const, label: "Départ" },
      { key: "Invités" as const, label: "Invités" },
      { key: "Montant" as const, label: "Montant" },
      { key: "Statut" as const, label: "Statut" },
      { key: "Réservé le" as const, label: "Réservé le" },
    ];

    const title = `Liste des réservations - ${filteredAndSortedBookings.length} réservation${filteredAndSortedBookings.length > 1 ? "s" : ""} • Généré le ${new Date().toLocaleDateString(
      "fr-FR",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;

    printTable(tableData, columns, title);
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
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintTable}
              className="flex items-center gap-2 no-print"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
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
                  <TableRow
                    key={booking.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(booking)}
                  >
                    <TableCell className="font-medium">
                      {`${booking.clientFirstName} ${booking.clientLastName}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.clientEmail}
                    </TableCell>
                    <TableCell>
                      {booking.room ? booking.room.name : "Parking jour"}
                    </TableCell>
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
                        <span className="font-medium">{booking.amount}</span>
                        <span className="text-xs text-muted-foreground">
                          CHF
                        </span>
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

      {/* Dialog des détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="!w-[1200px] !max-w-[95vw] h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Détails de la réservation
                </DialogTitle>
                <DialogDescription>
                  Informations complètes sur la réservation de{" "}
                  {selectedBooking?.clientFirstName}{" "}
                  {selectedBooking?.clientLastName}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {/* Bouton de téléchargement de facture */}
                {selectedBooking && establishment && (
                  <InvoiceDownload
                    booking={{
                      ...selectedBooking,
                      pricingOptionsTotal:
                        selectedBooking.pricingOptionsTotal || 0,
                      touristTaxTotal: selectedBooking.touristTaxTotal || 0,
                      room: selectedBooking.room
                        ? {
                            name: selectedBooking.room.name,
                            price: selectedBooking.room.price || 0,
                          }
                        : null,
                    }}
                    establishment={establishment}
                    variant="outline"
                    size="sm"
                    showText={false}
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    selectedBooking && handlePrintBooking(selectedBooking)
                  }
                  className="no-print"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selectedBooking && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Colonne 1: Informations du séjour + Status */}
              <div className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3" />
                    Informations du séjour
                  </h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        N° réservation :
                      </span>
                      <span className="font-medium">
                        {selectedBooking.bookingNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Place :</span>
                      <span className="font-medium">
                        {selectedBooking.room
                          ? selectedBooking.room.name
                          : "Parking jour"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Arrivée :</span>
                      <span className="font-medium">
                        {formatDate(selectedBooking.checkInDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Départ :</span>
                      <span className="font-medium">
                        {formatDate(selectedBooking.checkOutDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durée :</span>
                      <span className="font-medium">
                        {calculateStayDuration(
                          selectedBooking.checkInDate,
                          selectedBooking.checkOutDate
                        )}{" "}
                        nuit
                        {calculateStayDuration(
                          selectedBooking.checkInDate,
                          selectedBooking.checkOutDate
                        ) > 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invités :</span>
                      <span className="font-medium">
                        {selectedBooking.guests} personne
                        {selectedBooking.guests > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statut de la réservation */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3" />
                    Statut
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          getBookingStatus(selectedBooking).color + " text-xs"
                        }
                      >
                        {getBookingStatus(selectedBooking).label}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Réservée le {formatDateTime(selectedBooking.bookingDate)}
                    </div>
                    {selectedBooking.confirmationSent && (
                      <div className="text-xs text-green-600">
                        ✓ Confirmation envoyée{" "}
                        {selectedBooking.confirmationSentAt &&
                          `le ${formatDateTime(selectedBooking.confirmationSentAt)}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne 2: Informations client + Adresse */}
              <div className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <User className="h-3 w-3" />
                    Informations client
                  </h3>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-muted-foreground block">
                        Nom complet :
                      </span>
                      <span className="font-medium">
                        {selectedBooking.clientFirstName}{" "}
                        {selectedBooking.clientLastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        Email :
                      </span>
                      <div className="font-medium flex items-start gap-1">
                        <Mail className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="break-all text-xs">
                          {selectedBooking.clientEmail}
                        </span>
                      </div>
                    </div>
                    {selectedBooking.clientPhone && (
                      <div>
                        <span className="text-muted-foreground block">
                          Téléphone :
                        </span>
                        <div className="font-medium flex items-center gap-1">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>{selectedBooking.clientPhone}</span>
                        </div>
                      </div>
                    )}
                    {selectedBooking.clientBirthDate && (
                      <div>
                        <span className="text-muted-foreground block">
                          Date de naissance :
                        </span>
                        <span className="font-medium">
                          {new Date(
                            selectedBooking.clientBirthDate
                          ).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    )}
                    {selectedBooking.clientBirthPlace && (
                      <div>
                        <span className="text-muted-foreground block">
                          Lieu de naissance :
                        </span>
                        <span className="font-medium">
                          {selectedBooking.clientBirthPlace}
                        </span>
                      </div>
                    )}
                    {selectedBooking.clientIdNumber && (
                      <div>
                        <span className="text-muted-foreground block">
                          N° d&apos;identification :
                        </span>
                        <div className="font-medium flex items-center gap-1">
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="break-all">
                            {selectedBooking.clientIdNumber}
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedBooking.clientVehicleNumber && (
                      <div>
                        <span className="text-muted-foreground block">
                          Plaque d&apos;immatriculation :
                        </span>
                        <div className="font-medium flex items-center gap-1">
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="break-all">
                            {selectedBooking.clientVehicleNumber}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Adresse */}
                {(selectedBooking.clientAddress ||
                  selectedBooking.clientCity ||
                  selectedBooking.clientCountry) && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3" />
                      Adresse
                    </h3>
                    <div className="text-xs space-y-1">
                      {selectedBooking.clientAddress && (
                        <div className="font-medium">
                          {selectedBooking.clientAddress}
                        </div>
                      )}
                      {(selectedBooking.clientPostalCode ||
                        selectedBooking.clientCity) && (
                        <div>
                          {selectedBooking.clientPostalCode}{" "}
                          {selectedBooking.clientCity}
                        </div>
                      )}
                      {selectedBooking.clientCountry && (
                        <div>{selectedBooking.clientCountry}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Colonne 3: Paiement + Facturation */}
              <div className="space-y-3">
                {/* Informations de paiement */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <span className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
                      CHF
                    </span>
                    Paiement
                  </h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Montant total :
                      </span>
                      <span className="font-semibold">
                        {selectedBooking.amount}{" "}
                        {selectedBooking.currency || "CHF"}
                      </span>
                    </div>
                    Parfait
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Statut paiement :
                      </span>
                      <span
                        className={`font-medium ${
                          selectedBooking.paymentStatus === "succeeded"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {selectedBooking.paymentStatus === "succeeded"
                          ? "✓ Payé"
                          : "⏳ En attente"}
                      </span>
                    </div>
                    {selectedBooking.stripePaymentIntentId && (
                      <div className="text-xs text-muted-foreground truncate">
                        ID: {selectedBooking.stripePaymentIntentId}
                      </div>
                    )}
                  </div>
                </div>

                {/* Détails de facturation */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <Calculator className="h-3 w-3" />
                    Détail de la facturation
                  </h3>
                  {(() => {
                    const financials =
                      calculateBookingFinancials(selectedBooking);
                    return (
                      <div className="space-y-2 text-xs">
                        {/* Prix de base */}
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Chambre ({financials.roomPrice} CHF ×{" "}
                              {financials.duration} nuit
                              {financials.duration > 1 ? "s" : ""}) :
                            </span>
                            <span className="font-medium">
                              {formatCHF(financials.baseRoomCost)}
                            </span>
                          </div>

                          {financials.pricingOptionsTotal > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Options supplémentaires :
                              </span>
                              <span className="font-medium">
                                +{formatCHF(financials.pricingOptionsTotal)}
                              </span>
                            </div>
                          )}

                          {financials.touristTaxTotal > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Taxe de séjour :
                              </span>
                              <span className="font-medium">
                                +{formatCHF(financials.touristTaxTotal)}
                              </span>
                            </div>
                          )}

                          <div className="border-t pt-1">
                            <div className="flex justify-between font-medium">
                              <span>Sous-total (sans frais) :</span>
                              <span>{formatCHF(financials.subtotal)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Frais de plateforme */}
                        {financials.platformFees && (
                          <div className="space-y-1 border-t pt-1">
                            <div className="text-xs text-muted-foreground font-medium mb-1">
                              Frais de plateforme
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Commission (
                                {establishment
                                  ? establishment.commissionRate.toFixed(1)
                                  : "0.0"}
                                %) :
                              </span>
                              <span className="font-medium text-red-600">
                                +{formatCHF(financials.platformFees.commission)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Frais fixes :
                              </span>
                              <span className="font-medium text-red-600">
                                +{formatCHF(financials.platformFees.fixedFee)}
                              </span>
                            </div>
                            <div className="flex justify-between text-red-600 font-medium">
                              <span>Total frais :</span>
                              <span>
                                +{formatCHF(financials.platformFees.totalFees)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Total final */}
                        <div className="border-t pt-1">
                          <div className="flex justify-between font-bold">
                            <span>Total payé par le client :</span>
                            <span className="text-green-600">
                              {formatCHF(financials.finalAmount)}
                            </span>
                          </div>
                          {financials.platformFees && (
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>
                                Montant net pour l&apos;établissement :
                              </span>
                              <span className="font-medium">
                                {formatCHF(financials.platformFees.netAmount)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
