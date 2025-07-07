import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Protéger les routes admin et establishments
  if (
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/establishments")
  ) {
    // Vérifier si il y a un token de session dans les cookies
    const sessionToken = request.cookies.get("better-auth.session_token");

    console.log("🔍 Middleware protection:", {
      path: request.nextUrl.pathname,
      hasSessionCookie: !!sessionToken,
      sessionValue: sessionToken?.value?.substring(0, 20) + "...",
      allCookies: request.cookies.getAll().map((c) => c.name),
    });

    if (!sessionToken) {
      console.log("❌ Pas de session token, redirection vers login");
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    console.log("✅ Session token présent, accès autorisé");

    // Pour une vérification plus approfondie, nous laisserons les pages
    // faire leur propre vérification avec l'API
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/establishments/:path*"],
};
