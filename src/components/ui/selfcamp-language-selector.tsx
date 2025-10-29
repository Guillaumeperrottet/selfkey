"use client";

import { useSelfcampTranslation } from "@/hooks/useSelfcampTranslation";
import type { SelfcampLocale } from "@/lib/selfcamp-translations";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface LanguageOption {
  code: SelfcampLocale;
  label: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

interface SelfcampLanguageSelectorProps {
  variant?: "default" | "compact" | "minimal";
}

export function SelfcampLanguageSelector({
  variant = "default",
}: SelfcampLanguageSelectorProps) {
  const { locale, changeLocale } = useSelfcampTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === locale);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (code: SelfcampLocale) => {
    changeLocale(code);
    setIsOpen(false);
  };

  // Version minimale pour mobile - dropdown compact
  if (variant === "minimal") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide text-white hover:text-white/80 transition-colors drop-shadow-lg"
          aria-label="Changer la langue"
        >
          <span>{currentLanguage?.code}</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  w-full flex items-center justify-center px-3 py-2 text-sm text-center
                  transition-colors duration-150
                  ${
                    locale === lang.code
                      ? "bg-[#84994F]/10 text-[#84994F] font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <span className="text-xs font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Version compacte pour desktop - dropdown élégant
  if (variant === "compact") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-base font-bold text-white hover:text-white/80 transition-all duration-200 drop-shadow-lg"
          aria-label="Changer la langue"
        >
          <span className="text-sm">{currentLanguage?.code.toUpperCase()}</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  w-full flex items-center justify-center px-4 py-3 text-base text-center
                  transition-colors duration-150
                  ${
                    locale === lang.code
                      ? "bg-[#84994F]/10 text-[#84994F] font-bold"
                      : "text-gray-700 hover:bg-gray-50 font-bold"
                  }
                `}
              >
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Version par défaut
  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLocale(lang.code)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
            transition-all duration-200
            ${
              locale === lang.code
                ? "bg-[#84994F] text-white shadow-md scale-105"
                : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-sm"
            }
          `}
          aria-label={`Changer la langue en ${lang.label}`}
        >
          <span className="text-base">{lang.flag}</span>
          <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Version compacte pour mobile
 */
export function SelfcampLanguageSelectorCompact() {
  const { locale, changeLocale } = useSelfcampTranslation();

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLocale(lang.code)}
          className={`
            flex items-center justify-center w-8 h-8 rounded-full text-lg
            transition-all duration-200
            ${
              locale === lang.code
                ? "bg-[#84994F] scale-110 shadow-md"
                : "bg-white/60 hover:bg-white hover:scale-105"
            }
          `}
          aria-label={`Changer la langue en ${lang.label}`}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}
