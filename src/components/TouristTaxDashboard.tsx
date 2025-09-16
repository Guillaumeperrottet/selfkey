"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Euro,
  Users,
  Calendar,
  TrendingUp,
  Download,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import * as ExcelJS from "exceljs";

interface BookingForTax {
  id: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  checkInDate: Date;
  checkOutDate: Date;
  bookingDate: Date;
  guests: number; // Utiliser guests au lieu de adults + children
  touristTaxTotal?: number | null;
  amount: number;
  room?: {
    name: string;
  } | null;
}

export function TouristTaxDashboard({
  bookings,
}: {
  bookings: BookingForTax[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "month" | "quarter">(
    "all"
  );

  // Filtrer les réservations avec taxes de séjour
  const bookingsWithTax = useMemo(() => {
    return bookings.filter(
      (booking) => booking.touristTaxTotal && booking.touristTaxTotal > 0
    );
  }, [bookings]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfQuarter = new Date(
      now.getFullYear(),
      Math.floor(now.getMonth() / 3) * 3,
      1
    );

    const allTimeTotalTax = bookingsWithTax.reduce(
      (sum, booking) => sum + (booking.touristTaxTotal || 0),
      0
    );
    const allTimeBookingsCount = bookingsWithTax.length;
    const allTimeGuestsCount = bookingsWithTax.reduce(
      (sum, booking) => sum + booking.guests,
      0
    );

    const currentMonthBookings = bookingsWithTax.filter(
      (booking) => new Date(booking.bookingDate) >= startOfMonth
    );
    const currentMonthTotalTax = currentMonthBookings.reduce(
      (sum, booking) => sum + (booking.touristTaxTotal || 0),
      0
    );

    const currentQuarterBookings = bookingsWithTax.filter(
      (booking) => new Date(booking.bookingDate) >= startOfQuarter
    );
    const currentQuarterTotalTax = currentQuarterBookings.reduce(
      (sum, booking) => sum + (booking.touristTaxTotal || 0),
      0
    );

    return {
      allTime: {
        totalTax: allTimeTotalTax,
        bookingsCount: allTimeBookingsCount,
        guestsCount: allTimeGuestsCount,
        averageTaxPerBooking:
          allTimeBookingsCount > 0 ? allTimeTotalTax / allTimeBookingsCount : 0,
      },
      currentMonth: {
        totalTax: currentMonthTotalTax,
        bookingsCount: currentMonthBookings.length,
      },
      currentQuarter: {
        totalTax: currentQuarterTotalTax,
        bookingsCount: currentQuarterBookings.length,
      },
    };
  }, [bookingsWithTax]);

  // Filtrer les données selon la recherche et la période
  const filteredBookings = useMemo(() => {
    let filtered = bookingsWithTax;

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.clientFirstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.clientLastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.clientEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.room?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par période
    if (filterPeriod !== "all") {
      const now = new Date();
      const cutoffDate =
        filterPeriod === "month"
          ? new Date(now.getFullYear(), now.getMonth(), 1)
          : new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

      filtered = filtered.filter(
        (booking) => new Date(booking.bookingDate) >= cutoffDate
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    );
  }, [bookingsWithTax, searchTerm, filterPeriod]);

  const exportToExcel = async () => {
    try {
      // Créer un nouveau workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Taxes de séjour");

      // Définir les colonnes
      worksheet.columns = [
        { header: "N° Réservation", key: "id", width: 15 },
        { header: "Client", key: "client", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Chambre", key: "room", width: 15 },
        { header: "Date de réservation", key: "bookingDate", width: 18 },
        { header: "Check-in", key: "checkIn", width: 12 },
        { header: "Check-out", key: "checkOut", width: 12 },
        { header: "Nombre d'invités", key: "guests", width: 16 },
        { header: "Montant total", key: "amount", width: 15 },
        { header: "Taxe de séjour", key: "touristTax", width: 15 },
      ];

      // Ajouter les données
      filteredBookings.forEach((booking) => {
        worksheet.addRow({
          id: booking.id,
          client: `${booking.clientFirstName} ${booking.clientLastName}`,
          email: booking.clientEmail,
          room: booking.room?.name || "N/A",
          bookingDate: format(new Date(booking.bookingDate), "dd/MM/yyyy", {
            locale: fr,
          }),
          checkIn: format(new Date(booking.checkInDate), "dd/MM/yyyy", {
            locale: fr,
          }),
          checkOut: format(new Date(booking.checkOutDate), "dd/MM/yyyy", {
            locale: fr,
          }),
          guests: booking.guests,
          amount: `${booking.amount.toFixed(2)} CHF`,
          touristTax: `${(booking.touristTaxTotal || 0).toFixed(2)} CHF`,
        });
      });

      // Styliser l'en-tête
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

      // Ajouter une ligne de total
      const totalRow = worksheet.addRow({
        id: "",
        client: "",
        email: "",
        room: "",
        bookingDate: "",
        checkIn: "",
        checkOut: "",
        guests: "",
        amount: "TOTAL:",
        touristTax: `${filteredBookings.reduce((sum, booking) => sum + (booking.touristTaxTotal || 0), 0).toFixed(2)} CHF`,
      });
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF3F4F6" },
      };

      // Générer le fichier
      const buffer = await workbook.xlsx.writeBuffer();

      // Créer le nom du fichier avec la date actuelle
      const today = format(new Date(), "yyyy-MM-dd");
      let fileName = `taxes_sejour_${today}`;

      // Ajouter le filtre de période au nom du fichier
      if (filterPeriod === "month") {
        fileName += "_mois_en_cours";
      } else if (filterPeriod === "quarter") {
        fileName += "_trimestre_en_cours";
      } else {
        fileName += "_toutes_periodes";
      }

      if (searchTerm) {
        fileName += `_recherche_${searchTerm.replace(/[^a-zA-Z0-9]/g, "_")}`;
      }

      fileName += ".xlsx";

      // Télécharger le fichier
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(
        `Export Excel réussi: ${filteredBookings.length} lignes exportées`
      );
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      alert("Erreur lors de l'export Excel. Veuillez réessayer.");
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Taxes de séjour</h1>
          <p className="text-gray-600">
            Gestion et suivi des taxes touristiques collectées
          </p>
        </div>
        <Button onClick={exportToExcel} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exporter Excel
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total collecté
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.allTime.totalTax.toFixed(2)} CHF
            </div>
            <p className="text-xs text-muted-foreground">
              Depuis le début ({stats.allTime.bookingsCount} réservations)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.currentMonth.totalTax.toFixed(2)} CHF
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.currentMonth.bookingsCount} réservations ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Moyenne par réservation
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.allTime.averageTaxPerBooking.toFixed(2)} CHF
            </div>
            <p className="text-xs text-muted-foreground">
              Taxe moyenne collectée
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients taxés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.allTime.guestsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Personnes ayant payé la taxe
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email ou chambre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterPeriod === "all" ? "default" : "outline"}
                onClick={() => setFilterPeriod("all")}
                size="sm"
              >
                Tout
              </Button>
              <Button
                variant={filterPeriod === "month" ? "default" : "outline"}
                onClick={() => setFilterPeriod("month")}
                size="sm"
              >
                Ce mois
              </Button>
              <Button
                variant={filterPeriod === "quarter" ? "default" : "outline"}
                onClick={() => setFilterPeriod("quarter")}
                size="sm"
              >
                Ce trimestre
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des réservations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Réservations avec taxes de séjour</span>
            <Badge variant="outline">
              {filteredBookings.length} résultat
              {filteredBookings.length > 1 ? "s" : ""}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date de réservation</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Séjour</TableHead>
                  <TableHead>Chambre</TableHead>
                  <TableHead>Personnes</TableHead>
                  <TableHead className="text-right">Taxe collectée</TableHead>
                  <TableHead className="text-right">Montant total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Euro className="h-8 w-8 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Aucune taxe de séjour trouvée
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        {format(new Date(booking.bookingDate), "dd/MM/yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {booking.clientFirstName} {booking.clientLastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.clientEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {format(new Date(booking.checkInDate), "dd/MM", {
                              locale: fr,
                            })}{" "}
                            -{" "}
                            {format(
                              new Date(booking.checkOutDate),
                              "dd/MM/yyyy",
                              { locale: fr }
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.ceil(
                              (new Date(booking.checkOutDate).getTime() -
                                new Date(booking.checkInDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            nuit
                            {Math.ceil(
                              (new Date(booking.checkOutDate).getTime() -
                                new Date(booking.checkInDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) > 1
                              ? "s"
                              : ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {booking.room?.name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {booking.guests} personne
                          {booking.guests > 1 ? "s" : ""}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {booking.touristTaxTotal?.toFixed(2)} CHF
                      </TableCell>
                      <TableCell className="text-right">
                        {booking.amount.toFixed(2)} CHF
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
