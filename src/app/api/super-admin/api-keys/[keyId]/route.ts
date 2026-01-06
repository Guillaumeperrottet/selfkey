import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/auth/check";

interface RouteParams {
  params: Promise<{
    keyId: string;
  }>;
}

/**
 * DELETE /api/super-admin/api-keys/:keyId
 * Supprime une clé API
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Vérifier que l'utilisateur est super-admin
    const adminCheck = await isSuperAdmin();
    if (!adminCheck.valid) {
      return NextResponse.json(
        { error: "Unauthorized", message: adminCheck.message },
        { status: 401 }
      );
    }

    const { keyId } = await params;

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    return NextResponse.json({
      message: "API key deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/super-admin/api-keys/:keyId
 * Met à jour une clé API (activer/désactiver)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Vérifier que l'utilisateur est super-admin
    const adminCheck = await isSuperAdmin();
    if (!adminCheck.valid) {
      return NextResponse.json(
        { error: "Unauthorized", message: adminCheck.message },
        { status: 401 }
      );
    }

    const { keyId } = await params;
    const body = await request.json();
    const { isActive } = body;

    const apiKey = await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive },
    });

    return NextResponse.json({
      message: "API key updated successfully",
      apiKey,
    });
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
