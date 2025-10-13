import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/super-admin/monitoring/api-logs
 * Récupère les logs d'utilisation de l'API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 1000);
    const offset = parseInt(searchParams.get("offset") || "0");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construire le filtre WHERE
    const where: {
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Récupérer les logs
    const logs = await prisma.apiLog.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: {
        apiKey: {
          select: {
            name: true,
          },
        },
      },
    });

    // Statistiques des dernières 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalCount, errorCount, last24hCount, avgResponseTime] =
      await Promise.all([
        prisma.apiLog.count({ where }),
        prisma.apiLog.count({
          where: {
            ...where,
            statusCode: {
              gte: 400,
            },
          },
        }),
        prisma.apiLog.count({
          where: {
            createdAt: {
              gte: twentyFourHoursAgo,
            },
          },
        }),
        prisma.apiLog.aggregate({
          where: {
            ...where,
            responseTime: {
              not: null,
            },
          },
          _avg: {
            responseTime: true,
          },
        }),
      ]);

    return NextResponse.json({
      logs,
      stats: {
        total: totalCount,
        errors: errorCount,
        last24h: last24hCount,
        avgResponseTime: avgResponseTime._avg.responseTime || 0,
      },
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + logs.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching API logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
