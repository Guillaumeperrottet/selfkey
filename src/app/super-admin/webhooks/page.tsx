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
  Copy,
  Eye,
  EyeOff,
  FileJson,
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
  secret: string;
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
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [showPayloadDialog, setShowPayloadDialog] = useState(false);
  const [selectedWebhookForPayload, setSelectedWebhookForPayload] =
    useState<WebhookConfig | null>(null);
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
        console.log("Establishments API response:", data);
        console.log("Establishments array:", data.establishments);
        // L'API retourne { success: true, establishments: [...] }
        setEstablishments(
          Array.isArray(data.establishments) ? data.establishments : [],
        );
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
        `/api/super-admin/webhooks/${webhookId}/logs`,
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

      const data = await response.json();

      // Afficher le secret HMAC une seule fois
      if (data.generatedSecret) {
        const message = `🔐 Secret HMAC (à copier maintenant, il ne sera plus affiché) :\n\n${data.generatedSecret}`;

        // Copier automatiquement dans le presse-papier
        navigator.clipboard
          .writeText(data.generatedSecret)
          .then(() => {
            toast.success(
              "Webhook créé ! Secret copié dans le presse-papier.",
              {
                duration: 10000,
              },
            );
            alert(message); // Afficher aussi dans une alerte pour être sûr
          })
          .catch(() => {
            toast.success("Webhook créé avec succès");
            alert(message);
          });
      } else {
        toast.success("Webhook créé avec succès");
      }

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
          `✅ Webhook testé avec succès ! (${data.result.statusCode}) - ${data.result.executionTime}ms`,
        );
      } else {
        toast.error(
          `❌ Erreur lors du test: ${data.result.error || `HTTP ${data.result.statusCode}`}`,
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
                    <TableHead>Secret HMAC</TableHead>
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
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded break-all max-w-md">
                            {webhook.url}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(webhook.url);
                              toast.success("URL copiée dans le presse-papier");
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {visibleSecrets.has(webhook.id)
                              ? webhook.secret
                              : "••••••••••••••••••••••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newVisible = new Set(visibleSecrets);
                              if (visibleSecrets.has(webhook.id)) {
                                newVisible.delete(webhook.id);
                              } else {
                                newVisible.add(webhook.id);
                              }
                              setVisibleSecrets(newVisible);
                            }}
                          >
                            {visibleSecrets.has(webhook.id) ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(webhook.secret);
                              toast.success(
                                "Secret copié dans le presse-papier",
                              );
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
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
                            onClick={() => {
                              setSelectedWebhookForPayload(webhook);
                              setShowPayloadDialog(true);
                            }}
                            title="Voir exemple de payload"
                          >
                            <FileJson className="h-4 w-4 text-purple-500" />
                          </Button>
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

        {/* Dialog pour afficher l'exemple de payload */}
        <Dialog open={showPayloadDialog} onOpenChange={setShowPayloadDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Exemple de payload envoyé</DialogTitle>
              <DialogDescription>
                Voici un exemple du corps de requête (body) qui sera envoyé à{" "}
                {selectedWebhookForPayload?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Headers HTTP</Label>
                <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                  {`Content-Type: application/json
User-Agent: SelfKey-Webhook/1.0
X-Webhook-Event: booking.completed
X-Webhook-Signature: <signature HMAC SHA256>
X-Webhook-Attempt: 1`}
                </pre>
              </div>
              <div>
                <Label>Body (JSON)</Label>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => {
                      const example = JSON.stringify(
                        {
                          event: "booking.completed",
                          timestamp: "2026-02-10T10:30:00.000Z",
                          data: {
                            id: "clxyz123abc",
                            bookingNumber: 1234,
                            hotelSlug:
                              selectedWebhookForPayload?.establishmentSlug,
                            clientFirstName: "Jean",
                            clientLastName: "Dupont",
                            clientEmail: "jean.dupont@example.com",
                            clientPhone: "+41791234567",
                            clientBirthDate: "1985-03-15T00:00:00.000Z",
                            clientBirthPlace: "Fribourg",
                            clientAddress: "Rue de la Gare 12",
                            clientPostalCode: "1700",
                            clientCity: "Fribourg",
                            clientCountry: "Switzerland",
                            clientIdNumber: "CH-123456789",
                            clientIdType: "Carte d'identité",
                            clientVehicleNumber: "VD-123456",
                            checkInDate: "2026-02-10T14:00:00.000Z",
                            checkOutDate: "2026-02-12T11:00:00.000Z",
                            bookingDate: "2026-02-10T10:30:00.000Z",
                            adults: 2,
                            children: 1,
                            guests: 3,
                            hasDog: false,
                            amount: 250.0,
                            currency: "CHF",
                            platformCommission: 12.5,
                            ownerAmount: 237.5,
                            touristTaxTotal: 9.0,
                            paymentStatus: "succeeded",
                            bookingType: "night_parking",
                            bookingLocale: "fr",
                            room: {
                              id: "room123",
                              name: "Emplacement Standard",
                              price: 120.0,
                              accessCode: "1234",
                            },
                            establishment: {
                              id: "est123",
                              slug: selectedWebhookForPayload?.establishmentSlug,
                              name: selectedWebhookForPayload?.establishment
                                .name,
                              address: "Route de Beaumont 20",
                              city: "Fribourg",
                              postalCode: "1700",
                              country: "Switzerland",
                              hotelContactEmail: "info@selfcamp.ch",
                              hotelContactPhone: "+41261234567",
                            },
                          },
                        },
                        null,
                        2,
                      );
                      navigator.clipboard.writeText(example);
                      toast.success("Payload copié dans le presse-papier");
                    }}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copier
                  </Button>
                  <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                    {JSON.stringify(
                      {
                        event: "booking.completed",
                        timestamp: "2026-02-10T10:30:00.000Z",
                        data: {
                          id: "clxyz123abc",
                          bookingNumber: 1234,
                          hotelSlug:
                            selectedWebhookForPayload?.establishmentSlug,
                          clientFirstName: "Jean",
                          clientLastName: "Dupont",
                          clientEmail: "jean.dupont@example.com",
                          clientPhone: "+41791234567",
                          clientBirthDate: "1985-03-15T00:00:00.000Z",
                          clientBirthPlace: "Fribourg",
                          clientAddress: "Rue de la Gare 12",
                          clientPostalCode: "1700",
                          clientCity: "Fribourg",
                          clientCountry: "Switzerland",
                          clientIdNumber: "CH-123456789",
                          clientIdType: "Carte d'identité",
                          clientVehicleNumber: "VD-123456",
                          checkInDate: "2026-02-10T14:00:00.000Z",
                          checkOutDate: "2026-02-12T11:00:00.000Z",
                          bookingDate: "2026-02-10T10:30:00.000Z",
                          adults: 2,
                          children: 1,
                          guests: 3,
                          hasDog: false,
                          amount: 250.0,
                          currency: "CHF",
                          platformCommission: 12.5,
                          ownerAmount: 237.5,
                          touristTaxTotal: 9.0,
                          paymentStatus: "succeeded",
                          bookingType: "night_parking",
                          bookingLocale: "fr",
                          room: {
                            id: "room123",
                            name: "Emplacement Standard",
                            price: 120.0,
                            accessCode: "1234",
                          },
                          establishment: {
                            id: "est123",
                            slug: selectedWebhookForPayload?.establishmentSlug,
                            name: selectedWebhookForPayload?.establishment.name,
                            address: "Route de Beaumont 20",
                            city: "Fribourg",
                            postalCode: "1700",
                            country: "Switzerland",
                            hotelContactEmail: "info@selfcamp.ch",
                            hotelContactPhone: "+41261234567",
                          },
                        },
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}
