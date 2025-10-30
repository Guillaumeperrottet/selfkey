"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
import { MapPin, Search, Save, Map, ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LocationData {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  mapTitle?: string;
  mapDescription?: string;
  mapImage?: string;
  showOnMap?: boolean;
  isClosed?: boolean;
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
    mapTitle?: string;
    mapDescription?: string;
    mapImage?: string;
    showOnMap?: boolean;
    isClosed?: boolean;
  };
  onSave?: (data: LocationData) => void;
}

export function LocationForm({
  establishmentId,
  initialData,
  onSave,
}: LocationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    address: initialData?.address || "",
    city: initialData?.city || "",
    postalCode: initialData?.postalCode || "",
    country: initialData?.country || "Switzerland",
    latitude: initialData?.latitude || "",
    longitude: initialData?.longitude || "",
    mapTitle: initialData?.mapTitle || "",
    mapDescription: initialData?.mapDescription || "",
    mapImage: initialData?.mapImage || "",
    showOnMap: initialData?.showOnMap ?? true,
    isClosed: initialData?.isClosed ?? false,
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
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
            mapTitle: formData.mapTitle || null,
            mapDescription: formData.mapDescription || null,
            mapImage: formData.mapImage || null,
            isClosed: formData.isClosed,
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
          mapTitle: formData.mapTitle,
          mapDescription: formData.mapDescription,
          mapImage: formData.mapImage,
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
        {/* Case à cocher pour afficher sur la carte publique */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showOnMap"
              checked={formData.showOnMap}
              onCheckedChange={(checked) =>
                handleInputChange("showOnMap", checked === true)
              }
            />
            <Label
              htmlFor="showOnMap"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Afficher cet établissement sur la carte publique
            </Label>
          </div>
          <p className="text-xs text-gray-600 mt-1 ml-6">
            Décochez cette option si vous ne souhaitez pas que votre
            établissement apparaisse sur la carte publique de notre partenaire
            Selfcamp.ch
          </p>
        </div>

        {/* Case à cocher pour indiquer que l'établissement est fermé */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isClosed"
              checked={formData.isClosed}
              onCheckedChange={(checked) =>
                handleInputChange("isClosed", checked === true)
              }
            />
            <Label
              htmlFor="isClosed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Établissement temporairement fermé
            </Label>
          </div>
          <p className="text-xs text-gray-600 mt-1 ml-6">
            Cochez cette option pour indiquer que votre établissement est
            temporairement fermé. Le statut &quot;Fermé&quot; sera affiché sur
            la carte publique au lieu des places disponibles.
          </p>
        </div>

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

        {/* Section pour les informations d'affichage sur la carte */}
        {formData.showOnMap && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Map className="h-5 w-5" />
              Informations d&apos;affichage sur la carte
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="mapTitle">Titre affiché (optionnel)</Label>
                <Input
                  id="mapTitle"
                  value={formData.mapTitle}
                  onChange={(e) =>
                    handleInputChange("mapTitle", e.target.value)
                  }
                  placeholder="Laissez vide pour utiliser le nom de l'établissement"
                />
              </div>

              <div>
                <Label htmlFor="mapDescription">
                  Description brève (optionnel)
                </Label>
                <Textarea
                  id="mapDescription"
                  value={formData.mapDescription}
                  onChange={(e) =>
                    handleInputChange("mapDescription", e.target.value)
                  }
                  placeholder="Description courte qui sera affichée sur la carte"
                  rows={3}
                />
              </div>

              <ImageUpload
                value={formData.mapImage}
                onChange={(value) => handleInputChange("mapImage", value)}
              />
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="space-y-3">
          {/* Boutons de navigation */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => window.open("/map", "_blank")}
              className="flex-1 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Voir sur la carte
            </Button>
          </div>

          {/* Bouton de sauvegarde */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Sauvegarde..." : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
