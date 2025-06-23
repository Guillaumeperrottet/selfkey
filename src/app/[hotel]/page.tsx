import { notFound } from "next/navigation";
import { getHotelConfig, validateHotelSlug } from "@/lib/hotel-config";
import { getAvailableRooms } from "@/lib/availability";
import { CheckinForm } from "@/components/CheckinForm";
import { prisma } from "@/lib/prisma";

interface Props {
  params: {
    hotel: string;
  };
}

export default async function HotelPage({ params }: Props) {
  const { hotel } = params;

  if (!validateHotelSlug(hotel)) {
    notFound();
  }

  const config = await getHotelConfig(hotel);
  if (!config) {
    notFound();
  }

  // Vérifier que l'établissement existe
  const establishment = await prisma.establishment.findUnique({
    where: { slug: hotel },
  });

  if (!establishment) {
    notFound();
  }

  // Vérifier qu'il y a des chambres configurées
  const roomCount = await prisma.room.count({
    where: {
      hotelSlug: hotel,
      isActive: true,
    },
  });

  if (roomCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            {config.logo && (
              <img
                src={config.logo}
                alt={config.name}
                className="h-16 mx-auto mb-4"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {config.name}
            </h1>
            <p className="text-gray-600">Check-in tardif</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🏨</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Configuration en cours
            </h2>
            <p className="text-gray-600 mb-6">
              L&apos;établissement configure actuellement ses chambres. Veuillez
              réessayer dans quelques instants.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Besoin d&apos;aide ?</strong>
              </p>
              <p className="text-sm text-gray-600">
                Email: {config.contact.email}
                <br />
                Téléphone: {config.contact.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const availableRooms = await getAvailableRooms(hotel);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          {config.logo && (
            <img
              src={config.logo}
              alt={config.name}
              className="h-16 mx-auto mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {config.name}
          </h1>
          <p className="text-gray-600">
            Check-in tardif - Sélectionnez votre chambre
          </p>
        </div>

        {/* Contenu principal */}
        {availableRooms.length > 0 ? (
          <CheckinForm
            hotelSlug={hotel}
            hotelConfig={config}
            availableRooms={availableRooms}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Aucune chambre disponible
            </h2>
            <p className="text-gray-600 mb-6">
              Désolé, toutes nos chambres sont occupées pour ce soir.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Besoin d&apos;aide ?</strong>
              </p>
              <p className="text-sm text-gray-600">
                Email: {config.contact.email}
                <br />
                Téléphone: {config.contact.phone}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
