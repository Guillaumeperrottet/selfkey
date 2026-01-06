import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/auth/check";

/**
 * GET /api/super-admin/webhooks
 * Récupère tous les webhooks
 */
export async function GET() {
  try {
    // Vérifier que l'utilisateur est super-admin
    const adminCheck = await isSuperAdmin();
    if (!adminCheck.valid) {
      return NextResponse.json(
        { error: "Unauthorized", message: adminCheck.message },
        { status: 401 }
      );
    }

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
    // Vérifier que l'utilisateur est super-admin
    const adminCheck = await isSuperAdmin();
    if (!adminCheck.valid) {
      return NextResponse.json(
        { error: "Unauthorized", message: adminCheck.message },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      establishmentSlug,
      url,
      events,
      format,
      retryCount,
      retryDelay,
      secret,
    } = body;

    if (!name || !establishmentSlug || !url) {
      return NextResponse.json(
        { error: "Name, establishmentSlug and url are required" },
        { status: 400 }
      );
    }

    // Générer un secret automatiquement si non fourni (pour sécurité HMAC)
    const webhookSecret = secret || generateWebhookSecret();

    const webhook = await prisma.webhook.create({
      data: {
        name,
        establishmentSlug,
        url,
        events: events || ["booking.completed"],
        format: format || "json",
        retryCount: retryCount || 3,
        retryDelay: retryDelay || 60,
        secret: webhookSecret,
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
      // Retourner le secret une seule fois (comme pour les API keys)
      generatedSecret: !secret ? webhookSecret : undefined,
    });
  } catch (error) {
    console.error("Error creating webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Génère un secret aléatoire pour HMAC signature
 */
function generateWebhookSecret(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let secret = "whsec_";

  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return secret;
}
