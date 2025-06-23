import { NextRequest, NextResponse } from "next/server";
import {
  createConnectedAccount,
  createAccountLink,
  getAccountStatus,
} from "@/lib/stripe-connect";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const {
      hotelSlug,
      email,
      country = "CH",
      businessType = "individual",
    } = await request.json();

    if (!hotelSlug || !email) {
      return NextResponse.json(
        { error: "Slug hôtel et email requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotelSlug },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Si déjà un compte Stripe, créer un nouveau lien d'onboarding
    if (establishment.stripeAccountId) {
      const onboardingUrl = await createAccountLink(
        establishment.stripeAccountId
      );
      return NextResponse.json({
        onboardingUrl,
        accountId: establishment.stripeAccountId,
      });
    }

    // Créer un nouveau compte Stripe Connect
    const { accountId, onboardingUrl } = await createConnectedAccount({
      hotelName: establishment.name,
      email,
      country,
      businessType,
    });

    // Mettre à jour l'établissement avec l'ID du compte Stripe
    await prisma.establishment.update({
      where: { slug: hotelSlug },
      data: { stripeAccountId: accountId },
    });

    return NextResponse.json({
      accountId,
      onboardingUrl,
    });
  } catch (error) {
    console.error("Erreur onboarding Stripe:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Vérifier le statut d'un compte
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelSlug = searchParams.get("hotel");

    if (!hotelSlug) {
      return NextResponse.json({ error: "Slug hôtel requis" }, { status: 400 });
    }

    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotelSlug },
    });

    if (!establishment || !establishment.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        needsOnboarding: true,
      });
    }

    const accountStatus = await getAccountStatus(establishment.stripeAccountId);

    return NextResponse.json({
      connected: true,
      accountStatus,
      needsOnboarding: !accountStatus.chargesEnabled,
    });
  } catch (error) {
    console.error("Erreur vérification statut Stripe:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
