import { NextRequest, NextResponse } from "next/server";

// Configuration du super admin depuis les variables d'environnement
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    // Vérifier que les variables d'environnement sont définies
    if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
      console.error(
        "Variables d'environnement SUPER_ADMIN_EMAIL et SUPER_ADMIN_PASSWORD non définies"
      );
      return NextResponse.json(
        { error: "Configuration serveur manquante" },
        { status: 500 }
      );
    }

    const { email, password } = await request.json();

    if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      // Créer une session simple avec un cookie dans la réponse
      const response = NextResponse.json({ success: true });

      response.cookies.set("super-admin-session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 heures
      });

      return response;
    }

    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Erreur lors de la connexion super admin:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get("super-admin-session");

    return NextResponse.json({
      isAuthenticated: session?.value === "authenticated",
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de session:", error);
    return NextResponse.json({ isAuthenticated: false });
  }
}

export async function DELETE() {
  try {
    // Créer une réponse qui supprime le cookie de session
    const response = NextResponse.json({
      success: true,
      message: "Déconnexion réussie",
    });

    // Supprimer le cookie de session
    response.cookies.delete("super-admin-session");

    return response;
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}
