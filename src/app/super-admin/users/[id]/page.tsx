"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  User,
  Building2,
  Receipt,
  TrendingUp,
  FileDown,
  Users,
  Banknote,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface UserStats {
  user: {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
    emailVerified: boolean | null;
  };
  stats: {
    global: {
      totalEstablishments: number;
      totalBookings: number;
      totalRevenue: number;
      totalTouristTax: number;
      totalPersons: number;
      totalExports: number;
    };
    monthly: Array<{
      month: string;
      revenue: number;
      tax: number;
      bookings: number;
      persons: number;
    }>;
    establishments: Array<{
      id: string;
      name: string;
      slug: string;
      revenue: number;
      tax: number;
      bookings: number;
      persons: number;
    }>;
    recentExports: Array<{
      id: string;
      fileName: string;
      recordsCount: number;
      exportedAt: string;
      establishmentSlug: string;
    }>;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/super-admin/users/${params.id}/stats`
        );

        if (!response.ok) {
          if (response.status === 404) {
            toastUtils.error("Utilisateur non trouvé");
            router.push("/super-admin");
            return;
          }
          throw new Error("Erreur lors de la récupération des données");
        }

        const data = await response.json();
        setUserStats(data);
      } catch (error) {
        console.error("Erreur:", error);
        toastUtils.error("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const exportUserData = async () => {
    try {
      setExportLoading(true);
      const response = await fetch(
        `/api/super-admin/users/${params.id}/export`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `export-utilisateur-${userStats?.user.name || "utilisateur"}-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toastUtils.success("Export terminé avec succès");
    } catch (error) {
      console.error("Erreur export:", error);
      toastUtils.error("Impossible d'exporter les données");
    } finally {
      setExportLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Utilisateur non trouvé
          </h1>
          <Button onClick={() => router.push("/super-admin")} className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/super-admin")}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-8 h-8" />
                {userStats.user.name || "Utilisateur sans nom"}
              </h1>
              <p className="text-gray-600">
                {userStats.user.email} • Membre depuis le{" "}
                {formatDate(userStats.user.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={exportUserData}
              disabled={exportLoading}
              className="bg-green-600 hover:bg-green-700"
              title="Exporter toutes les données de l'utilisateur : informations personnelles, établissements, réservations, sessions, exports, statistiques complètes"
            >
              <FileDown className="w-4 h-4 mr-2" />
              {exportLoading ? "Export..." : "Export Excel Complet"}
            </Button>
            <Badge
              variant={userStats.user.emailVerified ? "default" : "secondary"}
            >
              {userStats.user.emailVerified
                ? "Email vérifié"
                : "Email non vérifié"}
            </Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Établissements
                  </p>
                  <p className="text-2xl font-bold">
                    {userStats.stats.global.totalEstablishments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Réservations
                  </p>
                  <p className="text-2xl font-bold">
                    {userStats.stats.global.totalBookings.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Banknote className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Revenus Total
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(userStats.stats.global.totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Taxe de Séjour
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(userStats.stats.global.totalTouristTax)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Personnes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {userStats.stats.global.totalPersons.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileDown className="w-4 h-4 text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Exports</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {userStats.stats.global.totalExports}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution mensuelle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Évolution Mensuelle
              </CardTitle>
              <CardDescription>
                Revenus et taxes des 6 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userStats.stats.monthly}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === "revenue" ? "Revenus" : "Taxe de séjour",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#0088FE"
                      fill="#0088FE"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="tax"
                      stackId="1"
                      stroke="#00C49F"
                      fill="#00C49F"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Répartition par établissement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Répartition des Revenus
              </CardTitle>
              <CardDescription>Par établissement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userStats.stats.establishments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {userStats.stats.establishments.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistiques par établissement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Détails par Établissement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Établissement</TableHead>
                    <TableHead className="text-right">Revenus</TableHead>
                    <TableHead className="text-right">Réservations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStats.stats.establishments.map((establishment) => (
                    <TableRow key={establishment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{establishment.name}</p>
                          <p className="text-sm text-gray-500">
                            /{establishment.slug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium text-green-600">
                            {formatCurrency(establishment.revenue)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(establishment.tax)} taxe
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">
                            {establishment.bookings}
                          </p>
                          <p className="text-sm text-gray-500">
                            {establishment.persons} pers.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Exports récents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="w-5 h-5" />
                Exports Récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fichier</TableHead>
                    <TableHead className="text-right">
                      Enregistrements
                    </TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStats.stats.recentExports.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-gray-500 py-8"
                      >
                        Aucun export trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    userStats.stats.recentExports.map((exportItem) => (
                      <TableRow key={exportItem.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {exportItem.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              /{exportItem.establishmentSlug}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">
                            {exportItem.recordsCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatDate(exportItem.exportedAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
