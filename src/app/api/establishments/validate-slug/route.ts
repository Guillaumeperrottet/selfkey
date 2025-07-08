import { NextRequest, NextResponse } from "next/server";
import { generateSlugSuggestions } from "@/lib/slug-utils";

export async function POST(request: NextRequest) {
  try {
    const { name, slug } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de l'établissement est requis" },
        { status: 400 }
      );
    }

    const result = await generateSlugSuggestions(name, slug);

    return NextResponse.json({
      success: true,
      baseSlug: result.baseSlug,
      isAvailable: result.isAvailable,
      suggestions: result.suggestions,
      message: result.isAvailable
        ? "Ce slug est disponible !"
        : "Ce slug est déjà pris. Voici quelques suggestions :",
    });
  } catch (error) {
    console.error("Erreur validation slug:", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation du slug" },
      { status: 500 }
    );
  }
}
