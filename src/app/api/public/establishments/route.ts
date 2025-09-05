import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const establishments = await prisma.establishment.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
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
        rooms: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    const formattedEstablishments = establishments.map((establishment) => ({
      id: establishment.id,
      slug: establishment.slug,
      name: establishment.name,
      location: `${establishment.city}, ${establishment.country}`,
      latitude: establishment.latitude,
      longitude: establishment.longitude,
      address: establishment.address,
      price:
        establishment.rooms.length > 0
          ? `${Math.min(...establishment.rooms.map((r) => r.price))} CHF/nuit`
          : "Prix sur demande",
      type: "camping",
      amenities: ["wifi", "parking"], // À personnaliser selon vos données
      description: `Emplacement de camping à ${establishment.city}`,
      image: "/background-selfcamp.jpg", // Image par défaut
      rating: 4.5, // À implémenter avec un système de reviews
      reviews: Math.floor(Math.random() * 200) + 50, // Temporaire
    }));

    return NextResponse.json(formattedEstablishments);
  } catch (error) {
    console.error("Erreur lors de la récupération des établissements:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
