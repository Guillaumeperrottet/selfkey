import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasAccessToEstablishment } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { hotel: string } }
) {
  try {
    const establishment = await prisma.establishment.findUnique({
      where: { slug: params.hotel },
      select: {
        id: true,
        name: true,
        maxBookingDays: true,
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Establishment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(establishment);
  } catch (error) {
    console.error("Error fetching establishment settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { hotel: string } }
) {
  try {
    // Vérifier l'authentification
    const user = await getSessionUser(request.headers);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier l'accès à l'établissement
    const hasAccess = await hasAccessToEstablishment(user.id, params.hotel);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { maxBookingDays } = body;

    // Validation
    if (!maxBookingDays || maxBookingDays < 1 || maxBookingDays > 365) {
      return NextResponse.json(
        { error: "La durée maximale doit être entre 1 et 365 jours" },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { slug: params.hotel },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Establishment not found" },
        { status: 404 }
      );
    }

    // Mettre à jour l'établissement
    const updatedEstablishment = await prisma.establishment.update({
      where: { slug: params.hotel },
      data: {
        maxBookingDays: parseInt(maxBookingDays),
      },
      select: {
        id: true,
        name: true,
        maxBookingDays: true,
      },
    });

    return NextResponse.json(updatedEstablishment);
  } catch (error) {
    console.error("Error updating establishment settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
