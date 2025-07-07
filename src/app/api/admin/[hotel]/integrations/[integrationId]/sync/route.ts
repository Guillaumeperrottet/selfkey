import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function checkAuthentication(hotelSlug: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }),
    };
  }

  // Vérifier les permissions d'accès à cet établissement
  const userEstablishment = await prisma.userEstablishment.findFirst({
    where: {
      userId: session.user.id,
      establishment: {
        slug: hotelSlug,
      },
    },
  });

  if (!userEstablishment) {
    return {
      error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }),
    };
  }

  return { user: session.user };
}

interface SyncResult {
  success: boolean;
  error?: string;
  data?: {
    processed?: number;
    total?: number;
    source?: string;
    message?: string;
    url?: string;
  };
}

interface IntegrationConfig {
  apiKey?: string;
  hotelId?: string;
  clientId?: string;
  webhookUrl?: string;
  baseUrl?: string;
  importPath?: string;
  [key: string]: string | number | boolean | undefined;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string; integrationId: string }> }
) {
  try {
    const { hotel, integrationId } = await params;

    // Vérifier l'authentification et les permissions
    const authResult = await checkAuthentication(hotel);
    if (authResult.error) {
      return authResult.error;
    }

    // Récupérer l'intégration
    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        establishmentSlug: hotel,
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Intégration non trouvée" },
        { status: 404 }
      );
    }

    // Effectuer la synchronisation selon le type d'intégration
    let syncResult: SyncResult = {
      success: false,
    };

    switch (integration.type) {
      case "booking-com":
        syncResult = await syncBookingComReservations(
          hotel,
          integration.configuration as IntegrationConfig
        );
        break;
      case "airbnb":
        syncResult = await syncAirbnbReservations(
          hotel,
          integration.configuration as IntegrationConfig
        );
        break;
      case "webhook":
        syncResult = await syncWebhookData(
          hotel,
          integration.configuration as IntegrationConfig
        );
        break;
      case "pms":
        syncResult = await syncPMSData(
          hotel,
          integration.configuration as IntegrationConfig
        );
        break;
      case "csv-import":
        syncResult = await syncCSVData(
          hotel,
          integration.configuration as IntegrationConfig
        );
        break;
      default:
        syncResult = {
          success: false,
          error: "Type d'intégration non supporté",
        };
    }

    // Enregistrer le résultat dans les logs
    await prisma.integrationLog.create({
      data: {
        integrationId,
        action: "sync",
        status: syncResult.success ? "success" : "error",
        message: syncResult.success
          ? "Synchronisation réussie"
          : syncResult.error || "Synchronisation échouée",
        data: syncResult.data,
      },
    });

    // Mettre à jour la dernière synchronisation
    await prisma.integration.update({
      where: { id: integrationId },
      data: {
        lastSync: new Date(),
        lastError: syncResult.success ? null : syncResult.error,
        status: syncResult.success ? "connected" : "error",
      },
    });

    return NextResponse.json(syncResult);
  } catch (error) {
    console.error("Erreur synchronisation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonctions de synchronisation spécifiques
async function syncBookingComReservations(
  hotelSlug: string,
  config: IntegrationConfig
): Promise<SyncResult> {
  try {
    // Simuler une synchronisation avec Booking.com
    const { apiKey, hotelId } = config;

    if (!apiKey || !hotelId) {
      return { success: false, error: "Configuration incomplète" };
    }

    // Ici vous pourriez récupérer les réservations depuis Booking.com
    // et les créer dans votre système
    const mockReservations = [
      {
        externalId: "booking_123",
        guestName: "Jean Dupont",
        checkIn: "2024-12-20",
        checkOut: "2024-12-22",
        amount: 150.0,
        source: "booking.com",
      },
    ];

    // Traiter chaque réservation
    let processed = 0;
    for (const reservation of mockReservations) {
      // Vérifier si la réservation existe déjà
      const existing = await prisma.booking.findFirst({
        where: {
          hotelSlug,
          clientEmail: `${reservation.externalId}@booking.com`, // Email fictif
        },
      });

      if (!existing) {
        // Créer la réservation (nécessiterait une chambre disponible)
        processed++;
      }
    }

    return {
      success: true,
      data: {
        processed,
        total: mockReservations.length,
        source: "booking.com",
      },
    };
  } catch {
    return { success: false, error: "Erreur de synchronisation Booking.com" };
  }
}

async function syncAirbnbReservations(
  hotelSlug: string,
  config: IntegrationConfig
): Promise<SyncResult> {
  try {
    // Simuler une synchronisation avec Airbnb
    const { clientId } = config;

    if (!clientId) {
      return { success: false, error: "Configuration incomplète" };
    }

    // Logique de synchronisation Airbnb
    return {
      success: true,
      data: {
        processed: 0,
        total: 0,
        source: "airbnb",
      },
    };
  } catch {
    return { success: false, error: "Erreur de synchronisation Airbnb" };
  }
}

async function syncWebhookData(
  hotelSlug: string,
  config: IntegrationConfig
): Promise<SyncResult> {
  try {
    // Pour les webhooks, on ne fait pas de synchronisation active
    // mais on peut vérifier la configuration
    const { webhookUrl } = config;

    if (!webhookUrl) {
      return { success: false, error: "URL webhook manquante" };
    }

    return {
      success: true,
      data: {
        message: "Webhook configuré - données reçues passivement",
        url: webhookUrl as string,
      },
    };
  } catch {
    return { success: false, error: "Erreur de configuration webhook" };
  }
}

async function syncPMSData(
  hotelSlug: string,
  config: IntegrationConfig
): Promise<SyncResult> {
  try {
    // Simuler une synchronisation avec un PMS
    const { baseUrl, apiKey } = config;

    if (!baseUrl || !apiKey) {
      return { success: false, error: "Configuration PMS incomplète" };
    }

    // Logique de synchronisation PMS
    return {
      success: true,
      data: {
        processed: 0,
        total: 0,
        source: "pms",
      },
    };
  } catch {
    return { success: false, error: "Erreur de synchronisation PMS" };
  }
}

async function syncCSVData(
  hotelSlug: string,
  config: IntegrationConfig
): Promise<SyncResult> {
  try {
    // Pour CSV, on peut vérifier s'il y a des fichiers à traiter
    const { importPath } = config;

    if (!importPath) {
      return { success: false, error: "Chemin d'import manquant" };
    }

    // Logique de traitement CSV
    return {
      success: true,
      data: {
        processed: 0,
        total: 0,
        source: "csv",
      },
    };
  } catch {
    return { success: false, error: "Erreur de synchronisation CSV" };
  }
}
