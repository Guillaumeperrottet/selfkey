import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface Props {
  params: Promise<{ hotel: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { hotel } = await params;

    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier les permissions d'accès à cet établissement
    const userEstablishment = await prisma.userEstablishment.findFirst({
      where: {
        userId: session.user.id,
        establishment: {
          slug: hotel,
        },
      },
      include: {
        establishment: {
          select: {
            enableDayParking: true,
            dayParkingTarif1h: true,
            dayParkingTarif2h: true,
            dayParkingTarif3h: true,
            dayParkingTarif4h: true,
            dayParkingTarifHalfDay: true,
            dayParkingTarifFullDay: true,
          },
        },
      },
    });

    if (!userEstablishment) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json(userEstablishment.establishment);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des paramètres de parking jour:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { hotel } = await params;
    const body = await request.json();

    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier les permissions d'accès à cet établissement
    const userEstablishment = await prisma.userEstablishment.findFirst({
      where: {
        userId: session.user.id,
        establishment: {
          slug: hotel,
        },
      },
    });

    if (!userEstablishment) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Validation des données
    const {
      enableDayParking,
      dayParkingTarif1h,
      dayParkingTarif2h,
      dayParkingTarif3h,
      dayParkingTarif4h,
      dayParkingTarifHalfDay,
      dayParkingTarifFullDay,
    } = body;

    // Validation des types et valeurs
    if (typeof enableDayParking !== "boolean") {
      return NextResponse.json(
        { error: "enableDayParking doit être un booléen" },
        { status: 400 }
      );
    }

    if (enableDayParking) {
      // Validation des tarifs si le parking jour est activé
      const tariffs = [
        dayParkingTarif1h,
        dayParkingTarif2h,
        dayParkingTarif3h,
        dayParkingTarif4h,
        dayParkingTarifHalfDay,
        dayParkingTarifFullDay,
      ];

      // Vérifier que tous les tarifs sont des nombres positifs
      for (const tariff of tariffs) {
        if (typeof tariff !== "number" || tariff < 0) {
          return NextResponse.json(
            { error: "Tous les tarifs doivent être des nombres positifs" },
            { status: 400 }
          );
        }
      }

      // Vérifier que les tarifs sont croissants
      if (
        dayParkingTarif1h >= dayParkingTarif2h ||
        dayParkingTarif2h >= dayParkingTarif3h ||
        dayParkingTarif3h >= dayParkingTarif4h ||
        dayParkingTarif4h >= dayParkingTarifHalfDay ||
        dayParkingTarifHalfDay >= dayParkingTarifFullDay
      ) {
        return NextResponse.json(
          {
            error:
              "Les tarifs doivent être croissants (1h < 2h < 3h < 4h < demi-journée < journée complète)",
          },
          { status: 400 }
        );
      }
    }

    // Mettre à jour l'établissement
    const updatedEstablishment = await prisma.establishment.update({
      where: { slug: hotel },
      data: {
        enableDayParking,
        dayParkingTarif1h: enableDayParking ? dayParkingTarif1h : null,
        dayParkingTarif2h: enableDayParking ? dayParkingTarif2h : null,
        dayParkingTarif3h: enableDayParking ? dayParkingTarif3h : null,
        dayParkingTarif4h: enableDayParking ? dayParkingTarif4h : null,
        dayParkingTarifHalfDay: enableDayParking
          ? dayParkingTarifHalfDay
          : null,
        dayParkingTarifFullDay: enableDayParking
          ? dayParkingTarifFullDay
          : null,
      },
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

    return NextResponse.json({
      message: "Paramètres de parking jour sauvegardés avec succès",
      establishment: updatedEstablishment,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la sauvegarde des paramètres de parking jour:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
