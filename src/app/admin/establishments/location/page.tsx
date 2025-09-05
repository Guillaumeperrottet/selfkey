"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationForm } from "@/components/ui/location-form";
import { MapPin, Edit } from "lucide-react";
import { toast } from "sonner";

interface Establishment {
  id: string;
  name: string;
  slug: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export default function EstablishmentsLocationPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEstablishment, setEditingEstablishment] = useState<
    string | null
  >(null);

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

  const handleLocationSave = () => {
    toast.success("Localisation sauvegardée !");
    setEditingEstablishment(null);
    fetchEstablishments(); // Recharger les données
  };

  const hasLocation = (establishment: Establishment) => {
    return establishment.latitude && establishment.longitude;
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Localisation des établissements</h1>
        <Badge variant="secondary">
          {establishments.filter(hasLocation).length} / {establishments.length}{" "}
          géolocalisés
        </Badge>
      </div>

      <div className="grid gap-6">
        {establishments.map((establishment) => (
          <Card key={establishment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {establishment.name}
                  {hasLocation(establishment) ? (
                    <Badge variant="default" className="bg-green-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      Géolocalisé
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <MapPin className="h-3 w-3 mr-1" />
                      Non géolocalisé
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditingEstablishment(
                      editingEstablishment === establishment.id
                        ? null
                        : establishment.id
                    )
                  }
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {editingEstablishment === establishment.id
                    ? "Annuler"
                    : "Modifier"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {hasLocation(establishment) &&
                editingEstablishment !== establishment.id && (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Adresse:</strong>{" "}
                      {establishment.address || "Non renseignée"}
                    </p>
                    <p>
                      <strong>Ville:</strong>{" "}
                      {establishment.city || "Non renseignée"}
                    </p>
                    <p>
                      <strong>Pays:</strong>{" "}
                      {establishment.country || "Non renseigné"}
                    </p>
                    <p>
                      <strong>Coordonnées:</strong> {establishment.latitude},{" "}
                      {establishment.longitude}
                    </p>
                  </div>
                )}

              {(!hasLocation(establishment) ||
                editingEstablishment === establishment.id) && (
                <LocationForm
                  establishmentId={establishment.id}
                  initialData={{
                    address: establishment.address,
                    city: establishment.city,
                    country: establishment.country,
                    latitude: establishment.latitude,
                    longitude: establishment.longitude,
                  }}
                  onSave={() => handleLocationSave()}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {establishments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Aucun établissement trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
