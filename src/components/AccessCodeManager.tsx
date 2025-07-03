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
import { Badge } from "@/components/ui/badge";
import { AccessCodeType } from "@/lib/access-codes";

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

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      console.log("Configuration mise à jour avec succès");
    } catch (error) {
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

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      setRoomCodes((prev) => ({ ...prev, [roomId]: code }));
      console.log("Code de la chambre mis à jour");
    } catch (error) {
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
          <div className="space-y-2">
            <Label htmlFor="access-type">Type de système d&apos;accès</Label>
            <select
              value={accessCodeType}
              onChange={(e) =>
                setAccessCodeType(e.target.value as AccessCodeType)
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="room">Code par chambre (Recommandé)</option>
              <option value="general">Code général</option>
              <option value="custom">Instructions personnalisées</option>
            </select>
          </div>

          {/* Configuration selon le type */}
          {accessCodeType === "room" && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Chaque chambre a son propre code d&apos;accès. Idéal pour la
                sécurité.
              </div>

              {/* Légende des pastilles */}
              <div className="flex items-center gap-6 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="default"
                    className="w-2 h-2 p-0 rounded-full bg-green-500"
                  />
                  <span>Chambre active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="w-2 h-2 p-0 rounded-full bg-red-500"
                  />
                  <span>Chambre désactivée</span>
                </div>
              </div>

              <div className="grid gap-4">
                {rooms.map((room) => (
                  <div key={room.id} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <Badge
                        variant={room.isActive ? "default" : "secondary"}
                        className={`w-2 h-2 p-0 rounded-full ${
                          room.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
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
                        Chambre désactivée
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
