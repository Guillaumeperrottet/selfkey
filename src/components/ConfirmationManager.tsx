"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Copy, Plus, X, Dog, Languages } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailEditor } from "@/components/EmailEditor";
import { toastUtils } from "@/lib/toast-utils";

// Types de langue
type Locale = "fr" | "en" | "de";

// Types pour Unlayer
interface UnlayerDesign {
  counters?: Record<string, number>;
  body?: {
    id?: string;
    rows?: Array<unknown>;
    headers?: Array<unknown>;
    footers?: Array<unknown>;
    values?: Record<string, unknown>;
  };
}

interface ConfirmationSettings {
  confirmationEmailEnabled: boolean;
  confirmationEmailFrom: string;
  // Templates français
  confirmationEmailTemplate: string;
  confirmationEmailTemplateWithDog: string;
  confirmationEmailDesign: UnlayerDesign | null;
  confirmationEmailDesignWithDog: UnlayerDesign | null;
  // Templates anglais
  confirmationEmailTemplateEn: string;
  confirmationEmailTemplateWithDogEn: string;
  confirmationEmailDesignEn: UnlayerDesign | null;
  confirmationEmailDesignWithDogEn: UnlayerDesign | null;
  // Templates allemands
  confirmationEmailTemplateDe: string;
  confirmationEmailTemplateWithDogDe: string;
  confirmationEmailDesignDe: UnlayerDesign | null;
  confirmationEmailDesignWithDogDe: UnlayerDesign | null;
  hotelContactEmail: string;
  hotelContactPhone: string;
  enableEmailCopyOnConfirmation: boolean;
  emailCopyAddresses: string[];
  enableDogOption: boolean;
}

interface ConfirmationManagerProps {
  hotelSlug: string;
}

const defaultMergeTags = {
  clientFirstName: {
    name: "Prénom du client",
    value: "John",
  },
  clientLastName: {
    name: "Nom du client",
    value: "Doe",
  },
  establishmentName: {
    name: "Nom de l'établissement",
    value: "Mon Hôtel",
  },
  roomName: {
    name: "Nom de la chambre",
    value: "Chambre Deluxe",
  },
  checkInDate: {
    name: "Date d'arrivée",
    value: "15 juillet 2025",
  },
  checkOutDate: {
    name: "Date de départ",
    value: "17 juillet 2025",
  },
  accessCode: {
    name: "Code d'accès",
    value: "1234",
  },
  hotelContactEmail: {
    name: "Email de contact",
    value: "contact@hotel.ch",
  },
  hotelContactPhone: {
    name: "Téléphone de contact",
    value: "+41 XX XXX XX XX",
  },
  bookingNumber: {
    name: "Numéro de réservation",
    value: "DEMO-12345-2025",
  },
  totalAmount: {
    name: "Montant total payé",
    value: "150.00",
  },
  currency: {
    name: "Devise",
    value: "CHF",
  },
  invoiceDownloadUrl: {
    name: "Lien de téléchargement de facture",
    value: "https://exemple.com/invoice/download",
  },
};

export function ConfirmationManager({ hotelSlug }: ConfirmationManagerProps) {
  const [selectedLocale, setSelectedLocale] = useState<Locale>("fr");
  const [settings, setSettings] = useState<ConfirmationSettings>({
    confirmationEmailEnabled: true,
    confirmationEmailFrom: "noreply@selfkey.ch",
    // Templates français
    confirmationEmailTemplate: "",
    confirmationEmailTemplateWithDog: "",
    confirmationEmailDesign: null,
    confirmationEmailDesignWithDog: null,
    // Templates anglais
    confirmationEmailTemplateEn: "",
    confirmationEmailTemplateWithDogEn: "",
    confirmationEmailDesignEn: null,
    confirmationEmailDesignWithDogEn: null,
    // Templates allemands
    confirmationEmailTemplateDe: "",
    confirmationEmailTemplateWithDogDe: "",
    confirmationEmailDesignDe: null,
    confirmationEmailDesignWithDogDe: null,
    hotelContactEmail: "",
    hotelContactPhone: "",
    enableEmailCopyOnConfirmation: false,
    emailCopyAddresses: [],
    enableDogOption: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [newCopyEmail, setNewCopyEmail] = useState("");

  // Chargement des paramètres
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/admin/${hotelSlug}/confirmation-settings`
        );
        if (response.ok) {
          const data = await response.json();
          setSettings({
            confirmationEmailEnabled: data.confirmationEmailEnabled ?? true,
            confirmationEmailFrom:
              data.confirmationEmailFrom ?? "noreply@selfkey.ch",
            // Templates français
            confirmationEmailTemplate: data.confirmationEmailTemplate ?? "",
            confirmationEmailTemplateWithDog:
              data.confirmationEmailTemplateWithDog ?? "",
            confirmationEmailDesign: data.confirmationEmailDesign ?? null,
            confirmationEmailDesignWithDog:
              data.confirmationEmailDesignWithDog ?? null,
            // Templates anglais
            confirmationEmailTemplateEn: data.confirmationEmailTemplateEn ?? "",
            confirmationEmailTemplateWithDogEn:
              data.confirmationEmailTemplateWithDogEn ?? "",
            confirmationEmailDesignEn: data.confirmationEmailDesignEn ?? null,
            confirmationEmailDesignWithDogEn:
              data.confirmationEmailDesignWithDogEn ?? null,
            // Templates allemands
            confirmationEmailTemplateDe: data.confirmationEmailTemplateDe ?? "",
            confirmationEmailTemplateWithDogDe:
              data.confirmationEmailTemplateWithDogDe ?? "",
            confirmationEmailDesignDe: data.confirmationEmailDesignDe ?? null,
            confirmationEmailDesignWithDogDe:
              data.confirmationEmailDesignWithDogDe ?? null,
            hotelContactEmail: data.hotelContactEmail ?? "",
            hotelContactPhone: data.hotelContactPhone ?? "",
            enableEmailCopyOnConfirmation:
              data.enableEmailCopyOnConfirmation ?? false,
            emailCopyAddresses: data.emailCopyAddresses ?? [],
            enableDogOption: data.enableDogOption ?? false,
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [hotelSlug]);

  // Sauvegarde des paramètres
  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/${hotelSlug}/confirmation-settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      if (response.ok) {
        toastUtils.success("Paramètres sauvegardés avec succès !");
      } else {
        toastUtils.error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toastUtils.error("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarde avec mise à jour immédiate des paramètres
  const handleSaveWithUpdate = async (newSettings: ConfirmationSettings) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/${hotelSlug}/confirmation-settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSettings),
        }
      );

      if (response.ok) {
        toastUtils.success("Template sauvegardé automatiquement", 2000);
      } else {
        toastUtils.error("Erreur lors de la sauvegarde automatique");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde automatique:", error);
      toastUtils.error("Erreur lors de la sauvegarde automatique");
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de l'ajout d'email en copie
  const addCopyEmail = () => {
    if (newCopyEmail && !settings.emailCopyAddresses.includes(newCopyEmail)) {
      setSettings((prev) => ({
        ...prev,
        emailCopyAddresses: [...prev.emailCopyAddresses, newCopyEmail],
      }));
      setNewCopyEmail("");
    }
  };

  // Gestion de la suppression d'email en copie
  const removeCopyEmail = (emailToRemove: string) => {
    setSettings((prev) => ({
      ...prev,
      emailCopyAddresses: prev.emailCopyAddresses.filter(
        (email) => email !== emailToRemove
      ),
    }));
  };

  // Fonctions de copie entre templates
  const copyGeneralToWithDog = async () => {
    const templateField = getTemplateField("general");
    const designField = getDesignField("general");
    const template = settings[templateField as keyof ConfirmationSettings];
    const design = settings[designField as keyof ConfirmationSettings];

    if (!template && !design) {
      toastUtils.error("Aucun template général à copier");
      return;
    }

    const withDogTemplateField = getTemplateField("withDog");
    const withDogDesignField = getDesignField("withDog");

    const newSettings = {
      ...settings,
      [withDogTemplateField]: template,
      [withDogDesignField]: design,
    };

    setSettings(newSettings);
    await handleSaveWithUpdate(newSettings);
    toastUtils.success("Template général copié vers le template avec chiens !");
  };

  const copyWithDogToGeneral = async () => {
    const templateField = getTemplateField("withDog");
    const designField = getDesignField("withDog");
    const template = settings[templateField as keyof ConfirmationSettings];
    const design = settings[designField as keyof ConfirmationSettings];

    if (!template && !design) {
      toastUtils.error("Aucun template avec chiens à copier");
      return;
    }

    const generalTemplateField = getTemplateField("general");
    const generalDesignField = getDesignField("general");

    const newSettings = {
      ...settings,
      [generalTemplateField]: template,
      [generalDesignField]: design,
    };

    setSettings(newSettings);
    await handleSaveWithUpdate(newSettings);
    toastUtils.success("Template avec chiens copié vers le template général !");
  };

  const copyGeneralToWithoutDog = async () => {
    const templateField = getTemplateField("general");
    const designField = getDesignField("general");
    const template = settings[templateField as keyof ConfirmationSettings];
    const design = settings[designField as keyof ConfirmationSettings];

    if (!template && !design) {
      toastUtils.error("Aucun template général à copier");
      return;
    }

    const withoutDogTemplateField = getTemplateField("withoutDog");
    const withoutDogDesignField = getDesignField("withoutDog");

    const newSettings = {
      ...settings,
      [withoutDogTemplateField]: template,
      [withoutDogDesignField]: design,
    };

    setSettings(newSettings);
    await handleSaveWithUpdate(newSettings);
    toastUtils.success("Template général copié vers le template sans chiens !");
  };

  const copyWithoutDogToGeneral = async () => {
    const templateField = getTemplateField("withoutDog");
    const designField = getDesignField("withoutDog");
    const template = settings[templateField as keyof ConfirmationSettings];
    const design = settings[designField as keyof ConfirmationSettings];

    if (!template && !design) {
      toastUtils.error("Aucun template sans chiens à copier");
      return;
    }

    const generalTemplateField = getTemplateField("general");
    const generalDesignField = getDesignField("general");

    const newSettings = {
      ...settings,
      [generalTemplateField]: template,
      [generalDesignField]: design,
    };

    setSettings(newSettings);
    await handleSaveWithUpdate(newSettings);
    toastUtils.success("Template sans chiens copié vers le template général !");
  };

  // Fonction pour propager un template vers toutes les langues
  const propagateToAllLanguages = async (
    variant: "general" | "withDog" | "withoutDog"
  ) => {
    const sourceLocale = selectedLocale;

    // Récupérer le template source dans la langue actuelle
    const sourceTemplate = getCurrentTemplate(variant);
    const sourceDesign = getCurrentDesign(variant);

    if (!sourceTemplate && !sourceDesign) {
      toastUtils.error(
        `Aucun template ${variant} à copier pour ${getLocaleName(sourceLocale)}`
      );
      return;
    }

    // Définir les champs cibles pour chaque langue
    const variantSuffix =
      variant === "general"
        ? ""
        : variant === "withDog"
          ? "WithDog"
          : "WithoutDog";

    const newSettings: Partial<ConfirmationSettings> = { ...settings };

    // Copier vers les autres langues
    const languages: Locale[] = ["fr", "en", "de"];
    let copiedCount = 0;

    for (const targetLocale of languages) {
      if (targetLocale !== sourceLocale) {
        const suffix =
          targetLocale === "fr" ? "" : targetLocale === "en" ? "En" : "De";
        const templateField = `confirmationEmailTemplate${variantSuffix}${suffix}`;
        const designField = `confirmationEmailDesign${variantSuffix}${suffix}`;

        newSettings[templateField as keyof ConfirmationSettings] =
          sourceTemplate as never;
        newSettings[designField as keyof ConfirmationSettings] =
          sourceDesign as never;
        copiedCount++;
      }
    }

    setSettings(newSettings as ConfirmationSettings);
    await handleSaveWithUpdate(newSettings as ConfirmationSettings);
    toastUtils.success(
      `Template ${variant} (${getLocaleName(sourceLocale)}) copié vers ${copiedCount} autre${copiedCount > 1 ? "s" : ""} langue${copiedCount > 1 ? "s" : ""} !`
    );
  };

  // Test d'email
  const handleTestEmail = async (templateType: "general" | "withDogs") => {
    if (!testEmail) {
      toastUtils.warning("Veuillez saisir une adresse email de test");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/${hotelSlug}/test-confirmation-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testEmail,
            templateType,
            settings: {
              confirmationEmailTemplate: settings.confirmationEmailTemplate,
              confirmationEmailTemplateWithDog:
                settings.confirmationEmailTemplateWithDog,
              confirmationEmailFrom: settings.confirmationEmailFrom,
              hotelContactEmail: settings.hotelContactEmail,
              hotelContactPhone: settings.hotelContactPhone,
              enableEmailCopyOnConfirmation:
                settings.enableEmailCopyOnConfirmation,
              emailCopyAddresses: settings.emailCopyAddresses,
            },
          }),
        }
      );

      if (response.ok) {
        toastUtils.success("Email de test envoyé avec succès !");
      } else {
        toastUtils.error("Erreur lors de l'envoi de l'email de test");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de test:", error);
      toastUtils.error("Erreur lors de l'envoi de l'email de test");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions helper pour obtenir/modifier les templates selon la langue
  const getTemplateField = (variant: "general" | "withDog" | "withoutDog") => {
    if (variant === "general") {
      switch (selectedLocale) {
        case "en":
          return "confirmationEmailTemplateEn";
        case "de":
          return "confirmationEmailTemplateDe";
        default:
          return "confirmationEmailTemplate";
      }
    } else if (variant === "withDog") {
      switch (selectedLocale) {
        case "en":
          return "confirmationEmailTemplateWithDogEn";
        case "de":
          return "confirmationEmailTemplateWithDogDe";
        default:
          return "confirmationEmailTemplateWithDog";
      }
    } else {
      // withoutDog
      switch (selectedLocale) {
        case "en":
          return "confirmationEmailTemplateWithoutDogEn";
        case "de":
          return "confirmationEmailTemplateWithoutDogDe";
        default:
          return "confirmationEmailTemplateWithoutDog";
      }
    }
  };

  const getDesignField = (variant: "general" | "withDog" | "withoutDog") => {
    if (variant === "general") {
      switch (selectedLocale) {
        case "en":
          return "confirmationEmailDesignEn";
        case "de":
          return "confirmationEmailDesignDe";
        default:
          return "confirmationEmailDesign";
      }
    } else if (variant === "withDog") {
      switch (selectedLocale) {
        case "en":
          return "confirmationEmailDesignWithDogEn";
        case "de":
          return "confirmationEmailDesignWithDogDe";
        default:
          return "confirmationEmailDesignWithDog";
      }
    } else {
      // withoutDog
      switch (selectedLocale) {
        case "en":
          return "confirmationEmailDesignWithoutDogEn";
        case "de":
          return "confirmationEmailDesignWithoutDogDe";
        default:
          return "confirmationEmailDesignWithoutDog";
      }
    }
  };

  const getCurrentTemplate = (
    variant: "general" | "withDog" | "withoutDog"
  ) => {
    const field = getTemplateField(variant);
    return settings[field as keyof ConfirmationSettings] as string;
  };

  const getCurrentDesign = (variant: "general" | "withDog" | "withoutDog") => {
    const field = getDesignField(variant);
    return settings[
      field as keyof ConfirmationSettings
    ] as UnlayerDesign | null;
  };

  const updateCurrentTemplate = (
    variant: "general" | "withDog" | "withoutDog",
    html: string,
    design: UnlayerDesign
  ) => {
    const templateField = getTemplateField(variant);
    const designField = getDesignField(variant);

    const newSettings = {
      ...settings,
      [templateField]: html,
      [designField]: design,
    };

    setSettings(newSettings);
    handleSaveWithUpdate(newSettings);
  };

  const getLocaleName = (locale: Locale) => {
    switch (locale) {
      case "fr":
        return "Français";
      case "en":
        return "English";
      case "de":
        return "Deutsch";
    }
  };

  if (isLoading && !settings.confirmationEmailTemplate) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sélecteur de langue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Langue du Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={selectedLocale === "fr" ? "default" : "outline"}
              onClick={() => setSelectedLocale("fr")}
              className="flex items-center gap-2"
            >
              🇫🇷 Français
            </Button>
            <Button
              variant={selectedLocale === "en" ? "default" : "outline"}
              onClick={() => setSelectedLocale("en")}
              className="flex items-center gap-2"
            >
              🇬🇧 English
            </Button>
            <Button
              variant={selectedLocale === "de" ? "default" : "outline"}
              onClick={() => setSelectedLocale("de")}
              className="flex items-center gap-2"
            >
              🇩🇪 Deutsch
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Créez un email de confirmation pour chaque langue. Les clients
            recevront automatiquement l&apos;email dans la langue qu&apos;ils
            ont choisie lors de la réservation.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Email Général</TabsTrigger>
          {settings.enableDogOption && (
            <TabsTrigger value="withDog">
              <Dog className="h-4 w-4 mr-1" />
              Avec Chiens
            </TabsTrigger>
          )}
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-1" />
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="copy">
            <Copy className="h-4 w-4 mr-1" />
            Copie
          </TabsTrigger>
        </TabsList>

        {/* Template général */}
        <TabsContent value="general" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => propagateToAllLanguages("general")}
              disabled={
                isLoading ||
                (!getCurrentTemplate("general") && !getCurrentDesign("general"))
              }
              variant="outline"
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Propager vers toutes les langues
            </Button>
          </div>
          <EmailEditor
            title={`Template de Confirmation Général (${getLocaleName(selectedLocale)})`}
            description="Template utilisé par défaut pour toutes les confirmations de réservation"
            templateType="general"
            key={`general-${selectedLocale}`}
            initialDesign={getCurrentDesign("general") || undefined}
            initialHtml={getCurrentTemplate("general")}
            mergeTags={defaultMergeTags}
            onSave={async (design, html) => {
              updateCurrentTemplate("general", html, design);
            }}
            testEmail={testEmail}
            onTestEmailChange={setTestEmail}
            onTestEmailSend={() => handleTestEmail("general")}
            isTestLoading={isLoading}
          />
        </TabsContent>

        {/* Template avec chiens */}
        {settings.enableDogOption && (
          <TabsContent value="withDog" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => propagateToAllLanguages("withDog")}
                disabled={
                  isLoading ||
                  (!getCurrentTemplate("withDog") &&
                    !getCurrentDesign("withDog"))
                }
                variant="outline"
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Propager vers toutes les langues
              </Button>
            </div>
            <EmailEditor
              title={`Template pour Emplacements Acceptant les Chiens (${getLocaleName(selectedLocale)})`}
              description="Template spécialisé pour les réservations d'emplacements acceptant les animaux"
              templateType="withDogs"
              key={`withDog-${selectedLocale}`}
              initialDesign={getCurrentDesign("withDog") || undefined}
              initialHtml={getCurrentTemplate("withDog")}
              mergeTags={defaultMergeTags}
              onSave={async (design, html) => {
                updateCurrentTemplate("withDog", html, design);
              }}
              testEmail={testEmail}
              onTestEmailChange={setTestEmail}
              onTestEmailSend={() => handleTestEmail("withDogs")}
              isTestLoading={isLoading}
            />
          </TabsContent>
        )}

        {/* Paramètres */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres Généraux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Activer les emails de confirmation</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoi automatique d&apos;emails après chaque réservation
                  </p>
                </div>
                <Switch
                  checked={settings.confirmationEmailEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      confirmationEmailEnabled: checked,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailFrom">Adresse expéditeur</Label>
                <Input
                  id="emailFrom"
                  value={settings.confirmationEmailFrom}
                  disabled
                  className="bg-muted cursor-not-allowed"
                  placeholder="noreply@monhotel.com"
                />
                <p className="text-xs text-muted-foreground">
                  Cette adresse est fixe et ne peut pas être modifiée.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de contact</Label>
                <Input
                  id="contactEmail"
                  value={settings.hotelContactEmail}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      hotelContactEmail: e.target.value,
                    }))
                  }
                  placeholder="contact@monhotel.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Téléphone de contact</Label>
                <Input
                  id="contactPhone"
                  value={settings.hotelContactPhone}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      hotelContactPhone: e.target.value,
                    }))
                  }
                  placeholder="+41 XX XXX XX XX"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Sauvegarde..." : "Sauvegarder les paramètres"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Copie des emails */}
        <TabsContent value="copy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Copie des Confirmations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Activer la copie des confirmations</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoie une copie de chaque email de confirmation aux
                    adresses configurées
                  </p>
                </div>
                <Switch
                  checked={settings.enableEmailCopyOnConfirmation}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      enableEmailCopyOnConfirmation: checked,
                    }))
                  }
                />
              </div>

              {settings.enableEmailCopyOnConfirmation && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nouvelle adresse email"
                      value={newCopyEmail}
                      onChange={(e) => setNewCopyEmail(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCopyEmail()}
                    />
                    <Button onClick={addCopyEmail} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {settings.emailCopyAddresses.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span>{email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCopyEmail(email)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Sauvegarde..." : "Sauvegarder les paramètres"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Copie entre templates */}
          {settings.enableDogOption && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  Copie entre Templates ({getLocaleName(selectedLocale)})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Copiez rapidement un template d&apos;email vers l&apos;autre
                  pour éviter de recréer le design.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Général → Avec Chiens */}
                  <div className="space-y-3">
                    <h4 className="font-medium">
                      Template Général → Avec Chiens
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Copie le template général vers le template avec chiens
                    </p>
                    <Button
                      onClick={copyGeneralToWithDog}
                      disabled={
                        isLoading ||
                        (!getCurrentTemplate("general") &&
                          !getCurrentDesign("general"))
                      }
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier Général → Chiens
                    </Button>
                  </div>

                  {/* Avec Chiens → Général */}
                  <div className="space-y-3">
                    <h4 className="font-medium">
                      Template Avec Chiens → Général
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Copie le template avec chiens vers le template général
                    </p>
                    <Button
                      onClick={copyWithDogToGeneral}
                      disabled={
                        isLoading ||
                        (!getCurrentTemplate("withDog") &&
                          !getCurrentDesign("withDog"))
                      }
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier Chiens → Général
                    </Button>
                  </div>

                  {/* Général → Sans Chiens */}
                  <div className="space-y-3">
                    <h4 className="font-medium">
                      Template Général → Sans Chiens
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Copie le template général vers le template sans chiens
                    </p>
                    <Button
                      onClick={copyGeneralToWithoutDog}
                      disabled={
                        isLoading ||
                        (!getCurrentTemplate("general") &&
                          !getCurrentDesign("general"))
                      }
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier Général → Sans Chiens
                    </Button>
                  </div>

                  {/* Sans Chiens → Général */}
                  <div className="space-y-3">
                    <h4 className="font-medium">
                      Template Sans Chiens → Général
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Copie le template sans chiens vers le template général
                    </p>
                    <Button
                      onClick={copyWithoutDogToGeneral}
                      disabled={
                        isLoading ||
                        (!getCurrentTemplate("withoutDog") &&
                          !getCurrentDesign("withoutDog"))
                      }
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier Sans Chiens → Général
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600 mt-0.5">ℹ️</div>
                    <div className="text-sm text-blue-700">
                      <strong>Conseil :</strong> Après avoir copié un template,
                      vous pouvez le modifier dans l&apos;onglet correspondant
                      pour l&apos;adapter aux spécificités de chaque type de
                      réservation.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
