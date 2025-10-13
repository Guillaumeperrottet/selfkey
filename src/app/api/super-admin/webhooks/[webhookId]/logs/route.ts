import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    webhookId: string;
  }>;
}

/**
 * GET /api/super-admin/webhooks/:webhookId/logs
 * Récupère les logs d'un webhook
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { webhookId } = await params;

    const logs = await prisma.webhookLog.findMany({
      where: { webhookId },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limiter aux 50 derniers logs
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching webhook logs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
