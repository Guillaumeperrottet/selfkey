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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
    { key: "accessCode", label: "Code d'accès (selon config établissement)" },
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
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Confirmations de réservation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Guide d'utilisation */}
        <Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              {isGuideOpen
                ? "Masquer le guide"
                : "Afficher le guide d'utilisation"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="bg-blue-50 border-blue-200 mt-2">
              <CardContent className="space-y-4 text-sm text-blue-700 pt-6">
                <div>
                  <h4 className="font-medium mb-2">
                    📧 Variables disponibles pour les templates :
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <ul className="space-y-1 text-xs">
                        <li>
                          <code>{"{clientFirstName}"}</code> - Prénom du client
                        </li>
                        <li>
                          <code>{"{clientLastName}"}</code> - Nom du client
                        </li>
                        <li>
                          <code>{"{establishmentName}"}</code> - Nom de
                          l&apos;établissement
                        </li>
                        <li>
                          <code>{"{roomName}"}</code> - Nom de la chambre
                        </li>
                      </ul>
                    </div>
                    <div>
                      <ul className="space-y-1 text-xs">
                        <li>
                          <code>{"{checkInDate}"}</code> - Date d&apos;arrivée
                        </li>
                        <li>
                          <code>{"{checkOutDate}"}</code> - Date de départ
                        </li>
                        <li>
                          <code>{"{accessCode}"}</code> - Code d&apos;accès
                        </li>
                        <li>
                          <code>{"{accessInstructions}"}</code> - Instructions
                          d&apos;accès
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-blue-800 mb-2">
                    � Code d&apos;accès automatique :
                  </h4>
                  <ul className="text-xs space-y-1 ml-2">
                    <li>
                      • <strong>Mode &quot;Par chambre&quot;</strong> : Affiche
                      le code spécifique de la chambre réservée
                    </li>
                    <li>
                      • <strong>Mode &quot;Général&quot;</strong> : Affiche le
                      code général de l&apos;établissement
                    </li>
                    <li>
                      • <strong>Mode &quot;Personnalisé&quot;</strong> : Affiche
                      &quot;Voir instructions ci-dessous&quot;
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-blue-800 mb-2">
                    💡 Conseils :
                  </h4>
                  <ul className="text-xs space-y-1 ml-2">
                    <li>
                      • Configurez votre adresse email d&apos;envoi (recommandé:
                      noreply@votre-domaine.com)
                    </li>
                    <li>
                      • Pour WhatsApp, utilisez le format international
                      (+41791234567)
                    </li>
                    <li>• Testez toujours vos templates avant activation</li>
                    <li>
                      • Les variables sont automatiquement remplacées lors de
                      l&apos;envoi
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Section Variables disponibles */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Copy className="h-5 w-5" />
              Variables disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {availableVariables.map((variable) => (
                <div key={variable.key} className="flex flex-col gap-2">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-mono text-sm text-blue-600 mb-1">
                      {`{${variable.key}}`}
                    </div>
                    <div className="text-xs text-slate-600 mb-2">
                      {variable.label}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-6 px-2"
                        onClick={() => copyToClipboard(`{${variable.key}}`)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copier
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-700">
                💡 <strong>Comment utiliser :</strong> Cliquez sur
                &quot;Copier&quot; puis collez la variable dans vos templates
                ci-dessous. Les variables seront automatiquement remplacées par
                les vraies valeurs lors de l&apos;envoi.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informations de contact de l'hôtel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Informations de contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hotel-contact-email">
                  Email de contact de l&apos;hôtel
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
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cette adresse sera affichée dans les emails de confirmation
                </p>
              </div>

              <div>
                <Label htmlFor="hotel-contact-phone">
                  Téléphone de contact de l&apos;hôtel
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
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce numéro sera affiché dans les confirmations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuration Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Confirmation par Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-enabled">Activer l&apos;email</Label>
                <Switch
                  id="email-enabled"
                  checked={settings.confirmationEmailEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      confirmationEmailEnabled: checked,
                    }))
                  }
                />
              </div>

              {settings.confirmationEmailEnabled && (
                <>
                  <div>
                    <Label htmlFor="email-from">
                      Adresse email d&apos;envoi
                    </Label>
                    <Input
                      id="email-from"
                      type="email"
                      value={settings.confirmationEmailFrom}
                      onChange={(e) => {
                        setSettings((prev) => ({
                          ...prev,
                          confirmationEmailFrom: e.target.value,
                        }));
                      }}
                      className="bg-gray-50"
                      readOnly
                    />

                    <div className="mt-2 flex items-start space-x-2 text-sm text-gray-600">
                      <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>
                        💡 L&apos;adresse de contact de votre hôtel peut être
                        mentionnée dans le template du message.
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="email-template">Template email</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetToDefault("email")}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Réinitialiser
                      </Button>
                    </div>
                    <Textarea
                      id="email-template"
                      rows={8}
                      placeholder="Votre template email..."
                      value={settings.confirmationEmailTemplate}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setSettings((prev) => ({
                          ...prev,
                          confirmationEmailTemplate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Configuration WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Confirmation par WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-enabled">Activer WhatsApp</Label>
                <Switch
                  id="whatsapp-enabled"
                  checked={settings.confirmationWhatsappEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      confirmationWhatsappEnabled: checked,
                    }))
                  }
                />
              </div>

              {settings.confirmationWhatsappEnabled && (
                <>
                  <div>
                    <Label htmlFor="whatsapp-from">
                      Numéro WhatsApp d&apos;envoi
                    </Label>
                    <Input
                      id="whatsapp-from"
                      type="tel"
                      placeholder="+41791234567"
                      value={settings.confirmationWhatsappFrom}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          confirmationWhatsappFrom: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="whatsapp-template">
                        Template WhatsApp
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetToDefault("whatsapp")}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Réinitialiser
                      </Button>
                    </div>
                    <Textarea
                      id="whatsapp-template"
                      rows={8}
                      placeholder="Votre template WhatsApp..."
                      value={settings.confirmationWhatsappTemplate}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setSettings((prev) => ({
                          ...prev,
                          confirmationWhatsappTemplate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
