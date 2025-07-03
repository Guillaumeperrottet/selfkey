import { prisma } from "@/lib/prisma";
import { StripeOnboarding } from "@/components/StripeOnboarding";
import { RoomManagement } from "@/components/RoomManagement";
import { AccessCodeManager } from "@/components/AccessCodeManager";
import { SettingsManager } from "@/components/SettingsManager";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CalendarDays,
  CreditCard,
  Hotel,
  Settings,
  BarChart3,
  QrCode,
  Users,
  Bed,
  KeyRound,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ hotel: string }>;
}

export default async function AdminPage({ params }: Props) {
  const { hotel } = await params;

  // Vérifier l'authentification
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/" + hotel);
  }

  // Vérifier les permissions d'accès à cet établissement
  const userEstablishment = await prisma.userEstablishment.findFirst({
    where: {
      userId: session.user.id,
      establishment: {
        slug: hotel,
      },
    },
    include: {
      establishment: true,
    },
  });

  if (!userEstablishment) {
    // L'utilisateur n'a pas accès à cet établissement
    redirect("/establishments");
  }

  const establishment = userEstablishment.establishment;

  // Récupérer les chambres depuis la base de données (toutes, actives et inactives)
  const dbRooms = await prisma.room.findMany({
    where: {
      hotelSlug: hotel,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Séparer les chambres actives pour les calculs de disponibilité
  const activeRooms = dbRooms.filter((room) => room.isActive);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Récupérer les réservations actuelles et futures
  const currentBookings = await prisma.booking.findMany({
    where: {
      hotelSlug: hotel,
      OR: [
        // Réservations en cours ou à venir
        { checkOutDate: { gte: today } },
        // Réservations d'aujourd'hui
        { checkInDate: { gte: today } },
      ],
      // Seulement les réservations confirmées
      stripePaymentIntentId: { not: null },
    },
    include: {
      room: true, // Inclure les détails de la chambre
    },
    orderBy: {
      checkInDate: "asc",
    },
  });

  // Utiliser la nouvelle logique de disponibilité avec checkout à 12h
  const { getCurrentlyAvailableRooms } = await import("@/lib/availability");
  const roomsAvailability = await getCurrentlyAvailableRooms(hotel);

  const roomsWithInventory = activeRooms.map((room) => {
    const availability = roomsAvailability.find((r) => r.id === room.id);
    return {
      id: room.id,
      name: room.name,
      price: room.price,
      inventory: availability?.available ? 1 : 0, // 1 si disponible, 0 si occupée
      isActive: room.isActive,
    };
  });

  // Si on a un stripeAccountId mais pas encore marqué comme onboarded,
  // vérifier le statut réel auprès de Stripe
  if (establishment.stripeAccountId && !establishment.stripeOnboarded) {
    try {
      const { getAccountStatus } = await import("@/lib/stripe-connect");
      const accountStatus = await getAccountStatus(
        establishment.stripeAccountId
      );

      if (accountStatus.chargesEnabled && accountStatus.detailsSubmitted) {
        // Mettre à jour le statut dans la base de données
        await prisma.establishment.update({
          where: { slug: hotel },
          data: { stripeOnboarded: true },
        });
        establishment.stripeOnboarded = true;
      }
    } catch (error) {
      console.error("Erreur vérification statut Stripe:", error);
    }
  }

  const finalIsStripeConfigured =
    establishment.stripeAccountId && establishment.stripeOnboarded;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header moderne */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {establishment.name}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Administration de l&apos;établissement
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {new Date().toLocaleDateString("fr-FR")}
            </Badge>
            <Link href={`/admin/${hotel}/qr-code`}>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                Code QR
              </Button>
            </Link>
          </div>
        </div>

        {/* Configuration Stripe */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Configuration des paiements
            </CardTitle>
            <CardDescription>
              Connectez votre compte Stripe pour accepter les paiements en ligne
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StripeOnboarding
              hotelSlug={hotel}
              hotelName={establishment.name}
            />
          </CardContent>
        </Card>

        {/* Commission info */}
        {(establishment.commissionRate > 0 || establishment.fixedFee > 0) && (
          <Alert className="mb-6">
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              <strong>Commission:</strong>{" "}
              {establishment.commissionRate > 0 &&
                `${establishment.commissionRate}% du montant`}
              {establishment.commissionRate > 0 &&
                establishment.fixedFee > 0 &&
                " + "}
              {establishment.fixedFee > 0 &&
                `${establishment.fixedFee} CHF par transaction`}
            </AlertDescription>
          </Alert>
        )}

        {/* Interface principale avec onglets */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d&apos;ensemble
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Chambres
            </TabsTrigger>
            <TabsTrigger
              value="access-codes"
              className="flex items-center gap-2"
            >
              <KeyRound className="h-4 w-4" />
              Codes d&apos;accès
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Réservations
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            {finalIsStripeConfigured && dbRooms.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Statistiques */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Chambres disponibles
                    </CardTitle>
                    <Bed className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {roomsWithInventory.filter((r) => r.inventory > 0).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      sur {roomsWithInventory.length} chambres
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Réservations aujourd&apos;hui
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {currentBookings.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentBookings.reduce(
                        (sum: number, b) => sum + b.guests,
                        0
                      )}{" "}
                      clients
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Revenus du jour
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {currentBookings
                        .reduce((sum: number, b) => sum + b.amount, 0)
                        .toFixed(2)}{" "}
                      CHF
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Commission:{" "}
                      {currentBookings
                        .reduce(
                          (sum: number, b) =>
                            sum +
                            (b.amount * establishment.commissionRate) / 100,
                          0
                        )
                        .toFixed(2)}{" "}
                      CHF
                    </p>
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
                    <div className="text-2xl font-bold">
                      {roomsWithInventory.length > 0
                        ? Math.round(
                            (roomsWithInventory.filter((r) => r.inventory === 0)
                              .length /
                              roomsWithInventory.length) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {
                        roomsWithInventory.filter((r) => r.inventory === 0)
                          .length
                      }{" "}
                      chambres occupées
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-muted p-6 mb-6">
                    {!finalIsStripeConfigured ? (
                      <Settings className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <Hotel className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {!finalIsStripeConfigured
                      ? "Configuration requise"
                      : "Première chambre"}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {!finalIsStripeConfigured
                      ? "Configurez Stripe pour accepter les paiements et commencer à recevoir des réservations"
                      : "Ajoutez votre première chambre pour commencer à recevoir des réservations"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Gestion des chambres */}
          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Gestion des chambres
                </CardTitle>
                <CardDescription>
                  Créez et gérez les chambres disponibles à la réservation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoomManagement hotelSlug={hotel} currency="CHF" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des codes d'accès */}
          <TabsContent value="access-codes">
            <AccessCodeManager
              establishmentSlug={hotel}
              rooms={dbRooms.map((room) => ({
                id: room.id,
                name: room.name,
                accessCode: room.accessCode,
                isActive: room.isActive,
              }))}
              establishment={{
                accessCodeType: establishment.accessCodeType || "room",
                generalAccessCode: establishment.generalAccessCode,
                accessInstructions: establishment.accessInstructions,
              }}
            />
          </TabsContent>

          {/* Réservations */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Réservations récentes
                </CardTitle>
                <CardDescription>
                  Consultez et gérez les réservations de votre établissement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {currentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{`${booking.clientFirstName} ${booking.clientLastName}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.clientEmail}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Chambre: {booking.room.name}
                          </p>
                          <div className="flex gap-2 text-xs">
                            <span>
                              Arrivée:{" "}
                              {new Date(booking.checkInDate).toLocaleDateString(
                                "fr-FR"
                              )}
                            </span>
                            <span>
                              Départ:{" "}
                              {new Date(
                                booking.checkOutDate
                              ).toLocaleDateString("fr-FR")}{" "}
                              (12h00)
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{booking.amount} CHF</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.bookingDate).toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>
                          {(() => {
                            const now = new Date();
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const checkOut = new Date(booking.checkOutDate);
                            const checkIn = new Date(booking.checkInDate);

                            if (
                              checkOut.toDateString() ===
                                today.toDateString() &&
                              now.getHours() < 12
                            ) {
                              return (
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                  Départ aujourd&apos;hui
                                </span>
                              );
                            } else if (
                              checkOut.toDateString() ===
                                today.toDateString() &&
                              now.getHours() >= 12
                            ) {
                              return (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Chambre libérée
                                </span>
                              );
                            } else if (
                              checkIn.toDateString() === today.toDateString()
                            ) {
                              return (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Arrivée aujourd&apos;hui
                                </span>
                              );
                            } else if (checkIn < today && checkOut > today) {
                              return (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  En cours
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Aucune réservation aujourd&apos;hui
                    </h3>
                    <p className="text-muted-foreground">
                      Les nouvelles réservations apparaîtront ici
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres de l&apos;établissement
                </CardTitle>
                <CardDescription>
                  Configurez les paramètres de réservation et de fonctionnement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsManager hotelSlug={hotel} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
