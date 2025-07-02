import { NextResponse, type NextRequest } from "next/server";
import { auth } from "./lib/auth";

export async function middleware(request: NextRequest) {
  // Protéger les routes admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Vérifier si l'utilisateur a accès à cet hôtel
    const hotelSlug = request.nextUrl.pathname.split("/")[2];
    if (hotelSlug) {
      // Ici vous pourriez ajouter une vérification supplémentaire
      // pour s'assurer que l'utilisateur a accès à cet hôtel spécifique
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
