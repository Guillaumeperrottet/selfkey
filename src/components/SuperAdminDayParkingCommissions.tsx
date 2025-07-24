"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  Percent,
  Edit3,
  Save,
  Car,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface Establishment {
  id: string;
  name: string;
  slug: string;
  commissionRate: number;
  dayParkingCommissionRate: number;
  enableDayParking: boolean;
  stripeOnboarded: boolean;
}

export function SuperAdminDayParkingCommissions() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEstablishment, setEditingEstablishment] =
    useState<Establishment | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/super-admin/establishments-commissions"
      );

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

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const handleEditCommission = (establishment: Establishment) => {
    setEditingEstablishment(establishment);
    setNewCommissionRate(establishment.dayParkingCommissionRate.toString());
  };

  const handleSaveCommission = async () => {
    if (!editingEstablishment) return;

    const rate = parseFloat(newCommissionRate);

    if (isNaN(rate) || rate < 0 || rate > 50) {
      toastUtils.error("Le taux de commission doit être entre 0% et 50%");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/super-admin/establishments/${editingEstablishment.id}/day-parking-commission`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dayParkingCommissionRate: rate,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      toastUtils.success("Taux de commission mis à jour avec succès");

      // Mettre à jour la liste locale
      setEstablishments((prev) =>
        prev.map((est) =>
          est.id === editingEstablishment.id
            ? { ...est, dayParkingCommissionRate: rate }
            : est
        )
      );

      setEditingEstablishment(null);
      setNewCommissionRate("");
    } catch (error) {
      console.error("Erreur:", error);
      toastUtils.error("Impossible de mettre à jour le taux de commission");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (establishment: Establishment) => {
    if (!establishment.stripeOnboarded) {
      return <Badge variant="destructive">Stripe non configuré</Badge>;
    }
    if (!establishment.enableDayParking) {
      return <Badge variant="secondary">Parking jour désactivé</Badge>;
    }
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Actif
      </Badge>
    );
  };

  const calculateCommissionAmount = (
    rate: number,
    exampleAmount: number = 20
  ) => {
    return ((exampleAmount * rate) / 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Gestion des Commissions Parking Jour
            </CardTitle>
            <Button
              onClick={fetchEstablishments}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {establishments.length}
              </div>
              <div className="text-sm text-blue-800">Établissements totaux</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Car className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {establishments.filter((e) => e.enableDayParking).length}
              </div>
              <div className="text-sm text-green-800">Parking jour activé</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {establishments.length > 0
                  ? (
                      establishments.reduce(
                        (sum, e) => sum + e.dayParkingCommissionRate,
                        0
                      ) / establishments.length
                    ).toFixed(1)
                  : "0"}
                %
              </div>
              <div className="text-sm text-purple-800">Commission moyenne</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table des établissements */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration des Commissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Chargement des établissements...</p>
            </div>
          ) : establishments.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Aucun établissement trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Établissement</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Commission Nuit</TableHead>
                    <TableHead>Commission Parking Jour</TableHead>
                    <TableHead>Exemple (20 CHF)</TableHead>
                    <TableHead>Actions</TableHead>
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
                      <TableCell>{getStatusBadge(establishment)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Percent className="w-3 h-3 mr-1" />
                          {establishment.commissionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            establishment.enableDayParking
                              ? "default"
                              : "secondary"
                          }
                          className={
                            establishment.enableDayParking
                              ? "bg-blue-100 text-blue-800"
                              : ""
                          }
                        >
                          <Car className="w-3 h-3 mr-1" />
                          {establishment.dayParkingCommissionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">
                            {calculateCommissionAmount(
                              establishment.dayParkingCommissionRate
                            )}{" "}
                            CHF
                          </span>
                          <div className="text-xs text-gray-500">
                            Commission sur 20 CHF
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleEditCommission(establishment)
                              }
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Modifier
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Modifier la Commission Parking Jour
                              </DialogTitle>
                              <DialogDescription>
                                Établissement :{" "}
                                <strong>{establishment.name}</strong>
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="commission">
                                  Taux de commission parking jour (%)
                                </Label>
                                <Input
                                  id="commission"
                                  type="number"
                                  min="0"
                                  max="50"
                                  step="0.1"
                                  value={newCommissionRate}
                                  onChange={(e) =>
                                    setNewCommissionRate(e.target.value)
                                  }
                                  placeholder="Ex: 5.0"
                                />
                                <div className="text-sm text-gray-500">
                                  Taux actuel :{" "}
                                  {establishment.dayParkingCommissionRate}%
                                </div>
                              </div>

                              {newCommissionRate &&
                                !isNaN(parseFloat(newCommissionRate)) && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="text-sm">
                                      <strong>Simulation :</strong>
                                      <div className="mt-1">
                                        • Parking 20 CHF → Commission :{" "}
                                        {calculateCommissionAmount(
                                          parseFloat(newCommissionRate)
                                        )}{" "}
                                        CHF
                                      </div>
                                      <div>
                                        • Parking 35 CHF → Commission :{" "}
                                        {calculateCommissionAmount(
                                          parseFloat(newCommissionRate),
                                          35
                                        )}{" "}
                                        CHF
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleSaveCommission}
                                disabled={saving || !newCommissionRate}
                              >
                                {saving ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Enregistrement...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Enregistrer
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
