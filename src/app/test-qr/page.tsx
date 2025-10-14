import { QRCodeGenerator } from "@/components/shared/QRCodeGenerator";

export default function QRTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test du générateur de QR Code
          </h1>
          <p className="text-gray-600">
            Page de test pour vérifier le bon fonctionnement du générateur de
            codes QR
          </p>
        </div>

        <QRCodeGenerator hotelSlug="test-hotel" hotelName="Hôtel de Test" />

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions de test</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Vérifiez que le QR code s&apos;affiche correctement</li>
            <li>Testez le bouton d&apos;impression</li>
            <li>Téléchargez le fichier PNG</li>
            <li>Scannez le QR code avec votre téléphone</li>
            <li>Vérifiez que l&apos;URL de destination est correcte</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
