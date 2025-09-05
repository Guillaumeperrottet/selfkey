import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// API pour tester la mise à jour des informations de carte pour un établissement
export async function POST() {
  try {
    console.log("🔧 Test de mise à jour des informations de carte...");

    // Mettre à jour le premier établissement avec des informations personnalisées
    const result1 = await prisma.establishment.updateMany({
      where: {
        slug: "camping-des-alpes",
      },
      data: {
        mapTitle: "Camping Premium des Alpes",
        mapDescription:
          "Un magnifique camping au cœur des Alpes françaises avec vue sur le Mont-Blanc. Emplacements spacieux et services haut de gamme.",
        mapImage: "/background-selfcamp.jpg",
      },
    });

    // Mettre à jour un deuxième établissement avec une autre image
    const result2 = await prisma.establishment.updateMany({
      where: {
        slug: "parking-du-lac",
      },
      data: {
        mapTitle: "Parking du Lac Premium",
        mapDescription:
          "Parking sécurisé avec vue panoramique sur le lac d'Annecy. Accès facile au centre-ville et aux activités nautiques.",
        mapImage: "/totem.png",
      },
    });

    const totalUpdated = result1.count + result2.count;
    console.log(`✅ ${totalUpdated} établissement(s) mis à jour`);

    return NextResponse.json({
      success: true,
      message: "Informations de carte mises à jour avec succès",
      updated: totalUpdated,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour",
      },
      { status: 500 }
    );
  }
}
