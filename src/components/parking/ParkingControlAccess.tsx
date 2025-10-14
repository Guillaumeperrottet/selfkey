"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Copy, ExternalLink, Shield, Download } from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface ParkingControlAccessProps {
  hotelSlug: string;
  enableDayParking: boolean;
}

export function ParkingControlAccess({
  hotelSlug,
  enableDayParking,
}: ParkingControlAccessProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const token = `${hotelSlug}-parking-control-2025`;
  const controlUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/parking-control/${hotelSlug}?token=${encodeURIComponent(token)}`;

  const generateQrCode = async () => {
    setIsGenerating(true);
    try {
      // Utiliser l'API QR Server pour générer le QR code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(controlUrl)}`;
      setQrCodeUrl(qrUrl);
    } catch {
      toastUtils.error("Erreur lors de la génération du QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(controlUrl);
      toastUtils.success("URL copiée dans le presse-papier");
    } catch {
      toastUtils.error("Erreur lors de la copie");
    }
  };

  const openPreview = () => {
    window.open(controlUrl, "_blank");
  };

  const downloadQrCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr-code-parking-${hotelSlug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!enableDayParking) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Accès Contrôle Parking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">
                Interface sécurisée pour le personnel
              </h4>
              <p className="text-sm text-blue-700">
                Donnez cet accès à votre personnel pour contrôler les plaques
                d&apos;immatriculation sans accès aux données sensibles (noms,
                emails, prix).
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50">
              <span className="text-blue-600">ℹ️</span>
              Comment donner l&apos;accès à votre personnel
              <span className="ml-auto transition-transform group-open:rotate-90">
                ▶
              </span>
            </summary>
            <div className="mt-2 pl-6 space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-600">📱</span>
                <span>
                  <strong>QR Code :</strong> Générez et imprimez le QR code pour
                  un accès rapide par scan
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-600">🔗</span>
                <span>
                  <strong>Copier lien :</strong> Copiez l&apos;URL et envoyez-la
                  par email, WhatsApp ou SMS
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-600">👀</span>
                <span>
                  <strong>Aperçu :</strong> Testez l&apos;interface avant de la
                  partager avec votre équipe
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-500 italic">
                💡 L&apos;accès fonctionne sur tous les appareils (mobile,
                tablette, ordinateur)
              </div>
            </div>
          </details>
          <div className="flex gap-2">
            <Button
              onClick={generateQrCode}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {isGenerating ? "Génération..." : "Générer QR Code"}
            </Button>
            <Button
              onClick={copyUrl}
              variant="outline"
              size="sm"
              title="Copier l'URL"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copier lien
            </Button>
            <Button
              onClick={openPreview}
              variant="outline"
              size="sm"
              title="Prévisualiser"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Aperçu
            </Button>
          </div>

          {qrCodeUrl && (
            <div className="text-center space-y-3">
              <div className="inline-block p-3 bg-white border-2 border-gray-200 rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="QR Code contrôle parking"
                  className="w-32 h-32 mx-auto"
                />
              </div>
              <Button onClick={downloadQrCode} variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Télécharger QR Code
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Fonctionnalités disponibles :</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Vue des plaques d&apos;immatriculation du jour</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Statuts en temps réel (actif, bientôt fini, expiré)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Recherche rapide par plaque</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Interface mobile optimisée</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Mise à jour automatique toutes les 30s</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-gray-50 rounded">
          <strong>URL d&apos;accès :</strong>
          <br />
          <code className="break-all">{controlUrl}</code>
        </div>
      </CardContent>
    </Card>
  );
}
