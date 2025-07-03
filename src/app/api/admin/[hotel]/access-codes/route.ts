import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;
    const { accessCodeType, generalAccessCode, accessInstructions } =
      await request.json();

    const establishment = await prisma.establishment.update({
      where: { slug: hotel },
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
