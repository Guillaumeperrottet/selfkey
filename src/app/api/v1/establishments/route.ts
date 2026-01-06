import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authenticateApiKey,
  hasPermission,
  logApiRequest,
} from "@/lib/api/auth";
import {
  checkRateLimit,
  addRateLimitHeaders,
  getRateLimitKey,
} from "@/lib/api/rate-limit";

/**
 * GET /api/v1/establishments
 * Récupère la liste des établissements accessibles
 *
 * Query params:
 * - city: Filtrer par ville
 * - country: Filtrer par pays (défaut: Switzerland)
 * - isPubliclyVisible: Filtrer les établissements publics uniquement
 * - limit: Nombre max de résultats (défaut: 50, max: 100)
 * - offset: Pagination (défaut: 0)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentification
    const apiKey = await authenticateApiKey(request);
    if (!apiKey) {
      await logApiRequest(
        null,
        "/api/v1/establishments",
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

    // Rate limiting
    const rateLimitKey = getRateLimitKey(request, apiKey.id);
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      await logApiRequest(
        apiKey.id,
        "/api/v1/establishments",
        "GET",
        429,
        request,
        Date.now() - startTime
      );
      const headers = addRateLimitHeaders(new Headers(), rateLimit);
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds`,
        },
        { status: 429, headers }
      );
    }

    // Vérifier les permissions
    if (!hasPermission(apiKey, "establishments", "read")) {
      await logApiRequest(
        apiKey.id,
        "/api/v1/establishments",
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

    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");
    const country = searchParams.get("country") || "Switzerland";
    const isPubliclyVisible = searchParams.get("isPubliclyVisible") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Construire les filtres
    const where: Record<string, unknown> = {
      country,
    };

    // Si la clé est limitée à un établissement, filtrer
    if (apiKey.establishmentSlug) {
      where.slug = apiKey.establishmentSlug;
    }

    if (city) {
      where.city = city;
    }

    if (isPubliclyVisible) {
      where.isPubliclyVisible = true;
    }

    // Récupérer les établissements
    const [establishments, total] = await Promise.all([
      prisma.establishment.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          name_en: true,
          name_de: true,
          address: true,
          address_en: true,
          address_de: true,
          city: true,
          city_en: true,
          city_de: true,
          country: true,
          postalCode: true,
          latitude: true,
          longitude: true,
          hotelContactEmail: true,
          hotelContactPhone: true,
          isPubliclyVisible: true,
          showOnMap: true,
          isClosed: true,
          is24h7Access: true,
          checkInStartTime: true,
          checkInEndTime: true,
          checkOutTime: true,
          accessRestrictions: true,
          accessRestrictions_en: true,
          accessRestrictions_de: true,
          mapTitle: true,
          mapTitle_en: true,
          mapTitle_de: true,
          mapDescription: true,
          mapDescription_en: true,
          mapDescription_de: true,
          presentationImages: true,
          presentationDescription: true,
          presentationDescription_en: true,
          presentationDescription_de: true,
          presentationWebsite: true,
          presentationEmail: true,
          presentationPhone: true,
          touristTaxAmount: true,
          touristTaxEnabled: true,
          enableDayParking: true,
          dayParkingTarif1h: true,
          dayParkingTarif2h: true,
          dayParkingTarif3h: true,
          dayParkingTarif4h: true,
          dayParkingTarifHalfDay: true,
          dayParkingTarifFullDay: true,
          _count: {
            select: {
              bookings: {
                where: {
                  paymentStatus: "succeeded",
                },
              },
              rooms: {
                where: {
                  isActive: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.establishment.count({ where }),
    ]);

    // Logger la requête réussie avec métadonnées
    await logApiRequest(
      apiKey.id,
      "/api/v1/establishments",
      "GET",
      200,
      request,
      Date.now() - startTime,
      undefined,
      {
        total,
        returned: establishments.length,
        limit,
        offset,
      }
    );

    // Ajouter les headers de rate limit
    const headers = addRateLimitHeaders(new Headers(), rateLimit);

    return NextResponse.json(
      {
        success: true,
        data: establishments,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("Error in GET /api/v1/establishments:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
