"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Moon,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Minus,
  Percent,
  Calendar,
  Users,
  Baby,
  Dog,
  Clock,
  Zap,
  CalendarDays,
  Building2,
  BedDouble,
  PieChart,
  Landmark,
  Receipt,
  Trophy,
} from "lucide-react";
import type { ComputedStats } from "@/hooks/useDashboardStats";

interface StatCardProps {
  statId: string;
  stats: ComputedStats;
  enableDayParking?: boolean;
}

export function StatCard({ statId, stats }: StatCardProps) {
  // Rendu selon le type de stat
  switch (statId) {
    case "avgRevenuePerBooking":
      return (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenu moyen / réservation
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.avgRevenuePerBooking.toFixed(2)} CHF
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valeur moyenne par booking
            </p>
          </CardContent>
        </Card>
      );

    case "revenuePerNight":
      return (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenu moyen / nuit
            </CardTitle>
            <Moon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.revenuePerNight.toFixed(2)} CHF
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Performance journalière
            </p>
          </CardContent>
        </Card>
      );

    case "avgBasketWithOptions":
      return (
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Panier moyen (avec options)
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {stats.avgBasketWithOptions.toFixed(2)} CHF
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Impact des options tarifaires
            </p>
          </CardContent>
        </Card>
      );

    case "revenueEvolution":
      return (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Évolution du revenu
            </CardTitle>
            {stats.revenueEvolution.trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : stats.revenueEvolution.trend === "down" ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-gray-400" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.revenueEvolution.trend === "up"
                  ? "text-green-600"
                  : stats.revenueEvolution.trend === "down"
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              {stats.revenueEvolution.trend === "up" && "+"}
              {stats.revenueEvolution.trend === "down" && "-"}
              {stats.revenueEvolution.percentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs période précédente
            </p>
          </CardContent>
        </Card>
      );

    case "commissionTotal":
      return (
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Commission moyenne
            </CardTitle>
            <Percent className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.commissionTotal.toFixed(2)} CHF
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Par réservation
            </p>
          </CardContent>
        </Card>
      );

    case "avgStayDuration":
      return (
        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Durée moyenne de séjour
            </CardTitle>
            <Calendar className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">
              {stats.avgStayDuration.toFixed(1)}{" "}
              {stats.avgStayDuration === 1 ? "nuit" : "nuits"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Nombre moyen de nuits
            </p>
          </CardContent>
        </Card>
      );

    case "avgGroupSize":
      return (
        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taille moyenne des groupes
            </CardTitle>
            <Users className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">
              {stats.avgGroupSize.toFixed(1)} pers.
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Adultes + enfants
            </p>
          </CardContent>
        </Card>
      );

    case "childrenRate":
      return (
        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux d&apos;enfants
            </CardTitle>
            <Baby className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {stats.childrenRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Réservations avec enfants
            </p>
          </CardContent>
        </Card>
      );

    case "dogRate":
      return (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux d&apos;animaux
            </CardTitle>
            <Dog className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.dogRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avec option chien
            </p>
          </CardContent>
        </Card>
      );

    case "bookingLeadTime":
      return (
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Délai de réservation
            </CardTitle>
            <Clock className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {stats.bookingLeadTime.toFixed(0)}{" "}
              {stats.bookingLeadTime === 1 ? "jour" : "jours"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Réservé à l&apos;avance
            </p>
          </CardContent>
        </Card>
      );

    case "lastMinuteBookings":
      return (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dernière minute
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.lastMinuteBookings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Réservations &lt; 24h
            </p>
          </CardContent>
        </Card>
      );

    case "nightsSold":
      return (
        <Card className="border-l-4 border-l-slate-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nuitées vendues
            </CardTitle>
            <BedDouble className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">
              {stats.nightsSold}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Nombre total de nuits
            </p>
          </CardContent>
        </Card>
      );

    case "totalTaxCollected":
      return (
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxes collectées
            </CardTitle>
            <Landmark className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.totalTaxCollected.toFixed(2)} CHF
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total sur la période
            </p>
          </CardContent>
        </Card>
      );

    case "avgTaxPerBooking":
      return (
        <Card className="border-l-4 border-l-lime-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxe moyenne</CardTitle>
            <Receipt className="h-4 w-4 text-lime-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lime-600">
              {stats.avgTaxPerBooking.toFixed(2)} CHF
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Par réservation
            </p>
          </CardContent>
        </Card>
      );

    case "bestMonth":
      return (
        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meilleur mois</CardTitle>
            <Trophy className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {stats.bestMonth.month}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.bestMonth.revenue.toFixed(0)} CHF •{" "}
              {stats.bestMonth.bookings} réservations
            </p>
          </CardContent>
        </Card>
      );

    // Stats plus complexes avec des listes
    case "popularDays":
      const topDays = [...stats.popularDays]
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      return (
        <Card className="border-l-4 border-l-sky-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jours populaires
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topDays.map((day, index) => (
                <div
                  key={day.day}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">
                    {index + 1}. {day.day}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {day.count} ({day.percentage.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );

    case "roomOccupancyRate":
      const topRooms = stats.roomOccupancyRate.slice(0, 3);
      return (
        <Card className="border-l-4 border-l-fuchsia-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top chambres</CardTitle>
            <Building2 className="h-4 w-4 text-fuchsia-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topRooms.map((room, index) => (
                <div
                  key={room.roomId}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium truncate">
                    {index + 1}. {room.roomName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {room.count} ({room.rate.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );

    case "stayDistribution":
      return (
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Durées de séjour
            </CardTitle>
            <PieChart className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.stayDistribution.map((dist) => (
                <div
                  key={dist.duration}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{dist.duration}</span>
                  <span className="text-sm text-muted-foreground">
                    {dist.count} ({dist.percentage.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}
