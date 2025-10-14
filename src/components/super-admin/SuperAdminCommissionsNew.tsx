"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Settings,
  Building2,
  Percent,
  RefreshCw,
  Edit,
  Check,
  X,
  DollarSign,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface Establishment {
  id: string;
  slug: string;
  name: string;
  enableDayParking: boolean;
  dayParkingCommissionRate: number;
  commissionRate: number; // Commission nuit
  fixedFee: number; // Frais fixes
}

interface EditingState {
  id: string;
  type: "nightCommission" | "dayCommission" | "fixedFee";
  value: number;
}

export function SuperAdminCommissions() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingState | null>(null);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/super-admin/establishments-complete");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des établissements");
      }

      const data = await response.json();
      setEstablishments(data.establishments || []);
    } catch (error) {
      console.error("Erreur:", error);
      toastUtils.error("Impossible de récupérer les établissements");
    } finally {
      setLoading(false);
    }
  };

  const updateEstablishment = async (
    establishmentId: string,
    type: "nightCommission" | "dayCommission" | "fixedFee",
    newValue: number
  ) => {
    try {
      const fieldMap = {
        nightCommission: "commissionRate",
        dayCommission: "dayParkingCommissionRate",
        fixedFee: "fixedFee",
      };

      const response = await fetch("/api/super-admin/establishments/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          establishmentId,
          [fieldMap[type]]: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      // Mettre à jour localement
      setEstablishments((prev) =>
        prev.map((est) =>
          est.id === establishmentId
            ? { ...est, [fieldMap[type]]: newValue }
            : est
        )
      );

      toastUtils.success("Mise à jour réussie");
      setEditing(null);
    } catch (error) {
      console.error("Erreur:", error);
      toastUtils.error("Erreur lors de la mise à jour");
    }
  };

  const startEditing = (
    id: string,
    type: "nightCommission" | "dayCommission" | "fixedFee",
    currentValue: number
  ) => {
    setEditing({ id, type, value: currentValue });
  };

  const cancelEditing = () => {
    setEditing(null);
  };

  const saveEditing = () => {
    if (editing && editing.value >= 0) {
      updateEstablishment(editing.id, editing.type, editing.value);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: "CHF",
    }).format(amount);
  };

  useEffect(() => {
    fetchEstablishments();
  }, []);

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
              <Settings className="w-5 h-5" />
              Commissions & Frais
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Gestion des commissions et frais fixes par établissement
            </p>
          </div>
          <Button onClick={fetchEstablishments} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {establishments.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-8 h-8 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Aucun établissement trouvé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {establishments.length}
                </div>
                <div className="text-sm text-blue-800">
                  Total établissements
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {establishments.filter((e) => e.enableDayParking).length}
                </div>
                <div className="text-sm text-green-800">
                  Parking jour activé
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {establishments.length > 0
                    ? (
                        establishments.reduce(
                          (sum, e) => sum + e.dayParkingCommissionRate,
                          0
                        ) / establishments.length
                      ).toFixed(1)
                    : 0}
                  %
                </div>
                <div className="text-sm text-orange-800">
                  Commission jour moy.
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(
                    establishments.length > 0
                      ? establishments.reduce((sum, e) => sum + e.fixedFee, 0) /
                          establishments.length
                      : 0
                  )}
                </div>
                <div className="text-sm text-purple-800">Frais fixe moyen</div>
              </div>
            </div>

            {/* Table des établissements */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Établissement</TableHead>
                    <TableHead className="text-center">Parking Jour</TableHead>
                    <TableHead className="text-center">
                      Commission Nuit
                    </TableHead>
                    <TableHead className="text-center">
                      Commission Jour
                    </TableHead>
                    <TableHead className="text-center">Frais Fixes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {establishments.map((establishment) => (
                    <TableRow key={establishment.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {establishment.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            /{establishment.slug}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant={
                            establishment.enableDayParking
                              ? "default"
                              : "secondary"
                          }
                          className={
                            establishment.enableDayParking
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {establishment.enableDayParking
                            ? "Activé"
                            : "Désactivé"}
                        </Badge>
                      </TableCell>

                      {/* Commission Nuit */}
                      <TableCell className="text-center">
                        {editing?.id === establishment.id &&
                        editing.type === "nightCommission" ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editing.value}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  value: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-20 h-8"
                              step="0.1"
                              min="0"
                              max="100"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={saveEditing}
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditing}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <Percent className="w-3 h-3" />
                            <span className="font-medium">
                              {establishment.commissionRate.toFixed(1)}%
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                startEditing(
                                  establishment.id,
                                  "nightCommission",
                                  establishment.commissionRate
                                )
                              }
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>

                      {/* Commission Jour */}
                      <TableCell className="text-center">
                        {establishment.enableDayParking ? (
                          editing?.id === establishment.id &&
                          editing.type === "dayCommission" ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={editing.value}
                                onChange={(e) =>
                                  setEditing({
                                    ...editing,
                                    value: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-20 h-8"
                                step="0.1"
                                min="0"
                                max="100"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={saveEditing}
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditing}
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <Percent className="w-3 h-3" />
                              <span className="font-medium">
                                {establishment.dayParkingCommissionRate.toFixed(
                                  1
                                )}
                                %
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  startEditing(
                                    establishment.id,
                                    "dayCommission",
                                    establishment.dayParkingCommissionRate
                                  )
                                }
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          )
                        ) : (
                          <Badge variant="outline">Désactivé</Badge>
                        )}
                      </TableCell>

                      {/* Frais Fixes */}
                      <TableCell className="text-center">
                        {editing?.id === establishment.id &&
                        editing.type === "fixedFee" ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editing.value}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  value: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-20 h-8"
                              step="0.1"
                              min="0"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={saveEditing}
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditing}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span className="font-medium">
                              {formatCurrency(establishment.fixedFee)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                startEditing(
                                  establishment.id,
                                  "fixedFee",
                                  establishment.fixedFee
                                )
                              }
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
