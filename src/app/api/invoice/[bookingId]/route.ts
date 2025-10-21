import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInvoiceToken } from "@/lib/invoice-security";

// Fonction utilitaire pour retry avec délai exponentiel
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;

      // Si c'est une erreur Prisma P1001 (connexion DB), on retry
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P1001"
      ) {
        if (i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i);
          console.log(
            `⏳ Tentative ${i + 1}/${maxRetries} échouée, nouvelle tentative dans ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // Pour les autres erreurs, on ne retry pas
      throw error;
    }
  }

  throw lastError;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // Vérifier que le token est présent
    if (!token) {
      return NextResponse.json(
        { error: "Token d'accès requis" },
        { status: 401 }
      );
    }

    // Récupérer la réservation avec retry en cas d'erreur de connexion
    const booking = await retryWithBackoff(() =>
      prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          establishment: true,
          room: true,
        },
      })
    );

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier le token
    if (!verifyInvoiceToken(token, bookingId, booking.clientEmail)) {
      return NextResponse.json({ error: "Token invalide" }, { status: 403 });
    }

    // Retourner les données de la réservation pour génération côté client
    const bookingData = {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      bookingDate: booking.bookingDate,
      clientFirstName: booking.clientFirstName,
      clientLastName: booking.clientLastName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      clientAddress: booking.clientAddress,
      clientPostalCode: booking.clientPostalCode,
      clientCity: booking.clientCity,
      clientCountry: booking.clientCountry,
      amount: booking.amount,
      currency: booking.currency || "CHF",
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      pricingOptionsTotal: booking.pricingOptionsTotal || 0,
      touristTaxTotal: booking.touristTaxTotal || 0,
      adults: booking.adults,
      selectedPricingOptions: booking.selectedPricingOptions || null,
      room: booking.room
        ? {
            name: booking.room.name,
            price: booking.room.price || 0,
          }
        : null,
    };

    const establishmentData = {
      name: booking.establishment.name,
      slug: booking.establishment.slug,
      commissionRate: booking.establishment.commissionRate,
      fixedFee: booking.establishment.fixedFee,
      address: booking.establishment.address,
      city: booking.establishment.city,
      postalCode: booking.establishment.postalCode,
      country: booking.establishment.country,
      hotelContactPhone: booking.establishment.hotelContactPhone,
      hotelContactEmail: booking.establishment.hotelContactEmail,
      // Informations de facturation
      billingCompanyName: booking.establishment.billingCompanyName,
      billingAddress: booking.establishment.billingAddress,
      billingCity: booking.establishment.billingCity,
      billingPostalCode: booking.establishment.billingPostalCode,
      billingCountry: booking.establishment.billingCountry,
      vatNumber: booking.establishment.vatNumber,
    };

    return NextResponse.json({
      booking: bookingData,
      establishment: establishmentData,
    });
  } catch (error) {
    console.error("Erreur récupération facture:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la facture" },
      { status: 500 }
    );
  }
}
