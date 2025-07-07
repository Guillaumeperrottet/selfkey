import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Vérifier la session côté serveur
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Vérifier les cookies
    const cookies = request.cookies.getAll();
    const sessionCookie = request.cookies.get("better-auth.session_token");

    return NextResponse.json({
      hasSession: !!session,
      session: session,
      cookies: cookies.map((c) => ({
        name: c.name,
        value: c.value?.substring(0, 20) + "...",
      })),
      sessionCookie: sessionCookie
        ? {
            name: sessionCookie.name,
            value: sessionCookie.value?.substring(0, 20) + "...",
            exists: true,
          }
        : { exists: false },
    });
  } catch (error) {
    console.error("Erreur debug session:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
