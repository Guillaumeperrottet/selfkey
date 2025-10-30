"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
import { PdfUpload } from "@/components/ui/pdf-upload";
import { MultilingualInput } from "@/components/ui/multilingual-input";
import {
  MapPin,
  Search,
  Save,
  Map,
  ArrowLeft,
  Eye,
  Globe,
  Mail,
  Phone,
  FileText,
  Store,
  Image as ImageIcon,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PresentationData {
  // Localisation
  address: string;
  address_en?: string;
  address_de?: string;
  city: string;
  city_en?: string;
  city_de?: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;

  // Affichage carte
  mapTitle?: string;
  mapTitle_en?: string;
  mapTitle_de?: string;
  mapDescription?: string;
  mapDescription_en?: string;
  mapDescription_de?: string;
  mapImage?: string;
  showOnMap?: boolean;
  isClosed?: boolean;

  // Présentation publique
  presentationImages?: string[];
  presentationDescription?: string;
  presentationDescription_en?: string;
  presentationDescription_de?: string;
  presentationAttributes?: Record<string, boolean>;
  presentationWebsite?: string;
  presentationEmail?: string;
  presentationPhone?: string;
  presentationDocuments?: Array<{
    name: string;
    name_en?: string;
    name_de?: string;
    url: string;
    type: string;
    description?: string;
    description_en?: string;
    description_de?: string;
  }>;
  presentationNearbyBusinesses?: Array<{
    name: string;
    name_en?: string;
    name_de?: string;
    type: string;
    type_en?: string;
    type_de?: string;
    distance: string;
    description?: string;
    description_en?: string;
    description_de?: string;
    website?: string;
    mapsUrl?: string;
    image?: string;
    documents?: Array<{
      name: string;
      url: string;
    }>;
  }>;
  isPubliclyVisible?: boolean;

  // Horaires
  is24h7Access?: boolean;
  checkInStartTime?: string;
  checkInEndTime?: string;
  checkOutTime?: string;
  accessRestrictions?: string;
  accessRestrictions_en?: string;
  accessRestrictions_de?: string;

  // Impact local
  showLocalImpact?: boolean;
  localImpactTitle?: string;
  localImpactTitle_en?: string;
  localImpactTitle_de?: string;
  localImpactDescription?: string;
  localImpactDescription_en?: string;
  localImpactDescription_de?: string;
  touristTaxImpactMessage?: string;
  touristTaxImpactMessage_en?: string;
  touristTaxImpactMessage_de?: string;
}

interface PresentationFormProps {
  establishmentId: string;
  initialData?: Partial<PresentationData>;
  onSave?: (data: PresentationData) => void;
}

// Attributs disponibles
const AVAILABLE_ATTRIBUTES = [
  { key: "wifi", label: "WiFi gratuit", icon: "📶" },
  { key: "electricity", label: "Électricité", icon: "⚡" },
  { key: "water", label: "Eau potable", icon: "💧" },
  { key: "showers", label: "Douches", icon: "🚿" },
  { key: "toilets", label: "Toilettes", icon: "🚽" },
  { key: "wasteDisposal", label: "Vidange eaux usées", icon: "🚰" },
  { key: "parking", label: "Parking", icon: "🅿️" },
  { key: "security", label: "Sécurité 24h/24", icon: "🔒" },
  { key: "restaurant", label: "Restaurant", icon: "🍽️" },
  { key: "store", label: "Boutique", icon: "🏪" },
  { key: "laundry", label: "Laverie", icon: "🧺" },
  { key: "playground", label: "Aire de jeux", icon: "🎮" },
  { key: "petFriendly", label: "Animaux acceptés", icon: "🐕" },
];

export function PresentationForm({
  establishmentId,
  initialData,
  onSave,
}: PresentationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Localisation
    address: initialData?.address || "",
    address_en: initialData?.address_en || "",
    address_de: initialData?.address_de || "",
    city: initialData?.city || "",
    city_en: initialData?.city_en || "",
    city_de: initialData?.city_de || "",
    postalCode: initialData?.postalCode || "",
    country: initialData?.country || "Switzerland",
    latitude: initialData?.latitude || "",
    longitude: initialData?.longitude || "",

    // Carte
    mapTitle: initialData?.mapTitle || "",
    mapTitle_en: initialData?.mapTitle_en || "",
    mapTitle_de: initialData?.mapTitle_de || "",
    mapDescription: initialData?.mapDescription || "",
    mapDescription_en: initialData?.mapDescription_en || "",
    mapDescription_de: initialData?.mapDescription_de || "",
    mapImage: initialData?.mapImage || "",
    showOnMap: initialData?.showOnMap ?? true,
    isClosed: initialData?.isClosed ?? false,

    // Présentation
    presentationImages: initialData?.presentationImages || [],
    presentationDescription: initialData?.presentationDescription || "",
    presentationDescription_en: initialData?.presentationDescription_en || "",
    presentationDescription_de: initialData?.presentationDescription_de || "",
    presentationAttributes: initialData?.presentationAttributes || {},
    presentationWebsite: initialData?.presentationWebsite || "",
    presentationEmail: initialData?.presentationEmail || "",
    presentationPhone: initialData?.presentationPhone || "",
    presentationDocuments: initialData?.presentationDocuments || [],
    presentationNearbyBusinesses:
      initialData?.presentationNearbyBusinesses || [],
    isPubliclyVisible: initialData?.isPubliclyVisible ?? false,

    // Horaires
    is24h7Access: initialData?.is24h7Access ?? true,
    checkInStartTime: initialData?.checkInStartTime || "",
    checkInEndTime: initialData?.checkInEndTime || "",
    checkOutTime: initialData?.checkOutTime || "",
    accessRestrictions: initialData?.accessRestrictions || "",
    accessRestrictions_en: initialData?.accessRestrictions_en || "",
    accessRestrictions_de: initialData?.accessRestrictions_de || "",

    // Impact local
    showLocalImpact: initialData?.showLocalImpact ?? false,
    localImpactTitle:
      initialData?.localImpactTitle || "L'impact de votre séjour",
    localImpactTitle_en: initialData?.localImpactTitle_en || "",
    localImpactTitle_de: initialData?.localImpactTitle_de || "",
    localImpactDescription: initialData?.localImpactDescription || "",
    localImpactDescription_en: initialData?.localImpactDescription_en || "",
    localImpactDescription_de: initialData?.localImpactDescription_de || "",
    touristTaxImpactMessage: initialData?.touristTaxImpactMessage || "",
    touristTaxImpactMessage_en: initialData?.touristTaxImpactMessage_en || "",
    touristTaxImpactMessage_de: initialData?.touristTaxImpactMessage_de || "",
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"location" | "presentation">(
    "location"
  );
  const [businessDocNames, setBusinessDocNames] = useState<
    Record<number, string>
  >({});

  const handleInputChange = (
    field: string,
    value:
      | string
      | number
      | boolean
      | string[]
      | Record<string, boolean>
      | Array<Record<string, string>>
  ) => {
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
            address_en: formData.address_en || null,
            address_de: formData.address_de || null,
            city: formData.city,
            city_en: formData.city_en || null,
            city_de: formData.city_de || null,
            postalCode: formData.postalCode,
            country: formData.country,
            latitude: parseFloat(formData.latitude.toString()),
            longitude: parseFloat(formData.longitude.toString()),
            mapTitle: formData.mapTitle || null,
            mapTitle_en: formData.mapTitle_en || null,
            mapTitle_de: formData.mapTitle_de || null,
            mapDescription: formData.mapDescription || null,
            mapDescription_en: formData.mapDescription_en || null,
            mapDescription_de: formData.mapDescription_de || null,
            mapImage: formData.mapImage || null,
            showOnMap: formData.showOnMap,
            isClosed: formData.isClosed,
            presentationImages: formData.presentationImages,
            presentationDescription: formData.presentationDescription || null,
            presentationDescription_en:
              formData.presentationDescription_en || null,
            presentationDescription_de:
              formData.presentationDescription_de || null,
            presentationAttributes: formData.presentationAttributes,
            presentationWebsite: formData.presentationWebsite || null,
            presentationEmail: formData.presentationEmail || null,
            presentationPhone: formData.presentationPhone || null,
            presentationDocuments: formData.presentationDocuments,
            presentationNearbyBusinesses: formData.presentationNearbyBusinesses,
            isPubliclyVisible: formData.isPubliclyVisible,
            is24h7Access: formData.is24h7Access,
            checkInStartTime: formData.checkInStartTime || null,
            checkInEndTime: formData.checkInEndTime || null,
            checkOutTime: formData.checkOutTime || null,
            accessRestrictions: formData.accessRestrictions || null,
            accessRestrictions_en: formData.accessRestrictions_en || null,
            accessRestrictions_de: formData.accessRestrictions_de || null,
            showLocalImpact: formData.showLocalImpact,
            localImpactTitle: formData.localImpactTitle || null,
            localImpactTitle_en: formData.localImpactTitle_en || null,
            localImpactTitle_de: formData.localImpactTitle_de || null,
            localImpactDescription: formData.localImpactDescription || null,
            localImpactDescription_en:
              formData.localImpactDescription_en || null,
            localImpactDescription_de:
              formData.localImpactDescription_de || null,
            touristTaxImpactMessage: formData.touristTaxImpactMessage || null,
            touristTaxImpactMessage_en:
              formData.touristTaxImpactMessage_en || null,
            touristTaxImpactMessage_de:
              formData.touristTaxImpactMessage_de || null,
          }),
        }
      );

      if (response.ok) {
        toast.success("Informations enregistrées avec succès !");
        onSave?.(formData as PresentationData);
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

  const toggleAttribute = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      presentationAttributes: {
        ...prev.presentationAttributes,
        [key]: !prev.presentationAttributes[key],
      },
    }));
  };

  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,
      presentationDocuments: [
        ...prev.presentationDocuments,
        { name: "", url: "", type: "pdf", description: "" },
      ],
    }));
  };

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      presentationDocuments: prev.presentationDocuments.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateDocument = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      presentationDocuments: prev.presentationDocuments.map((doc, i) =>
        i === index ? { ...doc, [field]: value } : doc
      ),
    }));
  };

  const addBusiness = () => {
    setFormData((prev) => ({
      ...prev,
      presentationNearbyBusinesses: [
        ...prev.presentationNearbyBusinesses,
        { name: "", type: "", distance: "", description: "" },
      ],
    }));
  };

  const removeBusiness = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      presentationNearbyBusinesses: prev.presentationNearbyBusinesses.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateBusiness = (
    index: number,
    field: string,
    value: string | Array<{ name: string; url: string }>
  ) => {
    setFormData((prev) => ({
      ...prev,
      presentationNearbyBusinesses: prev.presentationNearbyBusinesses.map(
        (business, i) =>
          i === index ? { ...business, [field]: value } : business
      ),
    }));
  };

  const addPresentationImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      presentationImages: [...prev.presentationImages, url],
    }));
  };

  const removePresentationImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      presentationImages: prev.presentationImages.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Onglets */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === "location" ? "default" : "ghost"}
          onClick={() => setActiveTab("location")}
          className="rounded-b-none"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Localisation & Carte
        </Button>
        <Button
          variant={activeTab === "presentation" ? "default" : "ghost"}
          onClick={() => setActiveTab("presentation")}
          className="rounded-b-none"
        >
          <Eye className="h-4 w-4 mr-2" />
          Page de présentation
        </Button>
      </div>

      {/* Onglet Localisation & Carte */}
      {activeTab === "location" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisation et affichage sur la carte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Affichage sur la carte */}
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
                établissement apparaisse sur la carte publique de Selfcamp.ch
              </p>
            </div>

            {/* Établissement fermé */}
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
                temporairement fermé. Le statut &quot;Fermé&quot; sera affiché
                sur la carte publique au lieu des places disponibles.
              </p>
            </div>

            {/* Adresse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <MultilingualInput
                  label="Adresse"
                  name="address"
                  value_fr={formData.address}
                  value_en={formData.address_en}
                  value_de={formData.address_de}
                  onChange={handleInputChange}
                  placeholder_fr="123 Rue de la Paix"
                  placeholder_en="123 Peace Street"
                  placeholder_de="123 Friedensstraße"
                  required
                />
              </div>
              <div>
                <MultilingualInput
                  label="Ville"
                  name="city"
                  value_fr={formData.city}
                  value_en={formData.city_en}
                  value_de={formData.city_de}
                  onChange={handleInputChange}
                  placeholder_fr="Fribourg"
                  placeholder_en="Fribourg"
                  placeholder_de="Freiburg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
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

            {/* Géolocalisation */}
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

            {/* Coordonnées GPS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    handleInputChange("latitude", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("longitude", e.target.value)
                  }
                  placeholder="7.1619"
                />
              </div>
            </div>

            {/* Informations d'affichage sur la carte */}
            {formData.showOnMap && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Informations d&apos;affichage sur la carte
                </h3>

                <div className="space-y-4">
                  <MultilingualInput
                    label="Titre affiché"
                    name="mapTitle"
                    value_fr={formData.mapTitle}
                    value_en={formData.mapTitle_en}
                    value_de={formData.mapTitle_de}
                    onChange={handleInputChange}
                    placeholder_fr="Laissez vide pour utiliser le nom de l'établissement"
                    description="Ce titre sera affiché sur la carte publique"
                  />

                  <MultilingualInput
                    label="Description brève"
                    name="mapDescription"
                    type="textarea"
                    value_fr={formData.mapDescription}
                    value_en={formData.mapDescription_en}
                    value_de={formData.mapDescription_de}
                    onChange={handleInputChange}
                    placeholder_fr="Description courte qui sera affichée sur la carte"
                    description="Description publique visible sur la carte"
                  />

                  <div>
                    <Label>Image pour la carte</Label>
                    <ImageUpload
                      value={formData.mapImage}
                      onChange={(value) => handleInputChange("mapImage", value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Onglet Page de présentation */}
      {activeTab === "presentation" && (
        <div className="space-y-6">
          {/* Activation de la page publique */}
          <Card>
            <CardContent className="pt-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPubliclyVisible"
                    checked={formData.isPubliclyVisible}
                    onCheckedChange={(checked) =>
                      handleInputChange("isPubliclyVisible", checked === true)
                    }
                  />
                  <Label
                    htmlFor="isPubliclyVisible"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Activer la page de présentation publique
                  </Label>
                </div>
                <p className="text-xs text-gray-600 mt-1 ml-6">
                  Cette page détaillée sera accessible depuis la carte. Les
                  visiteurs pourront voir toutes les informations ci-dessous
                  avant de réserver.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Horaires d'arrivée et de départ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Horaires d&apos;arrivée et de départ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Checkbox Accès 24h/24 */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is24h7Access"
                    checked={formData.is24h7Access}
                    onCheckedChange={(checked) =>
                      handleInputChange("is24h7Access", checked === true)
                    }
                  />
                  <Label
                    htmlFor="is24h7Access"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Accès 24h/24 et 7j/7
                  </Label>
                </div>
                <p className="text-xs text-gray-600 mt-1 ml-6">
                  Les clients peuvent arriver et partir à n&apos;importe quelle
                  heure
                </p>
              </div>

              {/* Horaires (affichés uniquement si pas 24h/24) */}
              {!formData.is24h7Access && (
                <>
                  <p className="text-sm text-gray-600">
                    Définissez les heures pendant lesquelles les clients peuvent
                    arriver et partir.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Début arrivée */}
                    <div className="space-y-2">
                      <Label htmlFor="checkInStartTime">
                        Arrivée à partir de
                      </Label>
                      <Input
                        id="checkInStartTime"
                        type="time"
                        value={formData.checkInStartTime}
                        onChange={(e) =>
                          handleInputChange("checkInStartTime", e.target.value)
                        }
                        placeholder="08:00"
                      />
                      <p className="text-xs text-gray-500">
                        Heure d&apos;ouverture
                      </p>
                    </div>

                    {/* Fin arrivée */}
                    <div className="space-y-2">
                      <Label htmlFor="checkInEndTime">
                        Arrivée jusqu&apos;à
                      </Label>
                      <Input
                        id="checkInEndTime"
                        type="time"
                        value={formData.checkInEndTime}
                        onChange={(e) =>
                          handleInputChange("checkInEndTime", e.target.value)
                        }
                        placeholder="22:00"
                      />
                      <p className="text-xs text-gray-500">
                        Dernière heure d&apos;arrivée
                      </p>
                    </div>

                    {/* Heure de départ */}
                    <div className="space-y-2">
                      <Label htmlFor="checkOutTime">Départ avant</Label>
                      <Input
                        id="checkOutTime"
                        type="time"
                        value={formData.checkOutTime}
                        onChange={(e) =>
                          handleInputChange("checkOutTime", e.target.value)
                        }
                        placeholder="12:00"
                      />
                      <p className="text-xs text-gray-500">Heure limite</p>
                    </div>
                  </div>

                  {formData.checkInStartTime && formData.checkInEndTime && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900">
                        📅 Arrivées possibles de{" "}
                        <strong>{formData.checkInStartTime}</strong> à{" "}
                        <strong>{formData.checkInEndTime}</strong>
                        {formData.checkOutTime &&
                          ` • Départ avant ${formData.checkOutTime}`}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Champ texte libre pour restrictions (toujours visible) */}
              <MultilingualInput
                label="Restrictions d'accès (optionnel)"
                name="accessRestrictions"
                type="textarea"
                value_fr={formData.accessRestrictions}
                value_en={formData.accessRestrictions_en}
                value_de={formData.accessRestrictions_de}
                onChange={handleInputChange}
                placeholder_fr="Ex: Fermé le mercredi, Barrière fermée de 22h à 8h, etc."
                placeholder_en="Ex: Closed on Wednesday, Barrier closed from 10 PM to 8 AM, etc."
                placeholder_de="Z.B.: Mittwochs geschlossen, Schranke von 22 bis 8 Uhr geschlossen, etc."
                description="Informations supplémentaires sur les restrictions d'accès ou fermetures spécifiques"
              />
            </CardContent>
          </Card>

          {formData.isPubliclyVisible && (
            <>
              {/* Galerie d'images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Galerie d&apos;images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.presentationImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={image}
                          alt={`Image ${index + 1}`}
                          width={200}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePresentationImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <ImageUpload value="" onChange={addPresentationImage} />
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Description de l&apos;établissement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MultilingualInput
                    label="Description complète"
                    name="presentationDescription"
                    type="textarea"
                    value_fr={formData.presentationDescription}
                    value_en={formData.presentationDescription_en}
                    value_de={formData.presentationDescription_de}
                    onChange={handleInputChange}
                    placeholder_fr="Décrivez votre établissement, ses atouts, son emplacement..."
                    placeholder_en="Describe your establishment, its advantages, location..."
                    placeholder_de="Beschreiben Sie Ihre Einrichtung, ihre Vorteile, ihren Standort..."
                    description="Description détaillée visible sur la page publique"
                  />
                </CardContent>
              </Card>

              {/* Équipements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Équipements et services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {AVAILABLE_ATTRIBUTES.map((attr) => (
                      <div
                        key={attr.key}
                        className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleAttribute(attr.key)}
                      >
                        <Checkbox
                          id={attr.key}
                          checked={!!formData.presentationAttributes[attr.key]}
                          onCheckedChange={() => toggleAttribute(attr.key)}
                        />
                        <Label
                          htmlFor={attr.key}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <span>{attr.icon}</span>
                          <span className="text-sm">{attr.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Informations de contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Informations de contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="presentationWebsite">
                      <Globe className="h-4 w-4 inline mr-2" />
                      Site web
                    </Label>
                    <Input
                      id="presentationWebsite"
                      type="url"
                      value={formData.presentationWebsite}
                      onChange={(e) =>
                        handleInputChange("presentationWebsite", e.target.value)
                      }
                      placeholder="https://www.exemple.ch"
                    />
                  </div>

                  <div>
                    <Label htmlFor="presentationEmail">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email de contact
                    </Label>
                    <Input
                      id="presentationEmail"
                      type="email"
                      value={formData.presentationEmail}
                      onChange={(e) =>
                        handleInputChange("presentationEmail", e.target.value)
                      }
                      placeholder="contact@exemple.ch"
                    />
                  </div>

                  <div>
                    <Label htmlFor="presentationPhone">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Téléphone
                    </Label>
                    <Input
                      id="presentationPhone"
                      type="tel"
                      value={formData.presentationPhone}
                      onChange={(e) =>
                        handleInputChange("presentationPhone", e.target.value)
                      }
                      placeholder="+41 26 123 45 67"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Documents téléchargeables */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents téléchargeables
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.presentationDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Document {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <MultilingualInput
                        label="Nom du document"
                        name={`presentationDocuments[${index}].name`}
                        value_fr={doc.name}
                        value_en={doc.name_en}
                        value_de={doc.name_de}
                        onChange={(field, value) => {
                          const fieldName = field.split(".").pop() || "name";
                          updateDocument(index, fieldName, value);
                        }}
                        placeholder_fr="Ex: Règlement intérieur, Tarifs..."
                        placeholder_en="Ex: House rules, Prices..."
                        placeholder_de="Z.B.: Hausordnung, Preise..."
                      />

                      <div>
                        <Label>Fichier PDF</Label>
                        <PdfUpload
                          value={doc.url}
                          onChange={(url) => updateDocument(index, "url", url)}
                          fileName={doc.name}
                          onFileNameChange={(name) =>
                            updateDocument(index, "name", name)
                          }
                        />
                      </div>

                      <MultilingualInput
                        label="Description (optionnel)"
                        name={`presentationDocuments[${index}].description`}
                        value_fr={doc.description}
                        value_en={doc.description_en}
                        value_de={doc.description_de}
                        onChange={(field, value) => {
                          const fieldName =
                            field.split(".").pop() || "description";
                          updateDocument(index, fieldName, value);
                        }}
                        placeholder_fr="Description du document"
                        placeholder_en="Document description"
                        placeholder_de="Dokumentbeschreibung"
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addDocument}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un document
                  </Button>
                </CardContent>
              </Card>

              {/* Commerces à proximité */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Commerces et services à proximité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.presentationNearbyBusinesses.map(
                    (business, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Commerce {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBusiness(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <MultilingualInput
                          label="Nom du commerce"
                          name={`presentationNearbyBusinesses[${index}].name`}
                          value_fr={business.name}
                          value_en={business.name_en}
                          value_de={business.name_de}
                          onChange={(field, value) => {
                            const fieldName = field.split(".").pop() || "name";
                            updateBusiness(index, fieldName, value);
                          }}
                          placeholder_fr="Ex: Boulangerie du Village"
                          placeholder_en="Ex: Village Bakery"
                          placeholder_de="Z.B.: Dorfbäckerei"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <MultilingualInput
                            label="Type de commerce"
                            name={`presentationNearbyBusinesses[${index}].type`}
                            value_fr={business.type}
                            value_en={business.type_en}
                            value_de={business.type_de}
                            onChange={(field, value) => {
                              const fieldName =
                                field.split(".").pop() || "type";
                              updateBusiness(index, fieldName, value);
                            }}
                            placeholder_fr="Ex: Restaurant, Boulangerie..."
                            placeholder_en="Ex: Restaurant, Bakery..."
                            placeholder_de="Z.B.: Restaurant, Bäckerei..."
                          />
                          <div>
                            <Label>Distance</Label>
                            <Input
                              placeholder="Ex: 500m, 2km..."
                              value={business.distance}
                              onChange={(e) =>
                                updateBusiness(
                                  index,
                                  "distance",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <MultilingualInput
                          label="Description (optionnel)"
                          name={`presentationNearbyBusinesses[${index}].description`}
                          value_fr={business.description}
                          value_en={business.description_en}
                          value_de={business.description_de}
                          onChange={(field, value) => {
                            const fieldName =
                              field.split(".").pop() || "description";
                            updateBusiness(index, fieldName, value);
                          }}
                          placeholder_fr="Description du commerce"
                          placeholder_en="Business description"
                          placeholder_de="Geschäftsbeschreibung"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-600 mb-1">
                              Site web (optionnel)
                            </Label>
                            <Input
                              placeholder="https://..."
                              value={business.website || ""}
                              onChange={(e) =>
                                updateBusiness(index, "website", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600 mb-1">
                              Lien Google Maps (optionnel)
                            </Label>
                            <Input
                              placeholder="https://maps.google.com/..."
                              value={business.mapsUrl || ""}
                              onChange={(e) =>
                                updateBusiness(index, "mapsUrl", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-600 mb-1">
                            Image (optionnel)
                          </Label>
                          <ImageUpload
                            value={business.image || ""}
                            onChange={(url) =>
                              updateBusiness(index, "image", url)
                            }
                          />
                        </div>

                        {/* Documents du commerce */}
                        <div>
                          <Label className="text-xs text-gray-600 mb-2">
                            Documents (menu, brochure...) - Optionnel
                          </Label>
                          {business.documents &&
                            business.documents.length > 0 && (
                              <div className="space-y-2 mb-3">
                                {business.documents.map((doc, docIndex) => (
                                  <div
                                    key={docIndex}
                                    className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
                                  >
                                    <FileText className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm flex-1 truncate">
                                      {doc.name}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newDocs = [
                                          ...(business.documents || []),
                                        ];
                                        newDocs.splice(docIndex, 1);
                                        updateBusiness(
                                          index,
                                          "documents",
                                          newDocs
                                        );
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3 text-red-500" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          <div className="space-y-2">
                            <Input
                              placeholder="Nom du document"
                              value={businessDocNames[index] || ""}
                              onChange={(e) => {
                                setBusinessDocNames((prev) => ({
                                  ...prev,
                                  [index]: e.target.value,
                                }));
                              }}
                            />
                            <PdfUpload
                              value=""
                              onChange={(url) => {
                                const docName =
                                  businessDocNames[index] || "Document";
                                const newDocs = [
                                  ...(business.documents || []),
                                  { name: docName, url },
                                ];
                                updateBusiness(index, "documents", newDocs);
                                // Reset le nom après ajout
                                setBusinessDocNames((prev) => ({
                                  ...prev,
                                  [index]: "",
                                }));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                  <Button
                    variant="outline"
                    onClick={addBusiness}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un commerce
                  </Button>
                </CardContent>
              </Card>

              {/* Impact local et taxe de séjour */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💚 Impact Territorial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-100 rounded-lg">
                    <Checkbox
                      id="showLocalImpact"
                      checked={formData.showLocalImpact}
                      onCheckedChange={(checked) =>
                        handleInputChange("showLocalImpact", checked === true)
                      }
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="showLocalImpact"
                        className="font-semibold cursor-pointer"
                      >
                        Afficher l&apos;encart &quot;Impact de votre
                        séjour&quot;
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Mettez en avant l&apos;impact positif de la taxe de
                        séjour et les avantages pour les visiteurs
                      </p>
                    </div>
                  </div>

                  {formData.showLocalImpact && (
                    <div className="space-y-4 pl-4 border-l-4 border-green-200">
                      <MultilingualInput
                        label="Titre de l'encart"
                        name="localImpactTitle"
                        value_fr={formData.localImpactTitle}
                        value_en={formData.localImpactTitle_en}
                        value_de={formData.localImpactTitle_de}
                        onChange={handleInputChange}
                        placeholder_fr="L'impact de votre séjour"
                        placeholder_en="The impact of your stay"
                        placeholder_de="Die Auswirkung Ihres Aufenthalts"
                        description="Par défaut : 'L'impact de votre séjour'"
                      />

                      <MultilingualInput
                        label="Message sur la taxe de séjour"
                        name="touristTaxImpactMessage"
                        type="textarea"
                        value_fr={formData.touristTaxImpactMessage}
                        value_en={formData.touristTaxImpactMessage_en}
                        value_de={formData.touristTaxImpactMessage_de}
                        onChange={handleInputChange}
                        placeholder_fr="Exemple : Votre taxe de séjour de 2.50 CHF soutient l'économie locale et vous donne accès à des avantages exclusifs."
                        placeholder_en="Example: Your tourist tax of 2.50 CHF supports the local economy and gives you access to exclusive benefits."
                        placeholder_de="Beispiel: Ihre Kurtaxe von 2,50 CHF unterstützt die lokale Wirtschaft und gibt Ihnen Zugang zu exklusiven Vorteilen."
                        description="Expliquez brièvement l'utilisation de la taxe de séjour"
                        required
                      />

                      <MultilingualInput
                        label="Liste des avantages"
                        name="localImpactDescription"
                        type="textarea"
                        value_fr={formData.localImpactDescription}
                        value_en={formData.localImpactDescription_en}
                        value_de={formData.localImpactDescription_de}
                        onChange={handleInputChange}
                        placeholder_fr="Exemple :\n✓ -10% chez Boulangerie du Village\n✓ Café offert au Restaurant du Lac"
                        placeholder_en="Example:\n✓ -10% at Village Bakery\n✓ Free coffee at Lake Restaurant"
                        placeholder_de="Beispiel:\n✓ -10% bei Dorfbäckerei\n✓ Kostenloser Kaffee im Seerestaurant"
                        description="Listez les avantages concrets. Utilisez ✓ ou • pour les puces"
                        required
                      />

                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="font-semibold text-sm text-blue-900 mb-2">
                          💡 Aperçu
                        </h4>
                        <div className="bg-[#F5F5F0] rounded-xl p-6 border border-[#E5E5DD]">
                          <h3 className="text-lg font-bold text-[#84994F] mb-3 text-center">
                            {formData.localImpactTitle ||
                              "L'impact de votre séjour"}
                          </h3>
                          {formData.touristTaxImpactMessage && (
                            <p className="text-gray-700 text-sm mb-4 text-center">
                              {formData.touristTaxImpactMessage}
                            </p>
                          )}
                          {formData.localImpactDescription && (
                            <div className="text-gray-700 text-sm whitespace-pre-line">
                              {formData.localImpactDescription}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Boutons d'action */}
      <div className="space-y-3 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border">
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

          {formData.isPubliclyVisible && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                window.open(`/establishment/${establishmentId}`, "_blank")
              }
              className="flex-1 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Prévisualiser
            </Button>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Sauvegarde..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
