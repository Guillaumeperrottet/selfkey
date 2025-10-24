import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicDashboardClient } from "./PublicDashboardClient";

interface Props {
  params: Promise<{ hotel: string }>;
  searchParams: Promise<{ token?: string }>;
}

async function getEstablishmentData(hotelSlug: string) {
  const establishment = await prisma.establishment.findUnique({
    where: { slug: hotelSlug },
    include: {
      rooms: {
        orderBy: { name: "asc" },
      },
      bookings: {
        where: {
          paymentStatus: "succeeded",
        },
        orderBy: { bookingDate: "desc" },
        include: {
          room: true,
        },
      },
    },
  });

  if (!establishment) {
    return null;
  }

  // Anonymiser les données des réservations pour la version publique
  const anonymizedBookings = establishment.bookings.map((booking) => ({
    id: booking.id,
    bookingDate: booking.bookingDate,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    guests: booking.guests,
    amount: booking.amount,
    touristTaxTotal: booking.touristTaxTotal,
    paymentStatus: booking.paymentStatus,
    bookingType: booking.bookingType,
    adults: booking.adults,
    children: booking.children,
    room: booking.room
      ? {
          id: booking.room.id,
          name: booking.room.name,
          price: booking.room.price,
        }
      : null,
    // Exclure les informations sensibles :
    // - clientFirstName, clientLastName
    // - clientEmail, clientPhone
    // - clientAddress, clientCity, etc.
    // - clientVehicleNumber
    // - stripePaymentIntentId
  }));

  return {
    establishment: {
      name: establishment.name,
      slug: establishment.slug,
      commissionRate: establishment.commissionRate,
      fixedFee: establishment.fixedFee,
    },
    rooms: establishment.rooms.map((room) => ({
      id: room.id,
      name: room.name,
      price: room.price,
      isActive: room.isActive,
    })),
    bookings: anonymizedBookings,
  };
}

export default async function PublicDashboardPage({
  params,
  searchParams,
}: Props) {
  const { hotel } = await params;
  const { token } = await searchParams;

  // Vérifier le token d'accès
  const expectedToken = `${hotel}-dashboard-public-2025`;
  if (!token || token !== expectedToken) {
    notFound();
  }

  const data = await getEstablishmentData(hotel);
  if (!data) {
    notFound();
  }

  return (
    <PublicDashboardClient
      establishment={data.establishment}
      rooms={data.rooms}
      bookings={data.bookings}
    />
  );
}
