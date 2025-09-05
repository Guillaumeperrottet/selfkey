import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fonction pour calculer la distance entre deux points (formule de Haversine)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius") || "50"; // Rayon par défaut 50km

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude et longitude requises" },
        { status: 400 }
      );
    }

    const centerLat = parseFloat(lat);
    const centerLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    if (isNaN(centerLat) || isNaN(centerLng) || isNaN(radiusKm)) {
      return NextResponse.json(
        { error: "Coordonnées invalides" },
        { status: 400 }
      );
    }

    // Récupérer tous les établissements avec geolocation
    const establishments = await prisma.establishment.findMany({
      where: {
        showOnMap: true,
        AND: [
          {
            latitude: {
              not: null,
            },
          },
          {
            longitude: {
              not: null,
            },
          },
        ],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        mapTitle: true,
        mapDescription: true,
        mapImage: true,
        address: true,
        city: true,
        country: true,
        latitude: true,
        longitude: true,
      },
    });

    // Filtrer par distance
    const nearbyEstablishments = establishments
      .filter((establishment) => {
        if (!establishment.latitude || !establishment.longitude) return false;

        const distance = calculateDistance(
          centerLat,
          centerLng,
          establishment.latitude,
          establishment.longitude
        );

        return distance <= radiusKm;
      })
      .map((establishment) => {
        const distance = calculateDistance(
          centerLat,
          centerLng,
          establishment.latitude!,
          establishment.longitude!
        );

        return {
          ...establishment,
          distance: Math.round(distance * 10) / 10, // Arrondir à 1 décimale
        };
      })
      .sort((a, b) => a.distance - b.distance); // Trier par distance

    return NextResponse.json(nearbyEstablishments);
  } catch (error) {
    console.error("Erreur lors de la recherche dans la zone:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
