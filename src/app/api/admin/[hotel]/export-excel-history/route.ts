import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel: hotelSlug } = await params;

    // Récupérer l'historique des exports pour cet établissement
    const exportHistory = await prisma.excelExportHistory.findMany({
      where: {
        establishmentSlug: hotelSlug,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        exportedAt: "desc",
      },
    });

    return NextResponse.json(exportHistory);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}
