import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlugSuggestions } from "@/lib/slug-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const establishments = await prisma.establishment.findMany({
      where: {
        users: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        _count: {
          select: {
            rooms: true,
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(establishments);
  } catch (error) {
    console.error("Erreur lors de la récupération des établissements:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name, slug } = await request.json();
    console.log(
      `🏗️ API: Début création établissement: ${name} (${slug}) pour utilisateur ${session.user.id}`
    );

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Nom et slug requis" },
        { status: 400 }
      );
    }

    // Vérifier si le slug existe déjà et proposer des alternatives
    console.log(`🔍 Vérification de la disponibilité du slug: ${slug}`);
    const slugValidation = await generateSlugSuggestions(name, slug);

    if (!slugValidation.isAvailable) {
      console.log(
        `❌ Slug ${slug} déjà utilisé, suggestions: ${slugValidation.suggestions.join(", ")}`
      );
      return NextResponse.json(
        {
          error: "Ce slug est déjà utilisé par un autre établissement",
          suggestion:
            "Vous pouvez garder le même nom d'établissement, mais le slug (adresse web) doit être unique.",
          suggestions: slugValidation.suggestions,
          baseSlug: slugValidation.baseSlug,
        },
        { status: 400 }
      );
    }

    console.log(`✅ Slug ${slug} disponible, création en cours...`);

    // Utiliser une transaction pour garantir la cohérence
    const establishment = await prisma.$transaction(async (tx) => {
      console.log(`📝 API: Création de l'établissement dans la transaction...`);

      // Créer l'établissement avec les frais par défaut
      const newEstablishment = await tx.establishment.create({
        data: {
          name,
          slug,
          commissionRate: parseFloat(
            process.env.PLATFORM_COMMISSION_RATE || "0"
          ),
          fixedFee: parseFloat(process.env.PLATFORM_FIXED_FEE || "3.00"),
        },
      });

      console.log(`✅ API: Établissement créé avec ID: ${newEstablishment.id}`);
      console.log(`🔗 API: Création de la relation UserEstablishment...`);

      // Associer l'utilisateur comme propriétaire
      await tx.userEstablishment.create({
        data: {
          userId: session.user.id,
          establishmentId: newEstablishment.id,
          role: "owner",
        },
      });

      console.log(`✅ API: Relation UserEstablishment créée avec succès`);
      return newEstablishment;
    });

    console.log(
      `🎉 API: Établissement créé avec succès: ${establishment.name} (${establishment.slug}) pour l'utilisateur ${session.user.id}`
    );

    return NextResponse.json(establishment, { status: 201 });
  } catch (error) {
    console.error(
      "❌ API: Erreur lors de la création de l'établissement:",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
