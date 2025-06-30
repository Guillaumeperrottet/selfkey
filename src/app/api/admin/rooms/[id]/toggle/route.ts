import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // Mettre à jour le statut de la chambre
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la chambre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la chambre" },
      { status: 500 }
    );
  }
}
