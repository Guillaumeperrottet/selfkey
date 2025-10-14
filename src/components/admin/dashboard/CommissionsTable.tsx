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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  Edit,
  Eye,
  Calendar,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { EditCommissionModal } from "@/components/super-admin/EditCommissionModal";

interface EstablishmentCommission {
  id: string;
  name: string;
  slug: string;
  commissionRate: number;
  fixedFee: number;
  totalCommissions: number;
  totalBookings: number;
  lastBookingDate: Date | string | null;
  stripeOnboarded: boolean;
  monthlyCommissions: number;
  averageBookingValue: number;
}

export function CommissionsTable() {
  const [establishments, setEstablishments] = useState<
    EstablishmentCommission[]
  >([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState<
    EstablishmentCommission[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] =
    useState<keyof EstablishmentCommission>("totalCommissions");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] =
    useState<EstablishmentCommission | null>(null);

  useEffect(() => {
    fetchEstablishments();
  }, []);

  useEffect(() => {
    const filtered = establishments.filter(
      (est) =>
        est.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Tri
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    setFilteredEstablishments(filtered);
  }, [establishments, searchTerm, sortField, sortOrder]);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/commissions");
      const data = await response.json();
      setEstablishments(data);
    } catch (error) {
      console.error("Erreur lors du chargement des établissements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof EstablishmentCommission) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleEditCommission = (establishment: EstablishmentCommission) => {
    setSelectedEstablishment(establishment);
    setEditModalOpen(true);
  };

  const handleUpdateCommission = (updatedData: {
    id: string;
    commissionRate: number;
    fixedFee: number;
  }) => {
    // Mettre à jour les données locales
    setEstablishments((prev) =>
      prev.map((est) =>
        est.id === updatedData.id
          ? {
              ...est,
              commissionRate: updatedData.commissionRate,
              fixedFee: updatedData.fixedFee,
            }
          : est
      )
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: "CHF",
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rate / 100);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Jamais";

    try {
      const dateObj = date instanceof Date ? date : new Date(date);

      // Vérifier si la date est valide
      if (isNaN(dateObj.getTime())) {
        return "Date invalide";
      }

      return new Intl.DateTimeFormat("fr-CH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(dateObj);
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error, date);
      return "Date invalide";
    }
  };

  const exportToCsv = () => {
    const csvContent = [
      [
        "Nom",
        "Slug",
        "Taux Commission",
        "Frais Fixes",
        "Total Commissions",
        "Réservations",
        "Commission Mensuelle",
        "Valeur Moyenne",
        "Dernière Réservation",
        "Stripe Activé",
      ].join(","),
      ...filteredEstablishments.map((est) =>
        [
          est.name,
          est.slug,
          est.commissionRate,
          est.fixedFee,
          est.totalCommissions,
          est.totalBookings,
          est.monthlyCommissions,
          est.averageBookingValue,
          formatDate(est.lastBookingDate),
          est.stripeOnboarded ? "Oui" : "Non",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `commissions-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres et actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un établissement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
          <Select
            value={`${sortField}-${sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split("-");
              setSortField(field as keyof EstablishmentCommission);
              setSortOrder(order as "asc" | "desc");
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totalCommissions-desc">
                Commissions (↓)
              </SelectItem>
              <SelectItem value="totalCommissions-asc">
                Commissions (↑)
              </SelectItem>
              <SelectItem value="totalBookings-desc">
                Réservations (↓)
              </SelectItem>
              <SelectItem value="totalBookings-asc">
                Réservations (↑)
              </SelectItem>
              <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
              <SelectItem value="commissionRate-desc">Taux (↓)</SelectItem>
              <SelectItem value="commissionRate-asc">Taux (↑)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={exportToCsv}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Commissions</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    filteredEstablishments.reduce(
                      (sum, est) => sum + est.totalCommissions,
                      0
                    )
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ce Mois</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    filteredEstablishments.reduce(
                      (sum, est) => sum + est.monthlyCommissions,
                      0
                    )
                  )}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Établissements</p>
                <p className="text-2xl font-bold">
                  {filteredEstablishments.length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Détail par Établissement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("name")}
                  >
                    Établissement
                    {sortField === "name" &&
                      (sortOrder === "asc" ? " ↑" : " ↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("commissionRate")}
                  >
                    Taux
                    {sortField === "commissionRate" &&
                      (sortOrder === "asc" ? " ↑" : " ↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("totalCommissions")}
                  >
                    Total Commissions
                    {sortField === "totalCommissions" &&
                      (sortOrder === "asc" ? " ↑" : " ↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("monthlyCommissions")}
                  >
                    Ce Mois
                    {sortField === "monthlyCommissions" &&
                      (sortOrder === "asc" ? " ↑" : " ↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("totalBookings")}
                  >
                    Réservations
                    {sortField === "totalBookings" &&
                      (sortOrder === "asc" ? " ↑" : " ↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("averageBookingValue")}
                  >
                    Valeur Moyenne
                    {sortField === "averageBookingValue" &&
                      (sortOrder === "asc" ? " ↑" : " ↓")}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstablishments.map((establishment) => (
                  <TableRow key={establishment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{establishment.name}</p>
                        <p className="text-sm text-gray-500">
                          /{establishment.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {formatPercentage(establishment.commissionRate)}
                        </p>
                        {establishment.fixedFee > 0 && (
                          <p className="text-sm text-gray-500">
                            + {formatCurrency(establishment.fixedFee)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(establishment.totalCommissions)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(establishment.monthlyCommissions)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {establishment.totalBookings}
                        </p>
                        <p className="text-sm text-gray-500">
                          Dernière: {formatDate(establishment.lastBookingDate)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(establishment.averageBookingValue)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          establishment.stripeOnboarded
                            ? "default"
                            : "secondary"
                        }
                        className={
                          establishment.stripeOnboarded
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {establishment.stripeOnboarded
                          ? "Stripe OK"
                          : "Stripe KO"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `/${establishment.slug}/admin`,
                              "_blank"
                            )
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCommission(establishment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEstablishments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun établissement trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'édition des commissions */}
      {selectedEstablishment && (
        <EditCommissionModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedEstablishment(null);
          }}
          establishment={selectedEstablishment}
          onUpdate={handleUpdateCommission}
        />
      )}
    </div>
  );
}
