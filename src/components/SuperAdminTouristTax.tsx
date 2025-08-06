"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  RefreshCw,
  Receipt,
  Banknote,
  ToggleLeft,
  ToggleRight,
  Save,
  Building2,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface EstablishmentTax {
  id: string;
  name: string;
  slug: string;
  touristTaxEnabled: boolean;
  touristTaxAmount: number;
  totalTaxCollected: number;
  totalPersons: number;
}

export function SuperAdminTouristTax() {
  const [establishments, setEstablishments] = useState<EstablishmentTax[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTax, setEditingTax] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/super-admin/tourist-tax");
      if (!response.ok) throw new Error("Erreur récupération données");

      const data = await response.json();
      setEstablishments(data.establishments || []);
    } catch (error) {
      console.error("Erreur:", error);
      toastUtils.error("Impossible de récupérer les données des taxes");
    } finally {
      setLoading(false);
    }
  };

  const handleTaxAmountChange = (establishmentId: string, value: string) => {
    setEditingTax((prev) => ({
      ...prev,
      [establishmentId]: value,
    }));
  };

  const saveTaxAmount = async (establishmentId: string) => {
    const newAmount = editingTax[establishmentId];
    if (!newAmount || isNaN(parseFloat(newAmount))) {
      toastUtils.error("Montant invalide");
      return;
    }

    setSaving((prev) => ({ ...prev, [establishmentId]: true }));

    try {
      const response = await fetch("/api/super-admin/tourist-tax/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          establishmentId,
          touristTaxAmount: parseFloat(newAmount),
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      toastUtils.success("Montant de la taxe mis à jour");
      setEditingTax((prev) => {
        const updated = { ...prev };
        delete updated[establishmentId];
        return updated;
      });

      fetchEstablishments(); // Recharger les données
    } catch (error) {
      console.error("Erreur:", error);
      toastUtils.error("Impossible de sauvegarder le montant");
    } finally {
      setSaving((prev) => ({ ...prev, [establishmentId]: false }));
    }
  };

  const toggleTaxEnabled = async (
    establishmentId: string,
    enabled: boolean
  ) => {
    setSaving((prev) => ({ ...prev, [establishmentId]: true }));

    try {
      const response = await fetch("/api/super-admin/tourist-tax/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          establishmentId,
          touristTaxEnabled: !enabled,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors du changement d'état");

      toastUtils.success(
        `Taxe de séjour ${!enabled ? "activée" : "désactivée"}`
      );
      fetchEstablishments(); // Recharger les données
    } catch (error) {
      console.error("Erreur:", error);
      toastUtils.error("Impossible de changer l'état de la taxe");
    } finally {
      setSaving((prev) => ({ ...prev, [establishmentId]: false }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalTaxCollected = establishments.reduce(
    (sum, est) => sum + est.totalTaxCollected,
    0
  );
  const totalPersons = establishments.reduce(
    (sum, est) => sum + est.totalPersons,
    0
  );
  const averageGlobalTax =
    totalPersons > 0 ? totalTaxCollected / totalPersons : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Taxe de Séjour
            </CardTitle>
            <CardDescription>
              Gestion des taxes de séjour par personne par nuit (UFT)
            </CardDescription>
          </div>
          <Button onClick={fetchEstablishments} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Banknote className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Collecté
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalTaxCollected)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Personnes
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalPersons.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Taxe Moyenne/Personne
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(averageGlobalTax)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau des établissements */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Établissement</TableHead>
                  <TableHead className="text-center">État</TableHead>
                  <TableHead className="text-center">
                    Montant/Personne/Nuit
                  </TableHead>
                  <TableHead className="text-center">Total Collecté</TableHead>
                  <TableHead className="text-center">Personnes</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {establishments.map((establishment) => (
                  <TableRow key={establishment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{establishment.name}</p>
                        <p className="text-sm text-gray-500">
                          /{establishment.slug}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleTaxEnabled(
                            establishment.id,
                            establishment.touristTaxEnabled
                          )
                        }
                        disabled={saving[establishment.id]}
                        className="p-1"
                      >
                        {establishment.touristTaxEnabled ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <ToggleRight className="w-5 h-5" />
                            <span className="text-xs">Activée</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400">
                            <ToggleLeft className="w-5 h-5" />
                            <span className="text-xs">Désactivée</span>
                          </div>
                        )}
                      </Button>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center gap-2 justify-center">
                        {editingTax[establishment.id] !== undefined ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingTax[establishment.id]}
                              onChange={(e) =>
                                handleTaxAmountChange(
                                  establishment.id,
                                  e.target.value
                                )
                              }
                              className="w-20 h-8 text-sm text-center"
                            />
                            <span className="text-xs text-gray-500">CHF</span>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() =>
                              setEditingTax((prev) => ({
                                ...prev,
                                [establishment.id]:
                                  establishment.touristTaxAmount.toString(),
                              }))
                            }
                          >
                            {formatCurrency(establishment.touristTaxAmount)}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="font-medium text-green-600">
                        {formatCurrency(establishment.totalTaxCollected)}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="font-medium">
                        {establishment.totalPersons.toLocaleString()}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {editingTax[establishment.id] !== undefined ? (
                        <div className="flex gap-1 justify-center">
                          <Button
                            size="sm"
                            onClick={() => saveTaxAmount(establishment.id)}
                            disabled={saving[establishment.id]}
                            className="h-8 px-2"
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditingTax((prev) => {
                                const updated = { ...prev };
                                delete updated[establishment.id];
                                return updated;
                              })
                            }
                            disabled={saving[establishment.id]}
                            className="h-8 px-2"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setEditingTax((prev) => ({
                              ...prev,
                              [establishment.id]:
                                establishment.touristTaxAmount.toString(),
                            }))
                          }
                          className="h-8 px-2 text-gray-400 hover:text-gray-600"
                        >
                          Modifier
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {establishments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun établissement trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
