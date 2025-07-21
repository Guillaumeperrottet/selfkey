"use client";

import { useMemo, useCallback } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp, Users, Calendar, Euro, BarChart3 } from "lucide-react";

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

interface Room {
  id: string;
  name: string;
  price: number;
  inventory: number;
  isActive: boolean;
}

interface ChartColors {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

interface DashboardChartsProps {
  bookings: Booking[];
  rooms: Room[];
  colors?: ChartColors;
  establishment?: {
    commissionRate: number;
    fixedFee: number;
  };
}

export function DashboardCharts({
  bookings,
  rooms,
  colors,
  establishment,
}: DashboardChartsProps) {
  // Fonction pour calculer le revenu net après commissions
  const calculateNetRevenue = useCallback(
    (bookings: Booking[]) => {
      if (!establishment) {
        return bookings.reduce((sum, b) => sum + b.amount, 0);
      }

      return bookings.reduce((sum, booking) => {
        const commission = Math.round(
          (booking.amount * establishment.commissionRate) / 100 +
            establishment.fixedFee
        );
        return sum + (booking.amount - commission);
      }, 0);
    },
    [establishment]
  );
  // Couleurs par défaut ou couleurs personnalisées
  const chartColors = useMemo(
    () =>
      colors || {
        chart1: "hsl(var(--chart-1))",
        chart2: "hsl(var(--chart-2))",
        chart3: "hsl(var(--chart-3))",
        chart4: "hsl(var(--chart-4))",
        chart5: "hsl(var(--chart-5))",
      },
    [colors]
  );

  // Chart configs
  const monthlyChartConfig = {
    reservations: {
      label: "Réservations",
      color: chartColors.chart1,
    },
  } satisfies ChartConfig;

  const revenueChartConfig = {
    revenus: {
      label: "Revenus nets",
      color: chartColors.chart2,
    },
  } satisfies ChartConfig;

  const roomsChartConfig = {
    reservations: {
      label: "Réservations",
      color: chartColors.chart3,
    },
  } satisfies ChartConfig;

  const guestChartConfig = {
    "1-personne": {
      label: "1 personne",
      color: chartColors.chart1,
    },
    "2-personnes": {
      label: "2 personnes",
      color: chartColors.chart2,
    },
    "3-4-personnes": {
      label: "3-4 personnes",
      color: chartColors.chart3,
    },
    "5plus-personnes": {
      label: "5+ personnes",
      color: chartColors.chart4,
    },
  } satisfies ChartConfig;

  // Données pour le graphique des réservations par mois
  const monthlyBookingsData = useMemo(() => {
    const last6Months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString("fr-FR", { month: "short" });

      const monthBookings = bookings.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        return (
          bookingDate.getMonth() === month.getMonth() &&
          bookingDate.getFullYear() === month.getFullYear()
        );
      });

      last6Months.push({
        month: monthName,
        reservations: monthBookings.length,
        revenus: calculateNetRevenue(monthBookings),
        clients: monthBookings.reduce((sum, b) => sum + b.guests, 0),
      });
    }

    return last6Months;
  }, [bookings, calculateNetRevenue]);

  // Données pour le graphique des chambres
  const roomsData = useMemo(() => {
    return rooms.map((room) => {
      const roomBookings = bookings.filter((b) => b.room.name === room.name);
      const totalRevenue = calculateNetRevenue(roomBookings);

      return {
        name: room.name,
        reservations: roomBookings.length,
        revenus: totalRevenue,
        prix: room.price,
        statut: room.isActive ? "active" : "inactive",
      };
    });
  }, [rooms, bookings, calculateNetRevenue]);

  // Données pour le graphique de l'évolution des revenus
  const revenueData = useMemo(() => {
    const last30Days = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i
      );
      const dayBookings = bookings.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate.toDateString() === date.toDateString();
      });

      last30Days.push({
        date: date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        }),
        revenus: calculateNetRevenue(dayBookings),
        reservations: dayBookings.length,
      });
    }

    return last30Days;
  }, [bookings, calculateNetRevenue]);

  // Données pour le graphique de répartition des clients
  const guestDistributionData = useMemo(() => {
    const distribution = bookings.reduce(
      (acc, booking) => {
        const guestCount = booking.guests;
        const key =
          guestCount === 1
            ? "1 personne"
            : guestCount === 2
              ? "2 personnes"
              : guestCount <= 4
                ? "3-4 personnes"
                : "5+ personnes";

        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const colorMap = {
      "1 personne": chartColors.chart1,
      "2 personnes": chartColors.chart2,
      "3-4 personnes": chartColors.chart3,
      "5+ personnes": chartColors.chart4,
    };

    return Object.entries(distribution).map(([key, value]) => ({
      name: key,
      value,
      fill: colorMap[key as keyof typeof colorMap] || chartColors.chart1,
    }));
  }, [bookings, chartColors]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
      {bookings.length === 0 ? (
        // Message explicatif quand il n'y a pas de réservations
        <div className="col-span-full">
          <Card>
            <CardContent className="text-center py-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Analyses et statistiques</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Les graphiques de performance s&apos;afficheront
                    automatiquement dès que vous recevrez vos premières
                    réservations. Vous pourrez alors analyser vos revenus, le
                    taux d&apos;occupation et les tendances.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Graphique des réservations par mois */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Réservations par mois
              </CardTitle>
              <CardDescription>
                Évolution des réservations sur les 6 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={monthlyChartConfig}
                className="min-h-[300px]"
              >
                <BarChart accessibilityLayer data={monthlyBookingsData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="reservations"
                    fill="var(--color-reservations)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Graphique des revenus par jour */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Évolution des revenus nets
              </CardTitle>
              <CardDescription>
                Revenus nets quotidiens sur les 30 derniers jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={revenueChartConfig}
                className="min-h-[300px]"
              >
                <AreaChart accessibilityLayer data={revenueData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="revenus"
                    type="monotone"
                    fill="var(--color-revenus)"
                    fillOpacity={0.4}
                    stroke="var(--color-revenus)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Graphique des chambres par performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Performance des chambres
              </CardTitle>
              <CardDescription>
                Nombre de réservations par chambre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={roomsChartConfig}
                className="min-h-[300px]"
              >
                <BarChart accessibilityLayer data={roomsData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="reservations"
                    fill="var(--color-reservations)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Graphique de répartition des clients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Répartition des clients
              </CardTitle>
              <CardDescription>
                Nombre de personnes par réservation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={guestChartConfig}
                className="min-h-[300px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={guestDistributionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {guestDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
