"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import Image from "next/image";

interface QRCodePreviewProps {
  hotelSlug: string;
}

export function QRCodePreview({ hotelSlug }: QRCodePreviewProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [bookingUrl, setBookingUrl] = useState<string>("");

  useEffect(() => {
    // Construire l'URL de réservation
    const url = `${window.location.origin}/${hotelSlug}`;
    setBookingUrl(url);

    // Générer le code QR
    QRCode.toDataURL(url, {
      width: 128,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((dataUrl) => {
        setQrCodeUrl(dataUrl);
      })
      .catch((error) => {
        console.error("Erreur lors de la génération du QR Code:", error);
      });
  }, [hotelSlug]);

  if (!qrCodeUrl) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Code QR de réservation
        </h3>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Code QR de réservation
      </h3>

      <div className="flex flex-col items-center space-y-4">
        {/* QR Code */}
        <div className="border border-gray-200 rounded-lg p-3">
          <Image
            src={qrCodeUrl}
            alt="QR Code pour réservation"
            width={128}
            height={128}
            className="w-32 h-32"
          />
        </div>

        {/* URL */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Lien de réservation :</p>
          <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 break-all">
            {bookingUrl}
          </code>
        </div>

        {/* Bouton d'action */}
        <a
          href={`/admin/${hotelSlug}/qr-code`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
        >
          <span>Gérer et imprimer</span>
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
