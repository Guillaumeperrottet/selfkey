"use client";

import { useState, useEffect } from "react";
import {
  selfcampTranslations,
  type SelfcampLocale,
} from "@/lib/selfcamp-translations";

const STORAGE_KEY = "selfcamp_locale";
const DEFAULT_LOCALE: SelfcampLocale = "fr";

/**
 * Hook pour gérer les traductions des pages publiques SelfCamp
 * Utilise le localStorage pour persister la langue choisie
 */
export function useSelfcampTranslation() {
  const [locale, setLocale] = useState<SelfcampLocale>(DEFAULT_LOCALE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger la langue sauvegardée au montage du composant
  useEffect(() => {
    const savedLocale = localStorage.getItem(STORAGE_KEY) as SelfcampLocale;
    if (savedLocale && selfcampTranslations[savedLocale]) {
      setLocale(savedLocale);
    }
    setIsLoaded(true);
  }, []);

  // Changer de langue, sauvegarder dans localStorage et recharger la page
  const changeLocale = (newLocale: SelfcampLocale) => {
    if (newLocale === locale) return; // Ne rien faire si c'est déjà la langue active

    setLocale(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);

    // Recharger la page pour appliquer la nouvelle langue partout
    window.location.reload();
  };

  return {
    locale,
    t: selfcampTranslations[locale],
    changeLocale,
    isLoaded,
  };
}
