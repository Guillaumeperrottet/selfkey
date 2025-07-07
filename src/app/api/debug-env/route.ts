import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Définie" : "❌ Manquante",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
      ? "✅ Définie"
      : "❌ Manquante",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
      ? "✅ Définie"
      : "❌ Manquante",
  });
}
