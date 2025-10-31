/**
 * Utilitaires pour la détection et le routing multi-domaines
 *
 * Application multi-tenant avec deux domaines :
 * - selfcamp.ch : Site public B2C pour les campeurs
 * - selfkey.ch : Application B2B pour les établissements
 */

/**
 * Détermine si le hostname correspond au domaine Selfcamp
 *
 * @param host - Le hostname à vérifier (ex: "www.selfcamp.ch")
 * @returns true si c'est selfcamp, false sinon
 *
 * @example
 * ```tsx
 * import { headers } from "next/headers";
 * import { isSelfcampDomain } from "@/lib/domain-utils";
 *
 * export default async function Page() {
 *   const host = (await headers()).get("host") || "";
 *
 *   if (isSelfcampDomain(host)) {
 *     return <SelfcampContent />;
 *   }
 *
 *   return <SelfkeyContent />;
 * }
 * ```
 */
export function isSelfcampDomain(host: string): boolean {
  return host.includes("selfcamp.ch") || host.includes("selfcamp.vercel.app");
}

/**
 * Détermine si le hostname correspond au domaine Selfkey
 *
 * @param host - Le hostname à vérifier
 * @returns true si c'est selfkey, false sinon
 */
export function isSelfkeyDomain(host: string): boolean {
  return (
    host.includes("selfkey.ch") ||
    host.includes("selfkey.vercel.app") ||
    host === "localhost" ||
    host.startsWith("127.0.0.1")
  );
}

/**
 * Type de domaine détecté
 */
export type DomainType = "selfcamp" | "selfkey";

/**
 * Détecte le type de domaine actuel
 *
 * @param host - Le hostname à analyser
 * @returns Le type de domaine ("selfcamp" ou "selfkey")
 */
export function getDomainType(host: string): DomainType {
  if (isSelfcampDomain(host)) {
    return "selfcamp";
  }
  return "selfkey";
}

/**
 * Récupère l'URL de base selon le domaine
 *
 * @param domainType - Type de domaine
 * @returns L'URL de base du domaine en production
 */
export function getBaseUrl(domainType: DomainType): string {
  if (domainType === "selfcamp") {
    return "https://www.selfcamp.ch";
  }
  return "https://selfkey.ch";
}

/**
 * Constantes pour les domaines
 */
export const DOMAINS = {
  selfcamp: {
    production: "www.selfcamp.ch",
    naked: "selfcamp.ch",
    preview: "selfcamp.vercel.app",
  },
  selfkey: {
    production: "selfkey.ch",
    naked: "selfkey.ch",
    preview: "selfkey.vercel.app",
  },
} as const;
