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

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Nom et slug requis" },
        { status: 400 }
      );
    }

    // Vérifier si le slug existe déjà et proposer des alternatives
    const slugValidation = await generateSlugSuggestions(name, slug);

    if (!slugValidation.isAvailable) {
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

    // Créer l'établissement avec les frais par défaut
    const establishment = await prisma.establishment.create({
      data: {
        name,
        slug,
        commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || "0"),
        fixedFee: parseFloat(process.env.PLATFORM_FIXED_FEE || "3.00"),
      },
    });

    // Associer l'utilisateur comme propriétaire
    await prisma.userEstablishment.create({
      data: {
        userId: session.user.id,
        establishmentId: establishment.id,
        role: "owner",
      },
    });

    return NextResponse.json(establishment, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'établissement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
