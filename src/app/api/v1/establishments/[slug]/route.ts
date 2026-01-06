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

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/v1/establishments/:slug
 * Récupère tous les détails d'un établissement
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  const { slug } = await params;

  try {
    // Authentification
    const apiKey = await authenticateApiKey(request);
    if (!apiKey) {
      await logApiRequest(
        null,
        `/api/v1/establishments/${slug}`,
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
        `/api/v1/establishments/${slug}`,
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
    if (!hasPermission(apiKey, "establishments", "read", slug)) {
      await logApiRequest(
        apiKey.id,
        `/api/v1/establishments/${slug}`,
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

    // Récupérer l'établissement avec toutes les relations
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      include: {
        rooms: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true,
            allowDogs: true,
          },
        },
        pricingOptions: {
          where: {
            isActive: true,
          },
          include: {
            values: {
              orderBy: {
                displayOrder: "asc",
              },
            },
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
        _count: {
          select: {
            bookings: {
              where: {
                paymentStatus: "succeeded",
              },
            },
          },
        },
      },
    });

    if (!establishment) {
      await logApiRequest(
        apiKey.id,
        `/api/v1/establishments/${slug}`,
        "GET",
        404,
        request,
        Date.now() - startTime
      );
      return NextResponse.json(
        { error: "Establishment not found" },
        { status: 404 }
      );
    }

    // Logger la requête réussie
    await logApiRequest(
      apiKey.id,
      `/api/v1/establishments/${slug}`,
      "GET",
      200,
      request,
      Date.now() - startTime
    );

    // Ajouter les headers de rate limit
    const headers = addRateLimitHeaders(new Headers(), rateLimit);

    return NextResponse.json(
      {
        success: true,
        data: establishment,
      },
      { headers }
    );
  } catch (error) {
    console.error(`Error in GET /api/v1/establishments/${slug}:`, error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
