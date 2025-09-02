import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string; roomId: string }> }
) {
  try {
    const { accessCode } = await request.json();
    const { hotel, roomId } = await params;

    console.log(
      `Tentative de mise à jour du code d'accès pour la chambre ${roomId} de l'hôtel ${hotel}`
    );

    // Vérifier d'abord que la chambre existe et appartient au bon hôtel
    const existingRoom = await prisma.room.findFirst({
      where: {
        id: roomId,
        hotelSlug: hotel,
      },
    });

    if (!existingRoom) {
      console.log(`Chambre non trouvée: ID=${roomId}, Hotel=${hotel}`);

      // Cherchons toutes les chambres de cet hôtel pour diagnostiquer
      const allRooms = await prisma.room.findMany({
        where: { hotelSlug: hotel },
        select: { id: true, name: true },
      });

      console.log(`Chambres existantes pour ${hotel}:`, allRooms);

      return NextResponse.json(
        { error: "Chambre non trouvée" },
        { status: 404 }
      );
    }

    console.log(
      `Chambre trouvée: ${existingRoom.name}, mise à jour du code d'accès`
    );

    // Mettre à jour le code d'accès
    const room = await prisma.room.update({
      where: { id: roomId },
      data: { accessCode },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du code de la chambre:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
