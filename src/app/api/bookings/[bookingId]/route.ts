import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Props {
  params: Promise<{ bookingId: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        establishment: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Erreur lors de la récupération de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { bookingId } = await params;
    const body = await request.json();

    // Vérifier que la réservation existe
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que la réservation n'est pas encore payée
    if (existingBooking.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "Impossible de modifier une réservation déjà payée" },
        { status: 400 }
      );
    }

    // Définir les champs modifiables
    const allowedFields = [
      "clientFirstName",
      "clientLastName",
      "clientEmail",
      "clientPhone",
      "clientAddress",
      "clientPostalCode",
      "clientCity",
      "clientCountry",
      "clientIdNumber",
    ];

    // Filtrer les champs autorisés
    const updateData: Record<string, string> = {};
    Object.keys(body).forEach((key) => {
      if (allowedFields.includes(key) && typeof body[key] === "string") {
        updateData[key] = body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucun champ valide à modifier" },
        { status: 400 }
      );
    }

    // Mettre à jour la réservation
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        room: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        establishment: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Erreur lors de la modification de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
