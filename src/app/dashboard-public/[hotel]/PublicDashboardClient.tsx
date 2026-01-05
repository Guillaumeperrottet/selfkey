"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  LayoutGrid,
  Sliders,
  TrendingUp,
  TrendingDown,
  Minus,
  Maximize,
  DollarSign,
  Moon,
  Trophy,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { StatsConfigDialog } from "@/components/admin/dashboard/StatsConfigDialog";
import { DashboardLayoutEditor } from "@/components/admin/dashboard/DashboardLayoutEditor";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  DEFAULT_VISIBLE_STATS,
  CATEGORY_LABELS,
  type DashboardPreferences,
  type StatCategory,
} from "@/types/dashboard-stats";
import { toast } from "sonner";

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
  // États pour le rafraîchissement automatique
  const [liveBookings, setLiveBookings] = useState(bookings);
  const [liveRooms, setLiveRooms] = useState(rooms);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialiser le filtre depuis localStorage ou utiliser "all" par défaut
  const [periodFilter, setPeriodFilter] = useState<
    "today" | "week" | "month" | "quarter" | "year" | "all"
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`periodFilter_${establishment.slug}`);
      if (
        saved &&
        ["today", "week", "month", "quarter", "year", "all"].includes(saved)
      ) {
        return saved as "today" | "week" | "month" | "quarter" | "year" | "all";
      }
    }
    return "all";
  });

  // Fonction pour rafraîchir les données
  const refreshData = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const token = new URLSearchParams(window.location.search).get("token");
      const response = await fetch(
        `/api/dashboard-public/${establishment.slug}?token=${encodeURIComponent(token || "")}`
      );

      if (response.ok) {
        const data = await response.json();
        setLiveBookings(data.bookings);
        setLiveRooms(data.rooms);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [establishment.slug, isRefreshing]);

  // Rafraîchissement automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [refreshData]);

  // Mettre à jour le temps écoulé chaque seconde
  useEffect(() => {
    const updateTimeAgo = () => {
      const seconds = Math.floor(
        (new Date().getTime() - lastUpdate.getTime()) / 1000
      );
      if (seconds < 10) setTimeAgo("à l'instant");
      else if (seconds < 60) setTimeAgo(`il y a ${seconds}s`);
      else if (seconds < 3600)
        setTimeAgo(`il y a ${Math.floor(seconds / 60)}min`);
      else setTimeAgo(`il y a ${Math.floor(seconds / 3600)}h`);
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Gestion du mode plein écran
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Sauvegarder le filtre dans localStorage quand il change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`periodFilter_${establishment.slug}`, periodFilter);
    }
  }, [periodFilter, establishment.slug]);

  const [chartColors] = useState({
    chart1: "#3b82f6",
    chart2: "#10b981",
    chart3: "#f59e0b",
    chart4: "#ef4444",
    chart5: "#8b5cf6",
  });

  // États pour les statistiques personnalisables
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLayoutEditorOpen, setIsLayoutEditorOpen] = useState(false);
  const [dashboardPreferences, setDashboardPreferences] =
    useState<DashboardPreferences>(DEFAULT_VISIBLE_STATS);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // Charger les préférences au montage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch(
          `/api/dashboard-preferences/${establishment.slug}?type=public`
        );
        if (response.ok) {
          const data = await response.json();
          setDashboardPreferences(data);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    loadPreferences();
  }, [establishment.slug]);

  // Sauvegarder les préférences
  const handleSavePreferences = useCallback(
    async (newPreferences: DashboardPreferences) => {
      try {
        const response = await fetch(
          `/api/dashboard-preferences/${establishment.slug}?type=public`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPreferences),
          }
        );

        if (!response.ok) throw new Error("Failed to save preferences");

        const data = await response.json();
        setDashboardPreferences(data);
        toast.success("Préférences sauvegardées !");
      } catch (error) {
        console.error("Error saving preferences:", error);
        toast.error("Erreur lors de la sauvegarde");
        throw error;
      }
    },
    [establishment.slug]
  );

  // Helper function pour les libellés de période au génitif
  const getPeriodLabelGenitive = (
    period: "today" | "week" | "month" | "quarter" | "year" | "all"
  ) => {
    switch (period) {
      case "today":
        return "d'aujourd'hui";
      case "week":
        return "de cette semaine";
      case "month":
        return "de ce mois";
      case "quarter":
        return "de ce trimestre";
      case "year":
        return "de cette année";
      case "all":
        return "depuis le début";
      default:
        return "d'aujourd'hui";
    }
  };

  // Fonction pour obtenir la plage de dates selon la période
  const getDateRange = useCallback(
    (period: "today" | "week" | "month" | "quarter" | "year" | "all") => {
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
          const dayOfWeek = now.getDay();
          const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, reculer de 6 jours
          startOfWeek.setDate(now.getDate() + diff); // Lundi de la semaine en cours
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche de la semaine en cours
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
          const endOfYear = new Date(
            now.getFullYear(),
            11,
            31,
            23,
            59,
            59,
            999
          );
          return { start: startOfYear, end: endOfYear };
        case "all":
          return { start: new Date(2020, 0, 1), end: now };
        default:
          return { start: startOfDay, end: endOfDay };
      }
    },
    []
  );

  // Filtrer les réservations selon la période
  const filteredBookings = useMemo(() => {
    const { start, end } = getDateRange(periodFilter);
    return liveBookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= start && bookingDate <= end;
    });
  }, [liveBookings, periodFilter, getDateRange]);

  // Transformer les données pour correspondre au format attendu par DashboardCharts
  const roomsWithInventory = liveRooms.map((room) => ({
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

  // Calculer les statistiques de la période précédente
  const getPreviousPeriodBookings = useMemo(() => {
    if (periodFilter === "all") return [];

    const { start, end } = getDateRange(periodFilter);
    const duration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - duration);
    const prevEnd = new Date(start.getTime() - 1);

    return liveBookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= prevStart && bookingDate <= prevEnd;
    });
  }, [liveBookings, periodFilter, getDateRange]);

  // Calculer les statistiques de base sur les réservations filtrées
  const totalRooms = liveRooms.length;
  const totalBookings = filteredBookings.length;
  const totalRevenue = filteredBookings.reduce(
    (sum, booking) => sum + booking.amount,
    0
  );

  // Statistiques période précédente
  const prevTotalBookings = getPreviousPeriodBookings.length;
  const prevTotalRevenue = getPreviousPeriodBookings.reduce(
    (sum, booking) => sum + booking.amount,
    0
  );

  // Calcul des tendances
  const bookingsTrend =
    prevTotalBookings > 0
      ? ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100
      : totalBookings > 0
        ? 100
        : 0;
  const revenueTrend =
    prevTotalRevenue > 0
      ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
      : totalRevenue > 0
        ? 100
        : 0;

  // Nouveaux KPIs
  const averagePrice = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const averageStay = useMemo(() => {
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

  // Top performer (chambre la plus réservée)
  const topRoom = useMemo(() => {
    const roomCounts = filteredBookings.reduce(
      (acc, booking) => {
        if (booking.room) {
          acc[booking.room.name] = (acc[booking.room.name] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const entries = Object.entries(roomCounts);
    if (entries.length === 0) return null;

    const [name, count] = entries.reduce((max, curr) =>
      curr[1] > max[1] ? curr : max
    );
    return { name, count };
  }, [filteredBookings]);

  // Prochaines arrivées (7 prochains jours)
  const upcomingArrivals = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return liveBookings.filter((booking) => {
      const checkIn = new Date(booking.checkInDate);
      return checkIn >= now && checkIn <= sevenDaysLater;
    }).length;
  }, [liveBookings]);

  // Prochains départs (7 prochains jours)
  const upcomingDepartures = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return liveBookings.filter((booking) => {
      const checkOut = new Date(booking.checkOutDate);
      return checkOut >= now && checkOut <= sevenDaysLater;
    }).length;
  }, [liveBookings]);

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

  // Calculer toutes les statistiques avec le hook
  const computedStats = useDashboardStats(
    filteredBookings,
    liveBookings,
    liveRooms,
    establishment,
    periodFilter,
    getDateRange
  );

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
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="flex items-center gap-2 text-sm px-3 py-1"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isRefreshing
                        ? "bg-blue-500 animate-pulse"
                        : "bg-green-500"
                    }`}
                  />
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Mise à jour auto (30s)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {timeAgo}
                  </span>
                </div>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
                className="text-xs"
              >
                {isRefreshing ? "Actualisation..." : "Actualiser"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-xs hidden lg:flex"
                title="Mode plein écran"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Sélecteur de période et configuration */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Statistiques de l&apos;établissement
            </h2>
            <p className="text-gray-600 text-sm">
              Données {getPeriodLabelGenitive(periodFilter)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLayoutEditorOpen(true)}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Organiser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
              className="gap-2"
            >
              <Sliders className="h-4 w-4" />
              Statistiques
            </Button>
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

        {/* Modal de configuration */}
        <StatsConfigDialog
          open={isConfigOpen}
          onOpenChange={setIsConfigOpen}
          currentPreferences={dashboardPreferences}
          onSave={handleSavePreferences}
        />

        {/* Statistiques rapides */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 mb-8">
          {/* Réservations avec tendance */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Réservations
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              {periodFilter !== "all" && (
                <div className="flex items-center gap-2 mt-2">
                  {bookingsTrend > 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />+
                      {bookingsTrend.toFixed(1)}%
                    </Badge>
                  ) : bookingsTrend < 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200"
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {bookingsTrend.toFixed(1)}%
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700"
                    >
                      <Minus className="h-3 w-3 mr-1" />
                      0%
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    vs période précédente
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
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

          {/* Revenus avec tendance */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                Revenus nets
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {totalRevenue.toFixed(2)} CHF
              </div>
              {periodFilter !== "all" && (
                <div className="flex items-center gap-2 mt-2">
                  {revenueTrend > 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />+
                      {revenueTrend.toFixed(1)}%
                    </Badge>
                  ) : revenueTrend < 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200"
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {revenueTrend.toFixed(1)}%
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700"
                    >
                      <Minus className="h-3 w-3 mr-1" />
                      0%
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    vs période précédente
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Taux d'occupation avec indicateur coloré */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taux d&apos;occupation
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupancyRate}%</div>
              <div className="mt-2">
                {occupancyRate >= 80 ? (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    🔥 Excellent
                  </Badge>
                ) : occupancyRate >= 60 ? (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    ✓ Très bon
                  </Badge>
                ) : occupancyRate >= 40 ? (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    → Correct
                  </Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                    ⚠️ À améliorer
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nouveaux KPIs */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prix moyen</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averagePrice.toFixed(0)} CHF
              </div>
              <p className="text-xs text-muted-foreground">Par réservation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Durée moyenne
              </CardTitle>
              <Moon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageStay.toFixed(1)} nuits
              </div>
              <p className="text-xs text-muted-foreground">Par séjour</p>
            </CardContent>
          </Card>

          {topRoom && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Top performer
                </CardTitle>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold truncate">{topRoom.name}</div>
                <p className="text-xs text-muted-foreground">
                  {topRoom.count} réservations
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Arrivées (7j)
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingArrivals}</div>
              <p className="text-xs text-muted-foreground">
                Prochains check-ins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Départs (7j)
              </CardTitle>
              <ArrowLeft className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingDepartures}</div>
              <p className="text-xs text-muted-foreground">
                Prochains check-outs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ========== STATISTIQUES PERSONNALISABLES ========== */}
        {filteredBookings.length > 0 && !isLoadingPreferences && (
          <div className="mb-8 space-y-6">
            {(
              Object.keys(dashboardPreferences.visibleStats) as StatCategory[]
            ).map((category) => {
              const visibleStats =
                dashboardPreferences.visibleStats[category] || [];
              if (visibleStats.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {visibleStats.map((statId) => (
                      <StatCard
                        key={statId}
                        statId={statId}
                        stats={computedStats}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
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
                      : `Aucune réservation ${getPeriodLabelGenitive(periodFilter)}. Essayez de sélectionner une autre période.`}
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

      {/* Dialogs */}
      <StatsConfigDialog
        open={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        currentPreferences={dashboardPreferences}
        onSave={handleSavePreferences}
      />

      <DashboardLayoutEditor
        open={isLayoutEditorOpen}
        onOpenChange={setIsLayoutEditorOpen}
        currentPreferences={dashboardPreferences}
        onSave={handleSavePreferences}
      />
    </div>
  );
}
