import { NextRequest, NextResponse } from "next/server";
import { monitorAllConnectedAccounts } from "@/lib/risk-management";

/**
 * Endpoint pour surveiller tous les comptes connectés
 * Selon les responsabilités de la plateforme dans la doc Stripe Connect
 */
export async function GET(request: NextRequest) {
  try {
    // Éviter l'exécution pendant le build
    if (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV) {
      return NextResponse.json(
        { error: "Service non disponible pendant le build" },
        { status: 503 }
      );
    }

    // Vérifier que c'est un appel autorisé (token, IP, etc.)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.MONITORING_API_KEY}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const assessments = await monitorAllConnectedAccounts();

    // Séparer par niveau de risque
    const summary = {
      total: assessments.length,
      low: assessments.filter((a) => a.riskLevel === "low").length,
      medium: assessments.filter((a) => a.riskLevel === "medium").length,
      high: assessments.filter((a) => a.riskLevel === "high").length,
      highRiskAccounts: assessments.filter((a) => a.riskLevel === "high"),
    };

    return NextResponse.json({
      summary,
      assessments,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur surveillance:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

/**
 * Déclencher une évaluation manuelle d'un compte spécifique
 */
export async function POST(request: NextRequest) {
  try {
    // Éviter l'exécution pendant le build
    if (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV) {
      return NextResponse.json(
        { error: "Service non disponible pendant le build" },
        { status: 503 }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.MONITORING_API_KEY}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "ID de compte requis" },
        { status: 400 }
      );
    }

    // Importer et utiliser la fonction d'évaluation
    const { assessAccountRisk } = await import("@/lib/risk-management");
    const assessment = await assessAccountRisk(accountId);

    return NextResponse.json({
      assessment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur évaluation compte:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
