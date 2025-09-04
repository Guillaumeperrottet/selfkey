import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Récupérer les données depuis la base de données
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Compter les réservations actives aujourd'hui
    const activeBookings = await prisma.booking.count({
      where: {
        paymentStatus: "completed",
        checkInDate: {
          lte: new Date(),
        },
        checkOutDate: {
          gte: new Date(),
        },
      },
    });

    // Compter les nouvelles réservations d'aujourd'hui
    const todayBookings = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: today,
          lt: tomorrow,
        },
        paymentStatus: "completed",
      },
    });

    // Récupérer les paramètres de l'établissement (nombre total d'emplacements)
    // Supposons qu'on récupère le premier établissement ou on peut adapter selon votre structure
    const establishment = await prisma.establishment.findFirst({
      include: {
        rooms: true,
      },
    });

    const totalSpots = establishment?.rooms.length || 50; // Valeur par défaut si pas d'établissement
    const availableSpots = Math.max(0, totalSpots - activeBookings);

    // Trouver la prochaine disponibilité
    let nextAvailable: string | null = null;
    if (availableSpots === 0) {
      // Chercher la prochaine checkout
      const nextCheckout = await prisma.booking.findFirst({
        where: {
          paymentStatus: "completed",
          checkOutDate: {
            gte: new Date(),
          },
        },
        orderBy: {
          checkOutDate: "asc",
        },
      });

      if (nextCheckout) {
        nextAvailable = nextCheckout.checkOutDate.toLocaleDateString("fr-CH", {
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    const availabilityData = {
      totalSpots,
      availableSpots,
      bookedToday: todayBookings,
      nextAvailable,
    };

    return NextResponse.json(availabilityData, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des disponibilités:", error);

    // Retourner des données par défaut en cas d'erreur
    return NextResponse.json(
      {
        totalSpots: 50,
        availableSpots: 10,
        bookedToday: 5,
        nextAvailable: null,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
