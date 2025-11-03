import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    // Vérifier la session super-admin
    const superAdminSession = request.cookies.get("super-admin-session");

    if (superAdminSession?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { emailVerified: true },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur vérification email:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification de l'email" },
      { status: 500 }
    );
  }
}
