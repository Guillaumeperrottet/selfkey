import { NextRequest, NextResponse } from "next/server";
import { getEstablishmentFees } from "@/lib/fee-calculator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;
    const fees = await getEstablishmentFees(hotel);

    return NextResponse.json({
      commissionRate: fees.commissionRate * 100, // Retourner en pourcentage
      fixedFee: fees.fixedFee,
    });
  } catch (error) {
    console.error("Erreur récupération frais:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des frais" },
      { status: 500 }
    );
  }
}
