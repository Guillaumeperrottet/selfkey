import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ParkingControlData {
  id: string;
  vehicleNumber: string;
  duration: string;
  startTime: Date;
  endTime: Date;
  status: "active" | "expired" | "ending_soon";
  timeRemaining?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // Vérification du token simple pour sécuriser l'accès
    const expectedToken = `${hotel}-parking-control-2025`;
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: { name: true, enableDayParking: true },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    if (!establishment.enableDayParking) {
      return NextResponse.json(
        {
          error: "Le parking jour n'est pas activé pour cet établissement",
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Récupérer les réservations parking du jour avec uniquement les données nécessaires
    const bookings = await prisma.booking.findMany({
      where: {
        hotelSlug: hotel,
        bookingType: "day_parking",
        paymentStatus: "succeeded",
        dayParkingStartTime: {
          gte: today,
          lt: tomorrow,
        },
        clientVehicleNumber: {
          not: null,
        },
      },
      select: {
        id: true,
        clientVehicleNumber: true,
        dayParkingDuration: true,
        dayParkingStartTime: true,
        dayParkingEndTime: true,
      },
      orderBy: {
        dayParkingEndTime: "asc",
      },
    });

    // Traiter les données pour le contrôle
    const parkingData: ParkingControlData[] = bookings
      .filter(
        (booking) =>
          booking.clientVehicleNumber &&
          booking.dayParkingStartTime &&
          booking.dayParkingEndTime
      )
      .map((booking) => {
        const endTime = booking.dayParkingEndTime!;
        const timeDiff = endTime.getTime() - now.getTime();
        const hoursRemaining = Math.ceil(timeDiff / (1000 * 60 * 60));
        const minutesRemaining = Math.ceil(timeDiff / (1000 * 60));

        let status: "active" | "expired" | "ending_soon";
        let timeRemaining: string;

        if (timeDiff <= 0) {
          status = "expired";
          timeRemaining = "Expiré";
        } else if (hoursRemaining <= 1) {
          status = "ending_soon";
          timeRemaining = `${minutesRemaining} min`;
        } else {
          status = "active";
          timeRemaining = `${hoursRemaining}h`;
        }

        return {
          id: booking.id,
          vehicleNumber: booking.clientVehicleNumber!,
          duration: booking.dayParkingDuration || "Inconnue",
          startTime: booking.dayParkingStartTime!,
          endTime: endTime,
          status,
          timeRemaining,
        };
      });

    // Statistiques pour l'affichage
    const stats = {
      total: parkingData.length,
      active: parkingData.filter((p) => p.status === "active").length,
      endingSoon: parkingData.filter((p) => p.status === "ending_soon").length,
      expired: parkingData.filter((p) => p.status === "expired").length,
    };

    return NextResponse.json({
      success: true,
      establishmentName: establishment.name,
      data: parkingData,
      stats,
      lastUpdated: now.toISOString(),
    });
  } catch (error) {
    console.error("Erreur API parking control:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
