import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Cette API est obsolète. Utilisez /api/establishments/[hotel]/bookings",
    },
    { status: 410 }
  );
}
