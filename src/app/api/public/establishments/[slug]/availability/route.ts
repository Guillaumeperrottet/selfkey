import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    // Récupérer l'établissement avec ses chambres
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      include: {
        rooms: {
          select: {
            id: true,
            name: true,
            isActive: true,
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

    // Compter les chambres actives
    const totalRooms = establishment.rooms.filter(
      (room) => room.isActive
    ).length;

    // Récupérer les réservations actives pour aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeBookings = await prisma.booking.count({
      where: {
        hotelSlug: slug,
        paymentStatus: "succeeded",
        OR: [
          // Réservations qui commencent aujourd'hui
          {
            checkInDate: {
              gte: today,
              lt: tomorrow,
            },
          },
          // Réservations en cours (commencées avant aujourd'hui, finissent après aujourd'hui)
          {
            AND: [
              {
                checkInDate: {
                  lt: today,
                },
              },
              {
                checkOutDate: {
                  gt: today,
                },
              },
            ],
          },
        ],
      },
    });

    const availableRooms = Math.max(0, totalRooms - activeBookings);

    // Calculer le pourcentage de disponibilité
    const availabilityPercentage =
      totalRooms > 0 ? (availableRooms / totalRooms) * 100 : 0;

    // Déterminer le statut
    let status: "available" | "limited" | "full";
    if (availableRooms === 0) {
      status = "full";
    } else if (availabilityPercentage <= 25) {
      status = "limited";
    } else {
      status = "available";
    }

    // Trouver la prochaine disponibilité si complet
    let nextAvailable: string | null = null;
    if (availableRooms === 0) {
      const nextCheckout = await prisma.booking.findFirst({
        where: {
          hotelSlug: slug,
          paymentStatus: "succeeded",
          checkOutDate: {
            gte: today,
          },
        },
        orderBy: {
          checkOutDate: "asc",
        },
      });

      if (nextCheckout) {
        nextAvailable = nextCheckout.checkOutDate.toLocaleDateString("fr-CH", {
          day: "2-digit",
          month: "2-digit",
        });
      }
    }

    return NextResponse.json({
      establishmentSlug: slug,
      totalRooms,
      availableRooms,
      occupiedRooms: activeBookings,
      availabilityPercentage: Math.round(availabilityPercentage),
      status,
      nextAvailable,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la disponibilité:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
