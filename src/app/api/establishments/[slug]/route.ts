import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug d'établissement requis" },
        { status: 400 }
      );
    }

    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        commissionRate: true,
        fixedFee: true,
        dayParkingCommissionRate: true,
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(establishment);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'établissement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'établissement" },
      { status: 500 }
    );
  }
}
