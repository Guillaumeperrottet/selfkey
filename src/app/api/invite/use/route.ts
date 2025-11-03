import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    // Marquer le token comme utilisé
    const invite = await prisma.inviteToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      email: invite.email,
    });
  } catch (error) {
    console.error("Erreur utilisation token:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
