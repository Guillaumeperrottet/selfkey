"use client";

import { useState, useEffect, useRef } from "react";
import { generateQRCodeWithLogo } from "@/lib/qrcode-with-logo";
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
  const [bookingUrl, setBookingUrl] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Construire l'URL de réservation
    const url = `${window.location.origin}/${hotelSlug}`;
    setBookingUrl(url);

    // Générer le code QR avec logo
    generateQRCodeWithLogo(url, {
      width: 256,
      margin: 2,
      borderRadius: 16,
    })
      .then((dataUrl: string) => {
        setQrCodeUrl(dataUrl);
      })
      .catch((error: Error) => {
        console.error("Erreur lors de la génération du QR Code:", error);
      });
  }, [hotelSlug]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `QR Code - ${hotelName}`,
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Code QR pour réservation
      </h3>

      <div className="space-y-4">
        {/* Aperçu du QR Code */}
        <div className="flex flex-col items-center space-y-4">
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

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">URL de réservation :</p>
            <code className="bg-gray-100 px-3 py-1 rounded text-sm break-all">
              {bookingUrl}
            </code>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handlePrint}
            disabled={!qrCodeUrl}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
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

          <a
            href={qrCodeUrl}
            download={`qr-code-${hotelSlug}.png`}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
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
            <span>Télécharger</span>
          </a>
        </div>
      </div>

      {/* Version imprimable (cachée) */}
      <div style={{ display: "none" }}>
        <div ref={printRef} className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{hotelName}</h1>
          <h2 className="text-xl mb-6">Réservation en ligne</h2>

          {qrCodeUrl && (
            <div className="flex justify-center mb-6">
              <Image
                src={qrCodeUrl}
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
