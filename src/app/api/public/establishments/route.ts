import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const establishments = await prisma.establishment.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        showOnMap: true, // Afficher seulement les établissements qui le souhaitent
      },
      select: {
        id: true,
        slug: true,
        name: true,
        address: true,
        city: true,
        country: true,
        latitude: true,
        longitude: true,
        mapTitle: true,
        mapDescription: true,
        mapImage: true,
        isPubliclyVisible: true,
      },
    });

    const formattedEstablishments = establishments.map((establishment) => ({
      id: establishment.id,
      slug: establishment.slug,
      name: establishment.mapTitle || establishment.name, // Utiliser le titre personnalisé ou le nom par défaut
      location: `${establishment.city}, ${establishment.country}`,
      latitude: establishment.latitude,
      longitude: establishment.longitude,
      address: establishment.address,
      type: "camping",
      amenities: ["wifi", "parking"], // À personnaliser selon vos données
      description:
        establishment.mapDescription ||
        `Emplacement de camping à ${establishment.city}`, // Description personnalisée ou par défaut
      image: establishment.mapImage || "/background-selfcamp.jpg", // Image personnalisée ou par défaut
      isPubliclyVisible: establishment.isPubliclyVisible || false,
    }));

    return NextResponse.json(formattedEstablishments);
  } catch (error) {
    console.error("Erreur lors de la récupération des établissements:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
