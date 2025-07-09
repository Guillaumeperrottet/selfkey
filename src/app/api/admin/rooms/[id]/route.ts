import { NextRequest, NextResponse } from "next/server";
import { updateRoom, deleteRoom, getRoomById } from "@/lib/room-management";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

interface UpdateRoomData {
  name?: string;
  price?: number;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { name, price } = await request.json();
    const { id: roomId } = await params;

    const updateData: UpdateRoomData = {};

    if (name !== undefined) {
      if (name.trim().length < 2) {
        return NextResponse.json(
          { error: "Le nom de la chambre doit contenir au moins 2 caractères" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (price !== undefined) {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return NextResponse.json(
          { error: "Le prix doit être un nombre positif" },
          { status: 400 }
        );
      }
      updateData.price = numPrice;
    }

    const room = await updateRoom(roomId, updateData);

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Erreur mise à jour chambre:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id: roomId } = await params;

    const room = await deleteRoom(roomId);

    return NextResponse.json({
      success: true,
      message: "Place supprimée définitivement",
      room,
    });
  } catch (error) {
    console.error("Erreur suppression chambre:", error);

    if (error instanceof Error) {
      if (error.message.includes("réservations existantes")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes("Record to delete does not exist")) {
        return NextResponse.json(
          { error: "Place non trouvée" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id: roomId } = await params;
    const room = await getRoomById(roomId);

    if (!room) {
      return NextResponse.json(
        { error: "Chambre non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Erreur récupération chambre:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
