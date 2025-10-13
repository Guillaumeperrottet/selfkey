import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/super-admin/webhooks
 * Récupère tous les webhooks
 */
export async function GET() {
  try {
    const webhooks = await prisma.webhook.findMany({
      include: {
        establishment: {
          select: {
            slug: true,
            name: true,
          },
        },
        _count: {
          select: {
            logs: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/super-admin/webhooks
 * Crée un nouveau webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      establishmentSlug,
      url,
      events,
      format,
      retryCount,
      retryDelay,
    } = body;

    if (!name || !establishmentSlug || !url) {
      return NextResponse.json(
        { error: "Name, establishmentSlug and url are required" },
        { status: 400 }
      );
    }

    const webhook = await prisma.webhook.create({
      data: {
        name,
        establishmentSlug,
        url,
        events: events || ["booking.completed"],
        format: format || "json",
        retryCount: retryCount || 3,
        retryDelay: retryDelay || 60,
        isActive: true,
      },
      include: {
        establishment: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Webhook created successfully",
      webhook,
    });
  } catch (error) {
    console.error("Error creating webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
