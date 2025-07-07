"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Settings, Save, Copy, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    setError("");
    setSuccess("");

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
        setSuccess("Paramètres sauvegardés avec succès");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la sauvegarde");
      }
    } catch {
      setError("Erreur lors de la sauvegarde");
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
    { key: "hotelContactEmail", label: "Email de contact de l'hôtel" },
    { key: "hotelContactPhone", label: "Téléphone de contact de l'hôtel" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Variable copiée !");
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
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${settings.confirmationEmailEnabled ? "bg-green-500" : "bg-gray-300"}`}
              ></div>
              <span className="text-xs font-medium">
                Email{" "}
                {settings.confirmationEmailEnabled ? "activé" : "désactivé"}
              </span>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
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
