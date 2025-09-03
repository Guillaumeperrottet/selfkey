import { NextRequest, NextResponse } from "next/server";
import { getTouristTaxSettings } from "@/lib/fee-calculator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;

    if (!hotel) {
      return NextResponse.json(
        { error: "Slug de l'établissement requis" },
        { status: 400 }
      );
    }

    const settings = await getTouristTaxSettings(hotel);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erreur récupération paramètres taxe de séjour:", error);
    return NextResponse.json(
      {
        error:
          "Erreur lors de la récupération des paramètres de taxe de séjour",
        touristTaxEnabled: true,
        touristTaxAmount: 3.0,
      },
      { status: 500 }
    );
  }
}
