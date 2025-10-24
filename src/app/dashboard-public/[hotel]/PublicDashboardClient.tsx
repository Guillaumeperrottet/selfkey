"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  BarChart3,
  Users,
  Building,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Moon,
  DollarSign,
  Award,
} from "lucide-react";

interface Room {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

interface Booking {
  id: string;
  bookingDate: Date;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  amount: number;
  touristTaxTotal: number;
  paymentStatus: string;
  bookingType: string;
  adults: number;
  children: number;
  room: {
    id: string;
    name: string;
    price: number;
  } | null;
}

interface Establishment {
  name: string;
  slug: string;
  commissionRate: number;
  fixedFee: number;
}

interface PublicDashboardClientProps {
  establishment: Establishment;
  rooms: Room[];
  bookings: Booking[];
}

export function PublicDashboardClient({
  establishment,
  rooms,
  bookings,
}: PublicDashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialiser le filtre depuis l'URL ou utiliser "all" par défaut
  const initialPeriod =
    (searchParams.get("period") as
      | "today"
      | "week"
      | "month"
      | "quarter"
      | "year"
      | "all") || "all";

  const [periodFilter, setPeriodFilter] = useState<
    "today" | "week" | "month" | "quarter" | "year" | "all"
  >(initialPeriod);

  const [chartColors] = useState({
    chart1: "#3b82f6",
    chart2: "#10b981",
    chart3: "#f59e0b",
    chart4: "#ef4444",
    chart5: "#8b5cf6",
  });

  // Mettre à jour l'URL quand le filtre change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", periodFilter);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [periodFilter, router, searchParams]);

  // Fonction pour obtenir la plage de dates selon la période
  const getDateRange = (
    period: "today" | "week" | "month" | "quarter" | "year" | "all"
  ) => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    switch (period) {
      case "today":
        return { start: startOfDay, end: endOfDay };
      case "week":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: startOfWeek, end: endOfWeek };
      case "month":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        return { start: startOfMonth, end: endOfMonth };
      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(
          now.getFullYear(),
          currentQuarter * 3,
          1
        );
        const endOfQuarter = new Date(
          now.getFullYear(),
          currentQuarter * 3 + 3,
          0,
          23,
          59,
          59,
          999
        );
        return { start: startOfQuarter, end: endOfQuarter };
      case "year":
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start: startOfYear, end: endOfYear };
      case "all":
        return { start: new Date(2020, 0, 1), end: now };
      default:
        return { start: startOfDay, end: endOfDay };
    }
  };

  // Filtrer les réservations selon la période
  const filteredBookings = useMemo(() => {
    const { start, end } = getDateRange(periodFilter);
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= start && bookingDate <= end;
    });
  }, [bookings, periodFilter]);

  // Transformer les données pour correspondre au format attendu par DashboardCharts
  const roomsWithInventory = rooms.map((room) => ({
    ...room,
    inventory: 1, // Inventaire par défaut pour la compatibilité
  }));

  // Transformer les bookings filtrés pour correspondre au format attendu
  const dashboardBookings = useMemo(
    () =>
      filteredBookings.map((booking) => ({
        id: booking.id,
        clientFirstName: "Anonyme", // Données anonymisées
        clientLastName: "Client",
        clientEmail: "anonyme@exemple.com",
        amount: booking.amount,
        guests: booking.guests,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        bookingDate: booking.bookingDate,
        touristTaxTotal: booking.touristTaxTotal,
        room: booking.room,
      })),
    [filteredBookings]
  );

  // Calculer les statistiques de base sur les réservations filtrées
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter((room) => room.isActive).length;
  const totalBookings = filteredBookings.length;
  const totalRevenue = filteredBookings.reduce(
    (sum, booking) => sum + booking.amount,
    0
  );

  // Calculer le taux d'occupation en fonction de la période
  const getDaysInPeriod = () => {
    const { start, end } = getDateRange(periodFilter);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const daysInPeriod = getDaysInPeriod();
  const occupancyRate =
    totalRooms > 0 && daysInPeriod > 0
      ? Math.round((totalBookings / (totalRooms * daysInPeriod)) * 100)
      : 0;

  // ========== NOUVELLES STATISTIQUES TOP 5 ==========

  // 1. Revenu moyen par réservation
  const averageRevenuePerBooking =
    totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // 2. Durée moyenne de séjour
  const averageStayDuration = useMemo(() => {
    if (filteredBookings.length === 0) return 0;
    const totalNights = filteredBookings.reduce((sum, booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + nights;
    }, 0);
    return totalNights / filteredBookings.length;
  }, [filteredBookings]);

  // 3. Comparaison avec la période précédente
  const previousPeriodComparison = useMemo(() => {
    const { start, end } = getDateRange(periodFilter);
    const periodDuration = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodDuration);
    const previousEnd = new Date(start);

    const previousBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= previousStart && bookingDate < previousEnd;
    });

    const previousRevenue = previousBookings.reduce(
      (sum, b) => sum + b.amount,
      0
    );
    const currentRevenue = totalRevenue;

    if (previousRevenue === 0) return { percentage: 0, trend: "neutral" };

    const percentageChange =
      ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    return {
      percentage: Math.abs(percentageChange),
      trend:
        percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "neutral",
      previousRevenue,
      currentRevenue,
    };
  }, [bookings, periodFilter, totalRevenue]);

  // 4. Top 3 des chambres/places les plus réservées
  const topRooms = useMemo(() => {
    const roomStats = rooms.map((room) => {
      const bookingCount = filteredBookings.filter(
        (b) => b.room?.id === room.id
      ).length;
      const revenue = filteredBookings
        .filter((b) => b.room?.id === room.id)
        .reduce((sum, b) => sum + b.amount, 0);
      return {
        ...room,
        bookingCount,
        revenue,
      };
    });

    return roomStats
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 3);
  }, [rooms, filteredBookings]);

  // 5. Délai moyen de réservation (jours à l'avance)
  const averageBookingLeadTime = useMemo(() => {
    if (filteredBookings.length === 0) return 0;
    const totalLeadTime = filteredBookings.reduce((sum, booking) => {
      const bookingDate = new Date(booking.bookingDate);
      const checkInDate = new Date(booking.checkInDate);
      const leadTime = Math.ceil(
        (checkInDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + Math.max(0, leadTime);
    }, 0);
    return totalLeadTime / filteredBookings.length;
  }, [filteredBookings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header moderne et épuré */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Building className="h-8 w-8 text-white" />
                </div>
                {establishment.name}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Statistiques et performances
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="flex items-center gap-2 text-sm px-3 py-1"
              >
                <Calendar className="h-4 w-4" />
                Mis à jour en temps réel
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Sélecteur de période */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Statistiques de l&apos;établissement
            </h2>
            <p className="text-gray-600 text-sm">
              {periodFilter === "today"
                ? "Données d'aujourd'hui"
                : periodFilter === "week"
                  ? "Données de cette semaine"
                  : periodFilter === "month"
                    ? "Données de ce mois"
                    : periodFilter === "quarter"
                      ? "Données de ce trimestre"
                      : periodFilter === "year"
                        ? "Données de cette année"
                        : "Toutes les données"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={periodFilter}
              onValueChange={(
                value: "today" | "week" | "month" | "quarter" | "year" | "all"
              ) => setPeriodFilter(value)}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Aujourd&apos;hui
                  </div>
                </SelectItem>
                <SelectItem value="week">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Cette semaine
                  </div>
                </SelectItem>
                <SelectItem value="month">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ce mois
                  </div>
                </SelectItem>
                <SelectItem value="quarter">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ce trimestre
                  </div>
                </SelectItem>
                <SelectItem value="year">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Cette année
                  </div>
                </SelectItem>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Depuis le début
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Places totales
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRooms}</div>
              <p className="text-xs text-muted-foreground">
                {activeRooms} actives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Réservations
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {periodFilter === "today"
                  ? "Aujourd'hui"
                  : periodFilter === "week"
                    ? "Cette semaine"
                    : periodFilter === "month"
                      ? "Ce mois"
                      : periodFilter === "quarter"
                        ? "Ce trimestre"
                        : periodFilter === "year"
                          ? "Cette année"
                          : "Depuis le début"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenus nets
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue.toFixed(2)} CHF
              </div>
              <p className="text-xs text-muted-foreground">
                {periodFilter === "today"
                  ? "Aujourd'hui"
                  : periodFilter === "week"
                    ? "Cette semaine"
                    : periodFilter === "month"
                      ? "Ce mois"
                      : periodFilter === "quarter"
                        ? "Ce trimestre"
                        : periodFilter === "year"
                          ? "Cette année"
                          : "Depuis le début"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taux d&apos;occupation
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">
                {periodFilter === "today"
                  ? "Aujourd'hui"
                  : periodFilter === "week"
                    ? "Cette semaine"
                    : periodFilter === "month"
                      ? "Ce mois"
                      : periodFilter === "quarter"
                        ? "Ce trimestre"
                        : periodFilter === "year"
                          ? "Cette année"
                          : "Depuis le début"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ========== NOUVELLES STATISTIQUES AVANCÉES ========== */}
        {filteredBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📊 Statistiques avancées
            </h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* 1. Revenu moyen par réservation */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Revenu moyen / réservation
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {averageRevenuePerBooking.toFixed(2)} CHF
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valeur moyenne par booking
                  </p>
                </CardContent>
              </Card>

              {/* 2. Durée moyenne de séjour */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Durée moyenne de séjour
                  </CardTitle>
                  <Moon className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {averageStayDuration.toFixed(1)}{" "}
                    {averageStayDuration === 1 ? "nuit" : "nuits"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nombre moyen de nuits par séjour
                  </p>
                </CardContent>
              </Card>

              {/* 3. Comparaison période précédente */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Évolution vs période précédente
                  </CardTitle>
                  {previousPeriodComparison.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : previousPeriodComparison.trend === "down" ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-400" />
                  )}
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      previousPeriodComparison.trend === "up"
                        ? "text-green-600"
                        : previousPeriodComparison.trend === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {previousPeriodComparison.trend === "up" && "+"}
                    {previousPeriodComparison.trend === "down" && "-"}
                    {previousPeriodComparison.percentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {previousPeriodComparison.trend === "up"
                      ? "Augmentation des revenus"
                      : previousPeriodComparison.trend === "down"
                        ? "Diminution des revenus"
                        : "Stabilité des revenus"}
                  </p>
                </CardContent>
              </Card>

              {/* 4. Délai moyen de réservation */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Délai moyen de réservation
                  </CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {averageBookingLeadTime.toFixed(0)}{" "}
                    {averageBookingLeadTime === 1 ? "jour" : "jours"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Réservé à l&apos;avance en moyenne
                  </p>
                </CardContent>
              </Card>

              {/* 5. Top 3 des chambres */}
              <Card className="border-l-4 border-l-amber-500 md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    🏆 Top 3 des places les plus réservées
                  </CardTitle>
                  <Award className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topRooms.map((room, index) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0
                                ? "bg-amber-100 text-amber-700"
                                : index === 1
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-orange-100 text-orange-700"
                            } font-bold text-sm`}
                          >
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{room.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {room.bookingCount} réservation
                              {room.bookingCount > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">
                            {room.revenue.toFixed(2)} CHF
                          </p>
                          <p className="text-xs text-muted-foreground">
                            revenus
                          </p>
                        </div>
                      </div>
                    ))}
                    {topRooms.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucune donnée disponible
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Graphiques et analyses */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Analyses et statistiques
                </h2>
                <p className="text-muted-foreground">
                  Visualisez les performances de l&apos;établissement
                </p>
              </div>
            </div>
            <DashboardCharts
              bookings={dashboardBookings}
              rooms={roomsWithInventory}
              colors={chartColors}
              establishment={{
                commissionRate: establishment.commissionRate,
                fixedFee: establishment.fixedFee,
              }}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Aucune donnée disponible</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {periodFilter === "all"
                      ? "Les analyses et statistiques s'afficheront quand l'établissement aura des réservations confirmées."
                      : `Aucune réservation pour ${
                          periodFilter === "today"
                            ? "aujourd'hui"
                            : periodFilter === "week"
                              ? "cette semaine"
                              : periodFilter === "month"
                                ? "ce mois"
                                : periodFilter === "quarter"
                                  ? "ce trimestre"
                                  : "cette année"
                        }. Essayez de sélectionner une autre période.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer épuré */}
      <div className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Données confidentielles protégées</span>
            </div>
            <div>
              Dernière mise à jour :{" "}
              {new Date().toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
