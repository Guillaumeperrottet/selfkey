import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const testData = [
  {
    name: "Camping des Alpes",
    slug: "camping-des-alpes",
    address: "123 Route des Alpes",
    city: "Chamonix",
    postalCode: "74400",
    country: "France",
    latitude: 45.9237,
    longitude: 6.8694,
  },
  {
    name: "Parking du Lac",
    slug: "parking-du-lac",
    address: "456 Avenue du Lac",
    city: "Annecy",
    postalCode: "74000",
    country: "France",
    latitude: 45.8992,
    longitude: 6.1294,
  },
  {
    name: "Aire de Repos Montagne",
    slug: "aire-repos-montagne",
    address: "789 Chemin de la Montagne",
    city: "Grenoble",
    postalCode: "38000",
    country: "France",
    latitude: 45.1885,
    longitude: 5.7245,
  },
];

export async function POST() {
  try {
    console.log("🔧 Ajout de données de test pour la localisation...");

    for (const data of testData) {
      await prisma.establishment.upsert({
        where: { slug: data.slug },
        update: {
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
          latitude: data.latitude,
          longitude: data.longitude,
        },
        create: {
          name: data.name,
          slug: data.slug,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
          latitude: data.latitude,
          longitude: data.longitude,
          commissionRate: 0.05,
          fixedFee: 2.5,
        },
      });
      console.log(`✅ Établissement ${data.name} ajouté/mis à jour`);
    }

    return NextResponse.json({
      success: true,
      message: "Données de test ajoutées avec succès",
      count: testData.length,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout des données de test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'ajout des données de test",
      },
      { status: 500 }
    );
  }
}
