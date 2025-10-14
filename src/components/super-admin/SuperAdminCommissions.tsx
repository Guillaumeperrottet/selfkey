"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Search,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";
import { useTableSortAndFilter } from "@/hooks/useTableSortAndFilter";
import { SortableHeader } from "@/components/ui/sortable-header";
import { StatsCard } from "@/components/ui/modern-table";

interface Establishment {
  id: string;
  slug: string;
  name: string;
  enableDayParking: boolean;
  parkingOnlyMode: boolean; // Mode parking uniquement (pas de nuitées)
  dayParkingCommissionRate: number;
  commissionRate: number; // Commission nuit
  fixedFee: number; // Frais fixes nuit
  dayParkingFixedFee: number; // Frais fixes jour
}

interface EditingState {
  id: string;
  type: "nightCommission" | "dayCommission" | "fixedFee" | "dayFixedFee";
  value: number;
}

export function SuperAdminCommissions() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingState | null>(null);

  // Hook pour le tri et la recherche
  const {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    filteredAndSortedData,
  } = useTableSortAndFilter({
    data: establishments,
    searchFields: ["name", "slug"],
    defaultSortField: "name",
    defaultSortDirection: "asc",
  });

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
    type: "nightCommission" | "dayCommission" | "fixedFee" | "dayFixedFee",
    newValue: number
  ) => {
    try {
      const fieldMap = {
        nightCommission: "commissionRate",
        dayCommission: "dayParkingCommissionRate",
        fixedFee: "fixedFee",
        dayFixedFee: "dayParkingFixedFee",
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
    type: "nightCommission" | "dayCommission" | "fixedFee" | "dayFixedFee",
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
    <div className="space-y-6">
      {/* En-tête avec recherche */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Commissions & Frais
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestion des commissions et frais fixes par établissement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un établissement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 h-9 border-gray-300 focus:border-gray-500 focus:ring-gray-500 dark:border-gray-600 dark:focus:border-gray-400"
            />
          </div>
          <Button
            onClick={fetchEstablishments}
            variant="outline"
            size="sm"
            className="h-9"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      {filteredAndSortedData.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12">
            <div className="text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? "Aucun résultat trouvé" : "Aucun établissement"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? `Aucun établissement trouvé pour "${searchTerm}"`
                  : "Aucun établissement disponible pour le moment"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Statistiques modernes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total établissements"
              value={establishments.length}
              icon={<Building2 className="w-8 h-8" />}
              variant="blue"
            />

            <StatsCard
              title="Commission jour moy."
              value={`${
                establishments.length > 0
                  ? (
                      establishments.reduce(
                        (sum, e) => sum + e.dayParkingCommissionRate,
                        0
                      ) / establishments.length
                    ).toFixed(1)
                  : 0
              }%`}
              icon={<Percent className="w-8 h-8" />}
              variant="orange"
            />

            <StatsCard
              title="Frais fixe nuit moy."
              value={formatCurrency(
                establishments.length > 0
                  ? establishments.reduce((sum, e) => sum + e.fixedFee, 0) /
                      establishments.length
                  : 0
              )}
              icon={<DollarSign className="w-8 h-8" />}
              variant="purple"
            />

            <StatsCard
              title="Frais fixe jour moy."
              value={formatCurrency(
                establishments.length > 0
                  ? establishments.reduce(
                      (sum, e) => sum + e.dayParkingFixedFee,
                      0
                    ) / establishments.length
                  : 0
              )}
              icon={<DollarSign className="w-8 h-8" />}
              variant="teal"
            />
          </div>

          {/* Table moderne des établissements */}
          <Card className="border-0 shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortableHeader
                        sortField="name"
                        currentSortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      >
                        Établissement
                      </SortableHeader>
                    </TableHead>
                    <TableHead className="text-center">
                      <SortableHeader
                        sortField="enableDayParking"
                        currentSortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      >
                        Parking Jour
                      </SortableHeader>
                    </TableHead>
                    <TableHead className="text-center">Parking Nuit</TableHead>
                    <TableHead className="text-center">
                      <SortableHeader
                        sortField="commissionRate"
                        currentSortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      >
                        Commission Nuit
                      </SortableHeader>
                    </TableHead>
                    <TableHead className="text-center">
                      <SortableHeader
                        sortField="dayParkingCommissionRate"
                        currentSortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      >
                        Commission Jour
                      </SortableHeader>
                    </TableHead>
                    <TableHead className="text-center">
                      <SortableHeader
                        sortField="fixedFee"
                        currentSortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      >
                        Frais Fixes Nuit
                      </SortableHeader>
                    </TableHead>
                    <TableHead className="text-center">
                      <SortableHeader
                        sortField="dayParkingFixedFee"
                        currentSortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      >
                        Frais Fixes Jour
                      </SortableHeader>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedData.map((establishment) => (
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
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              : ""
                          }
                        >
                          {establishment.enableDayParking
                            ? "Activé"
                            : "Désactivé"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant={
                            !establishment.parkingOnlyMode
                              ? "default"
                              : "secondary"
                          }
                          className={
                            !establishment.parkingOnlyMode
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              : ""
                          }
                        >
                          {!establishment.parkingOnlyMode
                            ? "Activé"
                            : "Désactivé"}
                        </Badge>
                      </TableCell>

                      {/* Commission Nuit */}
                      <TableCell className="text-center">
                        {!establishment.parkingOnlyMode ? (
                          editing?.id === establishment.id &&
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
                          )
                        ) : (
                          <Badge variant="outline">Désactivé</Badge>
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

                      {/* Frais Fixes Nuit */}
                      <TableCell className="text-center">
                        {!establishment.parkingOnlyMode ? (
                          editing?.id === establishment.id &&
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
                          )
                        ) : (
                          <Badge variant="outline">Désactivé</Badge>
                        )}
                      </TableCell>

                      {/* Frais Fixes Jour */}
                      <TableCell className="text-center">
                        {establishment.enableDayParking ? (
                          editing?.id === establishment.id &&
                          editing.type === "dayFixedFee" ? (
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
                                {formatCurrency(
                                  establishment.dayParkingFixedFee
                                )}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  startEditing(
                                    establishment.id,
                                    "dayFixedFee",
                                    establishment.dayParkingFixedFee
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
