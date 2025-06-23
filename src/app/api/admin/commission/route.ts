import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { hotelSlug, commissionRate, fixedFee } = await request.json();

    if (!hotelSlug) {
      return NextResponse.json({ error: "Slug hôtel requis" }, { status: 400 });
    }

    // Validation des valeurs
    const rate = Math.max(0, Math.min(100, parseFloat(commissionRate) || 0));
    const fee = Math.max(0, parseFloat(fixedFee) || 0);

    const establishment = await prisma.establishment.update({
      where: { slug: hotelSlug },
      data: {
        commissionRate: rate,
        fixedFee: fee,
      },
    });

    return NextResponse.json({
      success: true,
      establishment: {
        commissionRate: establishment.commissionRate,
        fixedFee: establishment.fixedFee,
      },
    });
  } catch (error) {
    console.error("Erreur mise à jour commission:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

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

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      commissionRate: establishment.commissionRate,
      fixedFee: establishment.fixedFee,
    });
  } catch (error) {
    console.error("Erreur récupération commission:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
