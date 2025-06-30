import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Récupérer les informations complètes d'un hôtel
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelSlug = searchParams.get("hotel");

    if (!hotelSlug) {
      return NextResponse.json({ error: "Slug hôtel requis" }, { status: 400 });
    }

    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotelSlug },
      include: {
        rooms: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
        bookings: {
          where: {
            bookingDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
            stripePaymentIntentId: { not: null },
          },
          include: {
            room: true,
          },
        },
      },
    });

    if (!establishment) {
      return NextResponse.json({ error: "Hôtel non trouvé" }, { status: 404 });
    }

    return NextResponse.json(establishment);
  } catch (error) {
    console.error("Erreur récupération info hôtel:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
