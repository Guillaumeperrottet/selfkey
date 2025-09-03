import { NextRequest, NextResponse } from "next/server";
import { updateBookingWithPayment } from "@/lib/booking";
import { sendBookingConfirmation } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { bookingId, paymentIntentId } = await request.json();

    if (!bookingId || !paymentIntentId) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Mettre à jour la réservation avec le PaymentIntent ID
    await updateBookingWithPayment(bookingId, paymentIntentId);

    // Récupérer les infos de l'établissement et de la chambre
    const bookingWithDetails = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        establishment: true,
        room: true,
      },
    });

    if (!bookingWithDetails) {
      throw new Error("Réservation non trouvée");
    }

    // Envoyer l'email de confirmation (simulé pour le moment)
    try {
      await sendBookingConfirmation(
        {
          id: bookingWithDetails.id, // Ajout de l'ID de réservation
          clientName: `${bookingWithDetails.clientFirstName} ${bookingWithDetails.clientLastName}`,
          clientEmail: bookingWithDetails.clientEmail,
          roomName: bookingWithDetails.room
            ? bookingWithDetails.room.name
            : "Parking jour",
          roomId: bookingWithDetails.roomId,
          amount: bookingWithDetails.amount,
          currency: bookingWithDetails.currency,
          bookingDate: bookingWithDetails.bookingDate,
          hotelSlug: bookingWithDetails.hotelSlug, // Ajouté pour les codes d'accès
        },
        {
          name: bookingWithDetails.establishment.name,
          currency: "CHF",
          rooms: [],
          logo: "",
          colors: { primary: "#000" },
          contact: { email: "", phone: "" },
          stripe_key: "",
          stripe_account_id: "",
        }
      );
    } catch (emailError) {
      console.error("Erreur envoi email:", emailError);
      // Ne pas faire échouer la requête si l'email échoue
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur confirmation booking:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
