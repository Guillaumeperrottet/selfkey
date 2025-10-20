"use client";

import { useState, useEffect } from "react";
import {
  selfcampTranslations,
  type SelfcampLocale,
} from "@/lib/selfcamp-translations";

const STORAGE_KEY = "selfcamp_locale";
const DEFAULT_LOCALE: SelfcampLocale = "fr";

// Fonction pour obtenir la locale initiale depuis le localStorage
function getInitialLocale(): SelfcampLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const savedLocale = localStorage.getItem(STORAGE_KEY) as SelfcampLocale;
  if (savedLocale && selfcampTranslations[savedLocale]) {
    return savedLocale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Hook pour gérer les traductions des pages publiques SelfCamp
 * Utilise le localStorage pour persister la langue choisie
 */
export function useSelfcampTranslation() {
  const [locale, setLocale] = useState<SelfcampLocale>(getInitialLocale);
  const [isLoaded, setIsLoaded] = useState(false);

  // Marquer comme chargé après le montage
  useEffect(() => {
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
