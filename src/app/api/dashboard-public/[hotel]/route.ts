import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API endpoint pour récupérer les données du dashboard public
 * Permet le rafraîchissement automatique sans recharger toute la page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel: hotelSlug } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // Vérifier le token d'accès
    const expectedToken = `${hotelSlug}-dashboard-public-2025`;
    if (!token || token !== expectedToken) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotelSlug },
      include: {
        rooms: {
          orderBy: { name: "asc" },
        },
        bookings: {
          where: {
            paymentStatus: "succeeded",
          },
          orderBy: { bookingDate: "desc" },
          include: {
            room: true,
          },
        },
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Anonymiser les données des réservations pour la version publique
    const anonymizedBookings = establishment.bookings.map((booking) => ({
      id: booking.id,
      bookingDate: booking.bookingDate,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      guests: booking.guests,
      amount: booking.amount,
      touristTaxTotal: booking.touristTaxTotal,
      paymentStatus: booking.paymentStatus,
      bookingType: booking.bookingType,
      adults: booking.adults,
      children: booking.children,
      room: booking.room
        ? {
            id: booking.room.id,
            name: booking.room.name,
            price: booking.room.price,
          }
        : null,
    }));

    return NextResponse.json({
      establishment: {
        name: establishment.name,
        slug: establishment.slug,
        commissionRate: establishment.commissionRate,
        fixedFee: establishment.fixedFee,
      },
      rooms: establishment.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        price: room.price,
        isActive: room.isActive,
      })),
      bookings: anonymizedBookings,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching public dashboard data:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
