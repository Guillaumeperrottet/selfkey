import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Récupérer tous les établissements qui ont autorisé l'affichage sur la carte
    // et qui ont des coordonnées GPS valides
    const establishments = await prisma.establishment.findMany({
      where: {
        showOnMap: true,
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
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
        postalCode: true,
        country: true,
        latitude: true,
        longitude: true,
        isPubliclyVisible: true,
      },
    });

    // Formatter les données pour le composant map
    const formattedEstablishments = establishments.map((establishment) => ({
      id: establishment.id,
      name: establishment.mapTitle || establishment.name,
      description:
        establishment.mapDescription ||
        `${establishment.address ? establishment.address + ", " : ""}${establishment.city || ""}`,
      location: `${establishment.city || ""}, ${establishment.country || "Switzerland"}`,
      latitude: establishment.latitude!,
      longitude: establishment.longitude!,
      type: "camping", // ou autre type selon votre logique
      price: "", // Vous pouvez ajouter la logique de prix si nécessaire
      image: establishment.mapImage,
      slug: establishment.slug,
      isPubliclyVisible: establishment.isPubliclyVisible,
    }));

    return NextResponse.json({
      success: true,
      establishments: formattedEstablishments,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des établissements:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des établissements",
      },
      { status: 500 }
    );
  }
}
