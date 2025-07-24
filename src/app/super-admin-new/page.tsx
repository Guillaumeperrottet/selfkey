"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  ArrowLeft,
  Settings,
  Building2,
  Users,
  Edit,
  Check,
  X,
  RefreshCw,
  LogOut,
  Percent,
  DollarSign,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface Establishment {
  id: string;
  slug: string;
  name: string;
  enableDayParking: boolean;
  dayParkingCommissionRate: number;
  commissionRate: number;
  fixedFee: number;
  stripeOnboarded: boolean;
  totalBookings: number;
  totalRevenue: number;
  lastBooking: string | null;
}

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<
    "dayCommission" | "nightCommission" | "fixedFee" | null
  >(null);
  const [editingValue, setEditingValue] = useState<number>(0);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/check-super-admin");
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);

      if (data.isAuthenticated) {
        fetchEstablishments();
      }
    } catch (error) {
      console.error("Erreur vérification auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const response = await fetch("/api/admin/check-super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        toastUtils.success("Connexion réussie !");
        fetchEstablishments();
      } else {
        toastUtils.error("Identifiants invalides");
      }
    } catch {
      toastUtils.error("Erreur de connexion");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Supprimer le cookie côté client en définissant une date d'expiration passée
      document.cookie =
        "super-admin-session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      setIsAuthenticated(false);
      setEstablishments([]);
      toastUtils.success("Déconnexion réussie");
    } catch {
      toastUtils.error("Erreur lors de la déconnexion");
    }
  };

  const fetchEstablishments = async () => {
    try {
      const response = await fetch("/api/super-admin/establishments-complete");
      if (!response.ok) throw new Error("Erreur récupération données");

      const data = await response.json();
      setEstablishments(data.establishments || []);
    } catch (error) {
      console.error("Erreur:", error);
      toastUtils.error("Impossible de récupérer les données");
    }
  };

  const updateEstablishment = async (
    id: string,
    field: string,
    value: number
  ) => {
    try {
      const response = await fetch(
        `/api/super-admin/establishments/${id}/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        }
      );

      if (!response.ok) throw new Error("Erreur mise à jour");

      setEstablishments((prev) =>
        prev.map((est) => (est.id === id ? { ...est, [field]: value } : est))
      );

      toastUtils.success("Mise à jour réussie");
      setEditingId(null);
      setEditingType(null);
    } catch {
      toastUtils.error("Erreur lors de la mise à jour");
    }
  };

  const startEditing = (
    id: string,
    type: "dayCommission" | "nightCommission" | "fixedFee",
    currentValue: number
  ) => {
    setEditingId(id);
    setEditingType(type);
    setEditingValue(currentValue);
  };

  const saveEditing = () => {
    if (!editingId || !editingType) return;

    const fieldMap = {
      dayCommission: "dayParkingCommissionRate",
      nightCommission: "commissionRate",
      fixedFee: "fixedFee",
    };

    updateEstablishment(editingId, fieldMap[editingType], editingValue);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingType(null);
    setEditingValue(0);
  };

  // Interface de connexion
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="SelfKey"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <h1 className="text-2xl font-bold">SelfKey</h1>
            </div>
            <CardTitle className="text-xl">Super Admin</CardTitle>
            <CardDescription>
              Accès restreint aux administrateurs autorisés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@selfkey.local"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" disabled={loginLoading} className="w-full">
                {loginLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="link" asChild size="sm">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Retour à l&apos;accueil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface Super Admin principale
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Card className="shadow-xl mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Image
                  src="/logo.png"
                  alt="SelfKey"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <CardTitle className="text-2xl">
                    Super Admin Dashboard
                  </CardTitle>
                  <CardDescription>
                    Gestion complète de la plateforme SelfKey
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={fetchEstablishments}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualiser
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Établissements
                  </p>
                  <p className="text-2xl font-bold">{establishments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Revenus Total
                  </p>
                  <p className="text-2xl font-bold">
                    {establishments
                      .reduce((sum, e) => sum + (e.totalRevenue || 0), 0)
                      .toFixed(2)}{" "}
                    CHF
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Parking Jour Actif
                  </p>
                  <p className="text-2xl font-bold">
                    {establishments.filter((e) => e.enableDayParking).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Percent className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Commission Moy.
                  </p>
                  <p className="text-2xl font-bold">
                    {establishments.length > 0
                      ? (
                          establishments.reduce(
                            (sum, e) => sum + e.dayParkingCommissionRate,
                            0
                          ) / establishments.length
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table des établissements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Gestion des Établissements
            </CardTitle>
            <CardDescription>
              Configuration des commissions, frais fixes et accès aux interfaces
              clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Établissement</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-center">
                      Commission Nuit
                    </TableHead>
                    <TableHead className="text-center">
                      Commission Jour
                    </TableHead>
                    <TableHead className="text-center">Frais Fixes</TableHead>
                    <TableHead className="text-center">Statistiques</TableHead>
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
                        <div className="space-y-1">
                          <Badge
                            variant={
                              establishment.stripeOnboarded
                                ? "default"
                                : "secondary"
                            }
                          >
                            {establishment.stripeOnboarded
                              ? "Stripe OK"
                              : "Config Stripe"}
                          </Badge>
                          {establishment.enableDayParking && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700"
                            >
                              Parking Jour
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        {editingId === establishment.id &&
                        editingType === "nightCommission" ? (
                          <div className="flex items-center gap-2 justify-center">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={editingValue}
                              onChange={(e) =>
                                setEditingValue(parseFloat(e.target.value) || 0)
                              }
                              className="w-20 text-center"
                            />
                            <span className="text-sm">%</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="font-mono">
                            {establishment.commissionRate}%
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        {editingId === establishment.id &&
                        editingType === "dayCommission" ? (
                          <div className="flex items-center gap-2 justify-center">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={editingValue}
                              onChange={(e) =>
                                setEditingValue(parseFloat(e.target.value) || 0)
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
                        {editingId === establishment.id &&
                        editingType === "fixedFee" ? (
                          <div className="flex items-center gap-2 justify-center">
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={editingValue}
                              onChange={(e) =>
                                setEditingValue(parseFloat(e.target.value) || 0)
                              }
                              className="w-20 text-center"
                            />
                            <span className="text-sm">CHF</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="font-mono">
                            {establishment.fixedFee} CHF
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="space-y-1 text-xs">
                          <div>
                            {establishment.totalBookings || 0} réservations
                          </div>
                          <div className="font-mono">
                            {(establishment.totalRevenue || 0).toFixed(2)} CHF
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center gap-1 justify-center flex-wrap">
                          {editingId === establishment.id ? (
                            <>
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
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  startEditing(
                                    establishment.id,
                                    "nightCommission",
                                    establishment.commissionRate
                                  )
                                }
                                className="h-8 w-8 p-0"
                                title="Modifier commission nuit"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  startEditing(
                                    establishment.id,
                                    "dayCommission",
                                    establishment.dayParkingCommissionRate
                                  )
                                }
                                className="h-8 w-8 p-0"
                                title="Modifier commission jour"
                              >
                                <Percent className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  startEditing(
                                    establishment.id,
                                    "fixedFee",
                                    establishment.fixedFee
                                  )
                                }
                                className="h-8 w-8 p-0"
                                title="Modifier frais fixes"
                              >
                                <DollarSign className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="h-8 w-8 p-0"
                                title="Accéder à l'interface admin"
                              >
                                <Link
                                  href={`/admin/${establishment.slug}`}
                                  target="_blank"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
