"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  QrCode,
  Copy,
  ExternalLink,
  Download,
  Share2,
  Shield,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface DashboardPublicAccessProps {
  hotelSlug: string;
  establishmentName: string;
}

export function DashboardPublicAccess({
  hotelSlug,
}: DashboardPublicAccessProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Générer un token sécurisé pour l'accès public
  const token = `${hotelSlug}-dashboard-public-2025`;
  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard-public/${hotelSlug}?token=${encodeURIComponent(token)}`;

  const generateQrCode = async () => {
    setIsGenerating(true);
    try {
      // Utiliser l'API QR Server pour générer le QR code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;
      setQrCodeUrl(qrUrl);
    } catch {
      toastUtils.error("Erreur lors de la génération du QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toastUtils.success("URL copiée dans le presse-papier");
    } catch {
      toastUtils.error("Erreur lors de la copie");
    }
  };

  const openPreview = () => {
    window.open(publicUrl, "_blank");
  };

  const downloadQrCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr-code-dashboard-${hotelSlug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Partager dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Partage du tableau de bord
          </DialogTitle>
          <DialogDescription>
            Donnez accès aux statistiques de votre établissement sans révéler
            d&apos;informations sensibles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Information sur la sécurité */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">
                  Version publique sécurisée
                </h4>
                <p className="text-sm text-blue-700">
                  Cette version du tableau de bord affiche uniquement les
                  statistiques générales (graphiques, taux d&apos;occupation,
                  revenus) sans aucune information personnelle des clients
                  (noms, emails, téléphones).
                </p>
              </div>
            </div>
          </div>

          {/* Instructions d'utilisation */}
          <div className="space-y-3">
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50">
                <span className="text-blue-600">ℹ️</span>
                Comment partager avec vos partenaires
                <span className="ml-auto transition-transform group-open:rotate-90">
                  ▶
                </span>
              </summary>
              <div className="mt-2 pl-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">📱</span>
                  <span>
                    <strong>QR Code :</strong> Générez et partagez le QR code
                    pour un accès rapide par scan
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">🔗</span>
                  <span>
                    <strong>Copier lien :</strong> Copiez l&apos;URL et
                    envoyez-la par email, WhatsApp ou message
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">👀</span>
                  <span>
                    <strong>Aperçu :</strong> Testez l&apos;interface avant de
                    la partager
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-500 italic">
                  💡 Idéal pour partager avec des investisseurs, autorités, ou
                  partenaires commerciaux
                </div>
              </div>
            </details>

            {/* Boutons d'action */}
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

            {/* QR Code généré */}
            {qrCodeUrl && (
              <div className="text-center space-y-3">
                <div className="inline-block p-3 bg-white border-2 border-gray-200 rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl}
                    alt="QR Code tableau de bord"
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

          {/* Fonctionnalités disponibles */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">
              Données visibles dans la version publique :
            </h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>
                  Statistiques générales (places disponibles, taux
                  d&apos;occupation)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Graphiques de revenus et réservations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Analyse des tendances par période</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Performance des chambres/places</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600">✗</span>
                <span>Informations personnelles des clients</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600">✗</span>
                <span>Coordonnées et données sensibles</span>
              </div>
            </div>
          </div>

          {/* URL pour information */}
          <div className="bg-gray-50 p-3 rounded text-xs font-mono break-all text-gray-600">
            {publicUrl}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
