"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import SearchBar from "@/components/ui/search-bar";
import TextType from "@/components/ui/text-type";
import { DOMAINS } from "@/lib/domains";

export function SelfcampHomepage() {
  return (
    <>
      <style jsx>{`
        .ease-bounce {
          transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
      <div className="min-h-screen">
        {/* Background avec parallax */}
        <div
          className="fixed top-0 left-0 w-full h-full z-0"
          style={{
            backgroundImage: "url('/background-selfcamp.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transform: "translateY(0px)",
          }}
        />

        {/* Header */}
        <header className="relative z-40 bg-transparent backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Desktop header */}
              <div className="hidden lg:flex items-center justify-between w-full">
                <div className="text-white font-bold uppercase tracking-wide text-sm lg:text-lg hover:text-yellow-300 transition-colors cursor-pointer">
                  24H/24 - 7J/7
                </div>
                <div className="text-white font-bold uppercase tracking-wide text-sm lg:text-lg hover:text-yellow-300 transition-colors cursor-pointer">
                  Soutient le tourisme local
                </div>
                <div className="text-white font-bold uppercase tracking-wide text-sm lg:text-lg hover:text-yellow-300 transition-colors cursor-pointer">
                  CONTACTEZ-NOUS
                </div>
              </div>

              {/* Mobile header - same structure as desktop */}
              <div className="flex lg:hidden items-center justify-between w-full">
                <div className="text-white font-bold uppercase tracking-wide text-xs">
                  24H/24 - 7J/7
                </div>
                <div className="text-white font-bold uppercase tracking-wide text-xs text-center">
                  AUTOMATISATION
                </div>
                <div className="text-white font-bold uppercase tracking-wide text-xs">
                  CONTACTEZ-NOUS
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-30 text-white text-center py-12 md:py-24 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[35vh]">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6 text-white">
                Selfcamp.ch
              </h1>
              <div className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-white max-w-4xl mx-auto leading-relaxed text-center font-medium px-2">
                <TextType
                  text="Solution d'accès pour le tourisme de véhicules de loisirs hors zone camping"
                  typingSpeed={50}
                  showCursor={true}
                  cursorCharacter="|"
                  cursorClassName="text-white"
                  loop={true}
                  loopInterval={90000} // 1min30 en millisecondes
                  startOnVisible={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="relative z-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="p-2 md:p-4">
                <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4 text-center">
                  Trouvez votre emplacement idéal
                </h2>
                <SearchBar />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-gray-900 text-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                  <Image
                    src="/logo.png"
                    alt="SelfCamp"
                    width={32}
                    height={32}
                    className="rounded"
                  />
                  <span className="text-xl font-bold">SelfCamp</span>
                </div>
                <p className="text-gray-400">
                  Le camping du futur, disponible dès aujourd&apos;hui.
                </p>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4 text-lg text-white">
                  Services
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-white transition-colors duration-300 cursor-pointer">
                    Réservation en ligne
                  </li>
                  <li className="hover:text-white transition-colors duration-300 cursor-pointer">
                    Accès automatisé
                  </li>
                  <li className="hover:text-white transition-colors duration-300 cursor-pointer">
                    Paiement sécurisé
                  </li>
                  <li className="hover:text-white transition-colors duration-300 cursor-pointer">
                    Support 24h/24
                  </li>
                </ul>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4 text-lg text-white">
                  Contact
                </h4>
                <div className="space-y-2 text-gray-400">
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>Canton de Fribourg, Suisse</span>
                  </div>
                  <div>
                    <a
                      href={DOMAINS.SELFKEY}
                      className="text-green-400 hover:text-green-300 transition-colors duration-300"
                    >
                      Système de réservation
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>
                &copy; 2025 SelfCamp. Tous droits réservés. Propulsé par
                SelfKey.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
