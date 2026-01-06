"use client";

import { useState, useEffect, useCallback } from "react";
import SuperAdminLayout from "@/components/super-admin/SuperAdminLayout";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number | null;
  createdAt: string;
  ipAddress: string | null;
  queryParams: Record<string, string> | null;
  responseBody: Record<string, unknown> | null;
  apiKey: {
    name: string;
  } | null;
}

interface WebhookLog {
  id: string;
  event: string;
  url: string;
  statusCode: number | null;
  success: boolean;
  attempt: number;
  executionTime: number | null;
  createdAt: string;
  webhook: {
    name: string;
  };
  error: string | null;
  payload: unknown;
  responseBody: unknown;
}

interface Stats {
  totalApiCalls: number;
  totalWebhooks: number;
  apiErrors: number;
  webhookErrors: number;
  avgResponseTime: number;
  last24hCalls: number;
}

export default function MonitoringApiPage() {
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalApiCalls: 0,
    totalWebhooks: 0,
    apiErrors: 0,
    webhookErrors: 0,
    avgResponseTime: 0,
    last24hCalls: 0,
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<ApiLog | WebhookLog | null>(
    null
  );
  const [logType, setLogType] = useState<"api" | "webhook">("api");

  // Pagination & Filtres
  const [apiPage, setApiPage] = useState(1);
  const [webhookPage, setWebhookPage] = useState(1);
  const [apiLimit, setApiLimit] = useState(50);
  const [webhookLimit, setWebhookLimit] = useState(50);
  const [apiTotal, setApiTotal] = useState(0);
  const [webhookTotal, setWebhookTotal] = useState(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Charger les données
  const loadData = useCallback(async () => {
    try {
      // Construire les query params
      const apiParams = new URLSearchParams({
        limit: apiLimit.toString(),
        offset: ((apiPage - 1) * apiLimit).toString(),
      });

      const webhookParams = new URLSearchParams({
        limit: webhookLimit.toString(),
        offset: ((webhookPage - 1) * webhookLimit).toString(),
      });

      // Ajouter les filtres de date si présents
      if (startDate) {
        apiParams.append("startDate", startDate);
        webhookParams.append("startDate", startDate);
      }
      if (endDate) {
        apiParams.append("endDate", endDate);
        webhookParams.append("endDate", endDate);
      }

      const [apiRes, webhookRes] = await Promise.all([
        fetch(`/api/super-admin/monitoring/api-logs?${apiParams}`),
        fetch(`/api/super-admin/monitoring/webhook-logs?${webhookParams}`),
      ]);

      if (apiRes.ok) {
        const data = await apiRes.json();
        setApiLogs(data.logs || []);
        setApiTotal(data.pagination?.total || 0);
        setStats((prev) => ({
          ...prev,
          totalApiCalls: data.stats?.total || 0,
          apiErrors: data.stats?.errors || 0,
          avgResponseTime: data.stats?.avgResponseTime || 0,
          last24hCalls: data.stats?.last24h || 0,
        }));
      }

      if (webhookRes.ok) {
        const data = await webhookRes.json();
        setWebhookLogs(data.logs || []);
        setWebhookTotal(data.pagination?.total || 0);
        setStats((prev) => ({
          ...prev,
          totalWebhooks: data.stats?.total || 0,
          webhookErrors: data.stats?.errors || 0,
        }));
      }
    } catch (error) {
      console.error("Error loading monitoring data:", error);
    } finally {
      setLoading(false);
    }
  }, [apiPage, webhookPage, apiLimit, webhookLimit, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh toutes les 5 secondes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  // Filtrer les logs API
  const filteredApiLogs = apiLogs.filter((log) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "success")
      return log.statusCode >= 200 && log.statusCode < 300;
    if (filterStatus === "error") return log.statusCode >= 400;
    return true;
  });

  // Filtrer les logs webhook
  const filteredWebhookLogs = webhookLogs.filter((log) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "success") return log.success;
    if (filterStatus === "error") return !log.success;
    return true;
  });

  const getStatusBadge = (statusCode: number | null, success?: boolean) => {
    if (success !== undefined) {
      return success ? (
        <Badge className="bg-green-500">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Succès
        </Badge>
      ) : (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Échec
        </Badge>
      );
    }

    if (!statusCode) return <Badge variant="secondary">N/A</Badge>;

    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-500">{statusCode}</Badge>;
    }
    if (statusCode >= 400 && statusCode < 500) {
      return <Badge variant="destructive">{statusCode}</Badge>;
    }
    if (statusCode >= 500) {
      return <Badge variant="destructive">{statusCode}</Badge>;
    }
    return <Badge variant="secondary">{statusCode}</Badge>;
  };

  // Fonction pour obtenir l'explication du code de statut
  const getStatusExplanation = (statusCode: number | null): string => {
    if (!statusCode) return "N/A";

    const statusExplanations: Record<number, string> = {
      200: "✅ Succès",
      201: "✅ Créé",
      204: "✅ Pas de contenu",
      400: "❌ Requête invalide",
      401: "🔒 Non authentifié (clé manquante/invalide)",
      403: "🚫 Accès refusé (pas les permissions)",
      404: "🔍 Non trouvé",
      405: "❌ Méthode non autorisée",
      429: "⏱️ Trop de requêtes",
      500: "💥 Erreur serveur",
      502: "🔌 Erreur passerelle",
      503: "⚠️ Service indisponible",
      504: "⏰ Timeout passerelle",
    };

    return statusExplanations[statusCode] || `Code ${statusCode}`;
  };

  const formatTime = (ms: number | null) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Monitoring API & Webhooks</h1>
            <p className="text-muted-foreground">
              Suivi en temps réel de l&apos;activité de l&apos;API
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
            <Button onClick={loadData} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Requêtes API (24h)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.last24hCalls}</div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total: {stats.totalApiCalls}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Webhooks envoyés (24h)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.totalWebhooks}</div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Succès: {stats.totalWebhooks - stats.webhookErrors}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Temps de réponse moyen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {stats.avgResponseTime < 1000
                    ? `${stats.avgResponseTime.toFixed(0)}ms`
                    : `${(stats.avgResponseTime / 1000).toFixed(2)}s`}
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.avgResponseTime < 200 ? "Excellent" : "Bon"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Taux d&apos;erreur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {stats.totalApiCalls > 0
                    ? ((stats.apiErrors / stats.totalApiCalls) * 100).toFixed(1)
                    : 0}
                  %
                </div>
                <AlertTriangle
                  className={`w-8 h-8 ${
                    stats.apiErrors > 10 ? "text-red-500" : "text-yellow-500"
                  }`}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.apiErrors} erreurs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtres & Pagination
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="success">
                      ✅ Succès uniquement
                    </SelectItem>
                    <SelectItem value="error">❌ Erreurs uniquement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date de début */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de début
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Date de fin */}
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de fin
                </Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Limite API */}
              <div className="space-y-2">
                <Label htmlFor="apiLimit">Logs API par page</Label>
                <Select
                  value={apiLimit.toString()}
                  onValueChange={(value) => {
                    setApiLimit(parseInt(value));
                    setApiPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Limite Webhook */}
              <div className="space-y-2">
                <Label htmlFor="webhookLimit">Logs Webhook par page</Label>
                <Select
                  value={webhookLimit.toString()}
                  onValueChange={(value) => {
                    setWebhookLimit(parseInt(value));
                    setWebhookPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setApiPage(1);
                  setWebhookPage(1);
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>📊 Logs API</CardTitle>
                <CardDescription>
                  {apiTotal} log{apiTotal > 1 ? "s" : ""} au total - Page{" "}
                  {apiPage} sur {Math.ceil(apiTotal / apiLimit) || 1}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApiPage((p) => Math.max(1, p - 1))}
                  disabled={apiPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {apiPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApiPage((p) => p + 1)}
                  disabled={apiPage >= Math.ceil(apiTotal / apiLimit)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Heure</TableHead>
                  <TableHead>Clé API</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Temps</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApiLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground"
                    >
                      Aucun log trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApiLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        {log.apiKey?.name || (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            Anonymous
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.endpoint}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.method}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(log.statusCode)}
                          <span className="text-xs text-muted-foreground">
                            {getStatusExplanation(log.statusCode)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(log.responseTime)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.ipAddress || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedLog(log);
                            setLogType("api");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Webhook Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>🪝 Logs Webhooks</CardTitle>
                <CardDescription>
                  {webhookTotal} log{webhookTotal > 1 ? "s" : ""} au total -
                  Page {webhookPage} sur{" "}
                  {Math.ceil(webhookTotal / webhookLimit) || 1}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWebhookPage((p) => Math.max(1, p - 1))}
                  disabled={webhookPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {webhookPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWebhookPage((p) => p + 1)}
                  disabled={
                    webhookPage >= Math.ceil(webhookTotal / webhookLimit)
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Heure</TableHead>
                  <TableHead>Webhook</TableHead>
                  <TableHead>Événement</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Tentative</TableHead>
                  <TableHead>Temps</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWebhookLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground"
                    >
                      Aucun log trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWebhookLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>{log.webhook.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.event}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs">
                        {log.url}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(log.statusCode, log.success)}
                          {log.statusCode && (
                            <span className="text-xs text-muted-foreground">
                              {getStatusExplanation(log.statusCode)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.attempt}/3</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(log.executionTime)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedLog(log);
                            setLogType("webhook");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog pour voir les détails */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {logType === "api"
                  ? "📊 Détails API Log"
                  : "🪝 Détails Webhook Log"}
              </DialogTitle>
              <DialogDescription>
                Informations complètes sur la requête
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4">
                {logType === "webhook" && "webhook" in selectedLog && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-2">📤 Payload envoyé</h3>
                      <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                        {JSON.stringify(selectedLog.payload, null, 2)}
                      </pre>
                    </div>

                    {selectedLog.responseBody && (
                      <div>
                        <h3 className="font-semibold mb-2">📥 Réponse reçue</h3>
                        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                          {JSON.stringify(selectedLog.responseBody, null, 2)}
                        </pre>
                      </div>
                    )}

                    {selectedLog.error && (
                      <div>
                        <h3 className="font-semibold mb-2 text-red-500">
                          ❌ Erreur
                        </h3>
                        <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-xs text-red-700 dark:text-red-300">
                          {selectedLog.error}
                        </pre>
                      </div>
                    )}
                  </>
                )}

                {logType === "api" && "endpoint" in selectedLog && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-semibold">Endpoint:</span>
                        <code className="ml-2 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                          {selectedLog.endpoint}
                        </code>
                      </div>
                      <div>
                        <span className="font-semibold">Méthode:</span>
                        <Badge className="ml-2">{selectedLog.method}</Badge>
                      </div>
                      <div>
                        <span className="font-semibold">Statut:</span>
                        <span className="ml-2">
                          {getStatusBadge(selectedLog.statusCode)}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Temps:</span>
                        <span className="ml-2 font-mono">
                          {formatTime(selectedLog.responseTime)}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">IP:</span>
                        <code className="ml-2 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs">
                          {selectedLog.ipAddress || "N/A"}
                        </code>
                      </div>
                      <div>
                        <span className="font-semibold">Date:</span>
                        <span className="ml-2 text-xs">
                          {new Date(selectedLog.createdAt).toLocaleString(
                            "fr-FR"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Query Params */}
                    {selectedLog.queryParams &&
                      Object.keys(selectedLog.queryParams).length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">
                            🔍 Query Params
                          </h3>
                          <pre className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg overflow-x-auto text-xs">
                            {JSON.stringify(selectedLog.queryParams, null, 2)}
                          </pre>
                        </div>
                      )}

                    {/* Response Metadata */}
                    {selectedLog.responseBody && (
                      <div>
                        <h3 className="font-semibold mb-2">
                          📊 Métadonnées de réponse
                        </h3>
                        <pre className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg overflow-x-auto text-xs">
                          {JSON.stringify(selectedLog.responseBody, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}
