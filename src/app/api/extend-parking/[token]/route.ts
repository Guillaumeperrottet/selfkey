import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Fonction pour générer/vérifier le token sécurisé
function generateExtensionToken(bookingId: string): string {
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`extend-${bookingId}`)
    .digest("hex")
    .substring(0, 32);
}

function verifyExtensionToken(token: string, bookingId: string): boolean {
  return generateExtensionToken(bookingId) === token;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Rechercher la réservation par token
    const bookings = await prisma.booking.findMany({
      where: {
        bookingType: "day_parking",
        paymentStatus: "succeeded",
        dayParkingEndTime: { not: null },
      },
      select: {
        id: true,
        clientEmail: true,
        clientVehicleNumber: true,
        dayParkingDuration: true,
        dayParkingStartTime: true,
        dayParkingEndTime: true,
        hotelSlug: true,
        establishment: {
          select: {
            name: true,
            enableDayParking: true,
          },
        },
      },
    });

    // Trouver la réservation correspondant au token
    const booking = bookings.find((b) => verifyExtensionToken(token, b.id));

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée ou token invalide" },
        { status: 404 }
      );
    }

    if (!booking.establishment.enableDayParking) {
      return NextResponse.json(
        { error: "Extension non disponible pour cet établissement" },
        { status: 400 }
      );
    }

    // Vérifier que la réservation n'est pas trop ancienne (24h après fin prévue)
    const now = new Date();
    const maxExtensionTime = new Date(booking.dayParkingEndTime!);
    maxExtensionTime.setHours(maxExtensionTime.getHours() + 24);

    if (now > maxExtensionTime) {
      return NextResponse.json(
        { error: "Cette réservation ne peut plus être étendue" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        vehicleNumber: booking.clientVehicleNumber,
        currentDuration: booking.dayParkingDuration,
        startTime: booking.dayParkingStartTime,
        endTime: booking.dayParkingEndTime,
        establishmentName: booking.establishment.name,
        hotelSlug: booking.hotelSlug,
      },
    });
  } catch (error) {
    console.error("Erreur GET extend-parking:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { extensionHours } = await request.json();

    if (!extensionHours || extensionHours < 1 || extensionHours > 12) {
      return NextResponse.json(
        { error: "Extension invalide (1-12 heures)" },
        { status: 400 }
      );
    }

    // Rechercher la réservation par token
    const bookings = await prisma.booking.findMany({
      where: {
        bookingType: "day_parking",
        paymentStatus: "succeeded",
        dayParkingEndTime: { not: null },
      },
      select: {
        id: true,
        dayParkingEndTime: true,
        establishment: {
          select: {
            enableDayParking: true,
          },
        },
      },
    });

    const booking = bookings.find((b) => verifyExtensionToken(token, b.id));

    if (!booking || !booking.establishment.enableDayParking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Calculer la nouvelle heure de fin
    const currentEndTime = new Date(booking.dayParkingEndTime!);
    const newEndTime = new Date(currentEndTime);
    newEndTime.setHours(newEndTime.getHours() + extensionHours);

    // Mettre à jour la réservation
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        dayParkingEndTime: newEndTime,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Parking étendu de ${extensionHours}h`,
      newEndTime: newEndTime.toISOString(),
    });
  } catch (error) {
    console.error("Erreur POST extend-parking:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Export de la fonction utilitaire pour l'utiliser dans les emails
export { generateExtensionToken };
