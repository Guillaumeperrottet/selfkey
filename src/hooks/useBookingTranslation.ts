"use client";

import { useState, useEffect } from "react";
import { translations, type Locale } from "@/lib/booking-translations";

const LOCALE_STORAGE_KEY = "booking_locale";

// Fonction pour obtenir la locale initiale depuis le localStorage
function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "fr";

  const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
  if (savedLocale && ["fr", "en", "de"].includes(savedLocale)) {
    return savedLocale;
  }
  return "fr";
}

/**
 * Hook pour gérer les traductions du système de réservatio
 * Persiste la langue choisie dans le localStorage
 */
export function useBookingTranslation() {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
  const [mounted, setMounted] = useState(false);

  // Marquer comme monté après le montage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fonction pour changer de langue
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  };

  // Retourner les traductions de la langue active
  const t = translations[locale];

  return {
    t,
    locale,
    setLocale,
    mounted, // Pour éviter les hydration mismatches
  };
}

/**
 * Hook simplifié pour obtenir uniquement les traductions
 * (sans gestion du changement de langue)
 */
export function useT() {
  const { t } = useBookingTranslation();
  return t;
}
