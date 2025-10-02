import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInvoiceToken } from "@/lib/invoice-security";

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

    // Récupérer la réservation
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        establishment: true,
        room: true,
      },
    });

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
