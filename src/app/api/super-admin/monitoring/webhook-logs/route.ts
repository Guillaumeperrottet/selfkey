import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/super-admin/monitoring/webhook-logs
 * Récupère les logs des webhooks envoyés
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
    const logs = await prisma.webhookLog.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: {
        webhook: {
          select: {
            name: true,
          },
        },
      },
    });

    // Statistiques
    const [totalCount, errorCount] = await Promise.all([
      prisma.webhookLog.count({ where }),
      prisma.webhookLog.count({
        where: {
          ...where,
          success: false,
        },
      }),
    ]);

    return NextResponse.json({
      logs,
      stats: {
        total: totalCount,
        errors: errorCount,
      },
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + logs.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching webhook logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
