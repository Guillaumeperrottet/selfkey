"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useTutorial } from "@/components/TutorialManager";
import { TutorialMenu } from "@/components/TutorialMenu";
import { StripeOnboarding } from "@/components/StripeOnboarding";
import { RoomManagement } from "@/components/RoomManagement";
import { AccessCodeManager } from "@/components/AccessCodeManager";
import { SettingsManager } from "@/components/SettingsManager";
import { PricingOptionsManager } from "@/components/PricingOptionsManager";
import { ConfirmationManager } from "@/components/ConfirmationManager";
import { BookingsTable } from "@/components/BookingsTable";
import { DashboardCharts } from "@/components/DashboardCharts";
import { ChartColorSelector } from "@/components/ChartColorSelector";
import ExcelExportManager from "@/components/ExcelExportManager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Hotel,
  Settings,
  BarChart3,
  Users,
  Bed,
  CheckCircle,
} from "lucide-react";

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
  };
  roomsWithInventory: Array<{
    id: string;
    name: string;
    price: number;
    inventory: number;
    isActive: boolean;
  }>;
  currentBookings: Array<{
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
  }>;
  allBookings: Array<{
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
  currentBookings,
  allBookings,
  dbRooms,
  finalIsStripeConfigured,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [chartColors, setChartColors] = useState<ChartColors>({
    chart1: "#3b82f6",
    chart2: "#10b981",
    chart3: "#f59e0b",
    chart4: "#ef4444",
    chart5: "#8b5cf6",
  });

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

  const handleColorsChange = (newColors: ChartColors) => {
    setChartColors(newColors);
    // Sauvegarder les couleurs dans localStorage
    localStorage.setItem(`chartColors_${hotel}`, JSON.stringify(newColors));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {finalIsStripeConfigured && dbRooms.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Statistiques */}
                <Card>
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

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Réservations aujourd&apos;hui
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {currentBookings.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentBookings.reduce(
                        (sum: number, b) => sum + b.guests,
                        0
                      )}{" "}
                      clients
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Revenus nets du jour
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(() => {
                        const totalGross = currentBookings.reduce(
                          (sum: number, b) => sum + b.amount,
                          0
                        );
                        const totalCommissions = currentBookings.reduce(
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
                        const netRevenue = totalGross - totalCommissions;
                        return netRevenue.toFixed(2);
                      })()}{" "}
                      CHF
                    </div>
                    <p className="text-xs text-muted-foreground">
                      après déduction des frais
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
                      {
                        roomsWithInventory.filter((r) => r.inventory === 0)
                          .length
                      }{" "}
                      places occupées
                    </p>
                  </CardContent>
                </Card>
              </div>
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

            {/* Graphiques analytiques */}
            {finalIsStripeConfigured && dbRooms.length > 0 && (
              <div className="mt-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      Analyses et statistiques
                    </h2>
                    <p className="text-muted-foreground">
                      Visualisez les performances de votre établissement
                    </p>
                  </div>
                  {currentBookings.length > 0 && (
                    <ChartColorSelector
                      onColorsChange={handleColorsChange}
                      currentColors={chartColors}
                    />
                  )}
                </div>
                <DashboardCharts
                  bookings={currentBookings}
                  rooms={roomsWithInventory}
                  colors={chartColors}
                  establishment={{
                    commissionRate: establishment.commissionRate,
                    fixedFee: establishment.fixedFee,
                  }}
                />
              </div>
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
              <BookingsTable bookings={allBookings} />
            </CardContent>
          </Card>
        );

      case "export-excel":
        return (
          <div className="max-w-4xl mx-auto">
            <ExcelExportManager hotelSlug={hotel} />
          </div>
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
      />

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
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
    </div>
  );
}
