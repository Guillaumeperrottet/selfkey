import { NextRequest, NextResponse } from "next/server";
import { createRoom, getRoomsForHotel } from "@/lib/room-management";

export async function POST(request: NextRequest) {
  try {
    const { hotelSlug, name, price } = await request.json();

    if (!hotelSlug || !name || !price) {
      return NextResponse.json(
        { error: "Données manquantes (hotelSlug, name, price requis)" },
        { status: 400 }
      );
    }

    // Validation du prix
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json(
        { error: "Le prix doit être un nombre positif" },
        { status: 400 }
      );
    }

    // Validation du nom
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "Le nom de la chambre doit contenir au moins 2 caractères" },
        { status: 400 }
      );
    }

    const room = await createRoom(hotelSlug, {
      name: name.trim(),
      price: numPrice,
    });

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Erreur création chambre:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelSlug = searchParams.get("hotel");

    if (!hotelSlug) {
      return NextResponse.json({ error: "Slug hôtel requis" }, { status: 400 });
    }

    const rooms = await getRoomsForHotel(hotelSlug);

    return NextResponse.json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error("Erreur récupération chambres:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
