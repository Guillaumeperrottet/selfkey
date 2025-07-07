import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const envVars = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
  };

  return NextResponse.json({
    message: "Debug des variables d'environnement",
    env: envVars,
    headers: Object.fromEntries(request.headers.entries()),
    url: request.url,
  });
}
