"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useTutorial } from "@/components/admin/settings/TutorialManager";
import { TutorialMenu } from "@/components/shared/TutorialMenu";
import { StripeOnboarding } from "@/components/admin/integrations/StripeOnboarding";
import { RoomManagement } from "@/components/admin/settings/RoomManagement";
import { AccessCodeManager } from "@/components/admin/settings/AccessCodeManager";
import { SettingsManager } from "@/components/admin/settings/SettingsManager";
import { FormCustomizer } from "@/components/admin/settings/FormCustomizer";
import { PricingOptionsManager } from "@/components/admin/settings/PricingOptionsManager";
import { ConfirmationManager } from "@/components/admin/settings/ConfirmationManager";
import { DayParkingManager } from "@/components/parking/DayParkingManager";
import { DayParkingEmailManager } from "@/components/admin/email/DayParkingEmailManager";
import { DayParkingControlTable } from "@/components/parking/DayParkingControlTable";
import { BookingsTable } from "@/components/admin/dashboard/BookingsTable";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { DashboardPublicAccess } from "@/components/admin/dashboard/DashboardPublicAccess";
import { ChartColorSelector } from "@/components/shared/ChartColorSelector";
import { TouristTaxDashboard } from "@/components/admin/dashboard/TouristTaxDashboard";
import { BookingCalendar } from "@/components/admin/dashboard/BookingCalendar";
import ExcelExportManager from "@/components/admin/settings/ExcelExportManager";
import { StatsConfigDialog } from "@/components/admin/dashboard/StatsConfigDialog";
import { DashboardLayoutEditor } from "@/components/admin/dashboard/DashboardLayoutEditor";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  DEFAULT_VISIBLE_STATS,
  DEFAULT_SECTION_ORDER,
  CATEGORY_LABELS,
  AVAILABLE_STATS,
  type DashboardPreferences,
  type StatCategory,
  type DashboardSectionType,
} from "@/types/dashboard-stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  CreditCard,
  Hotel,
  Settings,
  BarChart3,
  Users,
  Bed,
  CheckCircle,
  Calendar,
  Filter,
  LayoutGrid,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";

interface ChartColors {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

interface AdminDashboardProps {
  hotel: string;
  establishment: {
    name: string;
    stripeAccountId: string | null;
    stripeOnboarded: boolean;
    commissionRate: number;
    fixedFee: number;
    accessCodeType: string | null;
    generalAccessCode: string | null;
    accessInstructions: string | null;
    hotelContactEmail?: string | null;
    hotelContactPhone?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
    billingCompanyName?: string | null;
    billingAddress?: string | null;
    billingCity?: string | null;
    billingPostalCode?: string | null;
    billingCountry?: string | null;
    vatNumber?: string | null;
  };
  roomsWithInventory: Array<{
    id: string;
    name: string;
    price: number;
    inventory: number;
    isActive: boolean;
  }>;
  allBookings: Array<{
    id: string;
    bookingNumber: number;
    clientFirstName: string;
    clientLastName: string;
    clientEmail: string;
    amount: number;
    guests: number;
    checkInDate: Date;
    checkOutDate: Date;
    bookingDate: Date;
    paymentStatus?: string;
    stripePaymentIntentId?: string | null;
    confirmationSent?: boolean;
    confirmationSentAt?: Date | null;
    confirmationMethod?: string | null;
    touristTaxTotal?: number;
    room: {
      name: string;
    } | null;
  }>;
  dbRooms: Array<{
    id: string;
    name: string;
    accessCode: string | null;
    isActive: boolean;
  }>;
  finalIsStripeConfigured: boolean;
}

export function AdminDashboard({
  hotel,
  establishment,
  roomsWithInventory,
  allBookings,
  dbRooms,
  finalIsStripeConfigured,
}: AdminDashboardProps) {
  const router = useRouter();

  // Détecter l'ancre pour ouvrir le bon onglet au démarrage
  const getInitialTab = () => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#parking-access") {
        return "settings";
      }
    }
    return "overview";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [enableDayParking, setEnableDayParking] = useState(false);

  // Charger le filtre de période depuis localStorage
  const getInitialPeriodFilter = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`periodFilter_${hotel}`);
      if (
        saved &&
        ["today", "week", "month", "quarter", "year", "all"].includes(saved)
      ) {
        return saved as "today" | "week" | "month" | "quarter" | "year" | "all";
      }
    }
    return "today";
  };

  const [periodFilter, setPeriodFilter] = useState<
    "today" | "week" | "month" | "quarter" | "year" | "all"
  >(getInitialPeriodFilter());
  const [chartColors, setChartColors] = useState<ChartColors>({
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

  // Fonctions utilitaires pour filtrer les données par période
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
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start: startOfYear, end: endOfYear };
      case "all":
        return { start: new Date(2020, 0, 1), end: now }; // Depuis le début de la plateforme
      default:
        return { start: startOfDay, end: endOfDay };
    }
  };

  const getFilteredBookings = () => {
    const { start, end } = getDateRange(periodFilter);
    console.log("📅 Période filtrée:", {
      period: periodFilter,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    const filtered = allBookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      const isInRange = bookingDate >= start && bookingDate <= end;

      if (periodFilter === "week") {
        console.log("🔍 Réservation:", {
          id: booking.id.slice(0, 8),
          bookingDate: bookingDate.toISOString(),
          isInRange,
        });
      }

      return isInRange;
    });

    console.log(
      `✅ ${filtered.length} réservations filtrées sur ${allBookings.length} total`
    );
    return filtered;
  };

  const filteredBookings = getFilteredBookings();

  // Calculer toutes les statistiques avec le hook
  const computedStats = useDashboardStats(
    filteredBookings,
    allBookings,
    roomsWithInventory,
    establishment,
    periodFilter,
    getDateRange as (
      period: "today" | "week" | "month" | "quarter" | "year" | "all"
    ) => { start: Date; end: Date }
  );

  // Configuration du tutorial pour l'admin - focus sur la sidebar
  const adminTutorialSteps = [
    {
      target: '[data-tutorial="admin-sidebar"]',
      title: "Bienvenue dans votre tableau de bord !",
      content:
        "Ce menu de navigation vous donne accès à toutes les fonctionnalités de gestion de votre établissement.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
    {
      target: '[data-tutorial="nav-overview"]',
      title: "Vue d'ensemble",
      content:
        "Consultez vos statistiques principales : places disponibles, réservations du jour, revenus et graphiques de performance.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
    {
      target: '[data-tutorial="nav-bookings"]',
      title: "Réservations",
      content:
        "Visualisez toutes vos réservations : passées, actuelles et futures. Gérez les arrivées, départs et suivez l'historique complet.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
    {
      target: '[data-tutorial="nav-planning"]',
      title: "Planning",
      content:
        "Vue calendrier mensuel de toutes vos réservations. Visualisez l'occupation, survolez les réservations pour voir les détails, et imprimez le planning.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
    {
      target: '[data-tutorial="nav-rooms"]',
      title: "Gestion des places",
      content:
        "Créez, modifiez et gérez vos places. Définissez les prix, activez/désactivez les places et configurez leurs caractéristiques.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
    {
      target: '[data-tutorial="nav-pricing"]',
      title: "Options de prix",
      content:
        "Configurez des options tarifaires supplémentaires : petit-déjeuner, parking, services additionnels avec leurs prix.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
    {
      target: '[data-tutorial="nav-confirmations"]',
      title: "Confirmations",
      content:
        "Personnalisez les emails de confirmation envoyés automatiquement à vos clients après leur réservation.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
    {
      target: '[data-tutorial="nav-access-codes"]',
      title: "Codes d'accès",
      content:
        "Configurez les codes d'accès pour vos places. Automatiques (générés par le système) ou manuels selon vos besoins.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
    {
      target: '[data-tutorial="nav-tourist-tax"]',
      title: "Taxes de séjour",
      content:
        "Consultez et gérez toutes les taxes de séjour collectées. Statistiques détaillées et export Excel pour les déclarations.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
    {
      target: '[data-tutorial="nav-settings"]',
      title: "Paramètres",
      content:
        "Configurez votre établissement : informations générales, durée max de séjour, commissions, et paramètres avancés.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
    {
      target: '[data-tutorial="qr-code-link"]',
      title: "Code QR",
      content:
        "Générez un code QR pour permettre à vos clients de réserver directement en scannant le code avec leur téléphone.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
    {
      target: '[data-tutorial="stripe-dashboard"]',
      title: "Stripe Dashboard",
      content:
        "Accédez directement à votre tableau de bord Stripe pour consulter les paiements, remboursements et statistiques financières.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
    {
      target: '[data-tutorial="back-to-establishments"]',
      title: "Retour aux établissements",
      content:
        "Retournez à la liste de tous vos établissements pour en gérer plusieurs ou créer de nouveaux.",
      position: "right" as const,
      offset: { x: 20, y: 0 },
    },
  ];

  const tutorial = useTutorial({
    tutorialKey: "admin-dashboard-first-time",
    steps: adminTutorialSteps,
    autoStart: true,
    delay: 2000,
  });

  // Sauvegarder le filtre de période dans localStorage quand il change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`periodFilter_${hotel}`, periodFilter);
    }
  }, [periodFilter, hotel]);

  // Charger les couleurs sauvegardées au démarrage
  useEffect(() => {
    const savedColors = localStorage.getItem(`chartColors_${hotel}`);
    if (savedColors) {
      try {
        const parsedColors = JSON.parse(savedColors);
        setChartColors(parsedColors);
      } catch (error) {
        console.error("Erreur lors du chargement des couleurs:", error);
      }
    }
  }, [hotel]);

  // Charger les préférences de dashboard
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch(
          `/api/dashboard-preferences/${hotel}?type=admin`
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
  }, [hotel]);

  // Sauvegarder les préférences
  const handleSavePreferences = useCallback(
    async (newPreferences: DashboardPreferences) => {
      try {
        const response = await fetch(
          `/api/dashboard-preferences/${hotel}?type=admin`,
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
    [hotel]
  );

  // Charger l'état du parking jour
  useEffect(() => {
    const loadDayParkingStatus = async () => {
      try {
        const response = await fetch(
          `/api/admin/${hotel}/day-parking-settings`
        );
        if (response.ok) {
          const data = await response.json();
          setEnableDayParking(data.enableDayParking || false);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement du statut parking jour:",
          error
        );
      }
    };

    loadDayParkingStatus();
  }, [hotel]);

  // Gérer le scroll automatique vers l'ancre (une seule fois au chargement)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#parking-access") {
      // Attendre que le contenu soit rendu
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          // Nettoyer l'ancre après le scroll pour éviter les répétitions
          window.history.replaceState(null, "", window.location.pathname);
        }
      }, 500);
    }
  }, []); // Exécuter seulement au montage du composant

  const handleColorsChange = (newColors: ChartColors) => {
    setChartColors(newColors);
    // Sauvegarder les couleurs dans localStorage
    localStorage.setItem(`chartColors_${hotel}`, JSON.stringify(newColors));
  };

  // Helper pour obtenir le label de période
  const getPeriodLabel = () => {
    switch (periodFilter) {
      case "today":
        return "aujourd'hui";
      case "week":
        return "cette semaine";
      case "month":
        return "ce mois";
      case "quarter":
        return "ce trimestre";
      case "year":
        return "cette année";
      case "all":
        return "totales";
      default:
        return "aujourd'hui";
    }
  };

  const getPeriodLabelGenitive = () => {
    switch (periodFilter) {
      case "today":
        return "du jour";
      case "week":
        return "de la semaine";
      case "month":
        return "du mois";
      case "quarter":
        return "du trimestre";
      case "year":
        return "de l'année";
      case "all":
        return "totaux";
      default:
        return "du jour";
    }
  };

  // Fonction pour rendre chaque section du dashboard
  const renderSection = (sectionId: string) => {
    const hiddenSections = dashboardPreferences.hiddenSections || [];
    if (hiddenSections.includes(sectionId as DashboardSectionType)) {
      return null;
    }

    switch (sectionId) {
      case "existingStats":
        return (
          <div
            key="existingStats"
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            <Card className="stats-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Places disponibles
                </CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {roomsWithInventory.filter((r) => r.inventory > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  sur {roomsWithInventory.length} places
                </p>
              </CardContent>
            </Card>

            <Card className="stats-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Réservations {getPeriodLabel()}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredBookings.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredBookings.reduce(
                    (sum: number, b) => sum + b.guests,
                    0
                  )}{" "}
                  clients
                </p>
              </CardContent>
            </Card>

            <Card className="stats-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenus nets {getPeriodLabelGenitive()}
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const totalGross = filteredBookings.reduce(
                      (sum: number, b) => sum + b.amount,
                      0
                    );
                    const totalTouristTax = filteredBookings.reduce(
                      (sum: number, b) => sum + (b.touristTaxTotal || 0),
                      0
                    );
                    const totalCommissions = filteredBookings.reduce(
                      (sum: number, booking) => {
                        const commission = Math.round(
                          (booking.amount * establishment.commissionRate) /
                            100 +
                            establishment.fixedFee
                        );
                        return sum + commission;
                      },
                      0
                    );
                    const netRevenue =
                      totalGross - totalTouristTax - totalCommissions;
                    return netRevenue.toFixed(2);
                  })()}{" "}
                  CHF
                </div>
                <p className="text-xs text-muted-foreground">
                  après déduction des frais et taxes de séjour
                </p>
              </CardContent>
            </Card>

            <Card className="stats-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taux d&apos;occupation
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {roomsWithInventory.length > 0
                    ? Math.round(
                        (roomsWithInventory.filter((r) => r.inventory === 0)
                          .length /
                          roomsWithInventory.length) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {roomsWithInventory.filter((r) => r.inventory === 0).length}{" "}
                  places occupées
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "customStats":
        if (isLoadingPreferences || !dashboardPreferences) return null;
        return (
          <div key="customStats" className="space-y-6">
            {(
              Object.entries(AVAILABLE_STATS) as [
                StatCategory,
                (typeof AVAILABLE_STATS)[StatCategory],
              ][]
            ).map(([category, stats]) => {
              const categoryVisibleStats =
                dashboardPreferences.visibleStats[category] || [];
              const visibleStatsInCategory = stats.filter((stat) =>
                categoryVisibleStats.includes(stat.id)
              );

              if (visibleStatsInCategory.length === 0) return null;

              return (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {CATEGORY_LABELS[category]}
                  </h3>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visibleStatsInCategory.map((stat) => (
                      <StatCard
                        key={stat.id}
                        statId={stat.id}
                        stats={computedStats}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "charts":
        return (
          <div key="charts" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Analyses et statistiques
                </h2>
                <p className="text-muted-foreground">
                  Visualisez les performances de votre établissement
                </p>
              </div>
              {allBookings.length > 0 && (
                <div className="flex-shrink-0">
                  <ChartColorSelector
                    onColorsChange={handleColorsChange}
                    currentColors={chartColors}
                  />
                </div>
              )}
            </div>
            <DashboardCharts
              bookings={allBookings}
              rooms={roomsWithInventory}
              colors={chartColors}
              establishment={{
                commissionRate: establishment.commissionRate,
                fixedFee: establishment.fixedFee,
              }}
            />
          </div>
        );

      case "recentBookings":
        return (
          <div key="recentBookings">
            <BookingsTable
              bookings={allBookings}
              establishment={{
                name: establishment.name,
                slug: hotel,
                commissionRate: establishment.commissionRate,
                fixedFee: establishment.fixedFee,
                hotelContactEmail: establishment.hotelContactEmail,
                hotelContactPhone: establishment.hotelContactPhone,
                address: establishment.address,
                city: establishment.city,
                postalCode: establishment.postalCode,
                country: establishment.country,
                billingCompanyName: establishment.billingCompanyName,
                billingAddress: establishment.billingAddress,
                billingCity: establishment.billingCity,
                billingPostalCode: establishment.billingPostalCode,
                billingCountry: establishment.billingCountry,
                vatNumber: establishment.vatNumber,
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {finalIsStripeConfigured && dbRooms.length > 0 ? (
              <>
                {/* Sélecteur de période */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Vue d&apos;ensemble
                    </h2>
                    <p className="text-gray-600">
                      Statistiques de votre établissement
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <Select
                        value={periodFilter}
                        onValueChange={(
                          value:
                            | "today"
                            | "week"
                            | "month"
                            | "quarter"
                            | "year"
                            | "all"
                        ) => setPeriodFilter(value)}
                      >
                        <SelectTrigger className="w-48">
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
                </div>

                {/* Sections du dashboard organisables */}
                <div className="space-y-6">
                  {(
                    dashboardPreferences.sectionOrder || DEFAULT_SECTION_ORDER
                  ).map((sectionId) => renderSection(sectionId))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-muted p-6 mb-6">
                    {!finalIsStripeConfigured ? (
                      <Settings className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <Hotel className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {!finalIsStripeConfigured
                      ? "Configuration requise"
                      : "Première place"}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {!finalIsStripeConfigured
                      ? "Configurez Stripe pour accepter les paiements et commencer à recevoir des réservations"
                      : "Ajoutez votre première place pour commencer à recevoir des réservations"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "rooms":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Gestion des places
              </CardTitle>
              <CardDescription>
                Créez et gérez les places disponibles à la réservation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoomManagement hotelSlug={hotel} currency="CHF" />
            </CardContent>
          </Card>
        );

      case "pricing":
        return <PricingOptionsManager hotelSlug={hotel} />;

      case "day-parking":
        return <DayParkingManager hotelSlug={hotel} />;

      case "day-parking-manager":
        return <DayParkingManager hotelSlug={hotel} />;

      case "day-parking-email":
        return <DayParkingEmailManager hotelSlug={hotel} />;

      case "day-parking-control":
        return <DayParkingControlTable hotelSlug={hotel} />;

      case "day-parking-stats":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistiques Parking Jour
              </CardTitle>
              <CardDescription>
                Consultez les statistiques et métriques de votre parking jour
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Les statistiques détaillées arrivent bientôt...</p>
                <p className="text-sm mt-2">
                  Cette section affichera les revenus, taux d&apos;occupation et
                  tendances de votre parking jour.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "confirmations":
        return <ConfirmationManager hotelSlug={hotel} />;

      case "access-codes":
        return (
          <AccessCodeManager
            establishmentSlug={hotel}
            rooms={dbRooms.map((room) => ({
              id: room.id,
              name: room.name,
              accessCode: room.accessCode,
              isActive: room.isActive,
            }))}
            establishment={{
              accessCodeType: establishment.accessCodeType || "room",
              generalAccessCode: establishment.generalAccessCode,
              accessInstructions: establishment.accessInstructions,
            }}
          />
        );

      case "bookings":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Réservations
              </CardTitle>
              <CardDescription>
                Consultez et gérez toutes les réservations de votre
                établissement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingsTable
                bookings={allBookings}
                establishment={{
                  name: establishment.name,
                  slug: hotel,
                  commissionRate: establishment.commissionRate,
                  fixedFee: establishment.fixedFee,
                  hotelContactEmail: establishment.hotelContactEmail,
                  hotelContactPhone: establishment.hotelContactPhone,
                  address: establishment.address,
                  city: establishment.city,
                  postalCode: establishment.postalCode,
                  country: establishment.country,
                  billingCompanyName: establishment.billingCompanyName,
                  billingAddress: establishment.billingAddress,
                  billingCity: establishment.billingCity,
                  billingPostalCode: establishment.billingPostalCode,
                  billingCountry: establishment.billingCountry,
                  vatNumber: establishment.vatNumber,
                }}
              />
            </CardContent>
          </Card>
        );

      case "export-excel":
        return (
          <div className="max-w-4xl mx-auto">
            <ExcelExportManager hotelSlug={hotel} />
          </div>
        );

      case "payment-report":
        // Navigation vers la page dédiée sans rechargement
        router.push(`/admin/payment-report`);
        return (
          <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
            <p className="text-gray-600">
              Redirection vers le rapport de paiements...
            </p>
          </div>
        );

      case "tourist-tax":
        return (
          <div className="max-w-6xl mx-auto">
            <TouristTaxDashboard bookings={allBookings} />
          </div>
        );

      case "planning":
        return (
          <BookingCalendar
            bookings={allBookings}
            rooms={dbRooms.map((room) => ({
              ...room,
              price:
                roomsWithInventory.find((r) => r.id === room.id)?.price || 0,
            }))}
          />
        );

      case "settings":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres de l&apos;établissement
              </CardTitle>
              <CardDescription>
                Configurez les paramètres de réservation et de fonctionnement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsManager hotelSlug={hotel} />
            </CardContent>
          </Card>
        );

      case "form-customizer":
        return (
          <div className="max-w-4xl mx-auto">
            <FormCustomizer hotelSlug={hotel} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        hotel={hotel}
        establishmentName={establishment.name}
        isStripeConfigured={finalIsStripeConfigured}
        stripeAccountId={establishment.stripeAccountId || undefined}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        enableDayParking={enableDayParking}
      />

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="px-4 py-8 sm:px-6 lg:px-8 admin-dashboard-content">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tableau de bord
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <TutorialMenu onStartTutorial={tutorial.startTutorial} />
                {finalIsStripeConfigured && (
                  <DashboardPublicAccess
                    hotelSlug={hotel}
                    establishmentName={establishment.name}
                  />
                )}
                {finalIsStripeConfigured && (
                  <Badge variant="outline" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Paiements activés
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Stripe - seulement si pas encore configuré */}
          {!finalIsStripeConfigured && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Configuration des paiements
                </CardTitle>
                <CardDescription>
                  Connectez votre compte Stripe pour accepter les paiements en
                  ligne
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StripeOnboarding
                  hotelSlug={hotel}
                  hotelName={establishment.name}
                />
              </CardContent>
            </Card>
          )}

          {/* Contenu principal */}
          {renderContent()}
        </div>
      </div>

      {/* Tutorial Guide */}
      {tutorial.tutorialComponent}

      {/* Dialog de configuration des statistiques */}
      <StatsConfigDialog
        open={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        currentPreferences={dashboardPreferences}
        onSave={handleSavePreferences}
      />

      {/* Dialog d'organisation du layout */}
      <DashboardLayoutEditor
        open={isLayoutEditorOpen}
        onOpenChange={setIsLayoutEditorOpen}
        currentPreferences={dashboardPreferences}
        onSave={handleSavePreferences}
      />
    </div>
  );
}
