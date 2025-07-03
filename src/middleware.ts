import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Protéger les routes admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Vérifier si il y a un token de session dans les cookies
    const sessionToken = request.cookies.get("better-auth.session_token");

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
  matcher: ["/admin/:path*"],
};
