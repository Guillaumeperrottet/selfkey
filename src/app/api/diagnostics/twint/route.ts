import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

interface DiagnosticRequest {
  bookingId: string;
  clientData: {
    email: string;
    name: string;
    phone: string;
    address: {
      line1: string;
      city: string;
      postal_code: string;
      country: string;
    };
  };
  amount: number;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: DiagnosticRequest = await request.json();

    console.log("🔍 TWINT DIAGNOSTIC - Données reçues:", data);

    // 1. Tester la création d'un Customer
    let customerId: string | undefined;
    try {
      const customer = await stripe.customers.create({
        name: data.clientData.name,
        email: data.clientData.email,
        phone: data.clientData.phone,
        address: {
          line1: data.clientData.address.line1,
          city: data.clientData.address.city,
          postal_code: data.clientData.address.postal_code,
          country: data.clientData.address.country,
        },
        metadata: {
          diagnostic: "true",
          booking_id: data.bookingId,
        },
      });
      customerId = customer.id;
      console.log("✅ Customer créé pour diagnostic:", customerId);
    } catch (customerError) {
      console.error("❌ Erreur création Customer:", customerError);
      return NextResponse.json({
        error: "Impossible de créer le Customer Stripe",
        details:
          customerError instanceof Error
            ? customerError.message
            : "Erreur inconnue",
      });
    }

    // 2. Tester la création d'un PaymentIntent simple (sans Connect)
    let paymentIntentId: string | undefined;
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convertir en centimes
        currency: data.currency.toLowerCase(),
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "always",
        },
        payment_method_types: ["card", "twint"],
        description: `Test TWINT Diagnostic - Booking ${data.bookingId}`,
        metadata: {
          diagnostic: "true",
          booking_id: data.bookingId,
        },
      });

      paymentIntentId = paymentIntent.id;
      console.log("✅ PaymentIntent créé pour diagnostic:", {
        id: paymentIntentId,
        status: paymentIntent.status,
        supportedMethods: paymentIntent.payment_method_types,
      });

      // 3. Récupérer les détails du Customer pour vérification
      const customerDetails = await stripe.customers.retrieve(customerId);
      const customerData = customerDetails as {
        name?: string;
        email?: string;
        address?: {
          country?: string;
        };
      };

      // 4. Nettoyer après le test
      try {
        await stripe.paymentIntents.cancel(paymentIntentId);
        await stripe.customers.del(customerId);
        console.log("🧹 Nettoyage effectué après diagnostic");
      } catch (cleanupError) {
        console.warn("⚠️ Erreur lors du nettoyage:", cleanupError);
      }

      return NextResponse.json({
        success: true,
        paymentIntentId,
        customerId,
        status: paymentIntent.status,
        supportedMethods: paymentIntent.payment_method_types,
        customerDetails: {
          country: customerData.address?.country,
          name: customerData.name,
          email: customerData.email,
        },
        recommendations: [
          "✅ Customer Stripe créé avec succès",
          "✅ PaymentIntent supportant TWINT créé",
          paymentIntent.payment_method_types.includes("twint")
            ? "✅ TWINT est activé sur votre compte"
            : "❌ TWINT n'est pas activé sur votre compte",
          customerData.address?.country === "CH"
            ? "✅ Adresse client en Suisse (requis pour TWINT)"
            : "⚠️ Adresse client hors Suisse (TWINT limité à la Suisse)",
        ],
      });
    } catch (paymentIntentError) {
      console.error("❌ Erreur création PaymentIntent:", paymentIntentError);

      // Nettoyer le customer en cas d'erreur
      try {
        await stripe.customers.del(customerId);
      } catch (cleanupError) {
        console.warn("⚠️ Erreur nettoyage customer:", cleanupError);
      }

      return NextResponse.json({
        error: "Impossible de créer le PaymentIntent",
        details:
          paymentIntentError instanceof Error
            ? paymentIntentError.message
            : "Erreur inconnue",
        customerId,
        recommendations: [
          "❌ Vérifiez que TWINT est activé sur votre compte Stripe",
          "❌ Vérifiez que le pays client est la Suisse",
          "❌ Vérifiez votre configuration Stripe Connect",
        ],
      });
    }
  } catch (error) {
    console.error("❌ Erreur diagnostic TWINT:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du diagnostic TWINT",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
