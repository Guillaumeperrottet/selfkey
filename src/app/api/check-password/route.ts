import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier si l'utilisateur a un compte credential
    const credentialAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "credential",
        password: {
          not: null,
        },
      },
    });

    return NextResponse.json({
      hasPassword: !!credentialAccount,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du mot de passe:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
