"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Users,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

interface StripePayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  applicationFeeAmount: number;
  connectedAccountId: string;
  establishmentName: string;
  bookingId: string;
  clientEmail: string;
  paymentMethod: string;
  transferId?: string;
  refunded: boolean;
  refundAmount?: number;
}

interface StripeDashboardStats {
  totalPayments: number;
  totalCommissions: number;
  totalRefunds: number;
  successRate: number;
  averageCommissionRate: number;
  paymentsToday: number;
  commissionsToday: number;
  connectedAccounts: number;
  pendingPayments: number;
}

export function StripeDashboard() {
  const [payments, setPayments] = useState<StripePayment[]>([]);
  const [stats, setStats] = useState<StripeDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchStripeData();
  }, []);

  const fetchStripeData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/stripe-monitoring");
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPayments(data.payments || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Erreur lors du chargement des données Stripe:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: "CHF",
    }).format(amount / 100); // Stripe utilise les centimes
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("fr-CH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp * 1000));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Réussi
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Échoué
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="w-4 h-4" />;
      case "twint":
        return <span className="text-blue-600 font-bold text-xs">TWINT</span>;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données Stripe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchStripeData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoring Stripe</h2>
          <p className="text-gray-600">
            Surveillance des paiements et commissions en temps réel
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchStripeData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              window.open("https://dashboard.stripe.com", "_blank")
            }
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Dashboard Stripe
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Paiements</p>
                  <p className="text-2xl font-bold">{stats.totalPayments}</p>
                  <p className="text-xs text-gray-500">
                    {stats.paymentsToday} aujourd&apos;hui
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Commissions</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalCommissions)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(stats.commissionsToday)} aujourd&apos;hui
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
                  <p className="text-sm text-gray-600">Taux de Réussite</p>
                  <p className="text-2xl font-bold">
                    {stats.successRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.pendingPayments} en attente
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Comptes Connectés</p>
                  <p className="text-2xl font-bold">
                    {stats.connectedAccounts}
                  </p>
                  <p className="text-xs text-gray-500">
                    Taux moyen: {stats.averageCommissionRate.toFixed(1)}%
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tableau des paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Paiements Récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Hôtel</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Mode Paiement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(payment.created)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(payment.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        {formatCurrency(payment.applicationFeeAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(
                          (payment.applicationFeeAmount / payment.amount) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {payment.establishmentName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.connectedAccountId.slice(0, 20)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{payment.clientEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="text-sm capitalize">
                          {payment.paymentMethod}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                      {payment.refunded && (
                        <div className="text-xs text-red-600 mt-1">
                          Remboursé: {formatCurrency(payment.refundAmount || 0)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://dashboard.stripe.com/payments/${payment.id}`,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        {payment.transferId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `https://dashboard.stripe.com/transfers/${payment.transferId}`,
                                "_blank"
                              )
                            }
                          >
                            <TrendingUp className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {payments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun paiement trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
