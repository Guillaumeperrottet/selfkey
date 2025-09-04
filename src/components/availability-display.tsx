"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { API_ENDPOINTS, DOMAINS } from "@/lib/domains";

interface AvailabilityData {
  totalSpots: number;
  availableSpots: number;
  bookedToday: number;
  nextAvailable: string | null;
}

export function AvailabilityDisplay() {
  const [availability, setAvailability] = useState<AvailabilityData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        // Utiliser l'API endpoint configuré qui pointe vers selfkey.ch
        const response = await fetch(API_ENDPOINTS.AVAILABILITY);
        if (response.ok) {
          const data = await response.json();
          setAvailability(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des disponibilités:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
    // Actualiser toutes les 5 minutes
    const interval = setInterval(fetchAvailability, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!availability) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <p className="text-gray-600">
            Impossible de charger les disponibilités pour le moment.
          </p>
          <Button asChild className="mt-4">
            <Link href={DOMAINS.SELFKEY}>Voir toutes les disponibilités</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const occupancyRate =
    ((availability.totalSpots - availability.availableSpots) /
      availability.totalSpots) *
    100;

  return (
    <div className="space-y-8">
      {/* Statistiques principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardHeader>
            <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <CardTitle className="text-lg">Emplacements disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {availability.availableSpots}
            </div>
            <p className="text-sm text-gray-600">
              sur {availability.totalSpots} emplacements
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <CardTitle className="text-lg">
              Réservations aujourd&apos;hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {availability.bookedToday}
            </div>
            <p className="text-sm text-gray-600">nouvelles arrivées</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <CardTitle className="text-lg">Taux d&apos;occupation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(occupancyRate)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <CardTitle className="text-lg">Prochaine disponibilité</CardTitle>
          </CardHeader>
          <CardContent>
            {availability.nextAvailable ? (
              <>
                <div className="text-lg font-bold text-orange-600 mb-2">
                  {availability.nextAvailable}
                </div>
                <Badge
                  variant="outline"
                  className="border-orange-600 text-orange-600"
                >
                  Bientôt libre
                </Badge>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-green-600 mb-2">
                  Maintenant
                </div>
                <Badge className="bg-green-600">Disponible immédiatement</Badge>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statut global */}
      <Card className="text-center p-6">
        <CardContent>
          {availability.availableSpots > 0 ? (
            <>
              <h4 className="text-2xl font-bold text-green-600 mb-4">
                🎉 Places disponibles !
              </h4>
              <p className="text-gray-600 mb-6">
                {availability.availableSpots} emplacement
                {availability.availableSpots > 1 ? "s" : ""}
                {availability.availableSpots > 1 ? " sont" : " est"} disponible
                {availability.availableSpots > 1 ? "s" : ""}
                dès maintenant. Réservez rapidement !
              </p>
              <Button
                size="lg"
                asChild
                className="bg-green-600 hover:bg-green-700"
              >
                <Link href={DOMAINS.SELFKEY}>Réserver maintenant</Link>
              </Button>
            </>
          ) : (
            <>
              <h4 className="text-2xl font-bold text-orange-600 mb-4">
                Complet pour aujourd&apos;hui
              </h4>
              <p className="text-gray-600 mb-6">
                Tous nos emplacements sont occupés.
                {availability.nextAvailable &&
                  ` Prochaine disponibilité : ${availability.nextAvailable}`}
              </p>
              <Button size="lg" asChild variant="outline">
                <Link href={DOMAINS.SELFKEY}>
                  Voir les prochaines disponibilités
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mise à jour en temps réel */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Données mises à jour en temps réel • Dernière actualisation:{" "}
          {new Date().toLocaleTimeString("fr-CH")}
        </p>
      </div>
    </div>
  );
}
