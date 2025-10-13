import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authenticateApiKey,
  hasPermission,
  logApiRequest,
} from "@/lib/api/auth";

interface RouteParams {
  params: Promise<{
    bookingId: string;
  }>;
}

/**
 * GET /api/v1/bookings/:bookingId
 * Récupère tous les détails d'une réservation confirmée et payée
 *
 * Retourne TOUS les champs de la réservation + relations (room, establishment)
 * Note: Seules les réservations avec paymentStatus='succeeded' sont accessibles
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  const { bookingId } = await params;

  try {
    // Authentification
    const apiKey = await authenticateApiKey(request);
    if (!apiKey) {
      await logApiRequest(
        "anonymous",
        `/api/v1/bookings/${bookingId}`,
        "GET",
        401,
        request,
        Date.now() - startTime
      );
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing API key" },
        { status: 401 }
      );
    }

    // Récupérer la réservation avec toutes les relations
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        paymentStatus: "succeeded", // ✅ Filtrer automatiquement uniquement les paiements réussis
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            price: true,
            accessCode: true,
            allowDogs: true,
            hotelSlug: true,
            isActive: true,
          },
        },
        establishment: {
          select: {
            id: true,
            slug: true,
            name: true,
            address: true,
            city: true,
            postalCode: true,
            country: true,
            latitude: true,
            longitude: true,
            hotelContactEmail: true,
            hotelContactPhone: true,
            touristTaxAmount: true,
            touristTaxEnabled: true,
            commissionRate: true,
            fixedFee: true,
            billingCompanyName: true,
            billingAddress: true,
            billingCity: true,
            billingPostalCode: true,
            billingCountry: true,
            vatNumber: true,
          },
        },
        invoice: {
          select: {
            id: true,
            filename: true,
            generatedAt: true,
          },
        },
      },
    });

    if (!booking) {
      await logApiRequest(
        apiKey.id,
        `/api/v1/bookings/${bookingId}`,
        "GET",
        404,
        request,
        Date.now() - startTime
      );
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Vérifier les permissions (accès à l'établissement)
    if (!hasPermission(apiKey, "bookings", "read", booking.hotelSlug)) {
      await logApiRequest(
        apiKey.id,
        `/api/v1/bookings/${bookingId}`,
        "GET",
        403,
        request,
        Date.now() - startTime
      );
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this establishment" },
        { status: 403 }
      );
    }

    // Logger la requête réussie
    await logApiRequest(
      apiKey.id,
      `/api/v1/bookings/${bookingId}`,
      "GET",
      200,
      request,
      Date.now() - startTime
    );

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error(`Error in GET /api/v1/bookings/${bookingId}:`, error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
