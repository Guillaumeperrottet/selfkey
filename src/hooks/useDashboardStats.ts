import { useMemo } from "react";

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
  touristTaxTotal?: number;
  paymentStatus?: string;
  bookingType?: string;
  adults?: number;
  children?: number;
  hasDog?: boolean;
  pricingOptionsTotal?: number;
  platformCommission?: number;
  room: {
    id?: string;
    name: string;
    price?: number;
  } | null;
}

interface Establishment {
  commissionRate: number;
  fixedFee: number;
  enableDayParking?: boolean;
}

export interface ComputedStats {
  // Performance Financière
  avgRevenuePerBooking: number;
  revenuePerNight: number;
  avgBasketWithOptions: number;
  revenueEvolution: {
    percentage: number;
    trend: "up" | "down" | "neutral";
    previousRevenue: number;
    currentRevenue: number;
  };
  commissionTotal: number;

  // Comportement des Clients
  avgStayDuration: number;
  avgGroupSize: number;
  childrenRate: number;
  dogRate: number;
  bookingLeadTime: number;
  lastMinuteBookings: number;

  // Occupation
  popularDays: Array<{ day: string; count: number; percentage: number }>;
  bookingHours: Array<{ hour: number; count: number }>;
  roomOccupancyRate: Array<{
    roomId: string;
    roomName: string;
    count: number;
    rate: number;
  }>;
  nightsSold: number;
  stayDistribution: Array<{
    duration: string;
    count: number;
    percentage: number;
  }>;

  // Parking (si activé)
  parkingVsNights: {
    parkingRevenue: number;
    nightsRevenue: number;
    ratio: number;
  };
  avgParkingDuration: number;
  parkingAccommodationRatio: number;

  // Taxes de séjour
  totalTaxCollected: number;
  avgTaxPerBooking: number;
  taxEvolution: {
    percentage: number;
    trend: "up" | "down" | "neutral";
  };

  // Tendances
  bestMonth: {
    month: string;
    revenue: number;
    bookings: number;
  };
  occupancyTrend: Array<{ period: string; rate: number }>;
  seasonality: Array<{ season: string; revenue: number; bookings: number }>;
  nextMonthForecast: {
    estimatedRevenue: number;
    confirmedBookings: number;
  };
}

export function useDashboardStats(
  filteredBookings: Booking[],
  allBookings: Booking[],
  rooms: Room[],
  establishment: Establishment,
  periodFilter: string,
  getDateRange: (
    period: "today" | "week" | "month" | "quarter" | "year" | "all"
  ) => { start: Date; end: Date }
): ComputedStats {
  return useMemo(() => {
    const totalBookings = filteredBookings.length;
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.amount, 0);

    // ==================== PERFORMANCE FINANCIÈRE ====================

    // 1. Revenu moyen par réservation
    const avgRevenuePerBooking =
      totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // 2. Revenu moyen par nuit
    const totalNights = filteredBookings.reduce((sum, booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + Math.max(1, nights);
    }, 0);
    const revenuePerNight = totalNights > 0 ? totalRevenue / totalNights : 0;

    // 3. Panier moyen avec options
    const totalWithOptions = filteredBookings.reduce(
      (sum, b) => sum + b.amount + (b.pricingOptionsTotal || 0),
      0
    );
    const avgBasketWithOptions =
      totalBookings > 0 ? totalWithOptions / totalBookings : 0;

    // 4. Évolution du revenu (vs période précédente)
    const { start, end } = getDateRange(
      periodFilter as "today" | "week" | "month" | "quarter" | "year" | "all"
    );
    const periodDuration = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodDuration);
    const previousEnd = new Date(start);

    const previousBookings = allBookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= previousStart && bookingDate < previousEnd;
    });

    const previousRevenue = previousBookings.reduce(
      (sum, b) => sum + b.amount,
      0
    );
    const currentRevenue = totalRevenue;

    let revenueEvolution = {
      percentage: 0,
      trend: "neutral" as "up" | "down" | "neutral",
      previousRevenue,
      currentRevenue,
    };

    if (previousRevenue > 0) {
      const percentageChange =
        ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      revenueEvolution = {
        percentage: Math.abs(percentageChange),
        trend:
          percentageChange > 0
            ? "up"
            : percentageChange < 0
              ? "down"
              : "neutral",
        previousRevenue,
        currentRevenue,
      };
    }

    // 5. Commission moyenne par booking
    const totalCommissions = filteredBookings.reduce(
      (sum, b) => sum + (b.platformCommission || 0),
      0
    );
    const commissionTotal =
      totalBookings > 0 ? totalCommissions / totalBookings : 0;

    // ==================== COMPORTEMENT DES CLIENTS ====================

    // 1. Durée moyenne de séjour
    const avgStayDuration = totalBookings > 0 ? totalNights / totalBookings : 0;

    // 2. Taille moyenne des groupes
    const totalGuests = filteredBookings.reduce((sum, b) => sum + b.guests, 0);
    const avgGroupSize = totalBookings > 0 ? totalGuests / totalBookings : 0;

    // 3. Taux d'enfants
    const bookingsWithChildren = filteredBookings.filter(
      (b) => (b.children || 0) > 0
    ).length;
    const childrenRate =
      totalBookings > 0 ? (bookingsWithChildren / totalBookings) * 100 : 0;

    // 4. Taux d'animaux
    const bookingsWithDog = filteredBookings.filter(
      (b) => b.hasDog === true
    ).length;
    const dogRate =
      totalBookings > 0 ? (bookingsWithDog / totalBookings) * 100 : 0;

    // 5. Délai moyen de réservation
    const totalLeadTime = filteredBookings.reduce((sum, booking) => {
      const bookingDate = new Date(booking.bookingDate);
      const checkInDate = new Date(booking.checkInDate);
      const leadTime = Math.ceil(
        (checkInDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + Math.max(0, leadTime);
    }, 0);
    const bookingLeadTime =
      totalBookings > 0 ? totalLeadTime / totalBookings : 0;

    // 6. Réservations de dernière minute (< 24h)
    const lastMinuteBookings = filteredBookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      const checkInDate = new Date(booking.checkInDate);
      const hoursDiff =
        (checkInDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);
      return hoursDiff < 24;
    }).length;

    // ==================== OCCUPATION ====================

    // 1. Jours les plus populaires
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const daysCounts = new Array(7).fill(0);
    filteredBookings.forEach((booking) => {
      const dayOfWeek = new Date(booking.checkInDate).getDay();
      daysCounts[dayOfWeek]++;
    });
    const popularDays = daysCounts.map((count, index) => ({
      day: dayNames[index],
      count,
      percentage: totalBookings > 0 ? (count / totalBookings) * 100 : 0,
    }));

    // 2. Heures de réservation
    const hoursCounts = new Array(24).fill(0);
    filteredBookings.forEach((booking) => {
      const hour = new Date(booking.bookingDate).getHours();
      hoursCounts[hour]++;
    });
    const bookingHours = hoursCounts
      .map((count, hour) => ({ hour, count }))
      .filter((h) => h.count > 0);

    // 3. Taux de remplissage par chambre
    const roomStats = rooms.map((room) => {
      const count = filteredBookings.filter(
        (b) => b.room?.id === room.id
      ).length;
      return {
        roomId: room.id,
        roomName: room.name,
        count,
        rate: totalBookings > 0 ? (count / totalBookings) * 100 : 0,
      };
    });
    const roomOccupancyRate = roomStats.sort((a, b) => b.count - a.count);

    // 4. Nuitées vendues
    const nightsSold = totalNights;

    // 5. Distribution des durées de séjour
    const stayDurations: Record<string, number> = {};
    filteredBookings.forEach((booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      const key =
        nights === 1 ? "1 nuit" : nights === 2 ? "2 nuits" : "3+ nuits";
      stayDurations[key] = (stayDurations[key] || 0) + 1;
    });
    const stayDistribution = Object.entries(stayDurations).map(
      ([duration, count]) => ({
        duration,
        count,
        percentage: totalBookings > 0 ? (count / totalBookings) * 100 : 0,
      })
    );

    // ==================== PARKING ====================

    const parkingBookings = filteredBookings.filter(
      (b) => b.bookingType === "day"
    );
    const nightBookings = filteredBookings.filter(
      (b) => b.bookingType === "night"
    );

    const parkingRevenue = parkingBookings.reduce(
      (sum, b) => sum + b.amount,
      0
    );
    const nightsRevenue = nightBookings.reduce((sum, b) => sum + b.amount, 0);

    const parkingVsNights = {
      parkingRevenue,
      nightsRevenue,
      ratio: nightsRevenue > 0 ? (parkingRevenue / nightsRevenue) * 100 : 0,
    };

    const avgParkingDuration = 0; // À implémenter avec les données de durée de parking

    const parkingAccommodationRatio =
      totalBookings > 0 ? (parkingBookings.length / totalBookings) * 100 : 0;

    // ==================== TAXES DE SÉJOUR ====================

    const totalTaxCollected = filteredBookings.reduce(
      (sum, b) => sum + (b.touristTaxTotal || 0),
      0
    );

    const avgTaxPerBooking =
      totalBookings > 0 ? totalTaxCollected / totalBookings : 0;

    const previousTaxCollected = previousBookings.reduce(
      (sum, b) => sum + (b.touristTaxTotal || 0),
      0
    );

    let taxEvolution = {
      percentage: 0,
      trend: "neutral" as "up" | "down" | "neutral",
    };

    if (previousTaxCollected > 0) {
      const taxChange =
        ((totalTaxCollected - previousTaxCollected) / previousTaxCollected) *
        100;
      taxEvolution = {
        percentage: Math.abs(taxChange),
        trend: taxChange > 0 ? "up" : taxChange < 0 ? "down" : "neutral",
      };
    }

    // ==================== TENDANCES ====================

    // 1. Meilleur mois (simplifié - sur toutes les données)
    const monthlyStats: Record<string, { revenue: number; bookings: number }> =
      {};
    allBookings.forEach((booking) => {
      const month = new Date(booking.bookingDate).toLocaleString("fr-FR", {
        month: "long",
      });
      if (!monthlyStats[month]) {
        monthlyStats[month] = { revenue: 0, bookings: 0 };
      }
      monthlyStats[month].revenue += booking.amount;
      monthlyStats[month].bookings += 1;
    });

    let bestMonth = { month: "-", revenue: 0, bookings: 0 };
    Object.entries(monthlyStats).forEach(([month, stats]) => {
      if (stats.revenue > bestMonth.revenue) {
        bestMonth = { month, ...stats };
      }
    });

    // 2. Évolution taux d'occupation (simplifié)
    const occupancyTrend = [{ period: "Actuel", rate: 0 }];

    // 3. Saisonnalité (simplifié)
    const seasonality = [
      { season: "Printemps", revenue: 0, bookings: 0 },
      { season: "Été", revenue: 0, bookings: 0 },
      { season: "Automne", revenue: 0, bookings: 0 },
      { season: "Hiver", revenue: 0, bookings: 0 },
    ];

    // 4. Prévisions mois prochain (basé sur les réservations futures)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const futureBookings = allBookings.filter((b) => {
      const checkIn = new Date(b.checkInDate);
      return checkIn > new Date() && checkIn <= nextMonth;
    });

    const nextMonthForecast = {
      estimatedRevenue: futureBookings.reduce((sum, b) => sum + b.amount, 0),
      confirmedBookings: futureBookings.length,
    };

    return {
      // Performance Financière
      avgRevenuePerBooking,
      revenuePerNight,
      avgBasketWithOptions,
      revenueEvolution,
      commissionTotal,

      // Comportement des Clients
      avgStayDuration,
      avgGroupSize,
      childrenRate,
      dogRate,
      bookingLeadTime,
      lastMinuteBookings,

      // Occupation
      popularDays,
      bookingHours,
      roomOccupancyRate,
      nightsSold,
      stayDistribution,

      // Parking
      parkingVsNights,
      avgParkingDuration,
      parkingAccommodationRatio,

      // Taxes de séjour
      totalTaxCollected,
      avgTaxPerBooking,
      taxEvolution,

      // Tendances
      bestMonth,
      occupancyTrend,
      seasonality,
      nextMonthForecast,
    };
  }, [filteredBookings, allBookings, rooms, periodFilter, getDateRange]);
}
