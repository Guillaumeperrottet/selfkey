import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification super admin
    const session = request.cookies.get("super-admin-session");

    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("🔍 Démarrage diagnostic avancé des établissements...");

    // 1. Statistiques générales
    const totalEstablishments = await prisma.establishment.count();
    const totalUsers = await prisma.user.count();
    const totalUserEstablishments = await prisma.userEstablishment.count();

    // 2. Établissements orphelins
    const orphanedEstablishments = await prisma.establishment.findMany({
      where: {
        users: {
          none: {},
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Utilisateurs sans établissements
    const usersWithoutEstablishments = await prisma.user.findMany({
      where: {
        establishments: {
          none: {},
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 4. Analyse des créations récentes (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEstablishments = await prisma.establishment.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        users: {
          select: {
            user: {
              select: {
                email: true,
              },
            },
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 5. Analyse des patterns de création
    const establishmentsByDateRaw = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as creation_date,
        COUNT(*) as count
      FROM "establishments" 
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY creation_date DESC
    `;

    // Convertir les BigInt en nombres
    const establishmentsByDate = (
      establishmentsByDateRaw as Array<{ creation_date: Date; count: bigint }>
    ).map((row) => ({
      creation_date: row.creation_date,
      count: Number(row.count),
    }));

    // 6. Vérification de l'intégrité des données
    const integrityChecks = {
      establishmentsWithMultipleOwners: await prisma.establishment.count({
        where: {
          users: {
            some: {
              role: "owner",
            },
          },
        },
      }),
      userEstablishmentsWithInvalidRoles: await prisma.userEstablishment.count({
        where: {
          role: {
            notIn: ["owner", "admin", "user"],
          },
        },
      }),
    };

    // 7. Analyse des bookings pour les établissements orphelins
    const orphanedWithBookings = [];
    for (const orphaned of orphanedEstablishments) {
      const bookingCount = await prisma.booking.count({
        where: {
          establishment: {
            slug: orphaned.slug,
          },
        },
      });

      if (bookingCount > 0) {
        orphanedWithBookings.push({
          ...orphaned,
          bookingCount,
        });
      }
    }

    // 8. Suggestions d'actions
    const suggestions = [];

    if (orphanedEstablishments.length > 0) {
      suggestions.push({
        type: "warning",
        message: `${orphanedEstablishments.length} établissements orphelins détectés`,
        action:
          "Utiliser la synchronisation pour les associer à un utilisateur",
        priority: "high",
      });
    }

    if (usersWithoutEstablishments.length > 0) {
      suggestions.push({
        type: "info",
        message: `${usersWithoutEstablishments.length} utilisateurs sans établissements`,
        action: "Vérifier si ces utilisateurs ont besoin d'établissements",
        priority: "medium",
      });
    }

    if (orphanedWithBookings.length > 0) {
      suggestions.push({
        type: "critical",
        message: `${orphanedWithBookings.length} établissements orphelins avec des réservations actives`,
        action:
          "Synchronisation urgente requise pour éviter la perte de données",
        priority: "critical",
      });
    }

    const diagnosticResult = {
      timestamp: new Date().toISOString(),
      summary: {
        totalEstablishments,
        totalUsers,
        totalUserEstablishments,
        orphanedEstablishments: orphanedEstablishments.length,
        usersWithoutEstablishments: usersWithoutEstablishments.length,
        healthScore: Math.round(
          ((totalEstablishments - orphanedEstablishments.length) /
            totalEstablishments) *
            100
        ),
      },
      details: {
        orphanedEstablishments,
        usersWithoutEstablishments,
        recentEstablishments,
        orphanedWithBookings,
        establishmentsByDate,
        integrityChecks,
      },
      suggestions,
      recommendations: {
        shouldRunSync: orphanedEstablishments.length > 0,
        criticalIssues: orphanedWithBookings.length > 0,
        dataIntegrityOk:
          integrityChecks.userEstablishmentsWithInvalidRoles === 0,
      },
    };

    console.log("✅ Diagnostic avancé terminé:", {
      orphaned: orphanedEstablishments.length,
      healthScore: diagnosticResult.summary.healthScore,
    });

    return NextResponse.json(diagnosticResult);
  } catch (error) {
    console.error("❌ Erreur lors du diagnostic avancé:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du diagnostic avancé",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
