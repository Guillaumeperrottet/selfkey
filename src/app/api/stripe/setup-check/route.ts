import { NextResponse } from "next/server";
import { checkStripeConnectSetup } from "@/lib/stripe-connect";

/**
 * Endpoint pour diagnostiquer la configuration Stripe Connect
 */
export async function GET() {
  try {
    const setup = await checkStripeConnectSetup();

    return NextResponse.json(setup);
  } catch (error) {
    console.error("Erreur diagnostic Stripe:", error);
    return NextResponse.json(
      {
        isSetup: false,
        error: "Erreur lors du diagnostic",
        connectEnabled: false,
      },
      { status: 500 }
    );
  }
}
