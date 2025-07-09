"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Settings, Save, Copy, MessageSquare, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toastUtils } from "@/lib/toast-utils";

interface ConfirmationSettings {
  confirmationEmailEnabled: boolean;
  confirmationEmailFrom: string;
  confirmationEmailTemplate: string;
  hotelContactEmail: string;
  hotelContactPhone: string;
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

{accessInstructions}

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

{accessInstructions}

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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

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
          });
        }
      } catch {
        setError("Erreur lors du chargement des paramètres");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [hotelSlug]);

  const handleSave = async () => {
    setSaving(true);
    const loadingToast = toastUtils.loading("Sauvegarde des paramètres...");

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

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        toastUtils.success("Paramètres sauvegardés avec succès !");
      } else {
        const data = await response.json();
        toastUtils.error(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la sauvegarde");
      console.error("Erreur sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    setSettings((prev) => ({
      ...prev,
      confirmationEmailTemplate: defaultEmailTemplate,
    }));
  };

  const availableVariables = [
    { key: "clientFirstName", label: "Prénom du client" },
    { key: "clientLastName", label: "Nom du client" },
    { key: "establishmentName", label: "Nom de l'établissement" },
    { key: "roomName", label: "Nom de la chambre" },
    { key: "checkInDate", label: "Date d'arrivée" },
    { key: "checkOutDate", label: "Date de départ" },
    { key: "accessCode", label: "Code d'accès" },
    { key: "accessInstructions", label: "Instructions d'accès" },
    {
      key: "hotelContactEmail",
      label: "Email de contact de l'établissement",
    },
    {
      key: "hotelContactPhone",
      label: "Téléphone de contact de l'établissement",
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Variable copiée !");
    setTimeout(() => setSuccess(""), 2000);
  };

  // Fonction pour envoyer un email de test
  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toastUtils.error("Veuillez entrer une adresse email");
      return;
    }

    if (!testEmail.includes("@")) {
      toastUtils.error("Veuillez entrer une adresse email valide");
      return;
    }

    setSendingTest(true);
    const loadingToast = toastUtils.loading("Envoi de l'email de test...");

    try {
      const response = await fetch(
        `/api/admin/${hotelSlug}/test-confirmation-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testEmail: testEmail.trim(),
            settings: settings,
          }),
        }
      );

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        const data = await response.json();
        let successMessage = `Email de test envoyé avec succès à ${testEmail} !`;
        if (data.resendId) {
          successMessage += ` (ID: ${data.resendId})`;
        }
        toastUtils.success(successMessage);
        setTestEmail("");
      } else {
        const data = await response.json();
        toastUtils.error(
          data.error || "Erreur lors de l'envoi de l'email de test"
        );
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de l'envoi de l'email de test");
      console.error("Erreur test email:", error);
    } finally {
      setSendingTest(false);
    }
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
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  settings.confirmationEmailEnabled
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              ></div>
              <span className="text-xs font-medium">
                Email{" "}
                {settings.confirmationEmailEnabled ? "activé" : "désactivé"}
              </span>
            </div>
            <Button onClick={handleSave} disabled={saving} size="sm">
              <Save className="h-3 w-3 mr-1" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
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
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Test
          </TabsTrigger>
          <TabsTrigger value="variables" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Variables
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
                      setSettings((prev) => ({
                        ...prev,
                        hotelContactEmail: e.target.value,
                      }))
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
                      setSettings((prev) => ({
                        ...prev,
                        hotelContactPhone: e.target.value,
                      }))
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
                        setSettings((prev) => ({
                          ...prev,
                          confirmationEmailEnabled: checked,
                        }))
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
                      <p className="text-sm text-gray-900 font-mono mb-1">
                        {settings.confirmationEmailFrom}
                      </p>
                      <p className="text-xs text-gray-500">
                        Adresse technique utilisée pour l&apos;envoi (non
                        modifiable)
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
                          setSettings((prev) => ({
                            ...prev,
                            confirmationEmailTemplate: e.target.value,
                          }))
                        }
                        className="font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Variables disponibles à côté */}
            <div>
              <Card className="bg-slate-50 border-slate-200 h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                    <Copy className="h-4 w-4" />
                    Variables
                  </CardTitle>
                  <p className="text-xs text-gray-600">Cliquez pour copier</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Test */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Test d&apos;envoi d&apos;email
              </CardTitle>
              <p className="text-sm text-gray-600">
                Envoyez-vous un email de test pour voir le rendu final de vos
                confirmations
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status de la configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${settings.confirmationEmailEnabled ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {settings.confirmationEmailEnabled ? "Activé" : "Désactivé"}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${settings.hotelContactEmail ? "bg-green-500" : "bg-yellow-500"}`}
                    ></div>
                    <span className="text-sm font-medium">Contact</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {settings.hotelContactEmail ? "Configuré" : "À compléter"}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${settings.confirmationEmailTemplate ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="text-sm font-medium">Template</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {settings.confirmationEmailTemplate
                      ? "Configuré"
                      : "Manquant"}
                  </span>
                </div>
              </div>

              {/* Section d'envoi de test */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Send className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Envoyer un email de test
                    </h3>
                    <p className="text-sm text-gray-600">
                      Testez votre configuration avec des données d&apos;exemple
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    🧪 Données de test utilisées :
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>
                      • <strong>Client :</strong> Jean Dupont
                    </div>
                    <div>
                      • <strong>Établissement :</strong>{" "}
                      {settings.hotelContactEmail
                        ? settings.hotelContactEmail.split("@")[1] ||
                          "Votre hôtel"
                        : "Votre hôtel"}
                    </div>
                    <div>
                      • <strong>Chambre :</strong> Chambre Standard
                    </div>
                    <div>
                      • <strong>Dates :</strong> 15-17 juillet 2025
                    </div>
                    <div>
                      • <strong>Code d&apos;accès :</strong> 1234
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="test-email" className="text-sm font-medium">
                      📧 Adresse email de test
                    </Label>
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="votre-email@exemple.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleTestEmail();
                        }
                      }}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      L&apos;email de test sera envoyé à cette adresse
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleTestEmail}
                      disabled={
                        sendingTest ||
                        !settings.confirmationEmailEnabled ||
                        !testEmail.trim()
                      }
                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                      size="lg"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendingTest
                        ? "Envoi en cours..."
                        : "Envoyer l'email de test"}
                    </Button>
                  </div>

                  {/* Messages d'état */}
                  {!settings.confirmationEmailEnabled && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">
                        ⚠️ Les emails de confirmation sont désactivés.
                        Activez-les dans l&apos;onglet <strong>Email</strong>{" "}
                        pour pouvoir tester.
                      </p>
                    </div>
                  )}

                  {!settings.hotelContactEmail && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        💡 Pensez à configurer vos informations de contact dans
                        l&apos;onglet <strong>Contact</strong> pour un email
                        plus réaliste.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Variables */}
        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Variables disponibles pour personnaliser vos messages
              </CardTitle>
              <p className="text-sm text-gray-600">
                Cliquez sur une variable pour la copier, puis collez-la dans
                votre template email
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableVariables.map((variable) => (
                  <div
                    key={variable.key}
                    className="bg-white p-4 rounded border hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                    onClick={() => copyToClipboard(`{${variable.key}}`)}
                  >
                    <div className="font-mono text-lg text-blue-600 mb-2 font-bold">
                      {`{${variable.key}}`}
                    </div>
                    <div className="text-sm text-slate-600 mb-3">
                      {variable.label}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Copy className="h-3 w-3" />
                      Cliquer pour copier
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
