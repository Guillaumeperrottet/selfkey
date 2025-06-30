import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";

interface Props {
  params: Promise<{ hotel: string }>;
}

export default async function QRCodePage({ params }: Props) {
  const { hotel } = await params;

  // Récupérer l'établissement
  const establishment = await prisma.establishment.findUnique({
    where: { slug: hotel },
  });

  if (!establishment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Code QR - {establishment.name}
              </h1>
              <p className="text-gray-600 mt-2">
                Générez et imprimez votre code QR pour permettre aux clients de
                réserver directement
              </p>
            </div>
            <a
              href={`/admin/${hotel}`}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Retour au tableau de bord</span>
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            📱 Comment utiliser votre code QR
          </h2>
          <div className="space-y-2 text-blue-700">
            <p>
              • Imprimez le code QR et placez-le à l&apos;entrée de votre
              établissement
            </p>
            <p>
              • Les clients peuvent scanner le code avec leur téléphone pour
              accéder directement à la réservation
            </p>
            <p>
              • Le code QR redirige vers :{" "}
              <strong>votre-domaine.com/{hotel}</strong>
            </p>
            <p>
              • Aucune application spéciale n&apos;est requise - l&apos;appareil
              photo du téléphone suffit
            </p>
          </div>
        </div>

        {/* Générateur de QR Code */}
        <QRCodeGenerator hotelSlug={hotel} hotelName={establishment.name} />

        {/* Conseils d'utilisation */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-6 h-6 text-green-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Bonnes pratiques
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Placez le code à hauteur des yeux</li>
              <li>• Utilisez un support résistant aux intempéries</li>
              <li>• Assurez-vous que l&apos;éclairage est suffisant</li>
              <li>• Testez régulièrement le scan du code</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-6 h-6 text-blue-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Emplacements suggérés
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Hall d&apos;entrée principal</li>
              <li>• Réception / comptoir d&apos;accueil</li>
              <li>• Vitrines extérieures</li>
              <li>• Supports publicitaires</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
