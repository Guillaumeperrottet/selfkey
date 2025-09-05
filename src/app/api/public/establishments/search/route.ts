import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = query.trim().toLowerCase();

    // Rechercher dans les établissements avec geolocation
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
      take: 10, // Limiter les résultats
      orderBy: [
        {
          name: "asc",
        },
      ],
    });

    // Formater les résultats pour l'autocomplétion
    const results = establishments.map((establishment) => {
      const location = [establishment.city, establishment.country]
        .filter(Boolean)
        .join(", ");

      const displayName = establishment.mapTitle || establishment.name;

      return {
        id: establishment.slug,
        type: "location",
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
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Erreur lors de la recherche d'établissements:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
