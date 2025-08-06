"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Building2,
  Calendar,
  Zap,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface MonitoringData {
  timestamp: string;
  period: string;
  summary: {
    totalCreated: number;
    successfulCreations: number;
    problematicCreations: number;
    criticalIssues: number;
    warningIssues: number;
  };
  recentCreations: Array<{
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    status: "success" | "warning" | "critical";
    issues: string[];
    userCount: number;
    users: Array<{
      email: string;
      role: string;
    }>;
    bookingCount: number;
  }>;
  weeklyTrends: Array<{
    creation_date: string;
    total_establishments: number;
    establishments_with_users: number;
    orphaned_establishments: number;
  }>;
  recommendations: Array<{
    priority: "critical" | "high" | "medium" | "info";
    message: string;
    action: string;
    apiEndpoint?: string;
  }>;
  systemHealth: {
    overallScore: number;
    status: "healthy" | "warning" | "critical";
  };
}

export default function SuperAdminMonitoring() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMonitoringData = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/super-admin/monitor-creations");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      const data = await response.json();
      setMonitoring(data);
    } catch (error) {
      console.error("Erreur monitoring:", error);
      toastUtils.error("Impossible de récupérer les données de monitoring");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/check-super-admin");
        const data = await response.json();
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
          fetchMonitoringData();
        } else {
          window.location.href = "/super-admin";
        }
      } catch (error) {
        console.error("Erreur vérification auth:", error);
        window.location.href = "/super-admin";
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [fetchMonitoringData]);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      fetchMonitoringData();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, fetchMonitoringData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "critical":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-xl">
                      Monitoring Temps Réel
                    </CardTitle>
                    <CardDescription>
                      Surveillance des créations d&apos;établissements et santé
                      du système
                    </CardDescription>
                  </div>
                </div>
                {monitoring && (
                  <Badge
                    variant="outline"
                    className={`${
                      monitoring.systemHealth.status === "healthy"
                        ? "border-green-500 text-green-700"
                        : monitoring.systemHealth.status === "warning"
                          ? "border-yellow-500 text-yellow-700"
                          : "border-red-500 text-red-700"
                    }`}
                  >
                    Santé: {monitoring.systemHealth.overallScore}%
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={fetchMonitoringData}
                  variant="outline"
                  size="sm"
                  disabled={refreshing}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing ? "Actualisation..." : "Actualiser"}
                </Button>

                <Button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  variant={autoRefresh ? "default" : "outline"}
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {autoRefresh ? "Auto ON" : "Auto OFF"}
                </Button>

                <Button variant="outline" asChild size="sm">
                  <Link href="/super-admin">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {monitoring && (
          <>
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Créations 24h
                      </p>
                      <p className="text-2xl font-bold">
                        {monitoring.summary.totalCreated}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Succès
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {monitoring.summary.successfulCreations}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avertissements
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {monitoring.summary.warningIssues}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Critiques
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {monitoring.summary.criticalIssues}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Score Santé
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {monitoring.systemHealth.overallScore}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommandations */}
            {monitoring.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Recommandations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monitoring.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{rec.message}</p>
                            <p className="text-sm mt-1">{rec.action}</p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {rec.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Créations récentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Créations Récentes (24h)
                </CardTitle>
                <CardDescription>
                  Dernière mise à jour: {formatDateTime(monitoring.timestamp)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monitoring.recentCreations.length > 0 ? (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Établissement</TableHead>
                          <TableHead className="text-center">Statut</TableHead>
                          <TableHead className="text-center">
                            Utilisateurs
                          </TableHead>
                          <TableHead className="text-center">
                            Réservations
                          </TableHead>
                          <TableHead className="text-center">Créé le</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monitoring.recentCreations.map((creation) => (
                          <TableRow key={creation.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{creation.name}</p>
                                <p className="text-sm text-gray-500">
                                  {creation.slug}
                                </p>
                                {creation.issues.length > 0 && (
                                  <div className="mt-1">
                                    {creation.issues.map((issue, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="destructive"
                                        className="text-xs mr-1"
                                      >
                                        {issue}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                {getStatusIcon(creation.status)}
                                <Badge
                                  className={getStatusColor(creation.status)}
                                >
                                  {creation.status.toUpperCase()}
                                </Badge>
                              </div>
                            </TableCell>

                            <TableCell className="text-center">
                              <div>
                                <span className="font-medium">
                                  {creation.userCount}
                                </span>
                                {creation.users.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {creation.users.map((user, idx) => (
                                      <div key={idx}>
                                        {user.email} ({user.role})
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-center">
                              <span className="font-medium">
                                {creation.bookingCount}
                              </span>
                            </TableCell>

                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span className="text-sm">
                                  {formatDateTime(creation.createdAt)}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucune création d&apos;établissement dans les dernières 24
                    heures
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tendances hebdomadaires */}
            {monitoring.weeklyTrends.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Tendances Hebdomadaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-center">
                            Total Créations
                          </TableHead>
                          <TableHead className="text-center">
                            Avec Utilisateurs
                          </TableHead>
                          <TableHead className="text-center">
                            Orphelins
                          </TableHead>
                          <TableHead className="text-center">
                            Taux de Succès
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monitoring.weeklyTrends.map((trend, index) => {
                          const total = Number(trend.total_establishments);
                          const withUsers = Number(
                            trend.establishments_with_users
                          );
                          const orphaned = Number(
                            trend.orphaned_establishments
                          );
                          const successRate =
                            total > 0
                              ? Math.round((withUsers / total) * 100)
                              : 100;

                          return (
                            <TableRow key={index}>
                              <TableCell>
                                {new Date(
                                  trend.creation_date
                                ).toLocaleDateString("fr-FR")}
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {total}
                              </TableCell>
                              <TableCell className="text-center text-green-600 font-medium">
                                {withUsers}
                              </TableCell>
                              <TableCell className="text-center">
                                {orphaned > 0 ? (
                                  <Badge variant="destructive">
                                    {orphaned}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-500">0</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={
                                    successRate === 100
                                      ? "default"
                                      : successRate >= 90
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {successRate}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
