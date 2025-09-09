"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Copy, Plus, X, Dog } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailEditor } from "@/components/EmailEditor";
import { toastUtils } from "@/lib/toast-utils";

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
  confirmationEmailTemplate: string;
  confirmationEmailTemplateWithDog: string;
  confirmationEmailDesign: UnlayerDesign | null;
  confirmationEmailDesignWithDog: UnlayerDesign | null;
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
};

export function ConfirmationManager({ hotelSlug }: ConfirmationManagerProps) {
  const [settings, setSettings] = useState<ConfirmationSettings>({
    confirmationEmailEnabled: true,
    confirmationEmailFrom: "noreply@selfkey.ch",
    confirmationEmailTemplate: "",
    confirmationEmailTemplateWithDog: "",
    confirmationEmailDesign: null,
    confirmationEmailDesignWithDog: null,
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
            confirmationEmailTemplate: data.confirmationEmailTemplate ?? "",
            confirmationEmailTemplateWithDog:
              data.confirmationEmailTemplateWithDog ?? "",
            confirmationEmailDesign: data.confirmationEmailDesign ?? null,
            confirmationEmailDesignWithDog:
              data.confirmationEmailDesignWithDog ?? null,
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
          <EmailEditor
            title="Template de Confirmation Général"
            description="Template utilisé par défaut pour toutes les confirmations de réservation"
            templateType="general"
            initialDesign={settings.confirmationEmailDesign || undefined}
            initialHtml={settings.confirmationEmailTemplate}
            mergeTags={defaultMergeTags}
            onSave={async (design, html) => {
              const newSettings = {
                ...settings,
                confirmationEmailDesign: design,
                confirmationEmailTemplate: html,
              };
              setSettings(newSettings);
              // Sauvegarder automatiquement en base
              await handleSaveWithUpdate(newSettings);
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
            <EmailEditor
              title="Template pour Emplacements Acceptant les Chiens"
              description="Template spécialisé pour les réservations d'emplacements acceptant les animaux"
              templateType="withDogs"
              initialDesign={
                settings.confirmationEmailDesignWithDog || undefined
              }
              initialHtml={settings.confirmationEmailTemplateWithDog}
              mergeTags={defaultMergeTags}
              onSave={async (design, html) => {
                const newSettings = {
                  ...settings,
                  confirmationEmailDesignWithDog: design,
                  confirmationEmailTemplateWithDog: html,
                };
                setSettings(newSettings);
                // Sauvegarder automatiquement en base
                await handleSaveWithUpdate(newSettings);
              }}
              testEmail={testEmail}
              onTestEmailChange={setTestEmail}
              onTestEmailSend={() => handleTestEmail("withDogs")}
              isTestLoading={isLoading}
            />
          </TabsContent>
        )}

        {/* Template sans chiens */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
