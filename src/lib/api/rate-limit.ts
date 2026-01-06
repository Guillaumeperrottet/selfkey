import { NextRequest } from "next/server";

/**
 * Rate limiter simple en mémoire
 * Pour une solution production, utilisez Redis ou Upstash
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Store en mémoire (sera réinitialisé au redémarrage du serveur)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration par défaut
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 100; // 100 requêtes par minute

/**
 * Vérifie si une clé API a dépassé sa limite de taux
 * @param apiKeyId - ID de la clé API
 * @param maxRequests - Nombre maximum de requêtes autorisées
 * @param windowMs - Fenêtre de temps en millisecondes
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  apiKeyId: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(apiKeyId);

  // Si pas d'entrée ou fenêtre expirée, créer nouvelle entrée
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(apiKeyId, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
      limit: maxRequests,
    };
  }

  // Incrémenter le compteur
  entry.count++;

  // Vérifier si limite dépassée
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      limit: maxRequests,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
    limit: maxRequests,
  };
}

/**
 * Nettoie les entrées expirées (à appeler périodiquement)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Nettoyer toutes les 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

/**
 * Middleware pour ajouter les headers de rate limit à la réponse
 */
export function addRateLimitHeaders(
  headers: Headers,
  rateLimit: {
    allowed: boolean;
    remaining: number;
    resetAt: number;
    limit: number;
  }
): Headers {
  const newHeaders = new Headers(headers);

  newHeaders.set("X-RateLimit-Limit", rateLimit.limit.toString());
  newHeaders.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
  newHeaders.set(
    "X-RateLimit-Reset",
    Math.ceil(rateLimit.resetAt / 1000).toString()
  );

  if (!rateLimit.allowed) {
    newHeaders.set(
      "Retry-After",
      Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString()
    );
  }

  return newHeaders;
}

/**
 * Récupère ou crée une clé de rate limiting pour une requête
 * Utilise l'API key ID si disponible, sinon l'IP
 */
export function getRateLimitKey(
  request: NextRequest,
  apiKeyId?: string
): string {
  if (apiKeyId) {
    return `api-key:${apiKeyId}`;
  }

  // Fallback sur l'IP
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return `ip:${ip}`;
}
