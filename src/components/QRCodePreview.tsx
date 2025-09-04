"use client";

import { useState, useEffect } from "react";
import { generateQRCodeWithLogo } from "@/lib/qrcode-with-logo";
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

    // Générer le code QR avec logo
    generateQRCodeWithLogo(url, {
      width: 128,
      margin: 1,
      borderRadius: 12,
    })
      .then((dataUrl: string) => {
        setQrCodeUrl(dataUrl);
      })
      .catch((error: Error) => {
        console.error("Erreur lors de la génération du QR Code:", error);
      });
  }, [hotelSlug]);

  if (!qrCodeUrl) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-2 mr-3">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>
          Code QR de réservation
        </h3>
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Génération du QR Code...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <div className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-2 mr-3">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </div>
        Code QR de réservation
      </h3>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6">
        {/* QR Code avec style moderne */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative bg-white rounded-xl p-4 shadow-lg">
            <Image
              src={qrCodeUrl}
              alt="QR Code pour réservation"
              width={128}
              height={128}
              className="w-32 h-32 rounded-lg"
            />
          </div>
        </div>

        {/* URL avec style moderne */}
        <div className="text-center max-w-full">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Lien de réservation :
          </p>
          <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-300 max-w-full">
            <code className="text-xs text-indigo-600 font-mono break-all">
              {bookingUrl}
            </code>
          </div>
        </div>

        {/* Bouton d'action moderne */}
        <a
          href={`/admin/${hotelSlug}/qr-code`}
          className="group bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
        >
          <span>Gérer et imprimer</span>
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
