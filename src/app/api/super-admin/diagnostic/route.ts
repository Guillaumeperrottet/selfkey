import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification super admin
    const session = request.cookies.get("super-admin-session");

    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer tous les établissements
    const allEstablishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        users: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Récupérer tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        establishments: {
          select: {
            role: true,
            establishment: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      establishments: allEstablishments,
      users: allUsers,
      analysis: {
        establishmentsWithoutUsers: allEstablishments.filter(
          (est) => est.users.length === 0
        ),
        usersWithoutEstablishments: allUsers.filter(
          (user) => user.establishments.length === 0
        ),
      },
    });
  } catch (error) {
    console.error("Erreur lors du diagnostic:", error);
    return NextResponse.json(
      { error: "Erreur lors du diagnostic" },
      { status: 500 }
    );
  }
}
