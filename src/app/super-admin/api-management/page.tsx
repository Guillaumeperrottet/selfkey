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
import { Key, Trash2, Eye, EyeOff, Plus, Copy, Check } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  establishmentSlug: string | null;
  establishment: {
    slug: string;
    name: string;
  } | null;
  isActive: boolean;
  permissions: Record<string, string[]>;
  lastUsedAt: Date | null;
  createdAt: Date;
  expiresAt: Date | null;
}

interface Establishment {
  id: string;
  slug: string;
  name: string;
}

export default function ApiManagementPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: "",
    establishmentSlug: "",
    permissions: {
      bookings: ["read"],
      webhooks: [] as string[],
    },
  });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [keysRes, estabRes] = await Promise.all([
        fetch("/api/super-admin/api-keys"),
        fetch("/api/super-admin/establishments"),
      ]);

      if (keysRes.ok) {
        const data = await keysRes.json();
        setApiKeys(data.apiKeys || []);
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

  const handleCreateKey = async () => {
    if (!newKeyData.name) {
      toast.error("Le nom est obligatoire");
      return;
    }

    try {
      const response = await fetch("/api/super-admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newKeyData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création");
      }

      const data = await response.json();
      setGeneratedKey(data.key);

      toast.success("Clé API créée avec succès");
      loadData();

      // Reset form
      setNewKeyData({
        name: "",
        establishmentSlug: "",
        permissions: {
          bookings: ["read"],
          webhooks: [],
        },
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error("Erreur lors de la création de la clé");
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette clé ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/super-admin/api-keys/${keyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast.success("Clé API supprimée");
      loadData();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const copyToClipboard = async (key: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(keyId);
      toast.success("Clé copiée !");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error("Erreur lors de la copie");
    }
  };

  const maskKey = (key: string) => {
    return `${key.substring(0, 12)}${"•".repeat(20)}${key.substring(key.length - 4)}`;
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
              <Key className="h-8 w-8" />
              Gestion API
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez les clés API et contrôlez l&apos;accès aux données
            </p>
          </div>
          <Button onClick={() => setShowNewKeyDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle clé API
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Clés API actives</CardTitle>
            <CardDescription>
              {apiKeys.length} clé{apiKeys.length > 1 ? "s" : ""} configurée
              {apiKeys.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune clé API créée pour le moment
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Clé</TableHead>
                    <TableHead>Établissement</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Dernière utilisation</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">
                        {apiKey.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {showKeys[apiKey.id]
                              ? apiKey.key
                              : maskKey(apiKey.key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {showKeys[apiKey.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(apiKey.key, apiKey.id)
                            }
                          >
                            {copiedKey === apiKey.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {apiKey.establishment?.name || "Tous"}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {Object.entries(apiKey.permissions).map(
                            ([resource, actions]) => (
                              <div key={resource}>
                                <span className="font-medium">{resource}:</span>{" "}
                                {(actions as string[]).join(", ")}
                              </div>
                            )
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {apiKey.lastUsedAt
                          ? new Date(apiKey.lastUsedAt).toLocaleString()
                          : "Jamais"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            apiKey.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {apiKey.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey(apiKey.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog pour créer une nouvelle clé */}
        <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle clé API</DialogTitle>
              <DialogDescription>
                La clé sera affichée une seule fois. Assurez-vous de la copier.
              </DialogDescription>
            </DialogHeader>

            {generatedKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    Votre nouvelle clé API :
                  </p>
                  <code className="text-xs break-all">{generatedKey}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => copyToClipboard(generatedKey, "new")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier la clé
                  </Button>
                </div>
                <p className="text-sm text-yellow-600">
                  ⚠️ Sauvegardez cette clé maintenant. Vous ne pourrez plus la
                  voir.
                </p>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      setShowNewKeyDialog(false);
                      setGeneratedKey(null);
                    }}
                  >
                    Fermer
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom de la clé *</Label>
                  <Input
                    id="name"
                    placeholder="Police Fribourg"
                    value={newKeyData.name}
                    onChange={(e) =>
                      setNewKeyData({ ...newKeyData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="establishment">
                    Établissement (optionnel)
                  </Label>
                  <Select
                    value={newKeyData.establishmentSlug || "all"}
                    onValueChange={(value) =>
                      setNewKeyData({
                        ...newKeyData,
                        establishmentSlug: value === "all" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les établissements" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Tous les établissements
                      </SelectItem>
                      {establishments.map((est) => (
                        <SelectItem key={est.id} value={est.slug}>
                          {est.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Si vide, accès à tous les établissements
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewKeyDialog(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleCreateKey}>Créer la clé</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}
