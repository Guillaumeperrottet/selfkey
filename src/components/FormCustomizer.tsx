"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Settings, Info, Eye, EyeOff } from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface FormField {
  id: string;
  label: string;
  required: boolean;
  enabled: boolean;
  description?: string;
  isStripeRequired?: boolean; // Nouveau: champ requis pour Stripe
}

interface FormCustomizerProps {
  hotelSlug: string;
}

const DEFAULT_FORM_FIELDS: FormField[] = [
  {
    id: "adults",
    label: "Nombre d'adultes / Adults",
    required: true,
    enabled: true,
    description: "Obligatoire pour la réservation / Required for booking",
  },
  {
    id: "children",
    label: "Nombre d'enfants / Children",
    required: false,
    enabled: true,
    description: "Information optionnelle / Optional information",
  },
  {
    id: "clientFirstName",
    label: "Prénom / First Name",
    required: true,
    enabled: true,
    description:
      "Obligatoire pour l'identification / Required for identification",
  },
  {
    id: "clientLastName",
    label: "Nom / Last Name",
    required: true,
    enabled: true,
    description:
      "Obligatoire pour l'identification / Required for identification",
  },
  {
    id: "clientEmail",
    label: "Email / Email Address",
    required: true,
    enabled: true,
    description:
      "Obligatoire pour l'envoi de la confirmation / Required for confirmation",
  },
  {
    id: "clientPhone",
    label: "Téléphone mobile / Mobile Phone",
    required: true,
    enabled: true,
    description:
      "Obligatoire pour vous contacter si nécessaire / Required to contact you",
  },
  {
    id: "clientBirthDate",
    label: "Date de naissance / Date of Birth",
    required: true,
    enabled: true,
    description:
      "Information pour l'identification / Information for identification",
  },
  {
    id: "clientBirthPlace",
    label: "Lieu de naissance / Place of Birth",
    required: false,
    enabled: true,
    description:
      "Information pour l'identification / Information for identification",
  },
  {
    id: "clientAddress",
    label: "Adresse",
    required: true, // Requis pour Stripe billing_details.address.line1
    enabled: true,
    description: "Adresse de domicile (requis pour le paiement)",
    isStripeRequired: true,
  },
  {
    id: "clientPostalCode",
    label: "Code postal",
    required: true, // Requis pour Stripe billing_details.address.postal_code
    enabled: true,
    description: "Code postal de domicile (requis pour le paiement)",
    isStripeRequired: true,
  },
  {
    id: "clientCity",
    label: "Localité",
    required: true, // Requis pour Stripe billing_details.address.city
    enabled: true,
    description: "Ville de domicile (requis pour le paiement)",
    isStripeRequired: true,
  },
  {
    id: "clientCountry",
    label: "Pays / Country",
    required: true, // Requis pour Stripe billing_details.address.country
    enabled: true,
    description:
      "Pays de résidence (requis pour le paiement) / Country of residence (required for payment)",
    isStripeRequired: true,
  },
  {
    id: "clientIdNumber",
    label: "N° de permis ou carte d'identité / ID or License Number",
    required: false,
    enabled: true,
    description: "Numéro d'identification officiel / Official ID number",
  },
  {
    id: "clientVehicleNumber",
    label: "N° d'immatriculation du véhicule / License Plate",
    required: false,
    enabled: true,
    description:
      "Plaque d'immatriculation pour le parking / License plate for parking",
  },
];

export function FormCustomizer({ hotelSlug }: FormCustomizerProps) {
  const [formFields, setFormFields] =
    useState<FormField[]>(DEFAULT_FORM_FIELDS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Charger la configuration actuelle
  useEffect(() => {
    const loadFormConfig = async () => {
      try {
        const response = await fetch(`/api/admin/${hotelSlug}/form-config`);
        if (response.ok) {
          const data = await response.json();
          if (data.formConfig && Object.keys(data.formConfig).length > 0) {
            // Fusionner la configuration sauvegardée avec les champs par défaut
            const updatedFields = DEFAULT_FORM_FIELDS.map((field) => ({
              ...field,
              enabled: data.formConfig[field.id]?.enabled ?? field.enabled,
            }));
            setFormFields(updatedFields);
          }
        } else {
          console.error("Erreur lors du chargement de la configuration");
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        toastUtils.error("Erreur lors du chargement de la configuration");
      } finally {
        setIsLoading(false);
      }
    };

    loadFormConfig();
  }, [hotelSlug]);

  const handleFieldToggle = (fieldId: string, enabled: boolean) => {
    setFormFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, enabled } : field
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const loadingToast = toastUtils.loading(
      "Sauvegarde de la configuration..."
    );

    try {
      // Créer l'objet de configuration
      const formConfig = formFields.reduce(
        (config, field) => {
          config[field.id] = {
            enabled: field.enabled,
            required: field.required,
          };
          return config;
        },
        {} as Record<string, { enabled: boolean; required: boolean }>
      );

      const response = await fetch(`/api/admin/${hotelSlug}/form-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formConfig }),
      });

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        toastUtils.success(
          "Configuration du formulaire sauvegardée avec succès"
        );
      } else {
        const errorData = await response.json();
        toastUtils.error(errorData.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la sauvegarde");
      console.error("Error saving form config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const enabledFieldsCount = formFields.filter((field) => field.enabled).length;
  const totalFieldsCount = formFields.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement de la configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Personnalisation du formulaire de réservation
          </CardTitle>
          <div className="text-sm text-gray-600">
            <p>
              Personnalisez les champs affichés dans le formulaire de
              réservation pour vos clients.
            </p>
            <p className="mt-1">
              <strong>{enabledFieldsCount}</strong> sur{" "}
              <strong>{totalFieldsCount}</strong> champs activés
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Information importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">
                  Important à savoir :
                </p>
                <ul className="text-blue-700 space-y-1">
                  <li>
                    • Les champs obligatoires ne peuvent pas être désactivés
                  </li>
                  <li>
                    • Certains champs sont requis par Stripe pour le traitement
                    des paiements
                  </li>
                  <li>
                    • Cette configuration s&apos;applique uniquement aux
                    réservations de nuit
                  </li>
                  <li>• Les modifications prennent effet immédiatement</li>
                  <li>• Les réservations existantes ne sont pas affectées</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Liste des champs */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Champs du formulaire</h4>

            {/* Champs obligatoires */}
            <div>
              <h5 className="font-medium text-sm text-gray-700 mb-3 border-b pb-1">
                Champs obligatoires (ne peuvent pas être modifiés)
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formFields
                  .filter((field) => field.required)
                  .map((field) => (
                    <div
                      key={field.id}
                      className="flex items-start justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Eye className="h-4 w-4 text-green-600" />
                        <div>
                          <Label className="font-medium text-gray-900">
                            {field.label}
                          </Label>
                          {field.description && (
                            <p className="text-xs text-gray-600 mt-1">
                              {field.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          field.isStripeRequired
                            ? "bg-purple-100 text-purple-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {field.isStripeRequired
                          ? "Requis Stripe"
                          : "Obligatoire"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Champs optionnels */}
            <div>
              <h5 className="font-medium text-sm text-gray-700 mb-3 border-b pb-1">
                Champs optionnels (peuvent être masqués)
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formFields
                  .filter((field) => !field.required)
                  .map((field) => (
                    <div
                      key={field.id}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {field.enabled ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        <div>
                          <Label
                            className={`font-medium ${field.enabled ? "text-gray-900" : "text-gray-500"}`}
                          >
                            {field.label}
                          </Label>
                          {field.description && (
                            <p className="text-xs text-gray-600 mt-1">
                              {field.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Checkbox
                        checked={field.enabled}
                        onCheckedChange={(checked) =>
                          handleFieldToggle(field.id, checked === true)
                        }
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-32"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                "Sauvegarder la configuration"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
