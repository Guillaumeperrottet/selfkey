import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Vérifie l'authentification par API Key
 * Retourne les informations de la clé si valide, null sinon
 */
export async function authenticateApiKey(request: NextRequest) {
  const apiKey = request.headers.get("X-API-Key");

  if (!apiKey) {
    return null;
  }

  // Rechercher la clé dans la base de données
  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    include: {
      establishment: {
        select: {
          slug: true,
          name: true,
        },
      },
    },
  });

  // Vérifier que la clé existe et est active
  if (!key || !key.isActive) {
    return null;
  }

  // Vérifier l'expiration si définie
  if (key.expiresAt && key.expiresAt < new Date()) {
    return null;
  }

  // Mettre à jour la date de dernière utilisation (async, sans attendre)
  prisma.apiKey
    .update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {
      // Ignorer les erreurs de mise à jour silencieusement
    });

  return key;
}

/**
 * Vérifie que la clé API a les permissions nécessaires
 */
export function hasPermission(
  key: {
    permissions: unknown;
    establishmentSlug: string | null;
  },
  resource: string,
  action: string,
  requestedSlug?: string
): boolean {
  // Si la clé est limitée à un établissement, vérifier la correspondance
  if (key.establishmentSlug && requestedSlug) {
    if (key.establishmentSlug !== requestedSlug) {
      return false;
    }
  }

  // Vérifier les permissions
  const permissions = key.permissions as Record<string, string[]>;

  // Si pas de permissions définies, on refuse par défaut
  if (!permissions || typeof permissions !== "object") {
    return false;
  }

  // Vérifier si la ressource existe et contient l'action
  if (permissions[resource] && Array.isArray(permissions[resource])) {
    return (
      permissions[resource].includes(action) ||
      permissions[resource].includes("*")
    );
  }

  return false;
}

/**
 * Log une requête API
 */
export async function logApiRequest(
  apiKeyId: string | null,
  endpoint: string,
  method: string,
  statusCode: number,
  request: NextRequest,
  responseTime?: number,
  requestBody?: Record<string, unknown>
) {
  try {
    await prisma.apiLog.create({
      data: {
        apiKeyId: apiKeyId || undefined,
        endpoint,
        method,
        statusCode,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || undefined,
        requestBody: requestBody
          ? JSON.parse(JSON.stringify(requestBody))
          : undefined,
        responseTime,
      },
    });
  } catch (error) {
    console.error("Error logging API request:", error);
  }
}

/**
 * Génère une clé API unique
 */
export function generateApiKey(prefix: string = "sk_live"): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = prefix + "_";

  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return key;
}
