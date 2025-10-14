"use client";

import { useState } from "react";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, BarChart3, Eye, Users, Building } from "lucide-react";

interface Room {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

interface Booking {
  id: string;
  bookingDate: Date;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  amount: number;
  touristTaxTotal: number;
  paymentStatus: string;
  bookingType: string;
  adults: number;
  children: number;
  room: {
    id: string;
    name: string;
    price: number;
  } | null;
}

interface Establishment {
  name: string;
  slug: string;
  commissionRate: number;
  fixedFee: number;
}

interface PublicDashboardClientProps {
  establishment: Establishment;
  rooms: Room[];
  bookings: Booking[];
}

export function PublicDashboardClient({
  establishment,
  rooms,
  bookings,
}: PublicDashboardClientProps) {
  const [chartColors] = useState({
    chart1: "#3b82f6",
    chart2: "#10b981",
    chart3: "#f59e0b",
    chart4: "#ef4444",
    chart5: "#8b5cf6",
  });

  // Transformer les données pour correspondre au format attendu par DashboardCharts
  const roomsWithInventory = rooms.map((room) => ({
    ...room,
    inventory: 1, // Inventaire par défaut pour la compatibilité
  }));

  // Transformer les bookings pour correspondre au format attendu
  const dashboardBookings = bookings.map((booking) => ({
    id: booking.id,
    clientFirstName: "Anonyme", // Données anonymisées
    clientLastName: "Client",
    clientEmail: "anonyme@exemple.com",
    amount: booking.amount,
    guests: booking.guests,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    bookingDate: booking.bookingDate,
    touristTaxTotal: booking.touristTaxTotal,
    room: booking.room,
  }));

  // Calculer les statistiques de base
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter((room) => room.isActive).length;
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + booking.amount,
    0
  );
  const occupancyRate =
    totalRooms > 0 ? Math.round((totalBookings / (totalRooms * 30)) * 100) : 0; // Approximation sur 30 jours

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec indication que c'est une version publique */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building className="h-8 w-8 text-blue-600" />
                {establishment.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Tableau de bord public - Données anonymisées
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                Version publique sécurisée
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Lecture seule
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Informations importantes */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Confidentialité et sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-800">
                    ✅ Données visibles :
                  </h4>
                  <ul className="space-y-1 text-green-700">
                    <li>• Statistiques générales</li>
                    <li>• Graphiques de performance</li>
                    <li>• Taux d&apos;occupation</li>
                    <li>• Revenus globaux</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-red-800">
                    🔒 Données protégées :
                  </h4>
                  <ul className="space-y-1 text-red-700">
                    <li>• Informations personnelles des clients</li>
                    <li>• Coordonnées et adresses</li>
                    <li>• Numéros de téléphone et emails</li>
                    <li>• Données de paiement</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques rapides */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Places totales
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRooms}</div>
              <p className="text-xs text-muted-foreground">
                {activeRooms} actives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Réservations totales
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                Toutes périodes confondues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenus nets totaux
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue.toFixed(2)} CHF
              </div>
              <p className="text-xs text-muted-foreground">Après commissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taux d&apos;occupation
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">
                Estimation mensuelle
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques et analyses */}
        {bookings.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Analyses et statistiques
                </h2>
                <p className="text-muted-foreground">
                  Visualisez les performances de l&apos;établissement (données
                  anonymisées)
                </p>
              </div>
            </div>
            <DashboardCharts
              bookings={dashboardBookings}
              rooms={roomsWithInventory}
              colors={chartColors}
              establishment={{
                commissionRate: establishment.commissionRate,
                fixedFee: establishment.fixedFee,
              }}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Aucune donnée disponible</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Les analyses et statistiques s&apos;afficheront quand
                    l&apos;établissement aura des réservations confirmées.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              Tableau de bord public généré le{" "}
              {new Date().toLocaleDateString("fr-FR")}
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Données protégées et anonymisées
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
