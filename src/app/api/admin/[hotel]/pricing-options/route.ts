import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasAccessToEstablishment } from "@/lib/auth-utils";

interface PricingOptionValue {
  id?: string;
  label: string;
  priceModifier: number;
  isDefault: boolean;
  displayOrder: number;
}

interface PricingOption {
  id?: string;
  name: string;
  type: "select" | "checkbox" | "radio";
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
  values: PricingOptionValue[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;

    // Vérifier l'authentification
    const user = await getSessionUser(request.headers);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier l'accès à l'établissement
    const hasAccess = await hasAccessToEstablishment(user.id, hotel);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Récupérer l'établissement
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: { id: true },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Establishment not found" },
        { status: 404 }
      );
    }

    // Récupérer les options de prix
    const pricingOptions = await prisma.pricingOption.findMany({
      where: { establishmentId: establishment.id },
      include: {
        values: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ pricingOptions });
  } catch (error) {
    console.error("Error fetching pricing options:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;

    // Vérifier l'authentification
    const user = await getSessionUser(request.headers);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier l'accès à l'établissement
    const hasAccess = await hasAccessToEstablishment(user.id, hotel);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Récupérer l'établissement
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: { id: true },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Establishment not found" },
        { status: 404 }
      );
    }

    const { pricingOptions } = await request.json();

    // Supprimer toutes les options existantes
    await prisma.pricingOption.deleteMany({
      where: { establishmentId: establishment.id },
    });

    // Créer les nouvelles options
    for (const option of pricingOptions as PricingOption[]) {
      if (!option.name.trim()) continue; // Ignorer les options sans nom

      const createdOption = await prisma.pricingOption.create({
        data: {
          establishmentId: establishment.id,
          name: option.name,
          type: option.type,
          isRequired: option.isRequired,
          isActive: option.isActive,
          displayOrder: option.displayOrder,
        },
      });

      // Créer les valeurs
      for (const value of option.values) {
        if (!value.label.trim()) continue; // Ignorer les valeurs sans label

        await prisma.pricingOptionValue.create({
          data: {
            pricingOptionId: createdOption.id,
            label: value.label,
            priceModifier: value.priceModifier,
            isDefault: value.isDefault,
            displayOrder: value.displayOrder,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving pricing options:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
