import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasAccessToEstablishment } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const { hotel } = await params;
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
      select: {
        id: true,
        name: true,
        maxBookingDays: true,
        allowFutureBookings: true,
        enableCutoffTime: true,
        cutoffTime: true,
        reopenTime: true,
        checkoutTime: true,
        checkinTime: true,
        touristTaxEnabled: true,
        touristTaxAmount: true,
        enableDogOption: true,
        hidePlatformFees: true,
        // Informations de facturation
        billingCompanyName: true,
        billingAddress: true,
        billingPostalCode: true,
        billingCity: true,
        billingCountry: true,
        vatNumber: true,
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

    const body = await request.json();
    const {
      maxBookingDays,
      allowFutureBookings,
      enableCutoffTime,
      cutoffTime,
      reopenTime,
      checkoutTime,
      checkinTime,
      touristTaxEnabled,
      touristTaxAmount,
      enableDogOption,
      hidePlatformFees,
      // Informations de facturation
      billingCompanyName,
      billingAddress,
      billingPostalCode,
      billingCity,
      billingCountry,
      vatNumber,
    } = body;

    // Validation
    if (!maxBookingDays || maxBookingDays < 1 || maxBookingDays > 365) {
      return NextResponse.json(
        { error: "La durée maximale doit être entre 1 et 365 jours" },
        { status: 400 }
      );
    }

    // Validation pour l'heure limite
    if (enableCutoffTime && cutoffTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(cutoffTime)) {
        return NextResponse.json(
          {
            error:
              "Format d'heure invalide pour l'heure limite. Utilisez le format HH:mm (ex: 22:00)",
          },
          { status: 400 }
        );
      }
    }

    // Validation pour l'heure de réouverture
    if (enableCutoffTime && reopenTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(reopenTime)) {
        return NextResponse.json(
          {
            error:
              "Format d'heure invalide pour l'heure de réouverture. Utilisez le format HH:mm (ex: 00:00)",
          },
          { status: 400 }
        );
      }
    }

    // Validation pour l'heure de checkout
    if (checkoutTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(checkoutTime)) {
        return NextResponse.json(
          {
            error:
              "Format d'heure invalide pour l'heure de checkout. Utilisez le format HH:mm (ex: 12:00)",
          },
          { status: 400 }
        );
      }
    }

    // Validation pour l'heure de checkin
    if (checkinTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(checkinTime)) {
        return NextResponse.json(
          {
            error:
              "Format d'heure invalide pour l'heure de checkin. Utilisez le format HH:mm (ex: 15:00)",
          },
          { status: 400 }
        );
      }
    }

    // Validation pour la taxe de séjour
    if (touristTaxEnabled && (touristTaxAmount < 0 || touristTaxAmount > 100)) {
      return NextResponse.json(
        {
          error: "Le montant de la taxe de séjour doit être entre 0 et 100 CHF",
        },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { slug: hotel },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Establishment not found" },
        { status: 404 }
      );
    }

    // Mettre à jour l'établissement
    const updatedEstablishment = await prisma.establishment.update({
      where: { slug: hotel },
      data: {
        maxBookingDays: parseInt(maxBookingDays),
        allowFutureBookings: allowFutureBookings,
        enableCutoffTime: enableCutoffTime,
        cutoffTime: enableCutoffTime && cutoffTime ? cutoffTime : null,
        reopenTime: enableCutoffTime && reopenTime ? reopenTime : null,
        checkoutTime: checkoutTime || null,
        checkinTime: checkinTime || null,
        touristTaxEnabled: touristTaxEnabled ?? true,
        touristTaxAmount: touristTaxAmount || 3.0,
        enableDogOption: enableDogOption ?? false,
        hidePlatformFees: hidePlatformFees ?? false,
        // Informations de facturation
        billingCompanyName: billingCompanyName || null,
        billingAddress: billingAddress || null,
        billingPostalCode: billingPostalCode || null,
        billingCity: billingCity || null,
        billingCountry: billingCountry || null,
        vatNumber: vatNumber || null,
      },
      select: {
        id: true,
        name: true,
        maxBookingDays: true,
        allowFutureBookings: true,
        enableCutoffTime: true,
        cutoffTime: true,
        reopenTime: true,
        checkoutTime: true,
        checkinTime: true,
        touristTaxEnabled: true,
        touristTaxAmount: true,
        enableDogOption: true,
        hidePlatformFees: true,
        // Informations de facturation
        billingCompanyName: true,
        billingAddress: true,
        billingPostalCode: true,
        billingCity: true,
        billingCountry: true,
        vatNumber: true,
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
