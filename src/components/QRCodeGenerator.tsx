"use client";

import { useState, useEffect, useRef } from "react";
import {
  generateQRCodeWithLogo,
  generateHighQualityQRCode,
  downloadQRCode,
} from "@/lib/qrcode-with-logo";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";

interface QRCodeGeneratorProps {
  hotelSlug: string;
  hotelName: string;
}

export function QRCodeGenerator({
  hotelSlug,
  hotelName,
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [printQrCodeUrl, setPrintQrCodeUrl] = useState<string>("");
  const [bookingUrl, setBookingUrl] = useState<string>("");
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Construire l'URL de réservation
    const url = `${window.location.origin}/${hotelSlug}`;
    setBookingUrl(url);

    // Générer un QR code SANS logo pour l'affichage (meilleur scan)
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      })
        .then((dataUrl: string) => {
          setQrCodeUrl(dataUrl);
        })
        .catch((error: Error) => {
          console.error("Erreur lors de la génération du QR Code:", error);
        });
    });

    // Générer le code QR haute qualité AVEC logo pour l'impression
    generateQRCodeWithLogo(url, {
      width: 320,
      margin: 2,
      borderRadius: 20,
      quality: "print",
    })
      .then((dataUrl: string) => {
        setPrintQrCodeUrl(dataUrl);
      })
      .catch((error: Error) => {
        console.error(
          "Erreur lors de la génération du QR Code d'impression:",
          error
        );
      });
  }, [hotelSlug]);

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(event.target as Node)
      ) {
        setIsDownloadMenuOpen(false);
      }
    };

    if (isDownloadMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDownloadMenuOpen]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `QR Code - ${hotelName}`,
  });

  // Fonction pour télécharger en haute qualité AVEC logo
  const handleDownloadWithLogo = async (transparent = false) => {
    try {
      const options = {
        width: 512, // Taille plus grande pour le téléchargement
        margin: 2,
        borderRadius: 32, // Proportionnel à la taille
        transparent: transparent, // Option pour fond transparent
      };
      const highQualityQR = await generateHighQualityQRCode(
        bookingUrl,
        options
      );
      const suffix = transparent ? "avec-logo-transparent-hq" : "avec-logo-hq";
      downloadQRCode(highQualityQR, `qr-code-${hotelSlug}-${suffix}.png`);
    } catch (error) {
      console.error("Erreur lors du téléchargement haute qualité:", error);
      // Fallback vers le QR code normal
      downloadQRCode(qrCodeUrl, `qr-code-${hotelSlug}.png`);
    }
  };

  // Fonction pour télécharger en haute qualité SANS logo (optimisé scan)
  const handleDownloadWithoutLogo = async (transparent = false) => {
    try {
      // Importer QRCode dynamiquement
      const QRCode = await import("qrcode");
      const highQualityQRWithoutLogo = await QRCode.toDataURL(bookingUrl, {
        width: 512, // Haute résolution
        margin: 2,
        color: {
          dark: "#000000",
          light: transparent ? "#00000000" : "#FFFFFF", // Transparent si demandé
        },
        errorCorrectionLevel: "H", // Niveau élevé pour la haute qualité
      });
      const suffix = transparent ? "sans-logo-transparent-hq" : "sans-logo-hq";
      downloadQRCode(
        highQualityQRWithoutLogo,
        `qr-code-${hotelSlug}-${suffix}.png`
      );
    } catch (error) {
      console.error("Erreur lors du téléchargement sans logo:", error);
      // Fallback vers le QR code affiché
      downloadQRCode(qrCodeUrl, `qr-code-${hotelSlug}-sans-logo.png`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header avec titre et boutons */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Code QR pour réservation
        </h3>

        {/* Boutons d'action - en haut à droite */}
        <div className="flex space-x-3">
          {/* Bouton Imprimer */}
          <button
            onClick={handlePrint}
            disabled={!qrCodeUrl}
            className="text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 bg-white px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span>Imprimer</span>
          </button>

          {/* Bouton de téléchargement avec menu déroulant */}
          <div className="relative" ref={downloadMenuRef}>
            <button
              onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
              disabled={!qrCodeUrl}
              className="text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 bg-white px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Télécharger HQ</span>
              <svg
                className={`w-3 h-3 transition-transform ${isDownloadMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Menu déroulant simple */}
            {isDownloadMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                <div className="py-1">
                  {/* Sans logo */}
                  <button
                    onClick={() => {
                      handleDownloadWithoutLogo(false);
                      setIsDownloadMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      Sans logo
                    </div>
                    <div className="text-xs text-gray-500">
                      Optimal pour scan
                    </div>
                  </button>

                  {/* Avec logo */}
                  <button
                    onClick={() => {
                      handleDownloadWithLogo(false);
                      setIsDownloadMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      Avec logo
                    </div>
                    <div className="text-xs text-gray-500">
                      Logo sur fond blanc · Contraste optimal
                    </div>
                  </button>

                  {/* Sans logo, transparent */}
                  <button
                    onClick={() => {
                      handleDownloadWithoutLogo(true);
                      setIsDownloadMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      Sans logo, transparent
                    </div>
                    <div className="text-xs text-gray-500">
                      Fond transparent · Intégration libre
                    </div>
                  </button>

                  {/* Avec logo, transparent */}
                  <button
                    onClick={() => {
                      handleDownloadWithLogo(true);
                      setIsDownloadMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      Avec logo, transparent
                    </div>
                    <div className="text-xs text-gray-500">
                      Logo sans fond · Prévoir fond sombre
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu centré */}
      <div className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          {qrCodeUrl && (
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <Image
                src={qrCodeUrl}
                alt="QR Code pour réservation"
                width={256}
                height={256}
                className="w-64 h-64 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* URL affichée */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">URL de réservation :</div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <code className="text-sm text-gray-800">{bookingUrl}</code>
          </div>
        </div>
      </div>

      {/* Version imprimable (cachée) */}
      <div style={{ display: "none" }}>
        <div ref={printRef} className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{hotelName}</h1>
          <h2 className="text-xl mb-6">Réservation en ligne</h2>

          {printQrCodeUrl && (
            <div className="flex justify-center mb-6">
              <Image
                src={printQrCodeUrl}
                alt="QR Code pour réservation"
                width={320}
                height={320}
                className="w-80 h-80"
              />
            </div>
          )}

          <div className="space-y-4">
            <p className="text-lg">
              Scannez ce code QR avec votre téléphone pour réserver une chambre
            </p>
            <p className="text-sm text-gray-600">Ou visitez : {bookingUrl}</p>
          </div>

          <div className="mt-8 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Code QR généré le {new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
