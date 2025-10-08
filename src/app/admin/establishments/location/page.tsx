"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Eye,
  Map,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Establishment {
  id: string;
  name: string;
  slug: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  showOnMap?: boolean;
  isPubliclyVisible?: boolean;
  mapTitle?: string;
  mapDescription?: string;
  mapImage?: string;
  presentationDescription?: string;
  presentationWebsite?: string;
  presentationEmail?: string;
  presentationPhone?: string;
}

export default function EstablishmentsLocationPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      const response = await fetch("/api/establishments");
      if (response.ok) {
        const data = await response.json();
        setEstablishments(data);
      } else {
        toast.error("Erreur lors du chargement des établissements");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const hasLocation = (establishment: Establishment) => {
    return establishment.latitude && establishment.longitude;
  };

  const hasFullInfo = (establishment: Establishment) => {
    return (
      hasLocation(establishment) && establishment.address && establishment.city
    );
  };

  const getCompletionPercentage = (establishment: Establishment) => {
    let score = 0;
    const fields = [
      establishment.latitude,
      establishment.longitude,
      establishment.address,
      establishment.city,
      establishment.postalCode,
      establishment.mapTitle || establishment.name,
      establishment.mapDescription,
      establishment.presentationDescription,
    ];

    fields.forEach((field) => {
      if (field) score += 1;
    });

    return Math.round((score / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-96" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const geolocatedCount = establishments.filter(hasLocation).length;
  const fullInfoCount = establishments.filter(hasFullInfo).length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Présentation & Localisation
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez l&apos;affichage de vos établissements sur la carte
                publique et créez leurs pages de présentation
              </p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Établissements
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {establishments.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total des établissements
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Géolocalisés
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{geolocatedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {geolocatedCount} sur {establishments.length} établissements
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Infos complètes
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fullInfoCount}</div>
                <p className="text-xs text-muted-foreground">
                  Avec adresse et coordonnées
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Liste des établissements */}
        <div className="grid gap-4">
          {establishments.map((establishment) => {
            const completion = getCompletionPercentage(establishment);
            const isComplete = hasFullInfo(establishment);

            return (
              <Card
                key={establishment.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {establishment.name}
                        </CardTitle>

                        {/* Badges de statut */}
                        <div className="flex gap-2">
                          {isComplete ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complet
                            </Badge>
                          ) : hasLocation(establishment) ? (
                            <Badge variant="secondary">
                              <MapPin className="h-3 w-3 mr-1" />
                              Géolocalisé
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />À
                              configurer
                            </Badge>
                          )}

                          {establishment.showOnMap && (
                            <Badge
                              variant="outline"
                              className="border-blue-500 text-blue-600"
                            >
                              <Map className="h-3 w-3 mr-1" />
                              Sur la carte
                            </Badge>
                          )}

                          {establishment.isPubliclyVisible && (
                            <Badge
                              variant="outline"
                              className="border-purple-500 text-purple-600"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Page publique
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardDescription className="flex flex-col gap-1">
                        {establishment.address && (
                          <span className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {establishment.address}, {establishment.city}{" "}
                            {establishment.postalCode}
                          </span>
                        )}
                        {!establishment.address && (
                          <span className="text-muted-foreground italic">
                            Localisation non configurée
                          </span>
                        )}
                      </CardDescription>
                    </div>

                    {/* Bouton d'action */}
                    <Link href={`/admin/${establishment.slug}/location`}>
                      <Button variant="outline" size="sm" className="ml-4">
                        Configurer
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Barre de progression */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Complétion du profil
                        </span>
                        <span className="font-medium">{completion}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            completion === 100
                              ? "bg-green-600"
                              : completion >= 50
                                ? "bg-blue-600"
                                : "bg-orange-600"
                          }`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>

                    {/* Informations complémentaires */}
                    {hasLocation(establishment) && (
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Coordonnées GPS
                          </span>
                          <p className="font-mono text-xs mt-1">
                            {establishment.latitude?.toFixed(4)},{" "}
                            {establishment.longitude?.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Visibilité
                          </span>
                          <div className="flex gap-2 mt-1">
                            {establishment.showOnMap ? (
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Carte publique
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">
                                ✗ Carte publique
                              </span>
                            )}
                            {establishment.isPubliclyVisible && (
                              <span className="text-xs text-purple-600 font-medium">
                                ✓ Page présentation
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Message si incomplet */}
                    {!isComplete && (
                      <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="text-orange-800 dark:text-orange-200">
                          <p className="font-medium">
                            Configuration incomplète
                          </p>
                          <p className="text-xs mt-1">
                            Complétez l&apos;adresse et les coordonnées GPS pour
                            afficher cet établissement sur la carte.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Message si aucun établissement */}
        {establishments.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucun établissement
              </h3>
              <p className="text-muted-foreground mb-4">
                Vous n&apos;avez pas encore d&apos;établissement configuré.
              </p>
              <Link href="/establishments">
                <Button>Créer un établissement</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
