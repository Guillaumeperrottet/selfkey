import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { hotel: string; roomId: string } }
) {
  try {
    const { accessCode } = await request.json();
    const { roomId } = params;

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
