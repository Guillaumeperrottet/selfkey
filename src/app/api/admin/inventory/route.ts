import { NextRequest, NextResponse } from "next/server";
import { updateInventory } from "@/lib/availability";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { hotelSlug, inventory } = await request.json();

    if (!hotelSlug || !inventory) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Vérifier que l'hôtel existe dans la base de données
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotelSlug },
      include: {
        rooms: {
          where: { isActive: true },
        },
      },
    });

    if (!establishment) {
      return NextResponse.json({ error: "Hôtel non trouvé" }, { status: 404 });
    }

    // Mettre à jour l'inventaire pour chaque chambre
    const updatePromises = Object.entries(inventory).map(
      ([roomId, quantity]) => {
        // Vérifier que la chambre existe dans la base de données
        const room = establishment.rooms.find((r) => r.id === roomId);
        if (!room) {
          throw new Error(`Chambre ${roomId} non trouvée`);
        }

        return updateInventory(hotelSlug, roomId, quantity as number);
      }
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API admin inventory:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
