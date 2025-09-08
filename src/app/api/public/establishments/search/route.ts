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
    lon: number;
  };
}

// API de géocodage simple pour les villes/pays
async function geocodeLocation(location: string): Promise<GeocodingResult[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=5&countrycodes=ch,fr,it,de,at,es,be,nl&accept-language=fr&addressdetails=1`;

    console.log("Geocoding URL:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "SelfCamp/1.0 (contact@selfcamp.ch)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Nominatim API error:",
        response.status,
        response.statusText
      );
      return [];
    }

    const data = (await response.json()) as Array<{
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

    console.log("Geocoding results:", data);

    return data.map((item) => ({
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
            lon: location.lon,
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
