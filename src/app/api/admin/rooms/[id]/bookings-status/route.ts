import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id: roomId } = await params;

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Vérifier les réservations actives (en cours aujourd'hui)
    const activeBookings = await prisma.booking.findMany({
      where: {
        roomId,
        stripePaymentIntentId: { not: null }, // Seulement les réservations confirmées
        AND: [{ checkInDate: { lte: today } }, { checkOutDate: { gt: today } }],
      },
      select: {
        checkOutDate: true,
      },
      orderBy: {
        checkOutDate: "asc",
      },
      take: 1,
    });

    // Vérifier les réservations futures
    const futureBookings = await prisma.booking.findMany({
      where: {
        roomId,
        stripePaymentIntentId: { not: null }, // Seulement les réservations confirmées
        checkInDate: { gt: today },
      },
      select: {
        checkInDate: true,
      },
      orderBy: {
        checkInDate: "asc",
      },
      take: 1,
    });

    const hasActiveBookings = activeBookings.length > 0;
    const hasFutureBookings = futureBookings.length > 0;

    return NextResponse.json({
      id: roomId,
      hasActiveBookings,
      hasFutureBookings,
      currentBookingEndDate: hasActiveBookings
        ? activeBookings[0].checkOutDate.toISOString()
        : undefined,
      nextBookingDate: hasFutureBookings
        ? futureBookings[0].checkInDate.toISOString()
        : undefined,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification des réservations:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
