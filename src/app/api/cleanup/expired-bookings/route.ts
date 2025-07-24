import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Vérifier un token simple pour sécuriser cette API
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CLEANUP_API_TOKEN || "cleanup-secret";

    if (!authHeader || !authHeader.includes(expectedToken)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Supprimer les réservations non payées depuis plus de 2 heures
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const expiredBookings = await prisma.booking.findMany({
      where: {
        paymentStatus: "pending",
        bookingDate: {
          lt: twoHoursAgo,
        },
      },
      select: {
        id: true,
        hotelSlug: true,
        clientEmail: true,
        room: {
          select: {
            name: true,
          },
        },
      },
    });

    if (expiredBookings.length > 0) {
      // Supprimer les réservations expirées
      const deletedCount = await prisma.booking.deleteMany({
        where: {
          id: {
            in: expiredBookings.map((b) => b.id),
          },
        },
      });

      console.log(
        `🧹 Supprimé ${deletedCount.count} réservations expirées:`,
        expiredBookings.map((b) => `${b.id} (${b.clientEmail})`)
      );

      return NextResponse.json({
        success: true,
        cleanedCount: deletedCount.count,
        expiredBookings: expiredBookings.map((b) => ({
          id: b.id,
          hotel: b.hotelSlug,
          room: b.room ? b.room.name : "Parking jour",
          email: b.clientEmail,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      cleanedCount: 0,
      message: "Aucune réservation expirée trouvée",
    });
  } catch (error) {
    console.error("Erreur lors du nettoyage:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// GET pour vérifier les réservations expirées sans les supprimer
export async function GET() {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const expiredBookings = await prisma.booking.findMany({
      where: {
        paymentStatus: "pending",
        bookingDate: {
          lt: twoHoursAgo,
        },
      },
      select: {
        id: true,
        hotelSlug: true,
        clientEmail: true,
        bookingDate: true,
        room: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      count: expiredBookings.length,
      expiredBookings: expiredBookings.map((b) => ({
        id: b.id,
        hotel: b.hotelSlug,
        room: b.room ? b.room.name : "Parking jour",
        email: b.clientEmail,
        createdAt: b.bookingDate,
        expiredMinutes: Math.floor(
          (Date.now() - b.bookingDate.getTime()) / (1000 * 60)
        ),
      })),
    });
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
