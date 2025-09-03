"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Settings,
  Copy,
  MessageSquare,
  Users,
  Plus,
  X,
  ImageIcon,
  Send,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploader } from "@/components/ImageUploader";

interface ConfirmationSettings {
  confirmationEmailEnabled: boolean;
  confirmationEmailFrom: string;
  confirmationEmailTemplate: string;
  hotelContactEmail: string;
  hotelContactPhone: string;
  enableEmailCopyOnConfirmation: boolean;
  emailCopyAddresses: string[];
}

interface ConfirmationManagerProps {
  hotelSlug: string;
}

const defaultEmailTemplate = `Bonjour {clientFirstName} {clientLastName},

Votre réservation à {establishmentName} a été confirmée avec succès !

Détails de votre réservation :
- Chambre : {roomName}
- Arrivée : {checkInDate}
- Départ : {checkOutDate}
- Code d'accès : {accessCode}

Pour toute question, vous pouvez nous contacter :
📧 Email : {hotelContactEmail}
📞 Téléphone : {hotelContactPhone}

Nous vous souhaitons un excellent séjour !

Cordialement,
L'équipe de {establishmentName}

---

Guten Tag {clientFirstName} {clientLastName},

Ihre Reservierung im {establishmentName} wurde erfolgreich bestätigt!

Details Ihrer Reservierung:
- Zimmer: {roomName}
- Ankunft: {checkInDate}
- Abreise: {checkOutDate}
- Zugangscode: {accessCode}

Bei Fragen können Sie uns gerne kontaktieren:
📧 E-Mail: {hotelContactEmail}
📞 Telefon: {hotelContactPhone}

Wir wünschen Ihnen einen angenehmen Aufenthalt!

Mit freundlichen Grüssen,
Das Team von {establishmentName}`;

export function ConfirmationManager({ hotelSlug }: ConfirmationManagerProps) {
  const [settings, setSettings] = useState<ConfirmationSettings>({
    confirmationEmailEnabled: true,
    confirmationEmailFrom: "noreply@selfkey.ch",
    confirmationEmailTemplate: defaultEmailTemplate,
    hotelContactEmail: "",
    hotelContactPhone: "",
    enableEmailCopyOnConfirmation: false,
    emailCopyAddresses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newEmailAddress, setNewEmailAddress] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Validation d'email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Ajouter une nouvelle adresse email
  const addEmailAddress = () => {
    const email = newEmailAddress.trim();
    if (!email) return;

    if (!isValidEmail(email)) {
      setError("Adresse email invalide");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (settings.emailCopyAddresses.includes(email)) {
      setError("Cette adresse email est déjà configurée");
      setTimeout(() => setError(""), 3000);
      return;
    }

    updateSettings({
      emailCopyAddresses: [...settings.emailCopyAddresses, email],
    });
    setNewEmailAddress("");
  };

  // Supprimer une adresse email
  const removeEmailAddress = (index: number) => {
    const newAddresses = settings.emailCopyAddresses.filter(
      (_, i) => i !== index
    );
    updateSettings({
      emailCopyAddresses: newAddresses,
    });
  };

  // Debounce pour la sauvegarde automatique
  useEffect(() => {
    if (!hasUnsavedChanges || loading) return;

    const timeoutId = setTimeout(async () => {
      setError("");

      try {
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
          setHasUnsavedChanges(false);
          setSuccess("Sauvegardé automatiquement");
          setTimeout(() => setSuccess(""), 2000);
        } else {
          const data = await response.json();
          setError(data.error || "Erreur lors de la sauvegarde");
        }
      } catch {
        setError("Erreur lors de la sauvegarde");
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [settings, hasUnsavedChanges, loading, hotelSlug]);

  // Fonction pour mettre à jour les settings avec notification de changement
  const updateSettings = (newSettings: Partial<ConfirmationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    setHasUnsavedChanges(true);
  };

  // Fonction pour envoyer un email de test
  const sendTestEmail = async () => {
    if (!testEmail || !isValidEmail(testEmail)) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    setIsSendingTest(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/${hotelSlug}/test-confirmation-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testEmail,
            settings,
          }),
        }
      );

      if (response.ok) {
        setSuccess(`Email de test envoyé avec succès à ${testEmail}`);
        setTimeout(() => setSuccess(""), 5000);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'envoi de l'email de test");
      }
    } catch {
      setError("Erreur lors de l'envoi de l'email de test");
    } finally {
      setIsSendingTest(false);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(
          `/api/admin/${hotelSlug}/confirmation-settings`
        );
        if (response.ok) {
          const data = await response.json();
          setSettings({
            confirmationEmailEnabled: data.confirmationEmailEnabled ?? true,
            confirmationEmailFrom:
              data.confirmationEmailFrom ?? "noreply@selfkey.ch",
            confirmationEmailTemplate:
              data.confirmationEmailTemplate ?? defaultEmailTemplate,
            hotelContactEmail: data.hotelContactEmail ?? "",
            hotelContactPhone: data.hotelContactPhone ?? "",
            enableEmailCopyOnConfirmation:
              data.enableEmailCopyOnConfirmation ?? false,
            emailCopyAddresses: data.emailCopyAddresses ?? [],
          });
          // Marquer comme sauvegardé au chargement
          setHasUnsavedChanges(false);
        }
      } catch {
        setError("Erreur lors du chargement des paramètres");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [hotelSlug]);

  const resetToDefault = () => {
    const newSettings = {
      ...settings,
      confirmationEmailTemplate: defaultEmailTemplate,
    };
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const availableVariables = [
    { key: "clientFirstName", label: "Prénom du client" },
    { key: "clientLastName", label: "Nom du client" },
    { key: "establishmentName", label: "Nom de l'établissement" },
    { key: "roomName", label: "Nom de la chambre" },
    { key: "checkInDate", label: "Date d'arrivée" },
    { key: "checkOutDate", label: "Date de départ" },
    { key: "accessCode", label: "Code d'accès" },
    { key: "hotelContactEmail", label: "Email de contact de l'établissement" },
    {
      key: "hotelContactPhone",
      label: "Téléphone de contact de l'établissement",
    },
  ];

  const imageExamples = [
    {
      html: '<img src="https://votre-site.com/logo.png" alt="Logo" style="width: 150px; height: auto; margin: 20px 0;" />',
      label: "Logo de l'établissement",
    },
    {
      html: '<img src="https://votre-site.com/plan.jpg" alt="Plan d\'accès" style="width: 100%; max-width: 400px; height: auto; margin: 10px 0;" />',
      label: "Plan d'accès",
    },
    {
      html: '<img src="https://votre-site.com/qr-code.png" alt="QR Code WiFi" style="width: 200px; height: auto; margin: 15px 0;" />',
      label: "QR Code WiFi",
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Variable copiée !");
    setTimeout(() => setSuccess(""), 2000);
  };

  const insertImageInTemplate = (imageHtml: string) => {
    // Insérer l'image à la fin du template actuel
    const currentTemplate = settings.confirmationEmailTemplate;
    const newTemplate = currentTemplate + "\n\n" + imageHtml;

    updateSettings({
      confirmationEmailTemplate: newTemplate,
    });

    setSuccess("Image ajoutée au template !");
    setTimeout(() => setSuccess(""), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header compact */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Confirmations de réservation
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Configuration des confirmations automatiques par email
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${settings.confirmationEmailEnabled ? "bg-green-500" : "bg-gray-300"}`}
            ></div>
            <span className="text-xs font-medium">
              Email {settings.confirmationEmailEnabled ? "activé" : "désactivé"}
            </span>
          </div>
        </div>
      </div>

      {/* Alertes */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Interface avec onglets */}
      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="copy" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Copie
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Test
          </TabsTrigger>
        </TabsList>

        {/* Onglet Contact */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Informations de contact
              </CardTitle>
              <p className="text-sm text-gray-600">
                Ces informations seront affichées dans les confirmations
                envoyées aux clients
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="hotel-contact-email"
                    className="text-sm font-medium"
                  >
                    📧 Email de contact *
                  </Label>
                  <Input
                    id="hotel-contact-email"
                    type="email"
                    placeholder="contact@votre-hotel.com"
                    value={settings.hotelContactEmail}
                    onChange={(e) =>
                      updateSettings({
                        hotelContactEmail: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cette adresse sera visible dans les emails de confirmation
                  </p>
                </div>
                <div>
                  <Label
                    htmlFor="hotel-contact-phone"
                    className="text-sm font-medium"
                  >
                    📞 Téléphone de contact *
                  </Label>
                  <Input
                    id="hotel-contact-phone"
                    type="tel"
                    placeholder="+41 XX XXX XX XX"
                    value={settings.hotelContactPhone}
                    onChange={(e) =>
                      updateSettings({
                        hotelContactPhone: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ce numéro sera visible dans les confirmations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Email */}
        <TabsContent value="email" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Configuration Email */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Configuration Email
                    <Switch
                      checked={settings.confirmationEmailEnabled}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          confirmationEmailEnabled: checked,
                        })
                      }
                      className="ml-auto"
                    />
                  </CardTitle>
                </CardHeader>
                {settings.confirmationEmailEnabled && (
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">
                          Adresse d&apos;envoi
                        </span>
                      </div>
                      <Input
                        type="email"
                        value={settings.confirmationEmailFrom}
                        readOnly
                        className="bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Adresse technique utilisée pour l&apos;envoi
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">
                          Template du message
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetToDefault}
                          className="text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Réinitialiser
                        </Button>
                      </div>

                      <Textarea
                        rows={20}
                        placeholder="Votre template email..."
                        value={settings.confirmationEmailTemplate}
                        onChange={(e) =>
                          updateSettings({
                            confirmationEmailTemplate: e.target.value,
                          })
                        }
                        className="font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Variables et Images disponibles à côté */}
            <div>
              <Card className="bg-slate-50 border-slate-200 h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                    <Copy className="h-4 w-4" />
                    Variables & Images
                  </CardTitle>
                  <p className="text-xs text-gray-600">Cliquez pour copier</p>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="variables" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-3">
                      <TabsTrigger value="variables" className="text-xs">
                        <Copy className="h-3 w-3 mr-1" />
                        Variables
                      </TabsTrigger>
                      <TabsTrigger value="images" className="text-xs">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Images
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="variables" className="space-y-2 mt-0">
                      {availableVariables.map((variable) => (
                        <div
                          key={variable.key}
                          className="bg-white p-2 rounded border hover:shadow-sm transition-shadow cursor-pointer"
                          onClick={() => copyToClipboard(`{${variable.key}}`)}
                        >
                          <div className="font-mono text-xs text-blue-600 mb-1">
                            {`{${variable.key}}`}
                          </div>
                          <div className="text-xs text-slate-600">
                            {variable.label}
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="images" className="space-y-2 mt-0">
                      <div className="mb-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                        <div className="text-xs text-gray-700 space-y-1">
                          <div className="font-medium text-green-700">
                            🖼️ Drag & Drop :
                          </div>
                          <div>
                            • <strong>Glissez-déposez</strong> vos images
                            directement ici
                          </div>
                          <div>
                            • <strong>Insertion automatique</strong> dans le
                            template
                          </div>
                          <div>
                            • <strong>Formats supportés :</strong> JPG, PNG,
                            GIF, WebP
                          </div>
                        </div>
                      </div>

                      <ImageUploader onImageUploaded={insertImageInTemplate} />

                      <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-700">
                        <strong>💡 Astuce :</strong> L&apos;image sera
                        automatiquement ajoutée à la fin de votre template. Vous
                        pourrez ensuite la déplacer où vous voulez.
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Copie */}
        <TabsContent value="copy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Copie des confirmations
                <Switch
                  checked={settings.enableEmailCopyOnConfirmation}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      enableEmailCopyOnConfirmation: checked,
                    })
                  }
                  className="ml-auto"
                />
              </CardTitle>
              <p className="text-sm text-gray-600">
                Recevez une copie des emails de confirmation envoyés aux clients
              </p>
            </CardHeader>
            {settings.enableEmailCopyOnConfirmation && (
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Fonctionnement
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    À chaque confirmation de réservation envoyée au client, une
                    copie sera automatiquement envoyée aux adresses configurées
                    ci-dessous.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    Ajouter une adresse email
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="admin@hotel.com"
                      value={newEmailAddress}
                      onChange={(e) => setNewEmailAddress(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addEmailAddress();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={addEmailAddress}
                      disabled={!newEmailAddress.trim()}
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Entrez une adresse email valide et cliquez sur + pour
                    l&apos;ajouter
                  </p>
                </div>

                {settings.emailCopyAddresses.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Adresses configurées ({settings.emailCopyAddresses.length}
                      ) :
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.emailCopyAddresses.map((email, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-blue-100 text-blue-800 border border-blue-200"
                        >
                          {email}
                          <button
                            onClick={() => removeEmailAddress(index)}
                            className="ml-2 text-blue-600 hover:text-red-600 transition-colors"
                            title="Supprimer cette adresse"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-600">⚠️</span>
                    <span className="text-sm font-medium text-yellow-800">
                      Important
                    </span>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>
                      • Les copies sont envoyées uniquement pour les
                      confirmations de réservations de nuit
                    </li>
                    <li>
                      • Assurez-vous que les adresses email sont correctes
                    </li>
                    <li>
                      • Les copies contiennent toutes les informations clients
                      (données sensibles)
                    </li>
                  </ul>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Onglet Test */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Test d&apos;email de confirmation
              </CardTitle>
              <p className="text-sm text-gray-600">
                Envoyez un email de test pour vérifier l&apos;apparence et le
                contenu de vos confirmations
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Comment ça fonctionne
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  L&apos;email de test utilise le template configuré dans
                  l&apos;onglet &quot;Email&quot; avec des données
                  d&apos;exemple. Il vous permet de vérifier l&apos;apparence
                  finale avant l&apos;envoi aux clients.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-email" className="text-sm font-medium">
                    Adresse email de test
                  </Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    L&apos;email de test sera envoyé à cette adresse
                  </p>
                </div>

                <Button
                  onClick={sendTestEmail}
                  disabled={
                    isSendingTest || !testEmail || !isValidEmail(testEmail)
                  }
                  className="w-full"
                >
                  {isSendingTest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer l&apos;email de test
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-600">ℹ️</span>
                  <span className="text-sm font-medium text-yellow-800">
                    Données d&apos;exemple utilisées
                  </span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Client : Jean Dupont</li>
                  <li>• Chambre : Chambre Standard</li>
                  <li>• Dates : 15-17 juillet 2025</li>
                  <li>• Code d&apos;accès : selon votre configuration</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
