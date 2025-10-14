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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Car,
  Clock,
  Search,
  Printer,
  Phone,
  Mail,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  QrCode,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface DayParkingBooking {
  id: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  clientVehicleNumber: string;
  dayParkingDuration: string;
  dayParkingStartTime: string;
  dayParkingEndTime: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  emailConfirmation: boolean;
}

interface DayParkingControlTableProps {
  hotelSlug: string;
}

export function DayParkingControlTable({
  hotelSlug,
}: DayParkingControlTableProps) {
  const [bookings, setBookings] = useState<DayParkingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/${hotelSlug}/day-parking-control?date=${filterDate}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des réservations");
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Erreur:", error);
      toastUtils.error("Impossible de récupérer les réservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelSlug, filterDate]);

  const getDurationLabel = (duration: string) => {
    const labels = {
      "1h": "1h",
      "2h": "2h",
      "3h": "3h",
      "4h": "4h",
      half_day: "Demi-journée",
      full_day: "Journée",
    };
    return labels[duration as keyof typeof labels] || duration;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
      case "paid":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Payé
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Échec
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isExpired = (endTime: string) => {
    return new Date() > new Date(endTime);
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.clientLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.clientFirstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.clientVehicleNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const handleAccessSettings = () => {
    // Ouvrir les paramètres dans un nouvel onglet
    window.open(`/admin/${hotelSlug}#parking-access`, "_blank");
  };

  // Fonctions pour le contrôle d'accès
  const token = `${hotelSlug}-parking-control-2025`;
  const controlUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/parking-control/${hotelSlug}?token=${encodeURIComponent(token)}`;

  const generateQrCode = async () => {
    setIsGeneratingQr(true);
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(controlUrl)}`;
      setQrCodeUrl(qrUrl);
    } catch {
      toastUtils.error("Erreur lors de la génération du QR code");
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(controlUrl);
      toastUtils.success("URL copiée dans le presse-papier");
    } catch {
      toastUtils.error("Erreur lors de la copie");
    }
  };

  const openControlPreview = () => {
    window.open(controlUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header et contrôles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Contrôle Parking Jour
            </CardTitle>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Accès Contrôle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      Accès Contrôle Parking
                    </DialogTitle>
                    <DialogDescription>
                      Interface sécurisée pour le contrôle des véhicules
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* URL d'accès */}
                    <div>
                      <label className="text-sm font-medium">
                        URL d&apos;accès :
                      </label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={controlUrl}
                          readOnly
                          className="text-xs"
                        />
                        <Button onClick={copyUrl} variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="text-center space-y-2">
                      {!qrCodeUrl ? (
                        <Button
                          onClick={generateQrCode}
                          disabled={isGeneratingQr}
                          variant="outline"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          {isGeneratingQr ? "Génération..." : "Générer QR Code"}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <div className="inline-block p-2 bg-white border rounded">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={qrCodeUrl}
                              alt="QR Code contrôle parking"
                              className="w-32 h-32"
                            />
                          </div>
                          <Button
                            onClick={generateQrCode}
                            variant="outline"
                            size="sm"
                          >
                            Régénérer
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={openControlPreview}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Prévisualiser
                      </Button>
                      <Button
                        onClick={handleAccessSettings}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Paramètres
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filtre par date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-auto"
              />
            </div>

            {/* Recherche */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Nom, prénom, plaque ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Bouton actualiser */}
            <div className="flex items-end">
              <Button
                onClick={fetchBookings}
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
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredBookings.length}
              </div>
              <div className="text-sm text-blue-800">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {
                  filteredBookings.filter((b) => b.paymentStatus === "paid")
                    .length
                }
              </div>
              <div className="text-sm text-green-800">Payés</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {
                  filteredBookings.filter((b) => isExpired(b.dayParkingEndTime))
                    .length
                }
              </div>
              <div className="text-sm text-red-800">Expirés</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {filteredBookings
                  .reduce((sum, b) => {
                    // Calcul du revenu net après commission (5% par défaut)
                    const commissionRate = 5.0; // Taux par défaut
                    const netAmount = b.amount * (1 - commissionRate / 100);
                    return sum + netAmount;
                  }, 0)
                  .toFixed(2)}{" "}
                CHF
              </div>
              <div className="text-sm text-gray-800">Revenus nets</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table des réservations */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Chargement des réservations...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Aucune réservation trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Horaires</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      className={
                        isExpired(booking.dayParkingEndTime) ? "bg-red-50" : ""
                      }
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {booking.clientFirstName} {booking.clientLastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            <CalendarDays className="w-3 h-3 inline mr-1" />
                            {formatDate(booking.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono font-medium">
                          {booking.clientVehicleNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getDurationLabel(booking.dayParkingDuration)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-green-600" />
                            {formatTime(booking.dayParkingStartTime)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-red-600" />
                            {formatTime(booking.dayParkingEndTime)}
                          </div>
                          {isExpired(booking.dayParkingEndTime) && (
                            <Badge variant="destructive" className="text-xs">
                              Expiré
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(booking.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {booking.amount.toFixed(2)} CHF
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.clientPhone}
                          </div>
                          {booking.emailConfirmation && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span className="text-xs">Email envoyé</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Styles pour l'impression */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body * {
            visibility: hidden;
          }

          .print-area,
          .print-area * {
            visibility: visible;
          }

          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          th {
            background-color: #f8f9fa !important;
          }
        }
      `}</style>
    </div>
  );
}
