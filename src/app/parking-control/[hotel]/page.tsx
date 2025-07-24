"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  RefreshCw,
  Car,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";

interface ParkingControlData {
  id: string;
  vehicleNumber: string;
  duration: string;
  startTime: string;
  endTime: string;
  status: "active" | "expired" | "ending_soon";
  timeRemaining?: string;
}

interface ApiResponse {
  success: boolean;
  establishmentName: string;
  data: ParkingControlData[];
  stats: {
    total: number;
    active: number;
    endingSoon: number;
    expired: number;
  };
  lastUpdated: string;
}

export default function ParkingControlPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotel = params.hotel as string;
  const token = searchParams.get("token");

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    if (!token) {
      setError("Token d'accès manquant");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/parking-control/${hotel}?token=${encodeURIComponent(token)}`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Accès non autorisé - Token invalide");
        } else if (response.status === 404) {
          throw new Error("Établissement non trouvé");
        } else {
          throw new Error("Erreur lors du chargement des données");
        }
      }

      const result = await response.json();
      setData(result);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel, token]);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    if (!data || error) return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error]);

  const filteredData =
    data?.data.filter((item) =>
      item.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "ending_soon":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "expired":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "ending_soon":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "En cours";
      case "ending_soon":
        return "Bientôt fini";
      case "expired":
        return "Expiré";
      default:
        return "Inconnu";
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Chargement...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Accès refusé
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">{error}</p>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Contrôle Parking - {data.establishmentName}
            </CardTitle>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Dernière mise à jour : {lastRefresh.toLocaleTimeString("fr-FR")}
              </p>
              <Button
                onClick={fetchData}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Actualiser
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.stats.total}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.stats.active}
              </div>
              <div className="text-sm text-gray-600">En cours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.stats.endingSoon}
              </div>
              <div className="text-sm text-gray-600">Bientôt fini</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.stats.expired}
              </div>
              <div className="text-sm text-gray-600">Expirés</div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une plaque d'immatriculation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Liste des véhicules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Véhicules du jour ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? "Aucun véhicule trouvé pour cette recherche"
                  : "Aucune réservation parking aujourd'hui"}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredData.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-lg font-bold">
                            {item.vehicleNumber}
                          </span>
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">
                              {getStatusLabel(item.status)}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Durée : {item.duration}</span>
                          <span>Début : {formatTime(item.startTime)}</span>
                          <span>Fin : {formatTime(item.endTime)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${
                            item.status === "expired"
                              ? "text-red-600"
                              : item.status === "ending_soon"
                                ? "text-orange-600"
                                : "text-green-600"
                          }`}
                        >
                          {item.timeRemaining}
                        </div>
                        <div className="text-xs text-gray-500">restant</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <Shield className="h-4 w-4" />
              <span>
                Interface sécurisée pour le contrôle des véhicules parking. Mise
                à jour automatique toutes les 30 secondes.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
