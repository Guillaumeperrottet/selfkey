import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function checkAuthentication(hotelSlug: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }),
    };
  }

  // Vérifier les permissions d'accès à cet établissement
  const userEstablishment = await prisma.userEstablishment.findFirst({
    where: {
      userId: session.user.id,
      establishment: {
        slug: hotelSlug,
      },
    },
  });

  if (!userEstablishment) {
    return {
      error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }),
    };
  }

  return { user: session.user };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string; integrationId: string }> }
) {
  try {
    const { hotel, integrationId } = await params;

    // Vérifier l'authentification et les permissions
    const authResult = await checkAuthentication(hotel);
    if (authResult.error) {
      return authResult.error;
    }

    // Récupérer l'intégration
    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        establishmentSlug: hotel,
      },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Intégration non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ integration });
  } catch (error) {
    console.error("Erreur récupération intégration:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string; integrationId: string }> }
) {
  try {
    const { hotel, integrationId } = await params;
    const body = await request.json();
    const { name, configuration, isActive } = body;

    // Vérifier l'authentification et les permissions
    const authResult = await checkAuthentication(hotel);
    if (authResult.error) {
      return authResult.error;
    }

    // Vérifier que l'intégration existe
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        establishmentSlug: hotel,
      },
    });

    if (!existingIntegration) {
      return NextResponse.json(
        { error: "Intégration non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour l'intégration
    const updatedIntegration = await prisma.integration.update({
      where: { id: integrationId },
      data: {
        ...(name && { name }),
        ...(configuration && { configuration }),
        ...(typeof isActive === "boolean" && { isActive }),
        updatedAt: new Date(),
      },
    });

    // Enregistrer la modification dans les logs
    await prisma.integrationLog.create({
      data: {
        integrationId,
        action: "update",
        status: "success",
        message: "Configuration mise à jour",
        data: { changes: body },
      },
    });

    return NextResponse.json({ integration: updatedIntegration });
  } catch (error) {
    console.error("Erreur mise à jour intégration:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string; integrationId: string }> }
) {
  try {
    const { hotel, integrationId } = await params;

    // Vérifier l'authentification et les permissions
    const authResult = await checkAuthentication(hotel);
    if (authResult.error) {
      return authResult.error;
    }

    // Vérifier que l'intégration existe
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        establishmentSlug: hotel,
      },
    });

    if (!existingIntegration) {
      return NextResponse.json(
        { error: "Intégration non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer l'intégration (les logs seront supprimés en cascade)
    await prisma.integration.delete({
      where: { id: integrationId },
    });

    return NextResponse.json({ message: "Intégration supprimée avec succès" });
  } catch (error) {
    console.error("Erreur suppression intégration:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
