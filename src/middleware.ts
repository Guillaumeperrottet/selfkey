import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Redirection de selfkey.ch vers selfcamp.ch
  const hostname = request.headers.get("host") || "";

  if (hostname === "selfkey.ch" || hostname === "www.selfkey.ch") {
    const url = new URL(request.url);
    url.hostname = "selfcamp.ch";
    return NextResponse.redirect(url, 301); // Redirection permanente
  }

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
