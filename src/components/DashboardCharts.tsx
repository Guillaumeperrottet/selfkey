"use client";

import { useMemo } from "react";
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
import { TrendingUp, Users, Calendar, Euro } from "lucide-react";

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

interface DashboardChartsProps {
  bookings: Booking[];
  rooms: Room[];
}

export function DashboardCharts({ bookings, rooms }: DashboardChartsProps) {
  // Chart configs
  const monthlyChartConfig = {
    reservations: {
      label: "Réservations",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const revenueChartConfig = {
    revenus: {
      label: "Revenus",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const roomsChartConfig = {
    reservations: {
      label: "Réservations",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  const guestChartConfig = {
    "1-personne": {
      label: "1 personne",
      color: "hsl(var(--chart-1))",
    },
    "2-personnes": {
      label: "2 personnes",
      color: "hsl(var(--chart-2))",
    },
    "3-4-personnes": {
      label: "3-4 personnes",
      color: "hsl(var(--chart-3))",
    },
    "5plus-personnes": {
      label: "5+ personnes",
      color: "hsl(var(--chart-4))",
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
        revenus: monthBookings.reduce((sum, b) => sum + b.amount, 0),
        clients: monthBookings.reduce((sum, b) => sum + b.guests, 0),
      });
    }

    return last6Months;
  }, [bookings]);

  // Données pour le graphique des chambres
  const roomsData = useMemo(() => {
    return rooms.map((room) => {
      const roomBookings = bookings.filter((b) => b.room.name === room.name);
      const totalRevenue = roomBookings.reduce((sum, b) => sum + b.amount, 0);

      return {
        name: room.name,
        reservations: roomBookings.length,
        revenus: totalRevenue,
        prix: room.price,
        statut: room.isActive ? "active" : "inactive",
      };
    });
  }, [rooms, bookings]);

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
        revenus: dayBookings.reduce((sum, b) => sum + b.amount, 0),
        reservations: dayBookings.length,
      });
    }

    return last30Days;
  }, [bookings]);

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

    return Object.entries(distribution).map(([key, value]) => ({
      name: key,
      value,
      fill: `var(--color-${key.replace(/\s+/g, "-").replace(/\+/g, "plus")})`,
    }));
  }, [bookings]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
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
          <ChartContainer config={monthlyChartConfig} className="min-h-[300px]">
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
            Évolution des revenus
          </CardTitle>
          <CardDescription>
            Revenus quotidiens sur les 30 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueChartConfig} className="min-h-[300px]">
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
          <CardDescription>Nombre de réservations par chambre</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={roomsChartConfig} className="min-h-[300px]">
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
          <CardDescription>Nombre de personnes par réservation</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={guestChartConfig} className="min-h-[300px]">
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
    </div>
  );
}
