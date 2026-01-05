import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les établissements de l'utilisateur
    const userEstablishments = await prisma.userEstablishment.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        establishmentId: true,
        establishment: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    });

    // Extraire les slugs des établissements autorisés
    const authorizedSlugs = userEstablishments.map(
      (ue) => ue.establishment.slug
    );

    if (authorizedSlugs.length === 0) {
      return NextResponse.json({
        summary: {
          totalBookings: 0,
          totalAmount: "0.00",
          totalAmountHT: "0.00",
          totalTVA: "0.00",
          totalCommission: "0.00",
          totalOwnerAmount: "0.00",
          totalTouristTax: "0.00",
          totalPricingOptions: "0.00",
          currency: "CHF",
        },
        byEstablishment: [],
        byMonth: [],
        bookings: [],
        establishments: [],
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const establishmentSlug = searchParams.get("establishmentSlug");
    const includeAccountFees =
      searchParams.get("includeAccountFees") === "true";

    // Filtres de date
    const dateFilter: {
      bookingDate?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (startDate) {
      dateFilter.bookingDate = {
        ...dateFilter.bookingDate,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      dateFilter.bookingDate = {
        ...dateFilter.bookingDate,
        lte: new Date(endDate),
      };
    }

    // Filtre par établissement (optionnel)
    // Si un établissement spécifique est demandé, vérifier qu'il est autorisé
    let establishmentFilter = {};
    if (establishmentSlug) {
      if (!authorizedSlugs.includes(establishmentSlug)) {
        return NextResponse.json(
          { error: "Accès refusé à cet établissement" },
          { status: 403 }
        );
      }
      establishmentFilter = { hotelSlug: establishmentSlug };
    } else {
      // Sinon, filtrer uniquement sur les établissements autorisés
      establishmentFilter = { hotelSlug: { in: authorizedSlugs } };
    }

    // Récupérer toutes les réservations payées avec succès
    const bookings = await prisma.booking.findMany({
      where: {
        paymentStatus: "succeeded",
        ...dateFilter,
        ...establishmentFilter,
      },
      include: {
        establishment: {
          select: {
            name: true,
            slug: true,
            billingCompanyName: true,
            billingAddress: true,
            billingCity: true,
            billingPostalCode: true,
            billingCountry: true,
            vatNumber: true,
          },
        },
        room: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    // Calculer les statistiques globales
    const totalAmount = bookings.reduce(
      (sum, booking) => sum + booking.amount,
      0
    );
    const totalCommission = bookings.reduce(
      (sum, booking) => sum + booking.platformCommission,
      0
    );
    const totalOwnerAmount = bookings.reduce(
      (sum, booking) => sum + booking.ownerAmount,
      0
    );
    const totalTouristTax = bookings.reduce(
      (sum, booking) => sum + (booking.touristTaxTotal || 0),
      0
    );
    const totalStripeFees = bookings.reduce(
      (sum, booking) => sum + (booking.stripeFee || 0),
      0
    );

    // Récupérer les frais de compte Stripe si demandé
    let accountFees = 0;
    if (includeAccountFees && startDate && endDate) {
      try {
        const balanceTransactions = await stripe.balanceTransactions.list({
          type: "stripe_fee",
          created: {
            gte: Math.floor(new Date(startDate).getTime() / 1000),
            lte: Math.floor(new Date(endDate).getTime() / 1000),
          },
          limit: 100,
        });

        accountFees = balanceTransactions.data.reduce((sum, txn) => {
          return sum + Math.abs(txn.amount / 100); // Convertir en CHF et valeur absolue
        }, 0);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des frais de compte Stripe:",
          error
        );
        // Ne pas bloquer le rapport si erreur
      }
    }

    // Calculer la TVA (3.8% sur tout sauf la taxe de séjour)
    const TVA_RATE = 0.038; // 3.8%
    const totalAmountHT = bookings.reduce((sum, booking) => {
      const amountWithoutTouristTax =
        booking.amount - (booking.touristTaxTotal || 0);
      const amountHT = amountWithoutTouristTax / (1 + TVA_RATE);
      return sum + amountHT;
    }, 0);

    const totalTVA = bookings.reduce((sum, booking) => {
      const amountWithoutTouristTax =
        booking.amount - (booking.touristTaxTotal || 0);
      const amountHT = amountWithoutTouristTax / (1 + TVA_RATE);
      const tva = amountWithoutTouristTax - amountHT;
      return sum + tva;
    }, 0);

    const totalPricingOptions = bookings.reduce(
      (sum, booking) => sum + (booking.pricingOptionsTotal || 0),
      0
    );

    // Grouper par établissement
    const byEstablishment = bookings.reduce(
      (acc, booking) => {
        const slug = booking.hotelSlug;
        if (!acc[slug]) {
          acc[slug] = {
            name: booking.establishment.name,
            slug: slug,
            totalAmount: 0,
            totalCommission: 0,
            totalOwnerAmount: 0,
            bookingCount: 0,
            billingInfo: {
              companyName: booking.establishment.billingCompanyName,
              address: booking.establishment.billingAddress,
              city: booking.establishment.billingCity,
              postalCode: booking.establishment.billingPostalCode,
              country: booking.establishment.billingCountry,
              vatNumber: booking.establishment.vatNumber,
            },
          };
        }
        acc[slug].totalAmount += booking.amount;
        acc[slug].totalCommission += booking.platformCommission;
        acc[slug].totalOwnerAmount += booking.ownerAmount;
        acc[slug].bookingCount += 1;
        return acc;
      },
      {} as Record<
        string,
        {
          name: string;
          slug: string;
          totalAmount: number;
          totalCommission: number;
          totalOwnerAmount: number;
          bookingCount: number;
          billingInfo: {
            companyName: string | null;
            address: string | null;
            city: string | null;
            postalCode: string | null;
            country: string | null;
            vatNumber: string | null;
          };
        }
      >
    );

    // Grouper par mois
    const byMonth = bookings.reduce(
      (acc, booking) => {
        const month = new Date(booking.bookingDate).toISOString().slice(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = {
            totalAmount: 0,
            totalCommission: 0,
            totalOwnerAmount: 0,
            bookingCount: 0,
          };
        }
        acc[month].totalAmount += booking.amount;
        acc[month].totalCommission += booking.platformCommission;
        acc[month].totalOwnerAmount += booking.ownerAmount;
        acc[month].bookingCount += 1;
        return acc;
      },
      {} as Record<
        string,
        {
          totalAmount: number;
          totalCommission: number;
          totalOwnerAmount: number;
          bookingCount: number;
        }
      >
    );

    // Grouper par type de réservation
    const byBookingType = bookings.reduce(
      (acc, booking) => {
        const type = booking.bookingType || "night";
        if (!acc[type]) {
          acc[type] = {
            totalAmount: 0,
            totalCommission: 0,
            bookingCount: 0,
          };
        }
        acc[type].totalAmount += booking.amount;
        acc[type].totalCommission += booking.platformCommission;
        acc[type].bookingCount += 1;
        return acc;
      },
      {} as Record<
        string,
        { totalAmount: number; totalCommission: number; bookingCount: number }
      >
    );

    return NextResponse.json({
      summary: {
        totalBookings: bookings.length,
        totalAmount: totalAmount.toFixed(2),
        totalAmountHT: totalAmountHT.toFixed(2),
        totalTVA: totalTVA.toFixed(2),
        totalCommission: totalCommission.toFixed(2),
        totalOwnerAmount: totalOwnerAmount.toFixed(2),
        totalTouristTax: totalTouristTax.toFixed(2),
        totalPricingOptions: totalPricingOptions.toFixed(2),
        totalStripeFees: totalStripeFees.toFixed(2),
        accountFees: accountFees.toFixed(2),
        totalStripeFeesWithAccount: (totalStripeFees + accountFees).toFixed(2),
        currency: "CHF",
      },
      byEstablishment: Object.values(byEstablishment),
      byMonth: Object.entries(byMonth).map(([month, data]) => ({
        month,
        ...data,
      })),
      byBookingType: Object.entries(byBookingType).map(([type, data]) => ({
        type,
        ...data,
      })),
      establishments: userEstablishments.map((ue) => ({
        slug: ue.establishment.slug,
        name: ue.establishment.name,
      })),
      bookings: bookings.map((booking) => {
        // Le montant total inclut tout : base + options + taxe de séjour (TTC)
        // amount = base_TTC + options_TTC + touristTax

        // 1. Calculer le montant sans taxe de séjour (qui a TVA 0%)
        const amountWithoutTouristTax =
          booking.amount - (booking.touristTaxTotal || 0);

        // 2. Séparer la base TTC des options TTC
        // amountWithoutTouristTax = base_TTC + options_TTC
        const baseAmountTTC =
          amountWithoutTouristTax - (booking.pricingOptionsTotal || 0);
        const optionsAmountTTC = booking.pricingOptionsTotal || 0;

        // 3. Calculer le HT et la TVA pour la base
        const baseAmountHT = baseAmountTTC / (1 + TVA_RATE);
        const baseTVA = baseAmountTTC - baseAmountHT;

        // 4. Calculer le HT et la TVA pour les options
        const optionsAmountHT = optionsAmountTTC / (1 + TVA_RATE);
        const optionsTVA = optionsAmountTTC - optionsAmountHT;

        // 5. Total HT et TVA
        const totalAmountHT = baseAmountHT + optionsAmountHT;
        const totalTVA = baseTVA + optionsTVA;

        return {
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          bookingDate: booking.bookingDate,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          clientName: `${booking.clientFirstName} ${booking.clientLastName}`,
          clientEmail: booking.clientEmail,
          establishmentName: booking.establishment.name,
          roomName: booking.room?.name || "N/A",
          amount: booking.amount,
          baseAmount: baseAmountTTC,
          baseAmountHT: baseAmountHT,
          pricingOptions: booking.selectedPricingOptions || [],
          pricingOptionsTotal: optionsAmountTTC,
          pricingOptionsHT: optionsAmountHT,
          touristTax: booking.touristTaxTotal || 0,
          amountHT: totalAmountHT,
          tva: totalTVA,
          platformCommission: booking.platformCommission,
          ownerAmount: booking.ownerAmount,
          currency: booking.currency,
          bookingType: booking.bookingType,
          stripePaymentIntentId: booking.stripePaymentIntentId,
          paymentStatus: booking.paymentStatus,
          guests: booking.guests,
          adults: booking.adults,
          children: booking.children,
          hasDog: booking.hasDog,
          stripeFee: booking.stripeFee || null,
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching payment report:", error);
    return NextResponse.json(
      { error: "Failed to generate payment report" },
      { status: 500 }
    );
  }
}
