import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;

    if (!hotel) {
      return NextResponse.json(
        { error: "Nom d'hôtel manquant" },
        { status: 400 }
      );
    }

    console.log("DEBUG: Searching for pricing options for hotel:", hotel);

    // Vérifier si l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: { id: true, name: true },
    });

    console.log("DEBUG: Establishment found:", establishment);

    // Récupérer les options de prix actives pour cet établissement
    const pricingOptions = await prisma.pricingOption.findMany({
      where: {
        establishment: {
          slug: hotel,
        },
        isActive: true,
      },
      include: {
        values: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    console.log("DEBUG: Found pricing options:", pricingOptions.length);
    console.log(
      "DEBUG: Pricing options:",
      JSON.stringify(pricingOptions, null, 2)
    );

    return NextResponse.json({
      pricingOptions,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des options de prix:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
