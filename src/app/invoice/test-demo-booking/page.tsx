"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InvoiceDownload } from "@/components/InvoiceDownload";

// Données d'exemple pour la facture de test
const testBookingData = {
  id: "test-demo-booking",
  bookingNumber: 12345,
  bookingDate: new Date("2025-07-01"),
  clientFirstName: "Jean",
  clientLastName: "Dupont",
  clientEmail: "test@exemple.com",
  clientPhone: "+41 79 123 45 67",
  clientAddress: "Rue de l'Exemple 123",
  clientPostalCode: "1000",
  clientCity: "Lausanne",
  clientCountry: "Suisse",
  amount: 150.0,
  currency: "CHF",
  checkInDate: new Date("2025-07-15"),
  checkOutDate: new Date("2025-07-17"),
  pricingOptionsTotal: 25.0,
  touristTaxTotal: 5.0,
  room: {
    name: "Place Standard",
    price: 50.0,
  },
};

const testEstablishmentData = {
  name: "Camping du Lac - Démo",
  slug: "camping-du-lac",
  commissionRate: 5,
  fixedFee: 2.5,
  address: "Route du Lac 456",
  city: "Fribourg",
  postalCode: "1700",
  country: "Suisse",
  hotelContactPhone: "+41 26 123 45 67",
  hotelContactEmail: "contact@campingdulac.ch",
};

export default function TestInvoicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-700 border-blue-300"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                FACTURE DE TEST
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Téléchargement de facture de démonstration
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Voici un exemple de la vraie facture PDF que recevront vos clients
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Informations de la réservation d'exemple */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                Exemple de réservation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Client :</span>
                  <p className="font-medium">
                    {testBookingData.clientFirstName}{" "}
                    {testBookingData.clientLastName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Email :</span>
                  <p className="font-medium">{testBookingData.clientEmail}</p>
                </div>
                <div>
                  <span className="text-gray-600">Chambre :</span>
                  <p className="font-medium">{testBookingData.room.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Séjour :</span>
                  <p className="font-medium">
                    {testBookingData.checkInDate.toLocaleDateString("fr-FR")} -{" "}
                    {testBookingData.checkOutDate.toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Montant total :</span>
                  <p className="font-medium text-lg text-green-600">
                    {testBookingData.amount.toFixed(2)}{" "}
                    {testBookingData.currency}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">N° réservation :</span>
                  <p className="font-medium">{testBookingData.bookingNumber}</p>
                </div>
              </div>
            </div>

            {/* Vraie facture de test téléchargeable */}
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900 mb-1">
                      Facture PDF réelle
                    </p>
                    <p className="text-green-700 mb-3">
                      Cliquez ci-dessous pour télécharger une vraie facture PDF
                      générée avec vos données d&apos;exemple. C&apos;est
                      exactement ce que vos clients recevront !
                    </p>
                  </div>
                </div>
              </div>

              <InvoiceDownload
                booking={testBookingData}
                establishment={testEstablishmentData}
                variant="default"
                size="lg"
                showText={true}
              />
            </div>

            {/* Informations sur le système */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Caractéristiques de cette facture de test :
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  PDF généré avec vos vraies données d&apos;exemple
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Logo et branding de votre établissement
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Calculs détaillés des coûts et frais
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Format professionnel A4
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Même système que pour vos vrais clients
                </li>
              </ul>
            </div>

            {/* Différences avec la vraie utilisation */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                💡 Différences avec une vraie facture client :
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Les données sont des exemples (Jean Dupont, etc.)</li>
                <li>• Pas de vérification de sécurité (token)</li>
                <li>• Accès libre pour les tests</li>
                <li>• Les vrais clients auront leurs propres données</li>
              </ul>
            </div>

            {/* Lien de retour */}
            <div className="text-center pt-4">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à l&apos;administration
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
