import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est authentifié (session Better Auth OU session super-admin)
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const superAdminSession = request.cookies.get("super-admin-session");

    if (!session && superAdminSession?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "L'email est requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà enregistré" },
        { status: 400 }
      );
    }

    // Générer un token sécurisé
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    // Stocker le token d'invitation
    await prisma.inviteToken.create({
      data: {
        email,
        token,
        expiresAt,
        createdBy: session?.user.id || "super-admin",
      },
    });

    // Générer le lien d'invitation
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`;

    return NextResponse.json({
      success: true,
      inviteUrl,
      email,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Erreur lors de la génération du lien d'invitation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du lien" },
      { status: 500 }
    );
  }
}

// Liste des invitations en attente
export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est authentifié (session Better Auth OU session super-admin)
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const superAdminSession = request.cookies.get("super-admin-session");

    if (!session && superAdminSession?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer toutes les invitations en attente
    const invites = await prisma.inviteToken.findMany({
      where: {
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        token: true,
        createdAt: true,
        expiresAt: true,
        createdBy: true,
      },
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Erreur lors de la récupération des invitations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}
