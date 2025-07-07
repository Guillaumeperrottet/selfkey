"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Save,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Globe,
  Database,
  Code2,
  Webhook,
  Upload,
} from "lucide-react";

interface IntegrationConfig {
  [key: string]: string | number | boolean;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  configuration: IntegrationConfig;
  isActive: boolean;
  lastSync?: Date;
  logs?: IntegrationLog[];
}

interface IntegrationLog {
  id: string;
  action: string;
  status: string;
  message: string;
  createdAt: Date;
  data?: Record<string, unknown>;
}

interface IntegrationConfiguratorProps {
  hotelSlug: string;
  integrationId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export function IntegrationConfigurator({
  hotelSlug,
  integrationId,
  onSave,
  onCancel,
}: IntegrationConfiguratorProps) {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [formData, setFormData] = useState<IntegrationConfig>({});
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const loadIntegration = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/${hotelSlug}/integrations/${integrationId}`
      );
      if (response.ok) {
        const data = await response.json();
        setIntegration(data.integration);
        setFormData(data.integration.configuration || {});
      }
    } catch (error) {
      console.error("Erreur chargement intégration:", error);
    } finally {
      setLoading(false);
    }
  }, [hotelSlug, integrationId]);

  useEffect(() => {
    loadIntegration();
    // Générer l'URL webhook pour cet établissement
    const baseUrl = window.location.origin;
    setWebhookUrl(
      `${baseUrl}/api/webhooks/integrations/${hotelSlug}/${integrationId}`
    );
  }, [hotelSlug, integrationId]);

  const handleSave = async () => {
    if (!integration) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/${hotelSlug}/integrations/${integrationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: integration.name,
            configuration: formData,
            isActive: integration.isActive,
          }),
        }
      );

      if (response.ok) {
        onSave?.();
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyWebhook = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateFormData = (key: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleActive = () => {
    if (integration) {
      setIntegration((prev) =>
        prev ? { ...prev, isActive: !prev.isActive } : null
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!integration) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Intégration non trouvée</AlertDescription>
      </Alert>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "booking-com":
      case "airbnb":
        return Globe;
      case "pms":
        return Database;
      case "webhook":
        return Webhook;
      case "api-custom":
        return Code2;
      case "csv-import":
        return Upload;
      default:
        return Settings;
    }
  };

  const renderConfigFields = () => {
    switch (integration.type) {
      case "booking-com":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">Clé API Booking.com</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showSecrets ? "text" : "password"}
                  value={(formData.apiKey as string) || ""}
                  onChange={(e) => updateFormData("apiKey", e.target.value)}
                  placeholder="Votre clé API Booking.com"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="hotelId">ID de l&apos;hôtel</Label>
              <Input
                id="hotelId"
                value={(formData.hotelId as string) || ""}
                onChange={(e) => updateFormData("hotelId", e.target.value)}
                placeholder="ID de votre hôtel sur Booking.com"
              />
            </div>
            <div>
              <Label htmlFor="syncFrequency">
                Fréquence de synchronisation (minutes)
              </Label>
              <Select
                value={String(formData.syncFrequency || 15)}
                onValueChange={(value) =>
                  updateFormData("syncFrequency", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "airbnb":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientId">Client ID Airbnb</Label>
              <Input
                id="clientId"
                value={(formData.clientId as string) || ""}
                onChange={(e) => updateFormData("clientId", e.target.value)}
                placeholder="Votre Client ID Airbnb"
              />
            </div>
            <div>
              <Label htmlFor="clientSecret">Client Secret</Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  type={showSecrets ? "text" : "password"}
                  value={(formData.clientSecret as string) || ""}
                  onChange={(e) =>
                    updateFormData("clientSecret", e.target.value)
                  }
                  placeholder="Votre Client Secret Airbnb"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case "webhook":
        return (
          <div className="space-y-4">
            <div>
              <Label>URL Webhook (à utiliser dans votre système externe)</Label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyWebhook}
                  className="flex items-center gap-1"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copié" : "Copier"}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="secretKey">Clé secrète (optionnel)</Label>
              <div className="relative">
                <Input
                  id="secretKey"
                  type={showSecrets ? "text" : "password"}
                  value={(formData.secretKey as string) || ""}
                  onChange={(e) => updateFormData("secretKey", e.target.value)}
                  placeholder="Clé secrète pour sécuriser le webhook"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case "pms":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="baseUrl">URL de base du PMS</Label>
              <Input
                id="baseUrl"
                value={(formData.baseUrl as string) || ""}
                onChange={(e) => updateFormData("baseUrl", e.target.value)}
                placeholder="https://votre-pms.com/api"
              />
            </div>
            <div>
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <Input
                id="username"
                value={(formData.username as string) || ""}
                onChange={(e) => updateFormData("username", e.target.value)}
                placeholder="Nom d'utilisateur PMS"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showSecrets ? "text" : "password"}
                  value={(formData.password as string) || ""}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  placeholder="Mot de passe PMS"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case "api-custom":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="baseUrl">URL de base de l&apos;API</Label>
              <Input
                id="baseUrl"
                value={(formData.baseUrl as string) || ""}
                onChange={(e) => updateFormData("baseUrl", e.target.value)}
                placeholder="https://votre-api.com"
              />
            </div>
            <div>
              <Label htmlFor="apiKey">Clé API</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showSecrets ? "text" : "password"}
                  value={(formData.apiKey as string) || ""}
                  onChange={(e) => updateFormData("apiKey", e.target.value)}
                  placeholder="Votre clé API"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="testEndpoint">Endpoint de test</Label>
              <Input
                id="testEndpoint"
                value={(formData.testEndpoint as string) || ""}
                onChange={(e) => updateFormData("testEndpoint", e.target.value)}
                placeholder="/health ou /ping"
              />
            </div>
          </div>
        );

      case "csv-import":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="importPath">Chemin d&apos;import</Label>
              <Input
                id="importPath"
                value={(formData.importPath as string) || ""}
                onChange={(e) => updateFormData("importPath", e.target.value)}
                placeholder="/path/to/csv/files"
              />
            </div>
            <div>
              <Label htmlFor="delimiter">Délimiteur CSV</Label>
              <Select
                value={String(formData.delimiter || ",")}
                onValueChange={(value) => updateFormData("delimiter", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Virgule (,)</SelectItem>
                  <SelectItem value=";">Point-virgule (;)</SelectItem>
                  <SelectItem value="\t">Tabulation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <Textarea
              value={JSON.stringify(formData, null, 2)}
              onChange={(e) => {
                try {
                  setFormData(JSON.parse(e.target.value));
                } catch {
                  // Ignore invalid JSON
                }
              }}
              placeholder="Configuration JSON"
              rows={10}
            />
          </div>
        );
    }
  };

  const IconComponent = getIcon(integration.type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500">
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{integration.name}</h2>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  integration.status === "connected" ? "default" : "destructive"
                }
              >
                {integration.status}
              </Badge>
              {integration.lastSync && (
                <span className="text-sm text-muted-foreground">
                  Dernière sync:{" "}
                  {new Date(integration.lastSync).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="active">Actif</Label>
          <Switch
            id="active"
            checked={integration.isActive}
            onCheckedChange={toggleActive}
          />
        </div>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="help">Aide</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>{renderConfigFields()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs d&apos;activité</CardTitle>
            </CardHeader>
            <CardContent>
              {integration.logs && integration.logs.length > 0 ? (
                <div className="space-y-2">
                  {integration.logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            log.status === "success" ? "default" : "destructive"
                          }
                        >
                          {log.action}
                        </Badge>
                        <span className="text-sm">{log.message}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun log disponible</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Configuration requise</h4>
                <p className="text-sm text-muted-foreground">
                  Consultez la documentation spécifique à votre type
                  d&apos;intégration pour les détails de configuration.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Support</h4>
                <p className="text-sm text-muted-foreground">
                  En cas de problème, consultez les logs ou contactez le support
                  technique.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Sauvegarde..." : "Sauvegarder"}
          <Save className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
