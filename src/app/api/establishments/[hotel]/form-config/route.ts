import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ hotel: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { hotel } = await params;

    // Récupérer la configuration du formulaire pour cet établissement
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: {
        formConfig: true,
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      formConfig: establishment.formConfig || {},
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la configuration du formulaire:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
