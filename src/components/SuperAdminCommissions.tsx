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
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface Establishment {
  id: string;
  slug: string;
  name: string;
  enableDayParking: boolean;
  dayParkingCommissionRate: number;
  commissionRate: number; // Commission nuit
}

export function SuperAdminCommissions() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<number>(0);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/super-admin/establishments");

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

  const updateCommission = async (establishmentId: string, newRate: number) => {
    try {
      const response = await fetch(
        `/api/super-admin/establishments/${establishmentId}/commission`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dayParkingCommissionRate: newRate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      // Mettre à jour localement
      setEstablishments((prev) =>
        prev.map((est) =>
          est.id === establishmentId
            ? { ...est, dayParkingCommissionRate: newRate }
            : est
        )
      );

      toastUtils.success("Commission mise à jour avec succès");
      setEditingId(null);
    } catch (error) {
      console.error("Erreur:", error);
      toastUtils.error("Erreur lors de la mise à jour de la commission");
    }
  };

  const startEditing = (id: string, currentRate: number) => {
    setEditingId(id);
    setEditingRate(currentRate);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingRate(0);
  };

  const saveEditing = () => {
    if (editingId && editingRate >= 0 && editingRate <= 100) {
      updateCommission(editingId, editingRate);
    } else {
      toastUtils.error("Le taux doit être entre 0% et 100%");
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Chargement des établissements...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Gestion des Commissions Parking Jour
          </CardTitle>
          <Button onClick={fetchEstablishments} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Configurez individuellement les taux de commission pour les parkings
          jour de chaque établissement.
        </p>
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
                  Commission moyenne
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {
                    establishments.filter(
                      (e) => e.dayParkingCommissionRate !== 5.0
                    ).length
                  }
                </div>
                <div className="text-sm text-purple-800">
                  Taux personnalisés
                </div>
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
                    <TableHead className="text-center">Actions</TableHead>
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
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">
                          {establishment.commissionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === establishment.id ? (
                          <div className="flex items-center gap-2 justify-center">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={editingRate}
                              onChange={(e) =>
                                setEditingRate(parseFloat(e.target.value) || 0)
                              }
                              className="w-20 text-center"
                            />
                            <span className="text-sm">%</span>
                          </div>
                        ) : (
                          <Badge
                            variant={
                              establishment.dayParkingCommissionRate === 5.0
                                ? "outline"
                                : "default"
                            }
                            className={`font-mono ${
                              establishment.dayParkingCommissionRate === 5.0
                                ? ""
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {establishment.dayParkingCommissionRate}%
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === establishment.id ? (
                          <div className="flex items-center gap-1 justify-center">
                            <Button
                              size="sm"
                              onClick={saveEditing}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              startEditing(
                                establishment.id,
                                establishment.dayParkingCommissionRate
                              )
                            }
                            disabled={!establishment.enableDayParking}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Informations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-2">
                <Percent className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">
                    Informations importantes :
                  </p>
                  <ul className="text-blue-700 space-y-1 list-disc list-inside">
                    <li>
                      Le taux par défaut est de 5% pour tous les nouveaux
                      établissements
                    </li>
                    <li>
                      Les commissions s&apos;appliquent uniquement aux
                      réservations parking jour
                    </li>
                    <li>
                      Les parkings nuit utilisent le taux de commission standard
                    </li>
                    <li>
                      Les modifications sont appliquées immédiatement aux
                      nouvelles réservations
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
