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
  MessageSquare,
  Settings,
  Save,
  HelpCircle,
  Copy,
} from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

interface ConfirmationSettings {
  confirmationEmailEnabled: boolean;
  confirmationWhatsappEnabled: boolean;
  confirmationEmailFrom: string;
  confirmationWhatsappFrom: string;
  confirmationEmailTemplate: string;
  confirmationWhatsappTemplate: string;
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

const defaultWhatsappTemplate = `🏨 Réservation confirmée !

Bonjour {clientFirstName},

Votre réservation à {establishmentName} est confirmée ✅

📅 Arrivée : {checkInDate}
📅 Départ : {checkOutDate}
🏠 Chambre : {roomName}
🔑 Code d'accès : {accessCode}

{accessInstructions}

Bon séjour ! 😊`;

export function ConfirmationManager({ hotelSlug }: ConfirmationManagerProps) {
  const [settings, setSettings] = useState<ConfirmationSettings>({
    confirmationEmailEnabled: true,
    confirmationWhatsappEnabled: false,
    confirmationEmailFrom: "noreply@selfkey.ch",
    confirmationWhatsappFrom: "",
    confirmationEmailTemplate: defaultEmailTemplate,
    confirmationWhatsappTemplate: defaultWhatsappTemplate,
    hotelContactEmail: "",
    hotelContactPhone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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
            confirmationWhatsappEnabled:
              data.confirmationWhatsappEnabled ?? false,
            confirmationEmailFrom:
              data.confirmationEmailFrom ?? "noreply@selfkey.ch",
            confirmationWhatsappFrom: data.confirmationWhatsappFrom ?? "",
            confirmationEmailTemplate:
              data.confirmationEmailTemplate ?? defaultEmailTemplate,
            confirmationWhatsappTemplate:
              data.confirmationWhatsappTemplate ?? defaultWhatsappTemplate,
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

  const resetToDefault = (type: "email" | "whatsapp") => {
    setSettings((prev) => ({
      ...prev,
      [type === "email"
        ? "confirmationEmailTemplate"
        : "confirmationWhatsappTemplate"]:
        type === "email" ? defaultEmailTemplate : defaultWhatsappTemplate,
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
    { key: "hotelContactEmail", label: "Email de contact de l'établissement" },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header avec statut et actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Confirmations de réservation
            </h1>
            <p className="text-gray-600 mt-1">
              Configurez l'envoi automatique de confirmations par email et
              WhatsApp
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${settings.confirmationEmailEnabled ? "bg-green-500" : "bg-gray-300"}`}
              ></div>
              <span className="text-sm font-medium">Email</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${settings.confirmationWhatsappEnabled ? "bg-green-500" : "bg-gray-300"}`}
              ></div>
              <span className="text-sm font-medium">WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            {isGuideOpen ? "Masquer l'aide" : "Aide"}
          </Button>
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

      {/* Guide d'utilisation simplifié */}
      <Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen}>
        <CollapsibleContent>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">
                    🚀 Configuration en 3 étapes
                  </h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800 mt-0.5">
                        1
                      </div>
                      <span>Renseignez vos coordonnées de contact</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800 mt-0.5">
                        2
                      </div>
                      <span>Activez Email et/ou WhatsApp</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800 mt-0.5">
                        3
                      </div>
                      <span>Personnalisez vos messages (optionnel)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">
                    📝 Variables principales
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded border">
                      <code className="text-blue-600">
                        {"{clientFirstName}"}
                      </code>
                      <br />
                      <span className="text-gray-600">Prénom</span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <code className="text-blue-600">
                        {"{establishmentName}"}
                      </code>
                      <br />
                      <span className="text-gray-600">Nom établissement</span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <code className="text-blue-600">{"{checkInDate}"}</code>
                      <br />
                      <span className="text-gray-600">Arrivée</span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <code className="text-blue-600">{"{accessCode}"}</code>
                      <br />
                      <span className="text-gray-600">Code accès</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Étape 1: Informations de contact */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            Vos coordonnées de contact
          </CardTitle>
          <p className="text-sm text-gray-600 ml-10">
            Ces informations seront affichées dans les confirmations envoyées
            aux clients
          </p>
        </CardHeader>
        <CardContent className="ml-10 space-y-4">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Étape 2: Activation des services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Configuration */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4 text-green-600" />
              </div>
              Confirmation par Email
            </CardTitle>
            <div className="ml-10 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Envoi automatique d'emails de confirmation aux clients
              </p>
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
          </CardHeader>
          {settings.confirmationEmailEnabled && (
            <CardContent className="ml-10 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Adresse d'envoi</span>
                </div>
                <Input
                  type="email"
                  value={settings.confirmationEmailFrom}
                  readOnly
                  className="bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Adresse technique utilisée pour l'envoi
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
                    onClick={() => resetToDefault("email")}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Réinitialiser
                  </Button>
                </div>
                <Textarea
                  rows={10}
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

        {/* WhatsApp Configuration */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
              </div>
              Confirmation par WhatsApp
            </CardTitle>
            <div className="ml-10 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Envoi automatique de messages WhatsApp aux clients
              </p>
              <Switch
                checked={settings.confirmationWhatsappEnabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    confirmationWhatsappEnabled: checked,
                  }))
                }
              />
            </div>
          </CardHeader>
          {settings.confirmationWhatsappEnabled && (
            <CardContent className="ml-10 space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  📱 Numéro WhatsApp d'envoi
                </Label>
                <Input
                  type="tel"
                  placeholder="+41791234567"
                  value={settings.confirmationWhatsappFrom}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      confirmationWhatsappFrom: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format international requis (ex: +41791234567)
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
                    onClick={() => resetToDefault("whatsapp")}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Réinitialiser
                  </Button>
                </div>
                <Textarea
                  rows={8}
                  placeholder="Votre template WhatsApp..."
                  value={settings.confirmationWhatsappTemplate}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      confirmationWhatsappTemplate: e.target.value,
                    }))
                  }
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Variables disponibles - Section compacte */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-700">
            <Copy className="h-5 w-5" />
            Variables disponibles pour personnaliser vos messages
          </CardTitle>
          <p className="text-sm text-gray-600">
            Cliquez sur une variable pour la copier, puis collez-la dans vos
            templates
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableVariables.map((variable) => (
              <div
                key={variable.key}
                className="bg-white p-3 rounded border hover:shadow-sm transition-shadow"
              >
                <div className="font-mono text-sm text-blue-600 mb-1">
                  {`{${variable.key}}`}
                </div>
                <div className="text-xs text-slate-600 mb-2">
                  {variable.label}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 px-2 w-full"
                  onClick={() => copyToClipboard(`{${variable.key}}`)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copier
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde final */}
      <div className="flex justify-center">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 px-8"
        >
          <Save className="h-5 w-5 mr-2" />
          {saving ? "Sauvegarde en cours..." : "Sauvegarder la configuration"}
        </Button>
      </div>
    </div>
  );
}
