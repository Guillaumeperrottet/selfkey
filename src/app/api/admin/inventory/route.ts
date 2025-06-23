import { NextRequest, NextResponse } from "next/server";
import { updateInventory } from "@/lib/availability";
import { getHotelConfig } from "@/lib/hotel-config";

export async function POST(request: NextRequest) {
  try {
    const { hotelSlug, inventory } = await request.json();

    if (!hotelSlug || !inventory) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Vérifier que l'hôtel existe
    const hotelConfig = await getHotelConfig(hotelSlug);
    if (!hotelConfig) {
      return NextResponse.json({ error: "Hôtel non trouvé" }, { status: 404 });
    }

    // Mettre à jour l'inventaire pour chaque chambre
    const updatePromises = Object.entries(inventory).map(
      ([roomId, quantity]) => {
        // Vérifier que la chambre existe dans la config
        const room = hotelConfig.rooms.find((r) => r.id === roomId);
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
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
