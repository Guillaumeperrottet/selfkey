import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableRooms } from "@/lib/availability";

interface Context {
  params: Promise<{
    hotel: string;
  }>;
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const { hotel } = await context.params;
    const { searchParams } = new URL(request.url);

    const checkInDate = searchParams.get("checkInDate");
    const checkOutDate = searchParams.get("checkOutDate");

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "checkInDate and checkOutDate are required" },
        { status: 400 }
      );
    }

    // Validation des dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: "La date de départ doit être après la date d'arrivée" },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: { id: true, maxBookingDays: true },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Obtenir les chambres disponibles
    const availableRooms = await getAvailableRooms(hotel, checkIn, checkOut);

    console.log("DEBUG: Available rooms count:", availableRooms.length);
    console.log("DEBUG: Available rooms:", availableRooms);

    return NextResponse.json({
      availableRooms,
      maxBookingDays: establishment.maxBookingDays,
      message:
        availableRooms.length === 0
          ? "Aucune chambre disponible pour cette période"
          : null,
    });
  } catch (error) {
    console.error("Error fetching room availability:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
