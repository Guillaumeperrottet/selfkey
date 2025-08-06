"use client";

import { useState, useEffect } from "react";
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
  RefreshCw,
  DollarSign,
  BarChart3,
  ExternalLink,
  Building2,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface Establishment {
  id: string;
  slug: string;
  name: string;
  stripeOnboarded: boolean;
  totalBookings: number;
  totalRevenue: number;
  lastBooking: string | null;
  nightBookings?: number;
  dayBookings?: number;
  totalCommissions?: number;
}

export function SuperAdminEstablishments() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      const response = await fetch("/api/super-admin/establishments-complete");
      if (!response.ok) throw new Error("Erreur récupération données");

      const data = await response.json();
      setEstablishments(data.establishments || []);
    } catch (error) {
      console.error("Erreur:", error);
      toastUtils.error("Impossible de récupérer les données");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: "CHF",
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Aucune";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

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
              <Building2 className="w-5 h-5" />
              Gestion des Établissements
            </CardTitle>
            <CardDescription>
              Vue d&apos;ensemble des établissements et de leurs performances
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchEstablishments} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Établissements
                    </p>
                    <p className="text-2xl font-bold">
                      {establishments.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Réservations
                    </p>
                    <p className="text-2xl font-bold">
                      {establishments.reduce(
                        (sum, est) => sum + est.totalBookings,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Revenus Totaux
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(
                        establishments.reduce(
                          (sum, est) => sum + est.totalRevenue,
                          0
                        )
                      )}
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
                  <TableHead className="text-center">Réservations</TableHead>
                  <TableHead className="text-center">Revenus</TableHead>
                  <TableHead className="text-center">Dernière Rés.</TableHead>
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
                          {establishment.slug}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="text-sm">
                        <div className="font-medium">
                          {establishment.totalBookings}
                        </div>
                        {establishment.nightBookings !== undefined &&
                          establishment.dayBookings !== undefined && (
                            <div className="text-xs text-gray-500">
                              {establishment.nightBookings} nuit •{" "}
                              {establishment.dayBookings} jour
                            </div>
                          )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-medium">
                      {formatCurrency(establishment.totalRevenue)}
                    </TableCell>

                    <TableCell className="text-center text-sm">
                      {formatDate(establishment.lastBooking)}
                    </TableCell>

                    <TableCell className="text-center">
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={`/admin/${establishment.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
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
