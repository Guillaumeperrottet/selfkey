// Cache simple en mémoire pour les rate limits
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Fenêtre de temps en millisecondes
  maxRequests: number; // Nombre maximum de requêtes dans la fenêtre
}

/**
 * Vérifie si une clé dépasse la limite de taux
 * @param key - Clé unique pour identifier le client/ressource
 * @param options - Options de limite de taux
 * @returns true si la limite est dépassée, false sinon
 */
export function isRateLimited(key: string, options: RateLimitOptions): boolean {
  const now = Date.now();
  const existing = rateLimitCache.get(key);

  if (!existing) {
    // Première requête pour cette clé
    rateLimitCache.set(key, { count: 1, resetTime: now + options.windowMs });
    return false;
  }

  if (now > existing.resetTime) {
    // La fenêtre de temps a expiré, réinitialiser
    rateLimitCache.set(key, { count: 1, resetTime: now + options.windowMs });
    return false;
  }

  if (existing.count >= options.maxRequests) {
    // Limite dépassée
    return true;
  }

  // Incrémenter le compteur
  existing.count++;
  rateLimitCache.set(key, existing);
  return false;
}

/**
 * Nettoie les entrées expirées du cache
 */
export function cleanupRateLimitCache(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitCache.entries()) {
    if (now > value.resetTime) {
      rateLimitCache.delete(key);
    }
  }
}

// Nettoyer le cache toutes les 5 minutes
if (typeof window === "undefined") {
  // Uniquement côté serveur
  setInterval(cleanupRateLimitCache, 5 * 60 * 1000);
}
