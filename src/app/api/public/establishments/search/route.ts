import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface GeocodingResult {
  display_name: string;
  lat: number;
  lon: number;
  type: string;
  class: string;
}

interface SearchResult {
  id: string;
  type: "establishment" | "location";
  title: string;
  subtitle?: string | null;
  icon: "location" | "map" | "recent";
  establishment?: {
    slug: string;
    name: string;
    mapTitle?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    mapImage?: string | null;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// API de géocodage simple pour les villes/pays
async function geocodeLocation(location: string): Promise<GeocodingResult[]> {
  try {
    // Recherche prioritaire en Suisse
    const urlCH = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=10&countrycodes=ch&accept-language=fr&addressdetails=1`;

    // Recherche dans les autres pays si pas assez de résultats en Suisse
    const urlOther = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=5&countrycodes=fr,it,de,at&accept-language=fr&addressdetails=1`;

    console.log("Geocoding URL (CH):", urlCH);

    // Recherche d'abord en Suisse
    const responseCH = await fetch(urlCH, {
      headers: {
        "User-Agent": "SelfCamp/1.0 (contact@selfcamp.ch)",
        Accept: "application/json",
      },
    });

    if (!responseCH.ok) {
      console.error(
        "Nominatim API error:",
        responseCH.status,
        responseCH.statusText
      );
      return [];
    }

    let allData = (await responseCH.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
      type: string;
      class: string;
      address?: {
        town?: string;
        city?: string;
        village?: string;
        municipality?: string;
        county?: string;
        state?: string;
        country?: string;
        postcode?: string;
      };
    }>;

    // Si moins de 3 résultats suisses, ajouter les autres pays
    if (allData.length < 3) {
      const responseOther = await fetch(urlOther, {
        headers: {
          "User-Agent": "SelfCamp/1.0 (contact@selfcamp.ch)",
          Accept: "application/json",
        },
      });

      if (responseOther.ok) {
        const otherData = await responseOther.json();
        allData = [...allData, ...otherData];
      }
    }

    console.log("Geocoding results:", allData);

    return allData.slice(0, 5).map((item) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
      class: item.class,
    }));
  } catch (error) {
    console.error("Erreur géocodage:", error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = query.trim().toLowerCase();
    const allResults: SearchResult[] = [];

    // 1. PRIORITÉ AUX LIEUX GÉOGRAPHIQUES (comme Park4night)
    try {
      const geocodingResults = await geocodeLocation(searchTerm);
      console.log(
        `Found ${geocodingResults.length} geocoding results for "${searchTerm}"`
      );

      geocodingResults.forEach((location) => {
        // Extraire le nom principal et la localisation
        const parts = location.display_name.split(",");
        const mainName = parts[0].trim();
        const locationInfo = parts.slice(1).join(",").trim();

        allResults.push({
          id: `location-${location.lat}-${location.lon}`,
          type: "location",
          title: mainName,
          subtitle: locationInfo,
          icon: "map",
          coordinates: {
            lat: location.lat,
            lng: location.lon,
          },
        });
      });
    } catch (error) {
      console.error("Erreur lors du géocodage:", error);
    }

    // 2. Rechercher dans les établissements seulement si très peu de résultats géographiques
    if (allResults.length < 2) {
      const establishments = await prisma.establishment.findMany({
        where: {
          showOnMap: true,
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              mapTitle: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              mapDescription: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              address: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              city: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              country: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
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
        take: 3, // Limiter les établissements
        orderBy: [
          {
            name: "asc",
          },
        ],
      });

      // Ajouter les établissements aux résultats
      establishments.forEach((establishment) => {
        const location = [establishment.city, establishment.country]
          .filter(Boolean)
          .join(", ");

        const displayName = establishment.mapTitle || establishment.name;

        allResults.push({
          id: establishment.slug,
          type: "establishment",
          title: displayName,
          subtitle: location || establishment.address,
          icon: "location",
          establishment: {
            slug: establishment.slug,
            name: establishment.name,
            mapTitle: establishment.mapTitle,
            address: establishment.address,
            city: establishment.city,
            country: establishment.country,
            latitude: establishment.latitude,
            longitude: establishment.longitude,
            mapImage: establishment.mapImage,
          },
        });
      });
    }

    return NextResponse.json(allResults.slice(0, 6)); // Limiter à 6 résultats au total
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
