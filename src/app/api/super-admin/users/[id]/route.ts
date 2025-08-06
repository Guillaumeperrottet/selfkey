import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Vérification de la session super-admin
    const session = request.cookies.get("super-admin-session");

    if (!session || session.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer l'utilisateur et toutes ses données associées
    await prisma.$transaction(async (tx) => {
      // Supprimer les relations UserEstablishment
      await tx.userEstablishment.deleteMany({
        where: { userId: userId },
      });

      // Supprimer les historiques d'export Excel
      await tx.excelExportHistory.deleteMany({
        where: { userId: userId },
      });

      // Les accounts et sessions seront supprimés automatiquement
      // grâce aux cascades onDelete définies dans le schema

      // Supprimer l'utilisateur
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({
      message: "Utilisateur supprimé avec succès",
      deletedUser: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
