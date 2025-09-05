"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Save } from "lucide-react";
import { toast } from "sonner";

interface LocationData {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface LocationFormProps {
  establishmentId: string;
  initialData?: {
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  onSave?: (data: LocationData) => void;
}

export function LocationForm({
  establishmentId,
  initialData,
  onSave,
}: LocationFormProps) {
  const [formData, setFormData] = useState({
    address: initialData?.address || "",
    city: initialData?.city || "",
    postalCode: initialData?.postalCode || "",
    country: initialData?.country || "Switzerland",
    latitude: initialData?.latitude || "",
    longitude: initialData?.longitude || "",
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const geocodeAddress = async () => {
    if (!formData.address || !formData.city) {
      toast.error("Veuillez renseigner au moins l'adresse et la ville");
      return;
    }

    setIsGeocoding(true);
    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`;

      // Utiliser l'API Nominatim d'OpenStreetMap (gratuite)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const location = data[0];
          setFormData((prev) => ({
            ...prev,
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
          }));
          toast.success("Coordonnées trouvées automatiquement !");
        } else {
          toast.error(
            "Impossible de trouver les coordonnées pour cette adresse"
          );
        }
      } else {
        throw new Error("Erreur API géocodage");
      }
    } catch (error) {
      console.error("Erreur géocodage:", error);
      toast.error("Erreur lors de la géolocalisation");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSave = async () => {
    if (!formData.latitude || !formData.longitude) {
      toast.error("Les coordonnées GPS sont requises");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/establishments/${establishmentId}/location`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            latitude: parseFloat(formData.latitude.toString()),
            longitude: parseFloat(formData.longitude.toString()),
          }),
        }
      );

      if (response.ok) {
        toast.success("Localisation enregistrée avec succès !");
        onSave?.({
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          latitude: parseFloat(formData.latitude.toString()),
          longitude: parseFloat(formData.longitude.toString()),
        });
      } else {
        throw new Error("Erreur sauvegarde");
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localisation de l&apos;établissement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="123 Rue de la Paix"
            />
          </div>
          <div>
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Fribourg"
            />
          </div>
          <div>
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleInputChange("postalCode", e.target.value)}
              placeholder="1700"
            />
          </div>
          <div>
            <Label htmlFor="country">Pays</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              placeholder="Switzerland"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={geocodeAddress}
            disabled={isGeocoding}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {isGeocoding ? "Recherche..." : "Trouver les coordonnées"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => handleInputChange("latitude", e.target.value)}
              placeholder="46.8182"
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => handleInputChange("longitude", e.target.value)}
              placeholder="7.1619"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Sauvegarde..." : "Enregistrer la localisation"}
        </Button>
      </CardContent>
    </Card>
  );
}
