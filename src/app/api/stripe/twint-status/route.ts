import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("payment_intent_id");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID requis" },
        { status: 400 }
      );
    }

    // Récupérer le PaymentIntent et ses détails
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: ["charges", "payment_method", "customer"],
      }
    );

    console.log("🔍 TWINT STATUS - PaymentIntent:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      payment_method_types: paymentIntent.payment_method_types,
      last_payment_error: paymentIntent.last_payment_error,
    });

    // Analyser les erreurs spécifiques à TWINT
    const analysis = {
      isTwintPayment: paymentIntent.payment_method_types.includes("twint"),
      hasCustomer: !!paymentIntent.customer,
      customerCountry: null as string | null,
      billingDetailsComplete: false,
      hasRequiredFields: false,
      errors: [] as string[],
      recommendations: [] as string[],
    };

    // Vérifier le customer si présent
    if (paymentIntent.customer && typeof paymentIntent.customer === "object") {
      const customer = paymentIntent.customer as {
        address?: { country?: string };
        name?: string;
        email?: string;
        phone?: string;
      };

      analysis.customerCountry = customer.address?.country || null;
      analysis.hasRequiredFields = !!(
        customer.name &&
        customer.email &&
        customer.address?.country
      );
    }

    // Vérifier les détails de facturation du payment method
    if (
      paymentIntent.payment_method &&
      typeof paymentIntent.payment_method === "object"
    ) {
      const paymentMethod = paymentIntent.payment_method as {
        billing_details?: {
          name?: string;
          email?: string;
          phone?: string;
          address?: {
            country?: string;
            postal_code?: string;
            city?: string;
            line1?: string;
          };
        };
      };

      const billing = paymentMethod.billing_details;
      analysis.billingDetailsComplete = !!(
        billing?.name &&
        billing?.email &&
        billing?.address?.country &&
        billing?.address?.postal_code &&
        billing?.address?.city &&
        billing?.address?.line1
      );
    }

    // Analyser les erreurs
    if (paymentIntent.last_payment_error) {
      const error = paymentIntent.last_payment_error;
      analysis.errors.push(`${error.code}: ${error.message}`);

      if (error.code === "payment_method_provider_decline") {
        analysis.errors.push("Le fournisseur TWINT a refusé le paiement");

        if (!analysis.billingDetailsComplete) {
          analysis.recommendations.push(
            "❌ Informations de facturation incomplètes"
          );
        }

        if (analysis.customerCountry !== "CH") {
          analysis.recommendations.push(
            "❌ TWINT nécessite une adresse suisse"
          );
        }

        if (!analysis.hasCustomer) {
          analysis.recommendations.push(
            "❌ Customer Stripe manquant (requis pour TWINT)"
          );
        }
      }
    }

    // Recommandations générales
    if (analysis.isTwintPayment) {
      analysis.recommendations.push(
        "✅ TWINT est configuré comme méthode de paiement"
      );
    } else {
      analysis.recommendations.push("❌ TWINT n'est pas activé");
    }

    if (analysis.hasCustomer) {
      analysis.recommendations.push("✅ Customer Stripe associé");
    } else {
      analysis.recommendations.push(
        "❌ Pas de Customer Stripe (requis pour TWINT)"
      );
    }

    if (analysis.billingDetailsComplete) {
      analysis.recommendations.push("✅ Détails de facturation complets");
    } else {
      analysis.recommendations.push("❌ Détails de facturation incomplets");
    }

    if (analysis.customerCountry === "CH") {
      analysis.recommendations.push("✅ Adresse client en Suisse");
    } else {
      analysis.recommendations.push("⚠️ Adresse client hors Suisse");
    }

    return NextResponse.json({
      paymentIntentId,
      status: paymentIntent.status,
      analysis,
      rawData: {
        payment_method_types: paymentIntent.payment_method_types,
        last_payment_error: paymentIntent.last_payment_error,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error) {
    console.error("❌ Erreur récupération statut TWINT:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération du statut TWINT",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
