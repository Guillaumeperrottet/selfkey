"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
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
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;

  // Affichage carte
  mapTitle?: string;
  mapDescription?: string;
  mapImage?: string;
  showOnMap?: boolean;

  // Présentation publique
  presentationImages?: string[];
  presentationDescription?: string;
  presentationAttributes?: Record<string, boolean>;
  presentationWebsite?: string;
  presentationEmail?: string;
  presentationPhone?: string;
  presentationDocuments?: Array<{
    name: string;
    url: string;
    type: string;
    description?: string;
  }>;
  presentationNearbyBusinesses?: Array<{
    name: string;
    type: string;
    distance: string;
    description?: string;
  }>;
  isPubliclyVisible?: boolean;
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
    city: initialData?.city || "",
    postalCode: initialData?.postalCode || "",
    country: initialData?.country || "Switzerland",
    latitude: initialData?.latitude || "",
    longitude: initialData?.longitude || "",

    // Carte
    mapTitle: initialData?.mapTitle || "",
    mapDescription: initialData?.mapDescription || "",
    mapImage: initialData?.mapImage || "",
    showOnMap: initialData?.showOnMap ?? true,

    // Présentation
    presentationImages: initialData?.presentationImages || [],
    presentationDescription: initialData?.presentationDescription || "",
    presentationAttributes: initialData?.presentationAttributes || {},
    presentationWebsite: initialData?.presentationWebsite || "",
    presentationEmail: initialData?.presentationEmail || "",
    presentationPhone: initialData?.presentationPhone || "",
    presentationDocuments: initialData?.presentationDocuments || [],
    presentationNearbyBusinesses:
      initialData?.presentationNearbyBusinesses || [],
    isPubliclyVisible: initialData?.isPubliclyVisible ?? false,
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"location" | "presentation">(
    "location"
  );

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
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            latitude: parseFloat(formData.latitude.toString()),
            longitude: parseFloat(formData.longitude.toString()),
            mapTitle: formData.mapTitle || null,
            mapDescription: formData.mapDescription || null,
            mapImage: formData.mapImage || null,
            showOnMap: formData.showOnMap,
            presentationImages: formData.presentationImages,
            presentationDescription: formData.presentationDescription || null,
            presentationAttributes: formData.presentationAttributes,
            presentationWebsite: formData.presentationWebsite || null,
            presentationEmail: formData.presentationEmail || null,
            presentationPhone: formData.presentationPhone || null,
            presentationDocuments: formData.presentationDocuments,
            presentationNearbyBusinesses: formData.presentationNearbyBusinesses,
            isPubliclyVisible: formData.isPubliclyVisible,
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

  const updateBusiness = (index: number, field: string, value: string) => {
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

            {/* Adresse */}
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

                  <div>
                    <Label>Image pour la carte (optionnel)</Label>
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
                  <Textarea
                    value={formData.presentationDescription}
                    onChange={(e) =>
                      handleInputChange(
                        "presentationDescription",
                        e.target.value
                      )
                    }
                    placeholder="Décrivez votre établissement, ses atouts, son emplacement..."
                    rows={8}
                    className="w-full"
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Nom du document"
                          value={doc.name}
                          onChange={(e) =>
                            updateDocument(index, "name", e.target.value)
                          }
                        />
                        <Input
                          placeholder="URL du document"
                          value={doc.url}
                          onChange={(e) =>
                            updateDocument(index, "url", e.target.value)
                          }
                        />
                      </div>
                      <Input
                        placeholder="Description (optionnel)"
                        value={doc.description}
                        onChange={(e) =>
                          updateDocument(index, "description", e.target.value)
                        }
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            placeholder="Nom"
                            value={business.name}
                            onChange={(e) =>
                              updateBusiness(index, "name", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Type (restaurant, magasin...)"
                            value={business.type}
                            onChange={(e) =>
                              updateBusiness(index, "type", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Distance (ex: 500m)"
                            value={business.distance}
                            onChange={(e) =>
                              updateBusiness(index, "distance", e.target.value)
                            }
                          />
                        </div>
                        <Input
                          placeholder="Description (optionnel)"
                          value={business.description}
                          onChange={(e) =>
                            updateBusiness(index, "description", e.target.value)
                          }
                        />
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
