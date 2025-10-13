import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/super-admin/monitoring/webhook-logs
 * Récupère les logs des webhooks envoyés
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Récupérer les logs
    const logs = await prisma.webhookLog.findMany({
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
      prisma.webhookLog.count(),
      prisma.webhookLog.count({
        where: {
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
        limit,
        offset,
        hasMore: logs.length === limit,
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
