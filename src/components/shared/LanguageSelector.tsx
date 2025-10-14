"use client";

import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookingTranslation } from "@/hooks/useBookingTranslation";
import type { Locale } from "@/lib/booking-translations";

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Composant de sélection de langue pour le parcours de réservation
 * Affiche un sélecteur élégant avec drapeaux émojis
 */
export function LanguageSelector({
  className = "",
  showLabel = true,
}: LanguageSelectorProps) {
  const { locale, setLocale, t, mounted } = useBookingTranslation();

  // Éviter les hydration mismatches
  if (!mounted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="h-4 w-4 text-gray-400" />
        <div className="w-32 h-10 bg-gray-100 rounded-md animate-pulse" />
      </div>
    );
  }

  const languages = [
    { code: "fr" as Locale, flag: "🇫🇷", label: t.language.fr },
    { code: "en" as Locale, flag: "🇬🇧", label: t.language.en },
    { code: "de" as Locale, flag: "🇩🇪", label: t.language.de },
  ];

  const currentLanguage = languages.find((lang) => lang.code === locale);

  const handleLanguageChange = (value: string) => {
    setLocale(value as Locale);
    // Rafraîchir la page pour mettre à jour tous les composants
    window.location.reload();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && <Globe className="h-4 w-4 text-gray-600" />}
      <Select value={locale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-fit min-w-[140px] h-10 bg-white border-gray-300">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span className="text-lg">{currentLanguage?.flag}</span>
              <span className="font-medium">{currentLanguage?.label}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Version compacte du sélecteur de langue (seulement icône + drapeaux)
 */
export function LanguageSelectorCompact({
  className = "",
}: {
  className?: string;
}) {
  return <LanguageSelector className={className} showLabel={false} />;
}
