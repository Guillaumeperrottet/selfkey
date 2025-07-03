import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { hotel: string } }
) {
  try {
    const { accessCodeType, generalAccessCode, accessInstructions } =
      await request.json();
    const hotelSlug = params.hotel;

    const establishment = await prisma.establishment.update({
      where: { slug: hotelSlug },
      data: {
        accessCodeType,
        generalAccessCode,
        accessInstructions,
      },
    });

    return NextResponse.json(establishment);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des codes d'accès:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
