// Types pour les statistiques personnalisables du dashboard

export type StatCategory =
  | "financialPerformance"
  | "clientBehavior"
  | "occupancy"
  | "parking"
  | "touristTax"
  | "trends";

export interface StatDefinition {
  id: string;
  label: string;
  description: string;
  category: StatCategory;
  icon: string;
}

export type DashboardSectionType =
  | "customStats"
  | "existingStats"
  | "charts"
  | "recentBookings";

export interface DashboardSection {
  id: DashboardSectionType;
  label: string;
  visible: boolean;
}

export interface DashboardPreferences {
  visibleStats: {
    [key in StatCategory]?: string[];
  };
  sectionOrder?: DashboardSectionType[];
  hiddenSections?: DashboardSectionType[];
}

// Définition de toutes les statistiques disponibles
export const AVAILABLE_STATS: Record<StatCategory, StatDefinition[]> = {
  financialPerformance: [
    {
      id: "avgRevenuePerBooking",
      label: "Revenu moyen / réservation",
      description: "Valeur moyenne de chaque booking",
      category: "financialPerformance",
      icon: "DollarSign",
    },
    {
      id: "revenuePerNight",
      label: "Revenu moyen / nuit",
      description: "Performance journalière moyenne",
      category: "financialPerformance",
      icon: "Moon",
    },
    {
      id: "avgBasketWithOptions",
      label: "Panier moyen (avec options)",
      description: "Impact des options tarifaires",
      category: "financialPerformance",
      icon: "ShoppingCart",
    },
    {
      id: "revenueEvolution",
      label: "Évolution du revenu",
      description: "Comparaison période actuelle vs précédente",
      category: "financialPerformance",
      icon: "TrendingUp",
    },
    {
      id: "commissionTotal",
      label: "Commission moyenne / booking",
      description: "Commission plateforme par réservation",
      category: "financialPerformance",
      icon: "Percent",
    },
  ],
  clientBehavior: [
    {
      id: "avgStayDuration",
      label: "Durée moyenne de séjour",
      description: "Nombre moyen de nuits par réservation",
      category: "clientBehavior",
      icon: "Calendar",
    },
    {
      id: "avgGroupSize",
      label: "Taille moyenne des groupes",
      description: "Nombre moyen de personnes (adultes + enfants)",
      category: "clientBehavior",
      icon: "Users",
    },
    {
      id: "childrenRate",
      label: "Taux d'enfants",
      description: "Pourcentage de réservations avec enfants",
      category: "clientBehavior",
      icon: "Baby",
    },
    {
      id: "dogRate",
      label: "Taux d'animaux",
      description: "Pourcentage avec option chien",
      category: "clientBehavior",
      icon: "Dog",
    },
    {
      id: "bookingLeadTime",
      label: "Délai de réservation",
      description: "Combien de jours à l'avance les clients réservent",
      category: "clientBehavior",
      icon: "Clock",
    },
    {
      id: "lastMinuteBookings",
      label: "Réservations de dernière minute",
      description: "Réservations faites moins de 24h avant l'arrivée",
      category: "clientBehavior",
      icon: "Zap",
    },
  ],
  occupancy: [
    {
      id: "popularDays",
      label: "Jours les plus populaires",
      description: "Quels jours de la semaine sont les plus réservés",
      category: "occupancy",
      icon: "CalendarDays",
    },
    {
      id: "bookingHours",
      label: "Heures de réservation",
      description: "À quelle heure les clients réservent le plus",
      category: "occupancy",
      icon: "Clock3",
    },
    {
      id: "roomOccupancyRate",
      label: "Taux de remplissage par chambre",
      description: "Quelle chambre/place est la plus demandée",
      category: "occupancy",
      icon: "Building2",
    },
    {
      id: "nightsSold",
      label: "Nuitées vendues",
      description: "Nombre total de nuits vendues vs places disponibles",
      category: "occupancy",
      icon: "BedDouble",
    },
    {
      id: "stayDistribution",
      label: "Distribution des durées de séjour",
      description: "1 nuit, 2 nuits, 3+ nuits",
      category: "occupancy",
      icon: "PieChart",
    },
  ],
  parking: [
    {
      id: "parkingVsNights",
      label: "Revenus parking vs nuitées",
      description: "Comparaison des deux sources",
      category: "parking",
      icon: "ParkingCircle",
    },
    {
      id: "avgParkingDuration",
      label: "Durée moyenne de stationnement",
      description: "Performance du parking",
      category: "parking",
      icon: "Timer",
    },
    {
      id: "parkingAccommodationRatio",
      label: "Ratio parking/hébergement",
      description: "Mix des services",
      category: "parking",
      icon: "Ratio",
    },
  ],
  touristTax: [
    {
      id: "totalTaxCollected",
      label: "Total collecté sur la période",
      description: "Important pour vos déclarations",
      category: "touristTax",
      icon: "Landmark",
    },
    {
      id: "avgTaxPerBooking",
      label: "Taxe moyenne par réservation",
      description: "Performance fiscale",
      category: "touristTax",
      icon: "Receipt",
    },
    {
      id: "taxEvolution",
      label: "Évolution mensuelle des taxes",
      description: "Tendance de collecte",
      category: "touristTax",
      icon: "LineChart",
    },
  ],
  trends: [
    {
      id: "bestMonth",
      label: "Meilleur mois de l'année",
      description: "Performance mensuelle",
      category: "trends",
      icon: "Trophy",
    },
    {
      id: "occupancyTrend",
      label: "Évolution du taux d'occupation",
      description: "Tendance sur 6-12 mois",
      category: "trends",
      icon: "TrendingUp",
    },
    {
      id: "seasonality",
      label: "Saisonnalité",
      description: "Identifier les hautes/basses saisons",
      category: "trends",
      icon: "Sun",
    },
    {
      id: "nextMonthForecast",
      label: "Prévisions pour le mois prochain",
      description: "Basé sur les réservations futures",
      category: "trends",
      icon: "TrendingUp",
    },
  ],
};

// Ordre par défaut des sections du dashboard
export const DEFAULT_SECTION_ORDER: DashboardSectionType[] = [
  "existingStats",
  "customStats",
  "charts",
];

// Labels des sections du dashboard
export const SECTION_LABELS: Record<DashboardSectionType, string> = {
  customStats: "📊 Statistiques Personnalisées",
  existingStats: "📈 Statistiques de Base",
  charts: "� Analyses et Graphiques",
  recentBookings: "📋 Réservations Récentes",
};

// Labels des catégories
export const CATEGORY_LABELS: Record<StatCategory, string> = {
  financialPerformance: "💰 Performance Financière",
  clientBehavior: "👥 Comportement des Clients",
  occupancy: "📅 Remplissage et Occupation",
  parking: "🅿️ Performance Parking",
  touristTax: "🏛️ Taxes de Séjour",
  trends: "📈 Tendances et Prévisions",
};

// Statistiques par défaut (affichées si l'utilisateur n'a pas encore configuré)
export const DEFAULT_VISIBLE_STATS: DashboardPreferences = {
  visibleStats: {
    financialPerformance: ["avgRevenuePerBooking", "revenueEvolution"],
    clientBehavior: ["avgStayDuration", "bookingLeadTime"],
    occupancy: ["roomOccupancyRate"],
    touristTax: ["totalTaxCollected"],
  },
  sectionOrder: DEFAULT_SECTION_ORDER,
  hiddenSections: [],
};
