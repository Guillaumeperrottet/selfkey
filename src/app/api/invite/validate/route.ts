import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token manquant" },
        { status: 400 }
      );
    }

    // Vérifier le token
    const invite = await prisma.inviteToken.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json(
        { valid: false, error: "Token invalide" },
        { status: 404 }
      );
    }

    // Vérifier si le token a déjà été utilisé
    if (invite.usedAt) {
      return NextResponse.json(
        { valid: false, error: "Ce lien a déjà été utilisé" },
        { status: 400 }
      );
    }

    // Vérifier si le token a expiré
    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { valid: false, error: "Ce lien a expiré" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
    });
  } catch (error) {
    console.error("Erreur validation token:", error);
    return NextResponse.json(
      { valid: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
