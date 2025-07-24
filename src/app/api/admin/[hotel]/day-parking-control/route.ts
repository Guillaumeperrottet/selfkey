import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur a accès à cet établissement
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: { id: true },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement introuvable" },
        { status: 404 }
      );
    }

    // Construire les filtres de date
    let dateFilter = {};
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      dateFilter = {
        dayParkingStartTime: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      };
    }

    // Récupérer les réservations parking jour
    const bookings = await prisma.booking.findMany({
      where: {
        establishment: {
          slug: hotel,
        },
        bookingType: "day",
        ...dateFilter,
      },
      select: {
        id: true,
        clientFirstName: true,
        clientLastName: true,
        clientEmail: true,
        clientPhone: true,
        clientVehicleNumber: true,
        dayParkingDuration: true,
        dayParkingStartTime: true,
        dayParkingEndTime: true,
        amount: true,
        paymentStatus: true,
        bookingDate: true,
        emailConfirmation: true,
      },
      orderBy: [{ dayParkingStartTime: "desc" }, { bookingDate: "desc" }],
    });

    // Formater les données pour le frontend
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      clientFirstName: booking.clientFirstName,
      clientLastName: booking.clientLastName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      clientVehicleNumber: booking.clientVehicleNumber || "Non renseigné",
      dayParkingDuration: booking.dayParkingDuration || "1h",
      dayParkingStartTime: booking.dayParkingStartTime?.toISOString() || "",
      dayParkingEndTime: booking.dayParkingEndTime?.toISOString() || "",
      amount: booking.amount || 0,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.bookingDate.toISOString(),
      emailConfirmation: booking.emailConfirmation || false,
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      count: formattedBookings.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
