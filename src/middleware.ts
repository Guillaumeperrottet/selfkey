import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Plus de redirection automatique - chaque domaine affiche sa propre page
  
  // Protéger les routes admin et establishments
  if (
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/establishments")
  ) {
    // Vérifier si il y a un token de session dans les cookies
    // En production, le cookie peut avoir le préfixe __Secure-
    const sessionToken =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Pour une vérification plus approfondie, nous laisserons les pages
    // faire leur propre vérification avec l'API
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/establishments/:path*"],
};
