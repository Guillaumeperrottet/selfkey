import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Vérifier si le slug existe déjà
    const existingEstablishment = await prisma.establishment.findUnique({
      where: { slug },
    });

    if (existingEstablishment) {
      return NextResponse.json(
        { error: "Ce slug existe déjà" },
        { status: 400 }
      );
    }

    // Créer l'établissement
    const establishment = await prisma.establishment.create({
      data: {
        name,
        slug,
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
