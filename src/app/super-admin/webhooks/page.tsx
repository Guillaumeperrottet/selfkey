"use client";

import { useState, useEffect } from "react";
import SuperAdminLayout from "@/components/super-admin/SuperAdminLayout";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Webhook,
  Trash2,
  Plus,
  Activity,
  CheckCircle,
  XCircle,
  PlayCircle,
} from "lucide-react";

interface WebhookConfig {
  id: string;
  establishmentSlug: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  format: string;
  retryCount: number;
  retryDelay: number;
  createdAt: Date;
  establishment: {
    slug: string;
    name: string;
  };
  _count: {
    logs: number;
  };
}

interface Establishment {
  id: string;
  slug: string;
  name: string;
}

interface WebhookLog {
  id: string;
  event: string;
  success: boolean;
  statusCode: number | null;
  attempt: number;
  createdAt: Date;
  bookingId: string | null;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [newWebhookData, setNewWebhookData] = useState({
    name: "",
    establishmentSlug: "",
    url: "",
    events: ["booking.completed"],
    format: "json" as "json" | "csv",
    retryCount: 3,
    retryDelay: 60,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [webhooksRes, estabRes] = await Promise.all([
        fetch("/api/super-admin/webhooks"),
        fetch("/api/super-admin/establishments"),
      ]);

      if (webhooksRes.ok) {
        const data = await webhooksRes.json();
        setWebhooks(data.webhooks || []);
      }

      if (estabRes.ok) {
        const data = await estabRes.json();
        setEstablishments(data.establishments || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const loadWebhookLogs = async (webhookId: string) => {
    try {
      const response = await fetch(
        `/api/super-admin/webhooks/${webhookId}/logs`
      );
      if (response.ok) {
        const data = await response.json();
        setWebhookLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Error loading webhook logs:", error);
      toast.error("Erreur lors du chargement des logs");
    }
  };

  const handleCreateWebhook = async () => {
    if (
      !newWebhookData.name ||
      !newWebhookData.establishmentSlug ||
      !newWebhookData.url
    ) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }

    try {
      const response = await fetch("/api/super-admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWebhookData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création");
      }

      toast.success("Webhook créé avec succès");
      loadData();
      setShowNewWebhookDialog(false);

      // Reset form
      setNewWebhookData({
        name: "",
        establishmentSlug: "",
        url: "",
        events: ["booking.completed"],
        format: "json",
        retryCount: 3,
        retryDelay: 60,
      });
    } catch (error) {
      console.error("Error creating webhook:", error);
      toast.error("Erreur lors de la création du webhook");
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce webhook ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/super-admin/webhooks/${webhookId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast.success("Webhook supprimé");
      loadData();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleWebhookStatus = async (webhookId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/super-admin/webhooks/${webhookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      toast.success(`Webhook ${isActive ? "activé" : "désactivé"}`);
      loadData();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    toast.info("Test du webhook en cours...");

    try {
      const response = await fetch("/api/super-admin/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du test");
      }

      const data = await response.json();

      if (data.result.success) {
        toast.success(
          `✅ Webhook testé avec succès ! (${data.result.statusCode}) - ${data.result.executionTime}ms`
        );
      } else {
        toast.error(
          `❌ Erreur lors du test: ${data.result.error || `HTTP ${data.result.statusCode}`}`
        );
      }

      // Recharger les logs pour afficher le test
      loadData();
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast.error("Erreur lors du test du webhook");
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="container mx-auto p-6">
          <p>Chargement...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Webhook className="h-8 w-8" />
              Gestion des Webhooks
            </h1>
            <p className="text-muted-foreground mt-2">
              Configurez les envois automatiques vers la police
            </p>
          </div>
          <Button onClick={() => setShowNewWebhookDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau webhook
          </Button>
        </div>

        {/* Carte d'information Sandbox */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
              🧪 Mode Test / Sandbox
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Testez vos webhooks avant d&apos;avoir l&apos;URL réelle de la
              police
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                URL Sandbox (endpoint de test)
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white dark:bg-gray-900 px-3 py-2 rounded border">
                  {typeof window !== "undefined" ? window.location.origin : ""}
                  /api/sandbox/police-webhook
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const url = `${window.location.origin}/api/sandbox/police-webhook`;
                    navigator.clipboard.writeText(url);
                    toast.success("URL copiée !");
                  }}
                >
                  Copier
                </Button>
              </div>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>✅ Utilisez cette URL pour tester vos webhooks</p>
              <p>
                ✅ Les données envoyées seront affichées dans les logs serveur
              </p>
              <p>
                ✅ Cliquez sur le bouton 🎬 &quot;Play&quot; pour tester un
                webhook
              </p>
              <p className="text-xs mt-2">
                📖 Documentation :{" "}
                <a
                  href="/api/sandbox/police-webhook"
                  target="_blank"
                  className="underline"
                >
                  GET /api/sandbox/police-webhook
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhooks configurés</CardTitle>
            <CardDescription>
              {webhooks.length} webhook{webhooks.length > 1 ? "s" : ""}{" "}
              configuré
              {webhooks.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun webhook configuré pour le moment
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Établissement</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Événements</TableHead>
                    <TableHead>Envois</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">
                        {webhook.name}
                      </TableCell>
                      <TableCell>{webhook.establishment.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {webhook.url.substring(0, 40)}...
                        </code>
                      </TableCell>
                      <TableCell className="uppercase">
                        {webhook.format}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {webhook.events.join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedWebhook(webhook.id);
                            loadWebhookLogs(webhook.id);
                          }}
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          {webhook._count.logs}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() =>
                            toggleWebhookStatus(webhook.id, !webhook.isActive)
                          }
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs cursor-pointer ${
                            webhook.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {webhook.isActive ? "Actif" : "Inactif"}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestWebhook(webhook.id)}
                            title="Tester le webhook"
                          >
                            <PlayCircle className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog pour créer un nouveau webhook */}
        <Dialog
          open={showNewWebhookDialog}
          onOpenChange={setShowNewWebhookDialog}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouveau webhook</DialogTitle>
              <DialogDescription>
                Les données seront envoyées automatiquement après chaque
                réservation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  placeholder="Police Fribourg - API"
                  value={newWebhookData.name}
                  onChange={(e) =>
                    setNewWebhookData({
                      ...newWebhookData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="establishment">Établissement *</Label>
                <Select
                  value={newWebhookData.establishmentSlug}
                  onValueChange={(value) =>
                    setNewWebhookData({
                      ...newWebhookData,
                      establishmentSlug: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un établissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {establishments.map((est) => (
                      <SelectItem key={est.id} value={est.slug}>
                        {est.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="url">URL de destination *</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://api.police.ch/receive-booking"
                  value={newWebhookData.url}
                  onChange={(e) =>
                    setNewWebhookData({
                      ...newWebhookData,
                      url: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Pour tester :{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    {typeof window !== "undefined"
                      ? window.location.origin
                      : ""}
                    /api/sandbox/police-webhook
                  </code>
                </p>
              </div>

              <div>
                <Label htmlFor="format">Format</Label>
                <Select
                  value={newWebhookData.format}
                  onValueChange={(value: "json" | "csv") =>
                    setNewWebhookData({ ...newWebhookData, format: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON (recommandé)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowNewWebhookDialog(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreateWebhook}>Créer le webhook</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog pour afficher les logs d'un webhook */}
        <Dialog
          open={!!selectedWebhook}
          onOpenChange={() => setSelectedWebhook(null)}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Historique d&apos;envois</DialogTitle>
              <DialogDescription>
                {webhookLogs.length} envoi{webhookLogs.length > 1 ? "s" : ""}{" "}
                enregistré{webhookLogs.length > 1 ? "s" : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              {webhookLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Aucun envoi pour le moment
                </p>
              ) : (
                webhookLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    {log.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{log.event}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        HTTP {log.statusCode} - Tentative {log.attempt}
                      </p>
                      {log.bookingId && (
                        <p className="text-xs text-muted-foreground">
                          Réservation: {log.bookingId}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}
