import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authenticateApiKey,
  hasPermission,
  logApiRequest,
} from "@/lib/api/auth";

/**
 * GET /api/v1/bookings
 * Récupère la liste des réservations confirmées et payées
 *
 * Query params:
 * - establishmentSlug: Filtrer par établissement (obligatoire si la clé n'est pas limitée)
 * - startDate: Date de début (ISO 8601)
 * - endDate: Date de fin (ISO 8601)
 * - limit: Nombre max de résultats (défaut: 100, max: 1000)
 * - offset: Pagination (défaut: 0)
 *
 * Note: Seules les réservations avec paymentStatus='succeeded' sont retournées
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentification
    const apiKey = await authenticateApiKey(request);
    if (!apiKey) {
      await logApiRequest(
        null,
        "/api/v1/bookings",
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

    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const establishmentSlug =
      searchParams.get("establishmentSlug") || apiKey.establishmentSlug;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 1000);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Vérifier les permissions
    if (
      !hasPermission(apiKey, "bookings", "read", establishmentSlug || undefined)
    ) {
      await logApiRequest(
        apiKey.id,
        "/api/v1/bookings",
        "GET",
        403,
        request,
        Date.now() - startTime
      );
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    // Si la clé n'est pas limitée à un établissement, il faut le spécifier
    if (!establishmentSlug) {
      await logApiRequest(
        apiKey.id,
        "/api/v1/bookings",
        "GET",
        400,
        request,
        Date.now() - startTime
      );
      return NextResponse.json(
        { error: "Bad Request - establishmentSlug is required" },
        { status: 400 }
      );
    }

    // Construire les filtres
    const where: Record<string, unknown> = {
      hotelSlug: establishmentSlug,
      paymentStatus: "succeeded", // ✅ Filtrer automatiquement uniquement les paiements réussis
    };

    if (startDate) {
      where.checkInDate = {
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      where.checkOutDate = {
        lte: new Date(endDate),
      };
    }

    // Récupérer les réservations avec toutes les relations
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          room: {
            select: {
              id: true,
              name: true,
              price: true,
              accessCode: true,
              allowDogs: true,
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
              hotelContactEmail: true,
              hotelContactPhone: true,
            },
          },
        },
        orderBy: {
          bookingDate: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.booking.count({ where }),
    ]);

    // Logger la requête réussie
    await logApiRequest(
      apiKey.id,
      "/api/v1/bookings",
      "GET",
      200,
      request,
      Date.now() - startTime
    );

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/v1/bookings:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
