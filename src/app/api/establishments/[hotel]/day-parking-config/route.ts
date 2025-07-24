import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ hotel: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { hotel } = await params;

    // Récupérer la configuration du parking jour pour cet établissement
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: {
        enableDayParking: true,
        dayParkingTarif1h: true,
        dayParkingTarif2h: true,
        dayParkingTarif3h: true,
        dayParkingTarif4h: true,
        dayParkingTarifHalfDay: true,
        dayParkingTarifFullDay: true,
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      enableDayParking: establishment.enableDayParking,
      tariffs: establishment.enableDayParking
        ? {
            tarif1h: establishment.dayParkingTarif1h || 5.0,
            tarif2h: establishment.dayParkingTarif2h || 8.0,
            tarif3h: establishment.dayParkingTarif3h || 12.0,
            tarif4h: establishment.dayParkingTarif4h || 15.0,
            tarifHalfDay: establishment.dayParkingTarifHalfDay || 20.0,
            tarifFullDay: establishment.dayParkingTarifFullDay || 35.0,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la configuration parking jour:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
