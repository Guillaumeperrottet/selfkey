import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateTemplateData,
  generateConfirmationContent,
  type BookingWithDetails,
} from "@/lib/confirmation-template";

interface Props {
  params: Promise<{ bookingId: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { bookingId } = await params;

    // Récupérer la réservation complète avec les mêmes données que l'email
    const booking: BookingWithDetails | null = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: {
          select: {
            name: true,
            price: true,
            accessCode: true,
          },
        },
        establishment: {
          select: {
            id: true,
            name: true,
            accessCodeType: true,
            confirmationEmailTemplate: true,
            confirmationEmailTemplateWithDog: true,
            confirmationEmailTemplateWithoutDog: true,
            generalAccessCode: true,
            accessInstructions: true,
            hotelContactEmail: true,
            hotelContactPhone: true,
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

    // Vérifier que la réservation a bien été payée
    if (!booking.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "Réservation non payée" },
        { status: 400 }
      );
    }

    // Générer les données du template
    const templateData = generateTemplateData(booking);

    // Générer le contenu de confirmation (même logique que l'email)
    const content = await generateConfirmationContent(booking, templateData);

    return NextResponse.json({
      content,
      templateData,
      isHtml: content.includes("<") && content.includes(">"),
    });
  } catch (error) {
    console.error(
      "Erreur lors de la génération du contenu de confirmation:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
