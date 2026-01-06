import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/auth/check";

interface RouteParams {
  params: Promise<{
    webhookId: string;
  }>;
}

/**
 * DELETE /api/super-admin/webhooks/:webhookId
 * Supprime un webhook
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

    const { webhookId } = await params;

    await prisma.webhook.delete({
      where: { id: webhookId },
    });

    return NextResponse.json({
      message: "Webhook deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/super-admin/webhooks/:webhookId
 * Met à jour un webhook (activer/désactiver)
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

    const { webhookId } = await params;
    const body = await request.json();
    const { isActive } = body;

    const webhook = await prisma.webhook.update({
      where: { id: webhookId },
      data: { isActive },
    });

    return NextResponse.json({
      message: "Webhook updated successfully",
      webhook,
    });
  } catch (error) {
    console.error("Error updating webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
