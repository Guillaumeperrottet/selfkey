import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotelSlug, roomId, clientName, clientEmail, phone, amount } = body;

    // Validation des données
    if (
      !hotelSlug ||
      !roomId ||
      !clientName ||
      !clientEmail ||
      !phone ||
      !amount
    ) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Vérifier que l'hôtel existe
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotelSlug },
    });
    if (!establishment) {
      return NextResponse.json({ error: "Hôtel non trouvé" }, { status: 404 });
    }

    // Vérifier que la chambre existe dans la base de données
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        hotelSlug,
        isActive: true,
      },
    });
    if (!room) {
      return NextResponse.json(
        { error: "Chambre non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que le prix correspond
    if (amount !== room.price) {
      return NextResponse.json({ error: "Prix incorrect" }, { status: 400 });
    }

    // Créer la réservation
    const booking = await createBooking(hotelSlug, {
      roomId,
      clientName,
      clientEmail,
      phone,
      amount,
    });

    return NextResponse.json({ bookingId: booking.id });
  } catch (error) {
    console.error("Erreur API booking:", error);

    if (error instanceof Error && error.message === "Chambre non disponible") {
      return NextResponse.json(
        { error: "Cette chambre n'est plus disponible" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
