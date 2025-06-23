import { NextRequest, NextResponse } from "next/server";
import { resetInventoryForTomorrow } from "@/lib/availability";
import { getHotelConfig } from "@/lib/hotel-config";

export async function POST(request: NextRequest) {
  try {
    const { hotelSlug } = await request.json();

    if (!hotelSlug) {
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

    await resetInventoryForTomorrow(hotelSlug);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API admin reset:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
