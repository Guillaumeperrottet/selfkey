import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Debug signup request:", {
      body,
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url,
    });

    // Tenter l'inscription via better-auth directement
    const response = await fetch(
      `${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: process.env.NEXT_PUBLIC_APP_URL || "https://www.selfkey.ch",
        },
        body: JSON.stringify(body),
      }
    );

    const responseText = await response.text();

    console.log("Better-auth response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText,
    });

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      body: responseText,
      error: !response.ok,
    });
  } catch (error) {
    console.error("Debug signup error:", error);
    return NextResponse.json(
      {
        error: "Erreur du serveur",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
