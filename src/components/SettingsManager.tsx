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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Save,
  Car,
  Settings2,
  Calendar,
  Clock,
  DollarSign,
  PawPrint,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
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

  // État pour l'option chien
  const [enableDogOption, setEnableDogOption] = useState<boolean>(false);

  // État pour masquer les frais de plateforme
  const [hidePlatformFees, setHidePlatformFees] = useState<boolean>(false);

  // États pour les informations de facturation
  const [billingCompanyName, setBillingCompanyName] = useState<string>("");
  const [billingAddress, setBillingAddress] = useState<string>("");
  const [billingPostalCode, setBillingPostalCode] = useState<string>("");
  const [billingCity, setBillingCity] = useState<string>("");
  const [billingCountry, setBillingCountry] = useState<string>("Switzerland");
  const [vatNumber, setVatNumber] = useState<string>("");

  // Active tab state
  const [activeTab, setActiveTab] = useState("booking");

  // Load current settings (même logique que l'original)
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
          setEnableDogOption(data.enableDogOption || false);
          setHidePlatformFees(data.hidePlatformFees || false);
          // Charger les informations de facturation
          setBillingCompanyName(data.billingCompanyName || "");
          setBillingAddress(data.billingAddress || "");
          setBillingPostalCode(data.billingPostalCode || "");
          setBillingCity(data.billingCity || "");
          setBillingCountry(data.billingCountry || "Switzerland");
          setVatNumber(data.vatNumber || "");
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
            enableDogOption,
            hidePlatformFees,
            // Informations de facturation
            billingCompanyName,
            billingAddress,
            billingPostalCode,
            billingCity,
            billingCountry,
            vatNumber,
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
      setParkingOnlyMode(!parkingOnlyModeValue);
    }
  };

  // Fonctions pour gérer le parking jour
  const handleDayParkingToggle = () => {
    if (enableDayParking) {
      toggleDayParking(false);
    } else {
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
      const response = await fetch(
        `/api/admin/${hotelSlug}/day-parking-settings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enableDayParking: enable,
            parkingOnlyMode: enable ? parkingOnlyMode : false,
            dayParkingTarif1h: 5,
            dayParkingTarif2h: 8,
            dayParkingTarif3h: 12,
            dayParkingTarif4h: 15,
            dayParkingTarifHalfDay: 20,
            dayParkingTarifFullDay: 30,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setEnableDayParking(enable);
      if (!enable) setParkingOnlyMode(false);

      toastUtils.dismiss(loadingToast);
      toastUtils.success(
        enable
          ? "Parking jour activé avec succès ! Consultez la nouvelle section dans votre menu."
          : "Parking jour désactivé avec succès."
      );
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
      {/* Header avec statut global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Paramètres de l&apos;établissement
          </CardTitle>
          <CardDescription>
            Configurez les paramètres de réservation et de fonctionnement de
            votre établissement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Réservations</p>
                <p className="text-xs text-muted-foreground">
                  {allowFutureBookings
                    ? "Futures autorisées"
                    : "Jour même uniquement"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Car className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Parking jour</p>
                <Badge
                  variant={enableDayParking ? "default" : "secondary"}
                  className="text-xs"
                >
                  {enableDayParking ? "Activé" : "Désactivé"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Taxe de séjour</p>
                <p className="text-xs text-muted-foreground">
                  {touristTaxEnabled ? `${touristTaxAmount}CHF` : "Désactivée"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets principaux */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Réservations</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horaires</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Tarification</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Facturation</span>
          </TabsTrigger>
          <TabsTrigger value="parking" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">Parking</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Aide</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Réservations */}
        <TabsContent value="booking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Paramètres de réservation
              </CardTitle>
              <CardDescription>
                Configurez les règles de réservation pour vos clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Durée maximale */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="maxBookingDays" className="font-medium">
                    Durée maximale de séjour
                  </Label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <Input
                      id="maxBookingDays"
                      type="number"
                      min="1"
                      max="365"
                      value={maxBookingDays}
                      onChange={(e) =>
                        setMaxBookingDays(parseInt(e.target.value) || 1)
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      nuits maximum
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Les clients pourront réserver pour un maximum de{" "}
                    {maxBookingDays} nuit{maxBookingDays > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Réservations futures */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <Label className="font-medium">Réservations futures</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="allowFutureBookings"
                      checked={allowFutureBookings}
                      onCheckedChange={(checked) =>
                        setAllowFutureBookings(checked as boolean)
                      }
                    />
                    <Label htmlFor="allowFutureBookings" className="text-sm">
                      Autoriser les réservations dans le futur
                    </Label>
                  </div>
                  <div className="ml-6 p-3 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-700">
                      {allowFutureBookings ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Les clients peuvent réserver pour des dates futures
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Les clients ne peuvent réserver que pour
                          aujourd&apos;hui
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Option Chien */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4 text-amber-500" />
                  <Label className="font-medium">Gestion des animaux</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="enableDogOption"
                      checked={enableDogOption}
                      onCheckedChange={setEnableDogOption}
                    />
                    <Label htmlFor="enableDogOption" className="text-sm">
                      Permettre aux clients d&apos;indiquer s&apos;ils voyagent
                      avec un chien
                    </Label>
                  </div>
                  <div className="ml-6 p-3 rounded-lg bg-amber-50">
                    <p className="text-sm text-amber-800">
                      {enableDogOption ? (
                        <>
                          <strong>🐕 Option activée :</strong> Les clients
                          pourront cocher &quot;Avec chien&quot; lors du choix
                          des dates. Seules les places autorisant les chiens
                          leur seront proposées.
                        </>
                      ) : (
                        <>
                          <strong>ℹ️ Option désactivée :</strong> Aucune option
                          relative aux chiens lors des réservations.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Frais de plateforme */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <Label className="font-medium">Frais de plateforme</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="hidePlatformFees"
                      checked={hidePlatformFees}
                      onCheckedChange={setHidePlatformFees}
                    />
                    <Label htmlFor="hidePlatformFees" className="text-sm">
                      Masquer les frais de plateforme et les inclure dans le
                      prix de base
                    </Label>
                  </div>
                  <div className="ml-6 p-3 rounded-lg bg-green-50">
                    <p className="text-sm text-green-800">
                      {hidePlatformFees ? (
                        <>
                          <strong>💰 Frais masqués :</strong> Les frais de
                          plateforme sont inclus dans le prix affiché sans ligne
                          séparée. Le client voit un prix &quot;tout
                          compris&quot;.
                        </>
                      ) : (
                        <>
                          <strong>📋 Frais visibles :</strong> Les frais de
                          plateforme sont affichés séparément dans le
                          récapitulatif de commande pour plus de transparence.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Horaires */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Gestion des horaires
              </CardTitle>
              <CardDescription>
                Configurez les heures d&apos;ouverture et les restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Heure limite */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <Label className="font-medium">
                    Heure limite de réservation
                  </Label>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="enableCutoffTime"
                      checked={enableCutoffTime}
                      onCheckedChange={(checked) =>
                        setEnableCutoffTime(checked as boolean)
                      }
                    />
                    <Label htmlFor="enableCutoffTime" className="text-sm">
                      Activer une heure limite pour les réservations
                    </Label>
                  </div>

                  {enableCutoffTime && (
                    <div className="ml-6 space-y-4 p-4 border rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cutoffTime">Heure limite</Label>
                          <Input
                            id="cutoffTime"
                            type="time"
                            value={cutoffTime}
                            onChange={(e) => setCutoffTime(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reopenTime">
                            Heure de réouverture
                          </Label>
                          <Input
                            id="reopenTime"
                            type="time"
                            value={reopenTime}
                            onChange={(e) => setReopenTime(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Après {cutoffTime}, les réservations seront fermées
                        jusqu&apos;à {reopenTime} le lendemain.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Heures d'arrivée et départ */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <Label className="font-medium">
                    Heures d&apos;arrivée et de départ
                  </Label>
                </div>
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
                      className="w-full"
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
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Heure à laquelle les chambres redeviennent disponibles
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Disponibilité :</strong> Les chambres avec départ
                    redeviennent disponibles à <strong>{checkoutTime}</strong>.
                    Les nouvelles réservations peuvent commencer à partir de{" "}
                    <strong>{checkinTime}</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Tarification */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Gestion de la tarification
              </CardTitle>
              <CardDescription>
                Configurez les taxes et frais supplémentaires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Taxe de séjour */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <Label className="font-medium">Taxe de séjour</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="touristTaxEnabled"
                      checked={touristTaxEnabled}
                      onCheckedChange={(checked) =>
                        setTouristTaxEnabled(checked as boolean)
                      }
                    />
                    <Label htmlFor="touristTaxEnabled" className="text-sm">
                      Activer la taxe de séjour
                    </Label>
                  </div>

                  {touristTaxEnabled && (
                    <div className="ml-6 space-y-3 p-4 border rounded-lg bg-gray-50">
                      <div className="space-y-2">
                        <Label htmlFor="touristTaxAmount">
                          Montant par personne (CHF)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="touristTaxAmount"
                            type="number"
                            value={touristTaxAmount}
                            onChange={(e) =>
                              setTouristTaxAmount(
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-24"
                            min="0"
                            max="100"
                            step="0.50"
                            placeholder="3.00"
                          />
                          <span className="text-sm text-muted-foreground">
                            CHF par personne
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Ce montant sera automatiquement ajouté au prix total
                          pour chaque personne
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-blue-50">
                    <p className="text-sm text-blue-800">
                      {touristTaxEnabled ? (
                        <>
                          <strong>💰 Taxe active :</strong> Une taxe de{" "}
                          <strong>
                            {touristTaxAmount.toFixed(2)} CHF par personne
                          </strong>{" "}
                          sera automatiquement ajoutée à chaque réservation.
                        </>
                      ) : (
                        <>
                          <strong>ℹ️ Taxe désactivée :</strong> Aucune taxe
                          supplémentaire appliquée.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Facturation */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Informations de facturation
              </CardTitle>
              <CardDescription>
                Ces informations apparaîtront en haut à gauche de vos factures
                PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nom de l'entreprise */}
              <div className="space-y-2">
                <Label htmlFor="billingCompanyName">
                  Nom de l&apos;entreprise
                </Label>
                <Input
                  id="billingCompanyName"
                  value={billingCompanyName}
                  onChange={(e) => setBillingCompanyName(e.target.value)}
                  placeholder="Ex: Camping du Lac SA"
                />
                <p className="text-xs text-muted-foreground">
                  Nom officiel de votre entreprise pour la facturation
                </p>
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Adresse</Label>
                <Input
                  id="billingAddress"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Ex: L'Etrey 87"
                />
              </div>

              {/* Code postal et ville */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingPostalCode">Code postal</Label>
                  <Input
                    id="billingPostalCode"
                    value={billingPostalCode}
                    onChange={(e) => setBillingPostalCode(e.target.value)}
                    placeholder="Ex: 1643"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingCity">Ville</Label>
                  <Input
                    id="billingCity"
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                    placeholder="Ex: Gumefens"
                  />
                </div>
              </div>

              {/* Pays */}
              <div className="space-y-2">
                <Label htmlFor="billingCountry">Pays</Label>
                <Input
                  id="billingCountry"
                  value={billingCountry}
                  onChange={(e) => setBillingCountry(e.target.value)}
                  placeholder="Ex: Switzerland"
                />
              </div>

              {/* Numéro de TVA */}
              <div className="space-y-2">
                <Label htmlFor="vatNumber">Numéro de TVA</Label>
                <Input
                  id="vatNumber"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  placeholder="Ex: CHE-123.456.789 TVA"
                />
                <p className="text-xs text-muted-foreground">
                  Votre numéro d&apos;identification TVA (optionnel)
                </p>
              </div>

              <Separator />

              {/* Aperçu */}
              <div className="p-4 border rounded-lg bg-gray-50 space-y-2">
                <h4 className="font-medium text-sm">
                  📄 Aperçu de la facturation :
                </h4>
                <div className="text-sm space-y-1">
                  {billingCompanyName && (
                    <p className="font-semibold">{billingCompanyName}</p>
                  )}
                  {billingAddress && <p>{billingAddress}</p>}
                  {(billingPostalCode || billingCity) && (
                    <p>
                      {billingPostalCode} {billingCity}
                    </p>
                  )}
                  {billingCountry && <p>{billingCountry}</p>}
                  {vatNumber && <p className="mt-2">TVA: {vatNumber}</p>}
                  {!billingCompanyName &&
                    !billingAddress &&
                    !billingPostalCode &&
                    !billingCity &&
                    !billingCountry &&
                    !vatNumber && (
                      <p className="text-muted-foreground italic">
                        Aucune information de facturation configurée
                      </p>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Parking */}
        <TabsContent value="parking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Parking jour
              </CardTitle>
              <CardDescription>
                Activez et configurez la réservation de places de parking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Activation parking jour */}
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
                  {/* Configuration active */}
                  <div className="p-4 border rounded-lg bg-green-50 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <h5 className="font-medium text-green-800">
                        Configuration active
                      </h5>
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>• Commission : 5%</p>
                      <p>• Aucun frais fixe appliqué</p>
                      <p>
                        • Durées disponibles : 1h, 2h, 3h, 4h, demi-journée,
                        journée complète
                      </p>
                      <p>
                        • Section &quot;Parking Jour&quot; ajoutée à votre menu
                        d&apos;administration
                      </p>
                    </div>
                  </div>

                  {/* Mode parking uniquement */}
                  <div className="p-4 border rounded-lg bg-orange-50 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <h5 className="font-medium text-orange-800">
                        Mode Parking Uniquement
                      </h5>
                    </div>
                    <div className="text-sm text-orange-700 space-y-2">
                      <p>
                        Activez cette option si vous souhaitez que vos QR codes
                        mènent directement au formulaire de parking sans
                        proposer le choix chambre/parking.
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
                          ⚠️ Avec cette option activée, vos clients ne pourront
                          plus réserver de chambres via le QR code et iront
                          directement au formulaire de parking.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accès contrôle parking */}
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
        </TabsContent>

        {/* Onglet Aide */}
        <TabsContent value="help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Guide des paramètres
              </CardTitle>
              <CardDescription>
                Informations détaillées sur le fonctionnement de chaque
                paramètre
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
                    <span className="text-primary font-medium min-w-fit">
                      •
                    </span>
                    <span>
                      <strong>Durée maximale :</strong> Limite le nombre de
                      nuits consécutives que les clients peuvent réserver (1-365
                      nuits)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-medium min-w-fit">
                      •
                    </span>
                    <span>
                      <strong>Réservations futures :</strong> Si désactivé, les
                      clients ne peuvent réserver que pour aujourd&apos;hui
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-medium min-w-fit">
                      •
                    </span>
                    <span>
                      <strong>Heure limite :</strong> Empêche les nouvelles
                      réservations après l&apos;heure définie (évite les
                      arrivées tardives)
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Bonnes Pratiques */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-foreground border-b pb-1">
                  💡
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-medium min-w-fit">
                      ✓
                    </span>
                    <span>
                      Activez l&apos;heure limite (22h) pour éviter les arrivées
                      nocturnes non souhaitées
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-medium min-w-fit">
                      ✓
                    </span>
                    <span>
                      Limitez les séjours (4-7 nuits) pour maintenir un bon taux
                      de rotation
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-medium min-w-fit">
                      ✓
                    </span>
                    <span>Testez vos templates d&apos;email</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-medium min-w-fit">
                      ✓
                    </span>
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
                  <div className="text-blue-600 dark:text-blue-400 text-lg">
                    ℹ️
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-medium text-blue-900 dark:text-blue-100">
                      Besoin d&apos;aide ?
                    </h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Les réservations existantes ne sont jamais affectées par
                      les changements de paramètres. Seules les nouvelles
                      réservations suivront les nouveaux paramètres configurés.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bouton de sauvegarde global */}
      <div className="sticky bottom-4 flex justify-center">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="shadow-lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder les paramètres
            </>
          )}
        </Button>
      </div>

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
