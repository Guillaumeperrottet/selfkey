"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Mail, RotateCcw, Send } from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface DayParkingEmailManagerProps {
  hotelSlug: string;
}

interface DayParkingEmailSettings {
  dayParkingEmailTemplate: string;
}

// Template par défaut pour les emails de parking jour
const defaultDayParkingEmailTemplate = `Bonjour {clientFirstName} {clientLastName},

Votre réservation de parking jour à {establishmentName} a été confirmée avec succès !

Détails de votre parking :
- Place : {roomName}
- Durée : {dayParkingDuration}
- Heure de début : {dayParkingStartTime}
- Heure de fin : {dayParkingEndTime}
- Plaque d'immatriculation : {clientVehicleNumber}
- Code d'accès : {accessCode}

IMPORTANT : Votre stationnement commence dès maintenant. Veillez à libérer la place avant {dayParkingEndTime}.

Pour toute question, vous pouvez nous contacter :
📧 Email : {hotelContactEmail}
📞 Téléphone : {hotelContactPhone}

Bon stationnement !

Cordialement,
L'équipe de {establishmentName}

---

Guten Tag {clientFirstName} {clientLastName},

Ihre Tagesparking-Reservierung im {establishmentName} wurde erfolgreich bestätigt!

Details Ihres Parkplatzes:
- Platz: {roomName}
- Dauer: {dayParkingDuration}
- Startzeit: {dayParkingStartTime}
- Endzeit: {dayParkingEndTime}
- Kennzeichen: {clientVehicleNumber}
- Zugangscode: {accessCode}

WICHTIG: Ihr Parkplatz beginnt jetzt. Bitte räumen Sie den Platz vor {dayParkingEndTime}.

Bei Fragen können Sie uns kontaktieren:
📧 Email: {hotelContactEmail}
📞 Telefon: {hotelContactPhone}

Gutes Parken!

Mit freundlichen Grüßen,
Das Team von {establishmentName}`;

export function DayParkingEmailManager({
  hotelSlug,
}: DayParkingEmailManagerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [settings, setSettings] = useState<DayParkingEmailSettings>({
    dayParkingEmailTemplate: defaultDayParkingEmailTemplate,
  });

  // Charger les paramètres actuels
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(
          `/api/admin/${hotelSlug}/day-parking-settings`
        );
        if (response.ok) {
          const data = await response.json();
          setSettings({
            dayParkingEmailTemplate:
              data.dayParkingEmailTemplate || defaultDayParkingEmailTemplate,
          });
        }
      } catch (error) {
        console.error("Error loading day parking email settings:", error);
        toastUtils.error("Erreur lors du chargement des paramètres email");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [hotelSlug]);

  const handleSave = async () => {
    // Validation basique du template
    if (!settings.dayParkingEmailTemplate.trim()) {
      toastUtils.warning("Le template d'email ne peut pas être vide");
      return;
    }

    const loadingToast = toastUtils.loading("Sauvegarde du template email...");
    setIsSaving(true);

    try {
      // Charger d'abord les paramètres actuels pour préserver les tarifs
      const currentResponse = await fetch(
        `/api/admin/${hotelSlug}/day-parking-settings`
      );

      if (!currentResponse.ok) {
        throw new Error("Erreur lors du chargement des paramètres actuels");
      }

      const currentData = await currentResponse.json();

      const response = await fetch(
        `/api/admin/${hotelSlug}/day-parking-settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enableDayParking: true,
            dayParkingTarif1h: currentData.dayParkingTarif1h || 5.0,
            dayParkingTarif2h: currentData.dayParkingTarif2h || 8.0,
            dayParkingTarif3h: currentData.dayParkingTarif3h || 12.0,
            dayParkingTarif4h: currentData.dayParkingTarif4h || 15.0,
            dayParkingTarifHalfDay: currentData.dayParkingTarifHalfDay || 20.0,
            dayParkingTarifFullDay: currentData.dayParkingTarifFullDay || 35.0,
            dayParkingEmailTemplate: settings.dayParkingEmailTemplate,
          }),
        }
      );

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        toastUtils.success(
          "Template d'email de parking jour sauvegardé avec succès"
        );
      } else {
        const errorData = await response.json();
        toastUtils.error(errorData.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la sauvegarde");
      console.error("Error saving day parking email settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    // Validation de l'email de test
    if (!testEmail.trim()) {
      toastUtils.warning("Veuillez saisir un email de test");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toastUtils.warning("Format d'email invalide");
      return;
    }

    if (!settings.dayParkingEmailTemplate.trim()) {
      toastUtils.warning("Le template d'email ne peut pas être vide");
      return;
    }

    const loadingToast = toastUtils.loading("Envoi de l'email de test...");
    setIsTesting(true);

    try {
      const response = await fetch(
        `/api/admin/${hotelSlug}/test-day-parking-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testEmail: testEmail,
            emailTemplate: settings.dayParkingEmailTemplate,
          }),
        }
      );

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toastUtils.success(
            `✅ Email envoyé à ${testEmail}` +
              (data.resendId ? ` (ID: ${data.resendId})` : "")
          );
          console.log("Email de test envoyé avec succès:", {
            to: testEmail,
            resendId: data.resendId,
            preview: data.testData?.preview,
            subject: data.testData?.subject,
          });
        } else {
          toastUtils.warning(
            data.message || "Email envoyé mais statut incertain"
          );
        }
      } else {
        const errorData = await response.json();
        toastUtils.error(errorData.error || "Erreur lors de l'envoi du test");
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de l'envoi de l'email de test");
      console.error("Error testing day parking email:", error);
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement des paramètres email...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email de Confirmation - Parking Jour
          </CardTitle>
          <p className="text-muted-foreground">
            Personnalisez le message d&apos;email envoyé aux clients lors de la
            confirmation de leur réservation de parking jour. Utilisez les
            variables pour personnaliser le contenu.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration de l'email de confirmation */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailTemplate">
                Template d&apos;email personnalisé
                <Badge variant="outline" className="ml-2">
                  Variables disponibles
                </Badge>
              </Label>
              <Textarea
                id="emailTemplate"
                placeholder="Saisissez votre template d'email personnalisé..."
                value={settings.dayParkingEmailTemplate}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    dayParkingEmailTemplate: e.target.value,
                  }))
                }
                className="min-h-[400px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Variables disponibles :
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <Badge variant="outline">{"{clientFirstName}"}</Badge>
                <Badge variant="outline">{"{clientLastName}"}</Badge>
                <Badge variant="outline">{"{establishmentName}"}</Badge>
                <Badge variant="outline">{"{roomName}"}</Badge>
                <Badge variant="outline">{"{dayParkingDuration}"}</Badge>
                <Badge variant="outline">{"{dayParkingStartTime}"}</Badge>
                <Badge variant="outline">{"{dayParkingEndTime}"}</Badge>
                <Badge variant="outline">{"{clientVehicleNumber}"}</Badge>
                <Badge variant="outline">{"{accessCode}"}</Badge>
                <Badge variant="outline">{"{hotelContactEmail}"}</Badge>
                <Badge variant="outline">{"{hotelContactPhone}"}</Badge>
                <Badge variant="outline">{"{totalAmount}"}</Badge>
                <Badge variant="outline">{"{currency}"}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      dayParkingEmailTemplate: defaultDayParkingEmailTemplate,
                    }))
                  }
                >
                  <RotateCcw className="mr-2 h-3 w-3" />
                  Restaurer le template par défaut
                </Button>
              </div>

              {/* Section test d'email */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <h4 className="text-sm font-medium">Test de l&apos;email</h4>
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Adresse email de test</Label>
                  <div className="flex gap-2">
                    <Input
                      id="testEmail"
                      type="email"
                      placeholder="votre-email@exemple.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="default"
                      size="default"
                      onClick={handleTestEmail}
                      disabled={isTesting || !testEmail.trim()}
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-3 w-3" />
                          Envoyer le test
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Un email avec des données d&apos;exemple sera envoyé à cette
                    adresse pour tester votre template.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder le template
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informations sur les variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Guide des variables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <strong>Variables client :</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>
                • <code>{"{clientFirstName}"}</code> et{" "}
                <code>{"{clientLastName}"}</code> : Nom et prénom du client
              </li>
              <li>
                • <code>{"{clientVehicleNumber}"}</code> : Plaque
                d&apos;immatriculation du véhicule
              </li>
            </ul>
          </div>
          <div>
            <strong>Variables parking :</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>
                • <code>{"{dayParkingDuration}"}</code> : Durée sélectionnée
                (ex: &quot;2 heures&quot;)
              </li>
              <li>
                • <code>{"{dayParkingStartTime}"}</code> et{" "}
                <code>{"{dayParkingEndTime}"}</code> : Heures de début et fin
              </li>
              <li>
                • <code>{"{roomName}"}</code> : Nom de la place de parking
              </li>
            </ul>
          </div>
          <div>
            <strong>Variables établissement :</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>
                • <code>{"{establishmentName}"}</code> : Nom de votre
                établissement
              </li>
              <li>
                • <code>{"{accessCode}"}</code> : Code d&apos;accès
              </li>
              <li>
                • <code>{"{hotelContactEmail}"}</code> et{" "}
                <code>{"{hotelContactPhone}"}</code> : Vos coordonnées de
                contact
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
