import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

/**
 * Créer des liens dashboard selon la doc Stripe Connect
 * pour les composants embarqués
 */
export async function POST(request: NextRequest) {
  try {
    const { hotelSlug, accountId } = await request.json();

    if (!hotelSlug || !accountId) {
      return NextResponse.json(
        { error: "Slug hôtel et ID compte requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe et possède ce compte
    const establishment = await prisma.establishment.findFirst({
      where: {
        slug: hotelSlug,
        stripeAccountId: accountId,
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement ou compte non trouvé" },
        { status: 404 }
      );
    }

    // Créer un lien vers le dashboard Stripe Express
    // Selon la doc, on peut utiliser les liens dashboard pour l'accès
    const loginLink = await stripe.accounts.createLoginLink(accountId);

    return NextResponse.json({
      dashboardUrl: loginLink.url,
    });
  } catch (error) {
    console.error("Erreur création lien dashboard:", error);

    if (error instanceof Error) {
      // Gestion spécifique des erreurs Stripe
      if (error.message.includes("account")) {
        return NextResponse.json(
          { error: "Compte Stripe invalide ou non configuré" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
