import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification super admin
    const session = request.cookies.get("super-admin-session");

    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Trouver tous les établissements sans utilisateurs associés
    const establishmentsWithoutUsers = await prisma.establishment.findMany({
      where: {
        users: {
          none: {},
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (establishmentsWithoutUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tous les établissements ont déjà des utilisateurs associés",
        created: 0,
      });
    }

    // Trouver le premier utilisateur disponible (ou utiliser un utilisateur par défaut)
    const firstUser = await prisma.user.findFirst({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!firstUser) {
      return NextResponse.json(
        { error: "Aucun utilisateur trouvé pour associer les établissements" },
        { status: 400 }
      );
    }

    // Créer les relations UserEstablishment manquantes avec diagnostics détaillés
    const createdRelations = [];
    const failures = [];

    console.log(
      `🔍 Synchronisation: ${establishmentsWithoutUsers.length} établissements orphelins détectés`
    );

    for (const establishment of establishmentsWithoutUsers) {
      try {
        console.log(
          `📍 Traitement de l'établissement: ${establishment.name} (ID: ${establishment.id})`
        );

        // Vérifier si la relation existe déjà (double vérification)
        const existingRelation = await prisma.userEstablishment.findFirst({
          where: {
            establishmentId: establishment.id,
          },
        });

        if (existingRelation) {
          console.log(
            `⚠️ Relation déjà existante pour ${establishment.name} - sautée`
          );
          continue;
        }

        await prisma.userEstablishment.create({
          data: {
            userId: firstUser.id,
            establishmentId: establishment.id,
            role: "owner",
          },
        });

        createdRelations.push({
          establishment: establishment.name,
          user: firstUser.email,
          role: "owner",
        });

        console.log(`✅ Relation créée avec succès pour ${establishment.name}`);
      } catch (error) {
        console.error(
          `❌ Erreur création relation pour ${establishment.name}:`,
          error
        );
        failures.push({
          establishment: establishment.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdRelations.length} relations créées${failures.length > 0 ? `, ${failures.length} échecs` : ""}`,
      created: createdRelations.length,
      failures: failures.length,
      relations: createdRelations,
      failedRelations: failures,
      establishmentsProcessed: establishmentsWithoutUsers.map((e) => e.name),
      diagnostics: {
        totalOrphaned: establishmentsWithoutUsers.length,
        successfulSync: createdRelations.length,
        failedSync: failures.length,
        assignedToUser: firstUser.email,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la synchronisation des établissements" },
      { status: 500 }
    );
  }
}
