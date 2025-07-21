import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { hotel: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const establishmentSlug = params.hotel;

    if (!establishmentSlug) {
      return NextResponse.json(
        { error: "Slug d'établissement requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement appartient à l'utilisateur
    const establishment = await prisma.establishment.findFirst({
      where: {
        slug: establishmentSlug,
        users: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        _count: {
          select: {
            rooms: true,
            bookings: true,
          },
        },
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    // Supprimer l'établissement et toutes ses données associées en cascade
    // Grâce aux contraintes de clé étrangère dans le schéma Prisma,
    // les données liées seront supprimées automatiquement
    await prisma.establishment.delete({
      where: {
        id: establishment.id,
      },
    });

    return NextResponse.json({
      message: "Établissement supprimé avec succès",
      deletedEstablishment: {
        id: establishment.id,
        name: establishment.name,
        roomsCount: establishment._count.rooms,
        bookingsCount: establishment._count.bookings,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'établissement:", error);

    // Vérifier si l'erreur est liée à des contraintes de base de données
    if (
      error instanceof Error &&
      error.message.includes("Foreign key constraint")
    ) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer l'établissement. Il contient encore des données liées.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'établissement" },
      { status: 500 }
    );
  }
}
