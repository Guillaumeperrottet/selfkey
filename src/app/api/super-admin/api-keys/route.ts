import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api/auth";
import { isSuperAdmin } from "@/lib/auth/check";

/**
 * GET /api/super-admin/api-keys
 * Récupère toutes les clés API
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

    const apiKeys = await prisma.apiKey.findMany({
      include: {
        establishment: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/super-admin/api-keys
 * Crée une nouvelle clé API
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
    const { name, establishmentSlug, permissions } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Générer une clé unique
    const key = generateApiKey("sk_live");

    // Créer la clé dans la base de données
    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        establishmentSlug: establishmentSlug || null,
        permissions: permissions || { bookings: ["read"] },
        isActive: true,
        createdBy: "super-admin", // TODO: Utiliser session.user.id
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
      message: "API key created successfully",
      key: apiKey.key, // On retourne la clé une seule fois
      apiKey: {
        ...apiKey,
        key: "***hidden***", // On masque la clé dans la réponse pour la liste
      },
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
