import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * API de diagnostic pour les problèmes TWINT
 */
export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, bookingId } = await request.json();

    if (!paymentIntentId && !bookingId) {
      return NextResponse.json(
        { error: "paymentIntentId ou bookingId requis" },
        { status: 400 }
      );
    }

    let paymentIntent;
    let booking;

    // Récupérer les détails du PaymentIntent
    if (paymentIntentId) {
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
          expand: ["customer", "latest_charge", "payment_method"],
        });
      } catch (error) {
        console.error("Erreur récupération PaymentIntent:", error);
      }
    }

    // Récupérer les détails de la réservation
    if (bookingId) {
      try {
        booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { establishment: true },
        });

        if (booking?.stripePaymentIntentId && !paymentIntentId) {
          paymentIntent = await stripe.paymentIntents.retrieve(
            booking.stripePaymentIntentId,
            {
              expand: ["customer", "latest_charge", "payment_method"],
            }
          );
        }
      } catch (error) {
        console.error("Erreur récupération booking:", error);
      }
    }

    // Analyse des problèmes potentiels TWINT
    const diagnostics: {
      paymentIntent: object | null;
      booking: object | null;
      issues: string[];
      recommendations: string[];
    } = {
      paymentIntent: paymentIntent
        ? {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            payment_method_types: paymentIntent.payment_method_types,
            customer: paymentIntent.customer,
            last_payment_error: paymentIntent.last_payment_error,
            automatic_payment_methods: paymentIntent.automatic_payment_methods,
          }
        : null,

      booking: booking
        ? {
            id: booking.id,
            amount: booking.amount,
            currency: booking.currency,
            clientCountry: booking.clientCountry,
            clientEmail: booking.clientEmail,
            clientName: `${booking.clientFirstName} ${booking.clientLastName}`,
            establishment: {
              id: booking.establishment.id,
              name: booking.establishment.name,
              stripeAccountId: booking.establishment.stripeAccountId,
              stripeOnboarded: booking.establishment.stripeOnboarded,
            },
          }
        : null,

      issues: [],
      recommendations: [],
    };

    // Vérifications TWINT
    if (paymentIntent) {
      // Vérifier si TWINT est activé
      if (!paymentIntent.payment_method_types.includes("twint")) {
        diagnostics.issues.push(
          "TWINT n'est pas dans les payment_method_types"
        );
        diagnostics.recommendations.push(
          "Ajouter 'twint' aux payment_method_types lors de la création du PaymentIntent"
        );
      }

      // Vérifier la devise
      if (paymentIntent.currency !== "chf") {
        diagnostics.issues.push(
          `Devise incorrecte: ${paymentIntent.currency} (TWINT requiert CHF)`
        );
        diagnostics.recommendations.push(
          "TWINT ne fonctionne qu'avec la devise CHF"
        );
      }

      // Vérifier les redirections
      if (!paymentIntent.automatic_payment_methods?.allow_redirects) {
        diagnostics.issues.push("allow_redirects n'est pas activé");
        diagnostics.recommendations.push(
          "Activer allow_redirects: 'always' pour TWINT"
        );
      }

      // Vérifier le customer
      if (!paymentIntent.customer) {
        diagnostics.issues.push("Aucun Customer associé au PaymentIntent");
        diagnostics.recommendations.push(
          "Créer un Customer avec les données client pour améliorer la compatibilité TWINT"
        );
      }

      // Analyser les erreurs
      if (paymentIntent.last_payment_error) {
        const error = paymentIntent.last_payment_error;
        diagnostics.issues.push(
          `Erreur de paiement: ${error.code} - ${error.message}`
        );

        if (error.code === "payment_method_provider_decline") {
          diagnostics.recommendations.push(
            "Erreur du provider TWINT - vérifier les données client et l'état du compte TWINT"
          );
        }
      }
    }

    if (booking) {
      // Vérifier les données client
      if (
        !booking.clientEmail ||
        !booking.clientFirstName ||
        !booking.clientLastName
      ) {
        diagnostics.issues.push(
          "Données client incomplètes (nom/email manquants)"
        );
        diagnostics.recommendations.push(
          "Vérifier que tous les champs client requis sont renseignés"
        );
      }

      // Vérifier le pays
      if (
        booking.clientCountry &&
        !["Suisse", "Switzerland", "CH"].includes(booking.clientCountry)
      ) {
        diagnostics.issues.push(
          `Pays client non-suisse: ${booking.clientCountry}`
        );
        diagnostics.recommendations.push(
          "TWINT fonctionne principalement en Suisse"
        );
      }

      // Vérifier l'établissement Stripe
      if (!booking.establishment.stripeAccountId) {
        diagnostics.issues.push(
          "Compte Stripe non configuré pour l'établissement"
        );
        diagnostics.recommendations.push(
          "Configurer le compte Stripe Connect pour l'établissement"
        );
      }

      if (!booking.establishment.stripeOnboarded) {
        diagnostics.issues.push(
          "Onboarding Stripe non terminé pour l'établissement"
        );
        diagnostics.recommendations.push(
          "Terminer le processus d'onboarding Stripe Connect"
        );
      }
    }

    // Vérifications générales
    if (diagnostics.issues.length === 0) {
      diagnostics.recommendations.push(
        "Configuration TWINT semble correcte. Vérifier l'état du compte TWINT du client."
      );
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error("Erreur diagnostic TWINT:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du diagnostic TWINT",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
