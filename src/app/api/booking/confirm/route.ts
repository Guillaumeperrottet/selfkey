import { NextRequest, NextResponse } from "next/server";
import { updateBookingWithPayment } from "@/lib/booking";
import { sendBookingConfirmation } from "@/lib/email";
import { getHotelConfig } from "@/lib/hotel-config";

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
    const booking = await updateBookingWithPayment(bookingId, paymentIntentId);

    // Récupérer la config de l'hôtel
    const hotelConfig = await getHotelConfig(booking.hotelSlug);
    if (!hotelConfig) {
      throw new Error("Configuration hôtel non trouvée");
    }

    // Trouver les détails de la chambre
    const room = hotelConfig.rooms.find((r) => r.id === booking.roomId);
    if (!room) {
      throw new Error("Chambre non trouvée");
    }

    // Envoyer l'email de confirmation
    try {
      await sendBookingConfirmation(
        {
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          roomName: room.name,
          roomId: booking.roomId,
          amount: booking.amount,
          currency: booking.currency,
          bookingDate: booking.bookingDate,
        },
        hotelConfig
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
