"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { generatePaymentReportPDF } from "@/lib/pdf-generator";

interface PaymentReportData {
  summary: {
    totalBookings: number;
    totalAmount: string;
    totalAmountHT: string;
    totalTVA: string;
    totalCommission: string;
    totalOwnerAmount: string;
    totalTouristTax: string;
    totalPricingOptions: string;
    currency: string;
  };
  byEstablishment: Array<{
    name: string;
    slug: string;
    totalAmount: number;
    totalCommission: number;
    totalOwnerAmount: number;
    bookingCount: number;
    billingInfo: {
      companyName: string | null;
      address: string | null;
      city: string | null;
      postalCode: string | null;
      country: string | null;
      vatNumber: string | null;
    };
  }>;
  byMonth: Array<{
    month: string;
    totalAmount: number;
    totalCommission: number;
    totalOwnerAmount: number;
    bookingCount: number;
  }>;
  byBookingType: Array<{
    type: string;
    totalAmount: number;
    totalCommission: number;
    bookingCount: number;
  }>;
  bookings: Array<{
    id: string;
    bookingNumber: number;
    bookingDate: string;
    checkInDate: string;
    checkOutDate: string;
    clientName: string;
    clientEmail: string;
    establishmentName: string;
    roomName: string;
    amount: number;
    baseAmount: number;
    baseAmountHT: number;
    pricingOptions: unknown;
    pricingOptionsTotal: number;
    touristTax: number;
    amountHT: number;
    tva: number;
    platformCommission: number;
    ownerAmount: number;
    currency: string;
    bookingType: string;
    stripePaymentIntentId: string | null;
    paymentStatus: string;
    guests: number;
    adults: number;
    children: number;
    hasDog: boolean;
  }>;
}

export default function PaymentReportPage() {
  const [data, setData] = useState<PaymentReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [selectedEstablishment, setSelectedEstablishment] =
    useState<string>("all");

  // Générer la liste des mois
  const months = [
    { value: "0", label: "Janvier" },
    { value: "1", label: "Février" },
    { value: "2", label: "Mars" },
    { value: "3", label: "Avril" },
    { value: "4", label: "Mai" },
    { value: "5", label: "Juin" },
    { value: "6", label: "Juillet" },
    { value: "7", label: "Août" },
    { value: "8", label: "Septembre" },
    { value: "9", label: "Octobre" },
    { value: "10", label: "Novembre" },
    { value: "11", label: "Décembre" },
  ];

  // Générer la liste des années (5 dernières années)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Calculer les dates selon la période sélectionnée
      const now = new Date();

      if (
        selectedPeriod === "custom-range" &&
        customStartDate &&
        customEndDate
      ) {
        // Période personnalisée
        params.set("startDate", new Date(customStartDate).toISOString());
        params.set(
          "endDate",
          new Date(customEndDate + "T23:59:59").toISOString()
        );
      } else if (
        selectedPeriod === "specific-month" &&
        selectedMonth &&
        selectedYear
      ) {
        // Mois spécifique sélectionné
        const year = parseInt(selectedYear);
        const month = parseInt(selectedMonth);
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
        params.set("startDate", startOfMonth.toISOString());
        params.set("endDate", endOfMonth.toISOString());
      } else if (selectedPeriod === "current-month") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        params.set("startDate", startOfMonth.toISOString());
        params.set("endDate", now.toISOString());
      } else if (selectedPeriod === "last-month") {
        const startOfLastMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        params.set("startDate", startOfLastMonth.toISOString());
        params.set("endDate", endOfLastMonth.toISOString());
      } else if (selectedPeriod === "current-year") {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        params.set("startDate", startOfYear.toISOString());
        params.set("endDate", now.toISOString());
      } else if (selectedPeriod === "last-year") {
        const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
        const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);
        params.set("startDate", startOfLastYear.toISOString());
        params.set("endDate", endOfLastYear.toISOString());
      }

      if (selectedEstablishment !== "all") {
        params.set("establishmentSlug", selectedEstablishment);
      }

      const response = await fetch(`/api/admin/payment-report?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching payment report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedPeriod,
    selectedMonth,
    selectedYear,
    customStartDate,
    customEndDate,
    selectedEstablishment,
  ]);

  const exportToPDF = () => {
    if (!data) return;

    const periodLabel = getPeriodLabel(selectedPeriod);
    const establishmentName =
      selectedEstablishment !== "all"
        ? data.byEstablishment.find((e) => e.slug === selectedEstablishment)
            ?.name
        : undefined;

    generatePaymentReportPDF(data, {
      periodLabel,
      establishmentName,
    });
  };

  const getPeriodLabel = (period: string): string => {
    if (period === "custom-range" && customStartDate && customEndDate) {
      return `Du ${format(new Date(customStartDate), "dd/MM/yyyy", { locale: fr })} au ${format(new Date(customEndDate), "dd/MM/yyyy", { locale: fr })}`;
    }
    if (period === "specific-month" && selectedMonth && selectedYear) {
      const monthName = months[parseInt(selectedMonth)].label;
      return `${monthName} ${selectedYear}`;
    }
    switch (period) {
      case "current-month":
        return "Mois en cours";
      case "last-month":
        return "Mois dernier";
      case "current-year":
        return "Année en cours";
      case "last-year":
        return "Année dernière";
      default:
        return "Toute la période";
    }
  };

  const exportToExcel = () => {
    if (!data) return;

    // Créer un CSV détaillé
    const headers = [
      "Numéro de réservation",
      "Date de réservation",
      "Check-in",
      "Check-out",
      "Client",
      "Email",
      "Établissement",
      "Chambre",
      "Voyageurs",
      "Adultes",
      "Enfants",
      "Chien",
      "Montant base HT",
      "Options supplémentaires",
      "Sous-total HT",
      "TVA 3.8%",
      "Taxe de séjour (TVA 0%)",
      "Total TTC",
      "Commission plateforme",
      "Montant propriétaire",
      "Devise",
      "Type",
      "Stripe Payment ID",
      "Statut",
    ];

    const rows = data.bookings.map((booking) => [
      booking.bookingNumber,
      format(new Date(booking.bookingDate), "dd/MM/yyyy HH:mm", { locale: fr }),
      format(new Date(booking.checkInDate), "dd/MM/yyyy", { locale: fr }),
      format(new Date(booking.checkOutDate), "dd/MM/yyyy", { locale: fr }),
      booking.clientName,
      booking.clientEmail,
      booking.establishmentName,
      booking.roomName,
      booking.guests,
      booking.adults,
      booking.children,
      booking.hasDog ? "Oui" : "Non",
      booking.baseAmountHT.toFixed(2),
      booking.pricingOptionsTotal.toFixed(2),
      booking.amountHT.toFixed(2),
      booking.tva.toFixed(2),
      booking.touristTax.toFixed(2),
      booking.amount.toFixed(2),
      booking.platformCommission.toFixed(2),
      booking.ownerAmount.toFixed(2),
      booking.currency,
      booking.bookingType,
      booking.stripePaymentIntentId || "",
      booking.paymentStatus,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `rapport_paiements_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Rapport de Paiements
        </h1>
        <p className="text-gray-600">
          Justificatif des paiements reçus via Stripe pour votre comptabilité et
          votre banque
        </p>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toute la période</SelectItem>
                  <SelectItem value="custom-range">
                    Période personnalisée
                  </SelectItem>
                  <SelectItem value="specific-month">
                    Mois spécifique
                  </SelectItem>
                  <SelectItem value="current-month">Mois en cours</SelectItem>
                  <SelectItem value="last-month">Mois dernier</SelectItem>
                  <SelectItem value="current-year">Année en cours</SelectItem>
                  <SelectItem value="last-year">Année dernière</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sélecteurs de dates personnalisées */}
            {selectedPeriod === "custom-range" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* Sélecteurs de mois et année (visible si "Mois spécifique" est sélectionné) */}
            {selectedPeriod === "specific-month" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mois
                  </label>
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un mois" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div
              className={
                selectedPeriod === "specific-month" ||
                selectedPeriod === "custom-range"
                  ? "md:col-span-3"
                  : ""
              }
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Établissement
              </label>
              <Select
                value={selectedEstablishment}
                onValueChange={setSelectedEstablishment}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les établissements</SelectItem>
                  {data.byEstablishment.map((est) => (
                    <SelectItem key={est.slug} value={est.slug}>
                      {est.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Boutons d'export */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={exportToExcel}
              variant="outline"
              className="flex-1"
            >
              Export Excel
            </Button>
            <Button onClick={exportToPDF} variant="outline" className="flex-1">
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total TTC</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.summary.totalAmount} {data.summary.currency}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              HT: {data.summary.totalAmountHT} {data.summary.currency}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600 mb-2">TVA (3.8%)</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.summary.totalTVA} {data.summary.currency}
            </p>
            <p className="text-xs text-gray-500 mt-1">Hors taxe de séjour</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Commission plateforme
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {data.summary.totalCommission} {data.summary.currency}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Reversé aux propriétaires
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {data.summary.totalOwnerAmount} {data.summary.currency}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Réservations
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {data.summary.totalBookings}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Taxe séjour: {data.summary.totalTouristTax} CHF
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par établissement */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Répartition par établissement</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Établissement</TableHead>
                <TableHead className="text-right">Réservations</TableHead>
                <TableHead className="text-right">Montant total</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Reversé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byEstablishment.map((est) => (
                <TableRow key={est.slug}>
                  <TableCell className="font-medium">{est.name}</TableCell>
                  <TableCell className="text-right">
                    {est.bookingCount}
                  </TableCell>
                  <TableCell className="text-right">
                    {est.totalAmount.toFixed(2)} CHF
                  </TableCell>
                  <TableCell className="text-right">
                    {est.totalCommission.toFixed(2)} CHF
                  </TableCell>
                  <TableCell className="text-right">
                    {est.totalOwnerAmount.toFixed(2)} CHF
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Répartition par mois */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Répartition par mois</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mois</TableHead>
                <TableHead className="text-right">Réservations</TableHead>
                <TableHead className="text-right">Montant total</TableHead>
                <TableHead className="text-right">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byMonth.map((month) => (
                <TableRow key={month.month}>
                  <TableCell className="font-medium">
                    {format(new Date(month.month + "-01"), "MMMM yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {month.bookingCount}
                  </TableCell>
                  <TableCell className="text-right">
                    {month.totalAmount.toFixed(2)} CHF
                  </TableCell>
                  <TableCell className="text-right">
                    {month.totalCommission.toFixed(2)} CHF
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Liste détaillée des transactions */}
      <Card>
        <CardHeader>
          <CardTitle>
            Détail des transactions ({data.bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Réservation</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Établissement</TableHead>
                  <TableHead className="text-right">Base HT</TableHead>
                  <TableHead className="text-right">Options</TableHead>
                  <TableHead className="text-right">Taxe séjour</TableHead>
                  <TableHead className="text-right">TVA 3.8%</TableHead>
                  <TableHead className="text-right">Total TTC</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      #{booking.bookingNumber}
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.bookingDate), "dd/MM/yyyy", {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>{booking.clientName}</TableCell>
                    <TableCell>{booking.establishmentName}</TableCell>
                    <TableCell className="text-right text-xs">
                      {booking.baseAmountHT.toFixed(2)} CHF
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {booking.pricingOptionsTotal.toFixed(2)} CHF
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {booking.touristTax.toFixed(2)} CHF
                      <br />
                      <span className="text-gray-500">(TVA 0%)</span>
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {booking.tva.toFixed(2)} CHF
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {booking.amount.toFixed(2)} CHF
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {booking.platformCommission.toFixed(2)} CHF
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
