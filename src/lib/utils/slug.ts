/**
 * Utilitaires pour la génération et validation de slugs d'établissements
 */

import { prisma } from "@/lib/prisma";

/**
 * Génère un slug de base à partir du nom
 */
export function generateBaseSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD") // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, "") // Garder seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, "-") // Remplacer espaces par tirets
    .replace(/-+/g, "-") // Remplacer tirets multiples par un seul
    .replace(/^-|-$/g, ""); // Supprimer tirets au début/fin
}

/**
 * Vérifie si un slug existe déjà
 */
export async function slugExists(slug: string): Promise<boolean> {
  const existing = await prisma.establishment.findUnique({
    where: { slug },
    select: { id: true },
  });
  return !!existing;
}

/**
 * Génère des suggestions de slugs alternatifs
 */
export async function generateSlugSuggestions(
  name: string,
  preferredSlug?: string
): Promise<{
  baseSlug: string;
  isAvailable: boolean;
  suggestions: string[];
}> {
  const baseSlug = preferredSlug || generateBaseSlug(name);
  const isAvailable = !(await slugExists(baseSlug));

  if (isAvailable) {
    return {
      baseSlug,
      isAvailable: true,
      suggestions: [],
    };
  }

  // Générer des suggestions alternatives
  const suggestions: string[] = [];

  // 1. Ajouter des suffixes numériques
  for (let i = 2; i <= 5; i++) {
    const suggestion = `${baseSlug}-${i}`;
    if (!(await slugExists(suggestion))) {
      suggestions.push(suggestion);
    }
  }

  // 2. Ajouter des suffixes descriptifs courants
  const suffixes = ["hotel", "camping", "resort", "lodge", "inn"];
  for (const suffix of suffixes) {
    const suggestion = `${baseSlug}-${suffix}`;
    if (!(await slugExists(suggestion)) && !suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  }

  // 3. Ajouter des variantes avec des mots courants
  const words = name.split(/\s+/).filter((word) => word.length > 2);
  if (words.length > 1) {
    // Essayer avec le premier mot seulement
    const firstWordSlug = generateBaseSlug(words[0]);
    if (
      !(await slugExists(firstWordSlug)) &&
      !suggestions.includes(firstWordSlug)
    ) {
      suggestions.push(firstWordSlug);
    }

    // Essayer avec les premiers mots
    for (let i = 2; i <= Math.min(words.length, 3); i++) {
      const partialSlug = generateBaseSlug(words.slice(0, i).join(" "));
      if (
        !(await slugExists(partialSlug)) &&
        !suggestions.includes(partialSlug)
      ) {
        suggestions.push(partialSlug);
      }
    }
  }

  // 4. Ajouter des variantes avec des abréviations
  if (words.length > 1) {
    const abbreviation = words
      .map((word) => word[0])
      .join("")
      .toLowerCase();
    if (abbreviation.length >= 2) {
      const abbrevSlug = `${abbreviation}-${generateBaseSlug(words[words.length - 1])}`;
      if (
        !(await slugExists(abbrevSlug)) &&
        !suggestions.includes(abbrevSlug)
      ) {
        suggestions.push(abbrevSlug);
      }
    }
  }

  // Limiter à 5 suggestions max
  return {
    baseSlug,
    isAvailable: false,
    suggestions: suggestions.slice(0, 5),
  };
}

/**
 * Trouve le prochain slug disponible automatiquement
 */
export async function findAvailableSlug(name: string): Promise<string> {
  const { baseSlug, isAvailable, suggestions } =
    await generateSlugSuggestions(name);

  if (isAvailable) {
    return baseSlug;
  }

  if (suggestions.length > 0) {
    return suggestions[0];
  }

  // Fallback: ajouter un timestamp
  const timestamp = Date.now().toString().slice(-4);
  return `${baseSlug}-${timestamp}`;
}
