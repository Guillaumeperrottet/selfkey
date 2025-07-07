"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  DollarSign,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  Target,
} from "lucide-react";

interface BookingVerification {
  id: string;
  bookingDate: string;
  establishmentName: string;
  establishmentSlug: string;
  roomName: string;
  amount: number;
  currency: string;
  commissionRate: number;
  fixedFee: number;
  actualCommission: number;
  expectedCommission: number;
  isCommissionCorrect: boolean;
  commissionDifference: number;
  clientEmail: string;
  stripePaymentIntentId: string | null;
}

interface VerificationSummary {
  totalBookings: number;
  totalCommissions: number;
  commissionsCorrect: number;
  commissionsIncorrect: number;
  accuracy: number;
}

export default function VerifyCommissionsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [summary, setSummary] = useState<VerificationSummary | null>(null);
  const [bookings, setBookings] = useState<BookingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/admin/check-super-admin");
      const data = await response.json();

      if (data.isAuthenticated) {
        setIsAuthenticated(true);
        fetchVerificationData();
      } else {
        router.push("/admin/login");
      }
    } catch {
      router.push("/admin/login");
    }
  };

  const fetchVerificationData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/verify-commissions");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      const data = await response.json();
      setSummary(data.summary);
      setBookings(data.bookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
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

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fr-CH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Vérification des droits d&apos;accès...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/commissions")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Vérification des Commissions</h1>
            <p className="text-gray-600">
              Contrôle de la justesse des calculs de commission
            </p>
          </div>
        </div>
        <Button onClick={fetchVerificationData} disabled={loading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Actualiser
        </Button>
      </div>

      {/* Résumé */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Commissions</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summary.totalCommissions)}
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
                  <p className="text-sm text-gray-600">Précision</p>
                  <p className="text-2xl font-bold">
                    {summary.accuracy.toFixed(1)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Calculs Corrects</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summary.commissionsCorrect}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Erreurs</p>
                  <p className="text-2xl font-bold text-red-600">
                    {summary.commissionsIncorrect}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertes */}
      {summary && summary.commissionsIncorrect > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {summary.commissionsIncorrect} réservation(s) ont des calculs de
            commission incorrects ! Vérifiez les détails ci-dessous.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tableau des réservations */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des 10 Dernières Réservations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Vérification en cours...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Établissement</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Taux / Frais</TableHead>
                    <TableHead>Commission Calculée</TableHead>
                    <TableHead>Commission Attendue</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Stripe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatDate(booking.bookingDate)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.roomName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {booking.establishmentName}
                          </p>
                          <p className="text-sm text-gray-500">
                            /{booking.establishmentSlug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(booking.amount)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{booking.commissionRate}%</p>
                          {booking.fixedFee > 0 && (
                            <p className="text-sm text-gray-500">
                              + {formatCurrency(booking.fixedFee)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            booking.isCommissionCorrect
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {formatCurrency(booking.actualCommission)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(booking.expectedCommission)}
                        {!booking.isCommissionCorrect && (
                          <p className="text-xs text-red-600">
                            Diff: {booking.commissionDifference > 0 ? "+" : ""}
                            {formatCurrency(booking.commissionDifference)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.isCommissionCorrect
                              ? "default"
                              : "destructive"
                          }
                          className={
                            booking.isCommissionCorrect
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {booking.isCommissionCorrect ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Correct
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Erreur
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.stripePaymentIntentId
                              ? "default"
                              : "secondary"
                          }
                        >
                          {booking.stripePaymentIntentId
                            ? "Payé"
                            : "En attente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && bookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune réservation trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
