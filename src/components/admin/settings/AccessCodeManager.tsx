"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AccessCodeType } from "@/lib/access-codes";
import { toastUtils } from "@/lib/toast-utils";

interface AccessCodeManagerProps {
  establishmentSlug: string;
  rooms: Array<{
    id: string;
    name: string;
    accessCode?: string | null;
    isActive: boolean;
  }>;
  establishment: {
    accessCodeType: string;
    generalAccessCode?: string | null;
    accessInstructions?: string | null;
  };
}

export function AccessCodeManager({
  establishmentSlug,
  rooms,
  establishment,
}: AccessCodeManagerProps) {
  const [accessCodeType, setAccessCodeType] = useState<AccessCodeType>(
    establishment.accessCodeType as AccessCodeType
  );
  const [generalAccessCode, setGeneralAccessCode] = useState(
    establishment.generalAccessCode || ""
  );
  const [accessInstructions, setAccessInstructions] = useState(
    establishment.accessInstructions || ""
  );
  const [roomCodes, setRoomCodes] = useState<Record<string, string>>(
    rooms.reduce(
      (acc, room) => {
        acc[room.id] = room.accessCode || "";
        return acc;
      },
      {} as Record<string, string>
    )
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateEstablishmentSettings = async () => {
    setIsLoading(true);
    const loadingToast = toastUtils.loading(
      "Sauvegarde de la configuration..."
    );

    try {
      const response = await fetch(
        `/api/admin/${establishmentSlug}/access-codes`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessCodeType,
            generalAccessCode:
              accessCodeType === "general" ? generalAccessCode : null,
            accessInstructions:
              accessCodeType === "custom" ? accessInstructions : null,
          }),
        }
      );

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        toastUtils.success("Configuration sauvegardée avec succès !");
      } else {
        const data = await response.json();
        toastUtils.error(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la sauvegarde");
      console.error("Erreur lors de la mise à jour", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRoomCode = async (roomId: string, code: string) => {
    try {
      const response = await fetch(
        `/api/admin/${establishmentSlug}/rooms/${roomId}/access-code`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessCode: code || null }),
        }
      );

      if (response.ok) {
        setRoomCodes((prev) => ({ ...prev, [roomId]: code }));
        const roomName = rooms.find((r) => r.id === roomId)?.name || "Chambre";
        toastUtils.success(`Code mis à jour pour ${roomName}`);
      } else {
        const data = await response.json();
        toastUtils.error(data.error || "Erreur lors de la mise à jour du code");
      }
    } catch (error) {
      toastUtils.error("Erreur lors de la mise à jour du code");
      console.error("Erreur lors de la mise à jour du code", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔑 Gestion des codes d&apos;accès</CardTitle>
        <CardDescription>
          Configurez comment vos clients recevront leurs codes d&apos;accès
          après paiement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Type de système */}
          <div className="space-y-4">
            <Label htmlFor="access-type">Type de système d&apos;accès</Label>
            <select
              value={accessCodeType}
              onChange={(e) =>
                setAccessCodeType(e.target.value as AccessCodeType)
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="room">Code par place (Recommandé)</option>
              <option value="general">Code général</option>
              <option value="custom">Instructions personnalisées</option>
            </select>

            {/* Explications pour chaque type */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                💡 À quoi sert ce choix ?
              </h4>
              {accessCodeType === "room" && (
                <div className="text-sm text-blue-800">
                  <p className="mb-2">
                    <strong>Code par place :</strong> Chaque chambre a son
                    propre code unique.
                  </p>
                  <p className="mb-2">
                    <strong>Dans l&apos;email :</strong> &quot;Code d&apos;accès
                    : 1234&quot;
                  </p>
                  <p>
                    <strong>Avantages :</strong> Sécurité maximale, traçabilité,
                    gestion individuelle des codes.
                  </p>
                </div>
              )}
              {accessCodeType === "general" && (
                <div className="text-sm text-blue-800">
                  <p className="mb-2">
                    <strong>Code général :</strong> Un seul code pour tout
                    l&apos;établissement.
                  </p>
                  <p className="mb-2">
                    <strong>Dans l&apos;email :</strong> &quot;Code d&apos;accès
                    : 5678&quot;
                  </p>
                  <p>
                    <strong>Avantages :</strong> Simple à gérer, facile à
                    retenir pour les clients.
                  </p>
                </div>
              )}
              {accessCodeType === "custom" && (
                <div className="text-sm text-blue-800">
                  <p className="mb-2">
                    <strong>Instructions personnalisées :</strong> Vous rédigez
                    vos propres instructions d&apos;accès.
                  </p>
                  <p className="mb-2">
                    <strong>Dans l&apos;email :</strong> &quot;Code d&apos;accès
                    : Voir instructions ci-dessous&quot; + vos instructions
                    complètes
                  </p>
                  <p>
                    <strong>Idéal pour :</strong> Boîte à clés, réception
                    automatique, instructions step-by-step, HTML autorisé.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Configuration selon le type */}
          {accessCodeType === "room" && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Chaque place a son propre code d&apos;accès. Idéal pour la
                sécurité.
              </div>

              {/* Légende des pastilles */}
              <div className="flex items-center gap-6 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm ring-2 ring-emerald-500/20"></div>
                  <span>Place active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 shadow-sm ring-2 ring-slate-400/20"></div>
                  <span>Place désactivée</span>
                </div>
              </div>

              <div className="grid gap-4">
                {rooms.map((room) => (
                  <div key={room.id} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <div className="relative">
                        <div
                          className={`w-3 h-3 rounded-full shadow-sm transition-all ${
                            room.isActive
                              ? "bg-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/25"
                              : "bg-slate-400 ring-2 ring-slate-400/20 shadow-slate-400/25"
                          }`}
                        />
                        {room.isActive && (
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-pulse opacity-75" />
                        )}
                      </div>
                      <Label className="text-sm">{room.name}</Label>
                    </div>
                    <Input
                      placeholder="Code d'accès"
                      value={roomCodes[room.id] || ""}
                      onChange={(e) =>
                        setRoomCodes((prev) => ({
                          ...prev,
                          [room.id]: e.target.value,
                        }))
                      }
                      onBlur={() =>
                        handleUpdateRoomCode(room.id, roomCodes[room.id] || "")
                      }
                      className="max-w-[200px]"
                      disabled={!room.isActive}
                    />
                    {!room.isActive && (
                      <span className="text-xs text-gray-500">
                        Place désactivée
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {accessCodeType === "general" && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Un seul code pour tout l&apos;établissement. Plus simple à
                gérer.
              </div>
              <div className="space-y-2">
                <Label htmlFor="general-code">Code d&apos;accès général</Label>
                <Input
                  id="general-code"
                  placeholder="Ex: 1234"
                  value={generalAccessCode}
                  onChange={(e) => setGeneralAccessCode(e.target.value)}
                  className="max-w-[200px]"
                />
              </div>
            </div>
          )}

          {accessCodeType === "custom" && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Instructions personnalisées pour récupérer les clés (réception,
                boîte à clés, etc.)
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">
                  Instructions d&apos;accès (HTML autorisé)
                </Label>
                <textarea
                  id="instructions"
                  placeholder="Ex: Récupérez votre carte à la réception automatique située à l'entrée principale..."
                  value={accessInstructions}
                  onChange={(e) => setAccessInstructions(e.target.value)}
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleUpdateEstablishmentSettings}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Mise à jour..." : "Sauvegarder la configuration"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
