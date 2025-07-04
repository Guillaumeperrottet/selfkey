import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Props {
  params: Promise<{ hotel: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { hotel } = await params;

    // Récupérer les options de confirmation de l'établissement
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: {
        confirmationEmailEnabled: true,
        confirmationWhatsappEnabled: true,
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
    console.error("Erreur lors de la récupération des options:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
