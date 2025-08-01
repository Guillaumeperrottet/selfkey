"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Car, Settings2 } from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";
import { DayParkingSetupModal } from "@/components/DayParkingSetupModal";
import { ParkingControlAccess } from "@/components/ParkingControlAccess";

interface SettingsManagerProps {
  hotelSlug: string;
}

export function SettingsManager({ hotelSlug }: SettingsManagerProps) {
  const [maxBookingDays, setMaxBookingDays] = useState<number>(4);
  const [allowFutureBookings, setAllowFutureBookings] =
    useState<boolean>(false);
  const [enableCutoffTime, setEnableCutoffTime] = useState<boolean>(false);
  const [cutoffTime, setCutoffTime] = useState<string>("22:00");
  const [reopenTime, setReopenTime] = useState<string>("00:00");
  const [checkoutTime, setCheckoutTime] = useState<string>("12:00");
  const [checkinTime, setCheckinTime] = useState<string>("12:05");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // États pour la taxe de séjour
  const [touristTaxEnabled, setTouristTaxEnabled] = useState<boolean>(true);
  const [touristTaxAmount, setTouristTaxAmount] = useState<number>(3.0);

  // États pour parking jour
  const [enableDayParking, setEnableDayParking] = useState<boolean>(false);
  const [parkingOnlyMode, setParkingOnlyMode] = useState<boolean>(false);
  const [showDayParkingModal, setShowDayParkingModal] = useState(false);
  const [dayParkingLoading, setDayParkingLoading] = useState(false);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Charger les paramètres généraux
        const response = await fetch(
          `/api/establishments/${hotelSlug}/settings`
        );
        if (response.ok) {
          const data = await response.json();
          setMaxBookingDays(data.maxBookingDays || 4);
          setAllowFutureBookings(data.allowFutureBookings || false);
          setEnableCutoffTime(data.enableCutoffTime || false);
          setCutoffTime(data.cutoffTime || "22:00");
          setReopenTime(data.reopenTime || "00:00");
          setCheckoutTime(data.checkoutTime || "12:00");
          setCheckinTime(data.checkinTime || "12:05");
          setTouristTaxEnabled(data.touristTaxEnabled ?? true);
          setTouristTaxAmount(data.touristTaxAmount || 3.0);
        } else {
          toastUtils.error("Erreur lors du chargement des paramètres");
        }

        // Charger l'état du parking jour
        const dayParkingResponse = await fetch(
          `/api/admin/${hotelSlug}/day-parking-settings`
        );
        if (dayParkingResponse.ok) {
          const dayParkingData = await dayParkingResponse.json();
          setEnableDayParking(dayParkingData.enableDayParking || false);
          setParkingOnlyMode(dayParkingData.parkingOnlyMode || false);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toastUtils.error("Erreur lors du chargement des paramètres");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [hotelSlug]);

  const handleSave = async () => {
    if (maxBookingDays < 1 || maxBookingDays > 365) {
      toastUtils.warning("La durée doit être entre 1 et 365 jours");
      return;
    }

    if (touristTaxAmount < 0 || touristTaxAmount > 100) {
      toastUtils.warning(
        "Le montant de la taxe de séjour doit être entre 0 et 100 CHF"
      );
      return;
    }

    const loadingToast = toastUtils.loading("Sauvegarde des paramètres...");
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/establishments/${hotelSlug}/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            maxBookingDays,
            allowFutureBookings,
            enableCutoffTime,
            cutoffTime,
            reopenTime,
            checkoutTime,
            checkinTime,
            touristTaxEnabled,
            touristTaxAmount,
          }),
        }
      );

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        toastUtils.success("Paramètres sauvegardés avec succès");
      } else {
        const errorData = await response.json();
        toastUtils.error(errorData.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la sauvegarde");
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour sauvegarder le mode parking uniquement
  const saveParkingOnlyMode = async (parkingOnlyModeValue: boolean) => {
    try {
      const response = await fetch(
        `/api/admin/${hotelSlug}/day-parking-settings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enableDayParking: enableDayParking,
            parkingOnlyMode: parkingOnlyModeValue,
            // Préserver les autres paramètres
            dayParkingTarif1h: 5,
            dayParkingTarif2h: 8,
            dayParkingTarif3h: 12,
            dayParkingTarif4h: 15,
            dayParkingTarifHalfDay: 20,
            dayParkingTarifFullDay: 30,
          }),
        }
      );

      if (response.ok) {
        toastUtils.success(
          parkingOnlyModeValue
            ? "Mode parking uniquement activé - vos QR codes mènent directement au parking"
            : "Mode parking uniquement désactivé - le choix chambre/parking est rétabli"
        );
      } else {
        throw new Error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving parking only mode:", error);
      toastUtils.error(
        "Erreur lors de la sauvegarde du mode parking uniquement"
      );
      // Remettre l'état précédent en cas d'erreur
      setParkingOnlyMode(!parkingOnlyModeValue);
    }
  };

  // Fonctions pour gérer le parking jour
  const handleDayParkingToggle = () => {
    if (enableDayParking) {
      // Si déjà activé, désactiver directement
      toggleDayParking(false);
    } else {
      // Si pas activé, montrer la modal d'explication
      setShowDayParkingModal(true);
    }
  };

  const handleDayParkingConfirm = () => {
    setShowDayParkingModal(false);
    toggleDayParking(true);
  };

  const toggleDayParking = async (enable: boolean) => {
    setDayParkingLoading(true);
    const loadingToast = toastUtils.loading(
      enable
        ? "Activation du parking jour..."
        : "Désactivation du parking jour..."
    );

    try {
      // Préparer les données selon l'état
      const requestData = enable
        ? {
            enableDayParking: true,
            dayParkingTarif1h: 5,
            dayParkingTarif2h: 8,
            dayParkingTarif3h: 12,
            dayParkingTarif4h: 15,
            dayParkingTarifHalfDay: 20,
            dayParkingTarifFullDay: 30,
          }
        : {
            enableDayParking: false,
            dayParkingTarif1h: 0,
            dayParkingTarif2h: 0,
            dayParkingTarif3h: 0,
            dayParkingTarif4h: 0,
            dayParkingTarifHalfDay: 0,
            dayParkingTarifFullDay: 0,
          };

      const response = await fetch(
        `/api/admin/${hotelSlug}/day-parking-settings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        }
      );

      if (response.ok) {
        setEnableDayParking(enable);
        toastUtils.dismiss(loadingToast);
        toastUtils.success(
          enable
            ? "Parking jour activé avec succès ! Rechargez la page pour voir les nouvelles options."
            : "Parking jour désactivé avec succès"
        );
      } else {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du parking jour"
      );
    } finally {
      setDayParkingLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de réservation</CardTitle>
          <CardDescription>
            Configurez les paramètres de réservation pour votre établissement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxBookingDays">
              Durée maximale de séjour (en nuits)
            </Label>
            <Input
              id="maxBookingDays"
              type="number"
              min="1"
              max="365"
              value={maxBookingDays}
              onChange={(e) => setMaxBookingDays(parseInt(e.target.value) || 1)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Les clients pourront réserver pour un maximum de {maxBookingDays}{" "}
              nuit{maxBookingDays > 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowFutureBookings"
                checked={allowFutureBookings}
                onCheckedChange={(checked) =>
                  setAllowFutureBookings(checked as boolean)
                }
              />
              <Label
                htmlFor="allowFutureBookings"
                className="text-sm font-medium"
              >
                Autoriser les réservations dans le futur
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {allowFutureBookings
                ? "Les clients peuvent réserver pour des dates futures"
                : "Les clients ne peuvent réserver que pour aujourd'hui"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableCutoffTime"
                checked={enableCutoffTime}
                onCheckedChange={(checked) =>
                  setEnableCutoffTime(checked as boolean)
                }
              />
              <Label htmlFor="enableCutoffTime" className="text-sm font-medium">
                Activer une heure limite pour les réservations
              </Label>
            </div>

            {enableCutoffTime && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="cutoffTime">Heure limite (format 24h)</Label>
                <Input
                  id="cutoffTime"
                  type="time"
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="w-32"
                />

                <Label htmlFor="reopenTime">
                  Heure de réouverture (format 24h)
                </Label>
                <Input
                  id="reopenTime"
                  type="time"
                  value={reopenTime}
                  onChange={(e) => setReopenTime(e.target.value)}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Les réservations redeviendront disponibles à partir de cette
                  heure le lendemain
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {enableCutoffTime
                ? `Après ${cutoffTime}, les clients verront un message indiquant qu'il est trop tard pour réserver. Les réservations redeviendront disponibles à ${reopenTime} le lendemain.`
                : "Les réservations sont acceptées 24h/24"}
            </p>
          </div>

          {/* Section Heures d'arrivée et de départ */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-sm text-foreground">
              🕐 Heures d&apos;arrivée et de départ
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkinTime">
                  Heure d&apos;arrivée (check-in)
                </Label>
                <Input
                  id="checkinTime"
                  type="time"
                  value={checkinTime}
                  onChange={(e) => setCheckinTime(e.target.value)}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Heure à partir de laquelle les clients peuvent arriver
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkoutTime">
                  Heure de départ (check-out)
                </Label>
                <Input
                  id="checkoutTime"
                  type="time"
                  value={checkoutTime}
                  onChange={(e) => setCheckoutTime(e.target.value)}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Heure à laquelle les chambres redeviennent disponibles
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Disponibilité des chambres :</strong> Les chambres
                qui ont un départ aujourd&apos;hui redeviennent disponibles à
                partir de <strong>{checkoutTime}</strong>. Les nouvelles
                réservations peuvent commencer à partir de{" "}
                <strong>{checkinTime}</strong>.
              </p>
            </div>
          </div>

          {/* Section Taxe de séjour */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-sm text-foreground">
              🏨 Taxe de séjour
            </h4>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="touristTaxEnabled"
                  checked={touristTaxEnabled}
                  onCheckedChange={(checked) =>
                    setTouristTaxEnabled(checked as boolean)
                  }
                />
                <Label
                  htmlFor="touristTaxEnabled"
                  className="text-sm font-medium"
                >
                  Activer la taxe de séjour
                </Label>
              </div>

              {touristTaxEnabled && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="touristTaxAmount">
                    Montant par personne (CHF)
                  </Label>
                  <Input
                    id="touristTaxAmount"
                    type="number"
                    value={touristTaxAmount}
                    onChange={(e) =>
                      setTouristTaxAmount(parseFloat(e.target.value) || 0)
                    }
                    className="w-32"
                    min="0"
                    max="100"
                    step="0.50"
                    placeholder="3.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ce montant sera automatiquement ajouté au prix total pour
                    chaque personne
                  </p>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  {touristTaxEnabled ? (
                    <>
                      <strong>💰 Taxe de séjour active :</strong> Une taxe de{" "}
                      <strong>
                        {touristTaxAmount.toFixed(2)} CHF par personne
                      </strong>{" "}
                      sera automatiquement ajoutée à chaque réservation. Cette
                      taxe apparaîtra clairement dans le récapitulatif de
                      commande avant le paiement.
                    </>
                  ) : (
                    <strong>
                      ℹ️ Taxe de séjour désactivée : Aucune taxe supplémentaire
                      ne sera appliquée aux réservations.
                    </strong>
                  )}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Section Parking Jour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Parking Jour
          </CardTitle>
          <CardDescription>
            Activez la réservation de places de parking à l&apos;heure ou à la
            journée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Réservations parking jour</h4>
                <Badge variant={enableDayParking ? "default" : "secondary"}>
                  {enableDayParking ? "Activé" : "Désactivé"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {enableDayParking
                  ? "Vos clients peuvent réserver des places de parking par créneaux horaires"
                  : "Activez cette option pour proposer des réservations parking flexibles"}
              </p>
            </div>
            <Button
              onClick={handleDayParkingToggle}
              disabled={dayParkingLoading}
              variant={enableDayParking ? "destructive" : "default"}
            >
              {dayParkingLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {enableDayParking ? "Désactivation..." : "Activation..."}
                </>
              ) : enableDayParking ? (
                "Désactiver"
              ) : (
                "Activer"
              )}
            </Button>
          </div>

          {enableDayParking && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-green-50 space-y-2">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-green-600" />
                  <h5 className="font-medium text-green-800">
                    Configuration active
                  </h5>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• Commission : 5%</p>
                  <p>• Aucun frais fixe appliqué</p>
                  <p>
                    • Durées disponibles : 1h, 2h, 3h, 4h, demi-journée, journée
                    complète
                  </p>
                  <p>
                    • Section &quot;Parking Jour&quot; ajoutée à votre menu
                    d&apos;administration
                  </p>
                </div>
              </div>

              {/* Option Mode Parking Uniquement */}
              <div className="p-4 border rounded-lg bg-orange-50 space-y-3">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-orange-600" />
                  <h5 className="font-medium text-orange-800">
                    Mode Parking Uniquement
                  </h5>
                </div>
                <div className="text-sm text-orange-700 space-y-2">
                  <p>
                    Activez cette option si vous souhaitez que vos QR codes
                    mènent directement au formulaire de parking sans proposer le
                    choix entre réservation de chambre et parking.
                  </p>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="parkingOnlyMode"
                      checked={parkingOnlyMode}
                      onCheckedChange={(checked) => {
                        const newValue = checked === true;
                        setParkingOnlyMode(newValue);
                        saveParkingOnlyMode(newValue);
                      }}
                    />
                    <Label
                      htmlFor="parkingOnlyMode"
                      className="text-sm font-medium"
                    >
                      Mode parking uniquement - bypasser le choix
                      chambre/parking
                    </Label>
                  </div>
                  {parkingOnlyMode && (
                    <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
                      ⚠️ Avec cette option activée, vos clients ne pourront plus
                      réserver de chambres via le QR code et iront directement
                      au formulaire de parking.
                    </div>
                  )}
                </div>
              </div>

              {/* Accès Contrôle Parking intégré */}
              <div id="parking-access">
                <ParkingControlAccess
                  hotelSlug={hotelSlug}
                  enableDayParking={enableDayParking}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Accès Contrôle Parking supprimée car intégrée ci-dessus */}

      {/* Section Informations améliorée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Guide des paramètres
          </CardTitle>
          <CardDescription>
            Informations détaillées sur le fonctionnement de chaque paramètre
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section Réservations */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground border-b pb-1">
              📅 Paramètres de réservation
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium min-w-fit">•</span>
                <span>
                  <strong>Durée maximale :</strong> Limite le nombre de nuits
                  consécutives que les clients peuvent réserver (1-365 nuits)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium min-w-fit">•</span>
                <span>
                  <strong>Réservations futures :</strong> Si désactivé, les
                  clients ne peuvent réserver que pour aujourd&apos;hui
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium min-w-fit">•</span>
                <span>
                  <strong>Heure limite :</strong> Empêche les nouvelles
                  réservations après l&apos;heure définie (évite les arrivées
                  tardives)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium min-w-fit">•</span>
                <span>
                  <strong>Réouverture :</strong> Heure à laquelle les
                  réservations redeviennent disponibles le lendemain
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium min-w-fit">•</span>
                <span>
                  <strong>Heure de check-in :</strong> Heure à partir de
                  laquelle les places redeviennent disponibles
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium min-w-fit">•</span>
                <span>
                  <strong>Heure de check-out :</strong> Heure à laquelle les
                  chambres redeviennent disponibles pour de nouvelles
                  réservations (par défaut 12h00)
                </span>
              </div>
            </div>
          </div>

          {/* Section Parking Jour */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground border-b pb-1">
              🚗 Parking jour
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium min-w-fit">•</span>
                <span>
                  <strong>Fonctionnalité :</strong> Permet aux clients de
                  réserver des places de parking à l&apos;heure ou à la journée
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium min-w-fit">•</span>
                <span>
                  <strong>Configuration :</strong> Tarifs flexibles (1h, 2h, 4h,
                  journée complète) avec gestion automatique des créneaux
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium min-w-fit">•</span>
                <span>
                  <strong>Templates email :</strong> Emails de confirmation
                  personnalisables avec variables dynamiques
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium min-w-fit">•</span>
                <span>
                  <strong>Gestion :</strong> Interface dédiée pour le contrôle,
                  statistiques et gestion des réservations parking
                </span>
              </div>
            </div>
          </div>

          {/* Section Bonnes Pratiques */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground border-b pb-1">
              💡 Bonnes pratiques
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-medium min-w-fit">✓</span>
                <span>
                  Activez l&apos;heure limite (22h) pour éviter les arrivées
                  nocturnes non souhaitées
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-medium min-w-fit">✓</span>
                <span>
                  Limitez les séjours (4-7 nuits) pour maintenir un bon taux de
                  rotation
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-medium min-w-fit">✓</span>
                <span>
                  Testez vos templates d&apos;email avant d&apos;activer le
                  parking jour
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-medium min-w-fit">✓</span>
                <span>
                  Les modifications s&apos;appliquent immédiatement aux
                  nouvelles réservations
                </span>
              </div>
            </div>
          </div>

          {/* Section Support */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</div>
              <div className="space-y-1">
                <h5 className="font-medium text-blue-900 dark:text-blue-100">
                  Besoin d&apos;aide ?
                </h5>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Les réservations existantes ne sont jamais affectées par les
                  changements de paramètres. Seules les nouvelles réservations
                  suivront les nouveaux paramètres configurés.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal pour le parking jour */}
      <DayParkingSetupModal
        isOpen={showDayParkingModal}
        onClose={() => setShowDayParkingModal(false)}
        onConfirm={handleDayParkingConfirm}
        isLoading={dayParkingLoading}
      />
    </div>
  );
}
