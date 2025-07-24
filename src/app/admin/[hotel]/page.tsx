import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/AdminDashboard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ hotel: string }>;
}

export default async function AdminPage({ params }: Props) {
  const { hotel } = await params;

  // Vérifier l'authentification
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/" + hotel);
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
      establishment: true,
    },
  });

  if (!userEstablishment) {
    // L'utilisateur n'a pas accès à cet établissement
    redirect("/establishments");
  }

  const establishment = userEstablishment.establishment;

  // Récupérer les chambres depuis la base de données (toutes, actives et inactives)
  const dbRooms = await prisma.room.findMany({
    where: {
      hotelSlug: hotel,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Séparer les chambres actives pour les calculs de disponibilité
  const activeRooms = dbRooms.filter((room) => room.isActive);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Récupérer toutes les réservations (payées) pour l'affichage complet
  const allBookings = await prisma.booking.findMany({
    where: {
      hotelSlug: hotel,
      // Seulement les réservations avec paiement confirmé
      paymentStatus: "succeeded",
    },
    include: {
      room: true, // Inclure les détails de la chambre
    },
    orderBy: {
      checkInDate: "desc", // Plus récentes en premier
    },
  });

  // Utiliser la nouvelle logique de disponibilité avec checkout à 12h
  const { getCurrentlyAvailableRooms } = await import("@/lib/availability");
  const roomsAvailability = await getCurrentlyAvailableRooms(hotel);

  const roomsWithInventory = activeRooms.map((room) => {
    const availability = roomsAvailability.find((r) => r.id === room.id);
    return {
      id: room.id,
      name: room.name,
      price: room.price,
      inventory: availability?.available ? 1 : 0, // 1 si disponible, 0 si occupée
      isActive: room.isActive,
    };
  });

  // Si on a un stripeAccountId mais pas encore marqué comme onboarded,
  // vérifier le statut réel auprès de Stripe
  if (establishment.stripeAccountId && !establishment.stripeOnboarded) {
    try {
      const { getAccountStatus } = await import("@/lib/stripe-connect");
      const accountStatus = await getAccountStatus(
        establishment.stripeAccountId
      );

      if (accountStatus.chargesEnabled && accountStatus.detailsSubmitted) {
        // Mettre à jour le statut dans la base de données
        await prisma.establishment.update({
          where: { slug: hotel },
          data: { stripeOnboarded: true },
        });
        establishment.stripeOnboarded = true;
      }
    } catch (error) {
      console.error("Erreur vérification statut Stripe:", error);
    }
  }

  const finalIsStripeConfigured =
    establishment.stripeAccountId && establishment.stripeOnboarded;

  return (
    <AdminDashboard
      hotel={hotel}
      establishment={{
        name: establishment.name,
        stripeAccountId: establishment.stripeAccountId,
        stripeOnboarded: establishment.stripeOnboarded,
        commissionRate: establishment.commissionRate,
        fixedFee: establishment.fixedFee,
        accessCodeType: establishment.accessCodeType,
        generalAccessCode: establishment.generalAccessCode,
        accessInstructions: establishment.accessInstructions,
      }}
      roomsWithInventory={roomsWithInventory}
      allBookings={allBookings}
      dbRooms={dbRooms}
      finalIsStripeConfigured={!!finalIsStripeConfigured}
    />
  );
}
