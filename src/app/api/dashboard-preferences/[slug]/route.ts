import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_VISIBLE_STATS } from "@/types/dashboard-stats";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const dashboardType = searchParams.get("type") || "admin"; // "admin" ou "public"

    const preferences = await prisma.dashboardPreferences.findFirst({
      where: {
        establishmentSlug: slug,
        dashboardType,
      },
    });

    if (!preferences) {
      // Retourner les préférences par défaut si aucune n'existe
      return NextResponse.json(DEFAULT_VISIBLE_STATS);
    }

    return NextResponse.json({
      visibleStats: preferences.visibleStats,
      sectionOrder: preferences.sectionOrder || [],
      hiddenSections: preferences.hiddenSections || [],
    });
  } catch (error) {
    console.error("Error fetching dashboard preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const dashboardType = searchParams.get("type") || "admin"; // "admin" ou "public"

    const body = await request.json();
    const { visibleStats, sectionOrder, hiddenSections } = body;

    // Debug logs to help troubleshoot save issues
    console.debug(
      "[dashboard-preferences POST] slug:",
      slug,
      "dashboardType:",
      dashboardType
    );
    console.debug("[dashboard-preferences POST] body:", JSON.stringify(body));

    if (!visibleStats) {
      return NextResponse.json(
        { error: "visibleStats is required" },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Establishment not found" },
        { status: 404 }
      );
    }

    // Vérifier si les préférences existent déjà
    const existingPreferences = await prisma.dashboardPreferences.findFirst({
      where: {
        establishmentSlug: slug,
        dashboardType,
      },
    });

    let preferences;
    if (existingPreferences) {
      // Update
      preferences = await prisma.dashboardPreferences.update({
        where: {
          id: existingPreferences.id,
        },
        data: {
          visibleStats,
          sectionOrder: sectionOrder || null,
          hiddenSections: hiddenSections || null,
        },
      });
    } else {
      // Create
      preferences = await prisma.dashboardPreferences.create({
        data: {
          establishmentSlug: slug,
          dashboardType,
          visibleStats,
          sectionOrder: sectionOrder || null,
          hiddenSections: hiddenSections || null,
        },
      });
    }

    return NextResponse.json({
      visibleStats: preferences.visibleStats,
      sectionOrder: preferences.sectionOrder || [],
      hiddenSections: preferences.hiddenSections || [],
    });
  } catch (error) {
    console.error("Error saving dashboard preferences:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }
}
