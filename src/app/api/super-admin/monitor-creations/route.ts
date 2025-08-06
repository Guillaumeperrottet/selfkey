import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification super admin
    const session = request.cookies.get("super-admin-session");

    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Analyser les créations récentes (dernières 24 heures)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    // Établissements créés récemment
    const recentEstablishments = await prisma.establishment.findMany({
      where: {
        createdAt: {
          gte: last24Hours,
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Analyser les créations pour identifier les problèmes
    const analysisResults = recentEstablishments.map((establishment) => {
      const hasUsers = establishment.users.length > 0;
      const hasOwner = establishment.users.some((u) => u.role === "owner");
      const creationTime = establishment.createdAt.toISOString();

      let status = "success";
      const issues = [];

      if (!hasUsers) {
        status = "critical";
        issues.push("Aucun utilisateur associé");
      } else if (!hasOwner) {
        status = "warning";
        issues.push("Pas de propriétaire défini");
      }

      return {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        createdAt: creationTime,
        status,
        issues,
        userCount: establishment.users.length,
        users: establishment.users.map((u) => ({
          email: u.user.email,
          role: u.role,
        })),
        bookingCount: establishment._count.bookings,
      };
    });

    // Statistiques globales pour les dernières 24h
    const stats = {
      totalCreated: recentEstablishments.length,
      successfulCreations: analysisResults.filter((a) => a.status === "success")
        .length,
      problematicCreations: analysisResults.filter(
        (a) => a.status !== "success"
      ).length,
      criticalIssues: analysisResults.filter((a) => a.status === "critical")
        .length,
      warningIssues: analysisResults.filter((a) => a.status === "warning")
        .length,
    };

    // Tendances sur 7 jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyTrendsRaw = await prisma.$queryRaw`
      SELECT 
        DATE(e."createdAt") as creation_date,
        COUNT(*) as total_establishments,
        COUNT(ue.id) as establishments_with_users,
        (COUNT(*) - COUNT(ue.id)) as orphaned_establishments
      FROM "establishments" e
      LEFT JOIN "UserEstablishment" ue ON e.id = ue."establishmentId"
      WHERE e."createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE(e."createdAt")
      ORDER BY creation_date DESC
    `;

    // Convertir les BigInt en nombres
    const weeklyTrends = (
      weeklyTrendsRaw as Array<{
        creation_date: Date;
        total_establishments: bigint;
        establishments_with_users: bigint;
        orphaned_establishments: bigint;
      }>
    ).map((row) => ({
      creation_date: row.creation_date,
      total_establishments: Number(row.total_establishments),
      establishments_with_users: Number(row.establishments_with_users),
      orphaned_establishments: Number(row.orphaned_establishments),
    }));

    // Recommandations basées sur l'analyse
    const recommendations = [];

    if (stats.criticalIssues > 0) {
      recommendations.push({
        priority: "critical",
        message: `${stats.criticalIssues} établissements orphelins créés récemment`,
        action: "Lancer immédiatement la synchronisation des établissements",
        apiEndpoint: "/api/super-admin/sync-establishments",
      });
    }

    if (
      stats.problematicCreations / stats.totalCreated > 0.1 &&
      stats.totalCreated > 0
    ) {
      recommendations.push({
        priority: "high",
        message: "Taux d'erreur élevé dans la création d'établissements",
        action: "Vérifier les logs d'application et les processus de création",
        apiEndpoint: "/api/super-admin/diagnostic-advanced",
      });
    }

    if (stats.totalCreated === 0) {
      recommendations.push({
        priority: "info",
        message: "Aucune création d'établissement dans les dernières 24h",
        action: "Surveillance normale - pas d'action requise",
      });
    }

    const monitoringResult = {
      timestamp: new Date().toISOString(),
      period: "24 hours",
      summary: stats,
      recentCreations: analysisResults,
      weeklyTrends,
      recommendations,
      systemHealth: {
        overallScore: Math.round(
          (stats.successfulCreations / Math.max(stats.totalCreated, 1)) * 100
        ),
        status:
          stats.criticalIssues > 0
            ? "critical"
            : stats.warningIssues > 0
              ? "warning"
              : "healthy",
      },
    };

    console.log("📊 Monitoring des créations d'établissements:", {
      période: "24h",
      total: stats.totalCreated,
      succès: stats.successfulCreations,
      problèmes: stats.problematicCreations,
      santé: monitoringResult.systemHealth.overallScore + "%",
    });

    return NextResponse.json(monitoringResult);
  } catch (error) {
    console.error("❌ Erreur lors du monitoring:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du monitoring des créations",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
