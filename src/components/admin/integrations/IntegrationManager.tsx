"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings,
  Link,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Upload,
  Zap,
  Globe,
  Database,
  Code2,
  Webhook,
  Shield,
} from "lucide-react";
import { IntegrationConfigurator } from "./IntegrationConfigurator";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: Date;
  configuration: Record<string, string | number | boolean>;
}

interface IntegrationManagerProps {
  hotelSlug: string;
}

export function IntegrationManager({ hotelSlug }: IntegrationManagerProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; error?: string }>
  >({});
  const [configuringIntegration, setConfiguringIntegration] =
    useState<Integration | null>(null);

  // Types d'intégrations supportées
  const integrationTypes = [
    {
      id: "booking-com",
      name: "Booking.com",
      description: "Synchronisation avec Booking.com via API",
      icon: Globe,
      color: "bg-blue-500",
    },
    {
      id: "airbnb",
      name: "Airbnb",
      description: "Intégration avec Airbnb (API limitée)",
      icon: Globe,
      color: "bg-red-500",
    },
    {
      id: "channel-manager",
      name: "Channel Manager",
      description: "Connecteurs vers channel managers (SiteMinder, etc.)",
      icon: Database,
      color: "bg-green-500",
    },
    {
      id: "pms",
      name: "PMS (Property Management System)",
      description: "Intégration avec PMS existant",
      icon: Settings,
      color: "bg-purple-500",
    },
    {
      id: "webhook",
      name: "Webhook personnalisé",
      description: "Webhook bidirectionnel pour intégrations custom",
      icon: Webhook,
      color: "bg-orange-500",
    },
    {
      id: "csv-import",
      name: "Import/Export CSV",
      description: "Synchronisation par fichiers CSV",
      icon: Upload,
      color: "bg-gray-500",
    },
    {
      id: "api-custom",
      name: "API REST personnalisée",
      description: "Connecteur vers API REST sur mesure",
      icon: Code2,
      color: "bg-indigo-500",
    },
  ];

  const loadIntegrations = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/${hotelSlug}/integrations`);
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error("Erreur chargement intégrations:", error);
    } finally {
      setLoading(false);
    }
  }, [hotelSlug]);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const handleAddIntegration = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/${hotelSlug}/integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: integrationTypes.find((t) => t.id === type)?.name,
        }),
      });

      if (response.ok) {
        loadIntegrations();
      }
    } catch (error) {
      console.error("Erreur ajout intégration:", error);
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    try {
      const response = await fetch(
        `/api/admin/${hotelSlug}/integrations/${integrationId}/test`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      setTestResults((prev) => ({ ...prev, [integrationId]: result }));
    } catch (error) {
      console.error("Erreur test connexion:", error);
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      const response = await fetch(
        `/api/admin/${hotelSlug}/integrations/${integrationId}/sync`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        loadIntegrations();
      }
    } catch (error) {
      console.error("Erreur synchronisation:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Gestionnaire d&apos;Intégrations
          </h2>
          <p className="text-muted-foreground">
            Connectez votre système à d&apos;autres plateformes de réservation
          </p>
        </div>
        <Button
          onClick={() => console.log("Ajouter intégration")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter une intégration
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="active">Intégrations actives</TabsTrigger>
          <TabsTrigger value="available">Intégrations disponibles</TabsTrigger>
          <TabsTrigger value="settings">Paramètres globaux</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Link className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Aucune intégration configurée
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Ajoutez votre première intégration pour commencer à
                  synchroniser vos réservations
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {integrations.map((integration) => {
                const type = integrationTypes.find(
                  (t) => t.id === integration.type
                );
                const IconComponent = type?.icon || Settings;

                return (
                  <Card key={integration.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${type?.color || "bg-gray-500"}`}
                        >
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {type?.description || integration.type}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          integration.status === "connected"
                            ? "default"
                            : "destructive"
                        }
                        className="flex items-center gap-1"
                      >
                        {integration.status === "connected" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {integration.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {integration.lastSync
                            ? `Dernière sync: ${new Date(integration.lastSync).toLocaleString()}`
                            : "Jamais synchronisé"}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(integration.id)}
                            className="flex items-center gap-1"
                          >
                            <Zap className="h-3 w-3" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(integration.id)}
                            className="flex items-center gap-1"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setConfiguringIntegration(integration)
                            }
                            className="flex items-center gap-1"
                          >
                            <Settings className="h-3 w-3" />
                            Config
                          </Button>
                        </div>
                      </div>

                      {testResults[integration.id] && (
                        <Alert className="mt-3">
                          <AlertDescription>
                            {testResults[integration.id].success
                              ? "✅ Connexion réussie"
                              : `❌ Erreur: ${testResults[integration.id].error}`}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {integrationTypes.map((type) => {
              const IconComponent = type.icon;
              const isAlreadyAdded = integrations.some(
                (i) => i.type === type.id
              );

              return (
                <Card key={type.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleAddIntegration(type.id)}
                      disabled={isAlreadyAdded}
                      className="w-full"
                    >
                      {isAlreadyAdded
                        ? "Déjà ajouté"
                        : "Ajouter cette intégration"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Paramètres de sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Chiffrement des données</Label>
                  <p className="text-sm text-muted-foreground">
                    Chiffrer toutes les données échangées avec les intégrations
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Authentification 2FA</Label>
                  <p className="text-sm text-muted-foreground">
                    Exiger une authentification à deux facteurs
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Logs détaillés</Label>
                  <p className="text-sm text-muted-foreground">
                    Conserver des logs détaillés des synchronisations
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Paramètres de synchronisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>Fréquence de synchronisation</Label>
                  <Select defaultValue="15">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Toutes les 5 minutes</SelectItem>
                      <SelectItem value="15">Toutes les 15 minutes</SelectItem>
                      <SelectItem value="30">Toutes les 30 minutes</SelectItem>
                      <SelectItem value="60">Toutes les heures</SelectItem>
                      <SelectItem value="manual">
                        Manuelle uniquement
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Gestion des conflits</Label>
                  <Select defaultValue="overwrite">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overwrite">
                        Écraser les données locales
                      </SelectItem>
                      <SelectItem value="merge">
                        Fusionner les données
                      </SelectItem>
                      <SelectItem value="manual">
                        Résolution manuelle
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de configuration */}
      <Dialog
        open={!!configuringIntegration}
        onOpenChange={() => setConfiguringIntegration(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configuration - {configuringIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          {configuringIntegration && (
            <IntegrationConfigurator
              hotelSlug={hotelSlug}
              integrationId={configuringIntegration.id}
              onSave={() => {
                setConfiguringIntegration(null);
                // Recharger les intégrations après configuration
                loadIntegrations();
              }}
              onCancel={() => setConfiguringIntegration(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
