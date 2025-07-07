import { NextRequest, NextResponse } from "next/server";

// Configuration du super admin
const SUPER_ADMIN_EMAIL = "perrottet.guillaume.97@gmail.com";
const SUPER_ADMIN_PASSWORD = "GhtuneNXTpour0.-"; // Changez ce mot de passe !

export async function POST(request: NextRequest) {
  try {
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
