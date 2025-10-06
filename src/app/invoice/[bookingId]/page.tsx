"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { InvoiceDownload } from "@/components/InvoiceDownload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";

interface BookingData {
  id: string;
  bookingNumber: number;
  bookingDate: Date;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone?: string | null;
  clientAddress?: string | null;
  clientPostalCode?: string | null;
  clientCity?: string | null;
  clientCountry?: string | null;
  amount: number;
  currency: string;
  checkInDate: Date;
  checkOutDate: Date;
  pricingOptionsTotal: number;
  touristTaxTotal: number;
  selectedPricingOptions?: Record<string, string | string[]> | null;
  room: {
    name: string;
    price: number;
  } | null;
}

interface EstablishmentData {
  name: string;
  slug: string;
  commissionRate: number;
  fixedFee: number;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  hotelContactPhone?: string | null;
  hotelContactEmail?: string | null;
}

export default function InvoiceDownloadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [establishment, setEstablishment] = useState<EstablishmentData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = params.bookingId as string;
  const token = searchParams.get("token");

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!bookingId || !token) {
        setError("Paramètres manquants dans l'URL");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/invoice/${bookingId}?token=${token}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors du chargement");
        }

        const data = await response.json();

        // Convertir les dates string en objets Date
        const bookingWithDates = {
          ...data.booking,
          bookingDate: new Date(data.booking.bookingDate),
          checkInDate: new Date(data.booking.checkInDate),
          checkOutDate: new Date(data.booking.checkOutDate),
        };

        setBooking(bookingWithDates);
        setEstablishment(data.establishment);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [bookingId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre facture...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Erreur d&apos;accès</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500">
              Veuillez vérifier que le lien de téléchargement est correct ou
              contactez l&apos;établissement.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking || !establishment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <p className="text-gray-600">
              Aucune donnée de facturation trouvée.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Téléchargement de votre facture
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Réservation #{booking.bookingNumber} - {establishment.name}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Informations de la réservation */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Détails de la réservation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Client :</span>
                  <p className="font-medium">
                    {booking.clientFirstName} {booking.clientLastName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Email :</span>
                  <p className="font-medium">{booking.clientEmail}</p>
                </div>
                <div>
                  <span className="text-gray-600">Chambre :</span>
                  <p className="font-medium">
                    {booking.room?.name || "Service"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Séjour :</span>
                  <p className="font-medium">
                    {booking.checkInDate.toLocaleDateString("fr-FR")} -{" "}
                    {booking.checkOutDate.toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Montant total :</span>
                  <p className="font-medium text-lg text-green-600">
                    {booking.amount.toFixed(2)} {booking.currency}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Date de réservation :</span>
                  <p className="font-medium">
                    {booking.bookingDate.toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton de téléchargement */}
            <div className="text-center space-y-4">
              <InvoiceDownload
                booking={booking}
                establishment={establishment}
                variant="default"
                size="lg"
                showText={true}
              />

              <p className="text-sm text-gray-500">
                Cette facture est générée automatiquement et constitue un
                document officiel.
              </p>
            </div>

            {/* Informations de contact */}
            {(establishment.hotelContactEmail ||
              establishment.hotelContactPhone) && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Besoin d&apos;aide ?
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {establishment.hotelContactEmail && (
                    <p>📧 Email : {establishment.hotelContactEmail}</p>
                  )}
                  {establishment.hotelContactPhone && (
                    <p>📞 Téléphone : {establishment.hotelContactPhone}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
