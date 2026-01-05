"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { generatePaymentReportPDF } from "@/lib/pdf-generator";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { toast } from "sonner";

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
    totalStripeFees: string;
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
    stripeFee: number | null;
  }>;
}

export default function PaymentReportPage() {
  const [data, setData] = useState<PaymentReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingFees, setSyncingFees] = useState(false);

  // Filtres temporaires (modifiables sans recharger)
  const [tempDateRange, setTempDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), 0, 1), // Début d'année par défaut
    to: new Date(),
  });
  const [tempEstablishment, setTempEstablishment] = useState<string>("all");

  // Filtres appliqués (déclenchent le rechargement)
  const [appliedDateRange, setAppliedDateRange] = useState(tempDateRange);
  const [appliedEstablishment, setAppliedEstablishment] =
    useState(tempEstablishment);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Utiliser les filtres appliqués
      params.set("startDate", appliedDateRange.from.toISOString());
      params.set(
        "endDate",
        new Date(appliedDateRange.to.setHours(23, 59, 59, 999)).toISOString()
      );

      if (appliedEstablishment !== "all") {
        params.set("establishmentSlug", appliedEstablishment);
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

  // Charger les données au montage et quand les filtres appliqués changent
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedDateRange, appliedEstablishment]);

  // Appliquer les filtres temporaires
  const handleApplyFilters = () => {
    setAppliedDateRange(tempDateRange);
    setAppliedEstablishment(tempEstablishment);
  };

  // Synchroniser les frais Stripe
  const handleSyncStripeFees = async () => {
    setSyncingFees(true);
    try {
      const response = await fetch("/api/admin/sync-stripe-fees", {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        // Recharger les données pour afficher les frais mis à jour
        await fetchData();
      } else {
        toast.error("Erreur lors de la synchronisation");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la synchronisation");
    } finally {
      setSyncingFees(false);
    }
  };

  const exportToPDF = () => {
    if (!data) return;

    const periodLabel = `Du ${format(appliedDateRange.from, "dd/MM/yyyy", { locale: fr })} au ${format(appliedDateRange.to, "dd/MM/yyyy", { locale: fr })}`;
    const establishmentName =
      appliedEstablishment !== "all"
        ? data.byEstablishment.find((e) => e.slug === appliedEstablishment)
            ?.name
        : undefined;

    generatePaymentReportPDF(data, {
      periodLabel,
      establishmentName,
    });
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
      "Frais Stripe",
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
      booking.stripeFee ? booking.stripeFee.toFixed(2) : "N/A",
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
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Date range picker */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <DateRangePicker
                value={tempDateRange}
                onChange={setTempDateRange}
                className="w-full"
              />
            </div>

            {/* Sélecteur d'établissement */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Établissement
              </label>
              <Select
                value={tempEstablishment}
                onValueChange={setTempEstablishment}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les établissements</SelectItem>
                  {data?.byEstablishment.map((est) => (
                    <SelectItem key={est.slug} value={est.slug}>
                      {est.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bouton Appliquer */}
            <Button
              onClick={handleApplyFilters}
              className="flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Appliquer
            </Button>
          </div>

          {/* Boutons d'export */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSyncStripeFees}
              variant="default"
              className="bg-orange-600 hover:bg-orange-700"
              disabled={syncingFees || loading}
            >
              {syncingFees ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Synchronisation...
                </>
              ) : (
                "Sync Frais Stripe"
              )}
            </Button>
            <Button
              onClick={exportToExcel}
              variant="outline"
              className="flex-1"
              disabled={!data}
            >
              Export Excel
            </Button>
            <Button
              onClick={exportToPDF}
              variant="outline"
              className="flex-1"
              disabled={!data}
            >
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
              Frais Stripe
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {data.summary.totalStripeFees} {data.summary.currency}
            </p>
            <p className="text-xs text-gray-500 mt-1">Frais de transaction</p>
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
