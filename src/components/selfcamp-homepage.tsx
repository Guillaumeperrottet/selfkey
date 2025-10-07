"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import SearchBar from "@/components/ui/search-bar";
import TextType from "@/components/ui/text-type";
import { DOMAINS } from "@/lib/domains";
import { StructuredData } from "@/components/structured-data";

export function SelfcampHomepage() {
  return (
    <>
      <StructuredData />
      <style jsx>{`
        .ease-bounce {
          transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .brand-green {
          color: #84994f;
        }
        .bg-brand-green {
          background-color: #84994f;
        }
        .border-brand-green {
          border-color: #84994f;
        }
        .hover-brand-green:hover {
          background-color: #84994f;
        }
        .bg-footer-dark {
          background-color: #2d3d1f;
        }
      `}</style>
      <div className="min-h-screen bg-white">
        {/* Hero Section avec dégradé */}
        <section className="relative bg-gradient-to-b from-[#84994F]/8 via-white to-white">
          {/* Header intégré */}
          <header className="container mx-auto px-4 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              {/* Desktop header */}
              <div className="hidden lg:flex items-center justify-between w-full">
                <div className="flex items-center space-x-2 bg-[#84994F]/10 text-[#84994F] px-3 py-1.5 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-[#84994F] rounded-full animate-pulse"></div>
                  <span>24H/24 - 7J/7</span>
                </div>
                <div className="text-gray-800 font-bold uppercase tracking-wide text-sm lg:text-lg hover:text-[#84994F] transition-colors cursor-pointer"></div>
                <Link
                  href="/contact"
                  className="text-[#84994F] font-bold uppercase tracking-wide text-sm lg:text-lg hover:text-[#84994F]/80 transition-colors cursor-pointer"
                >
                  CONTACTEZ-NOUS
                </Link>
              </div>

              {/* Mobile header */}
              <div className="flex lg:hidden items-center justify-between w-full">
                <div className="flex items-center space-x-1.5 bg-[#84994F]/10 text-[#84994F] px-2.5 py-1 rounded-full text-xs font-medium">
                  <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full animate-pulse"></div>
                  <span>24H/24 - 7J/7</span>
                </div>
                <div className="text-gray-800 font-bold uppercase tracking-wide text-xs text-center"></div>
                <Link
                  href="/contact"
                  className="text-[#84994F] font-bold uppercase tracking-wide text-xs hover:text-[#84994F]/80 transition-colors"
                >
                  CONTACT
                </Link>
              </div>
            </div>
          </header>

          {/* Contenu Hero avec Search intégré */}
          <div className="text-center py-8 md:py-12 px-4 pb-16 md:pb-20">
            <div className="container mx-auto max-w-4xl">
              <div className="flex flex-col items-center justify-center space-y-8 md:space-y-10">
                {/* Logo avec cercle vert subtil */}
                <div className="mt-4 md:mt-6 relative">
                  <div className="absolute inset-0 bg-[#84994F]/5 rounded-full blur-2xl scale-110"></div>
                  <Image
                    src="/logo_map.png"
                    alt="SelfCamp Logo"
                    width={160}
                    height={160}
                    className="mx-auto relative z-10"
                  />
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900">
                  Selfcamp.ch
                </h1>

                <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[#84994F]">
                  Développons le tourisme local ensemble
                </p>

                {/* Badge avec point vert animé */}
                <div className="flex items-center gap-2 bg-[#84994F]/10 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-[#84994F] rounded-full animate-pulse"></div>
                  <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                    <TextType
                      text="Autonome. Facile. Légal."
                      typingSpeed={80}
                      showCursor={true}
                      cursorCharacter="|"
                      cursorClassName="text-[#374151]"
                      className="text-gray-900"
                      textColors={["#374151"]}
                      loop={true}
                      loopInterval={5000}
                      startOnVisible={true}
                    />
                  </div>
                </div>

                <p className="text-[15px] md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8 md:mb-0">
                  Solution d&apos;accès pour le tourisme de véhicule de loisirs.
                </p>

                {/* Search Bar intégrée avec accent vert */}
                <div className="w-full max-w-2xl mt-6 md:mt-10">
                  <div className="mb-4 md:mb-6">
                    <h2 className="text-base md:text-2xl font-semibold text-gray-800 text-center">
                      Trouvez votre{" "}
                      <span className="text-[#84994F]">emplacement idéal</span>
                    </h2>
                    <p className="hidden md:block text-base text-gray-500 text-center mt-2">
                      Recherchez par ville, région ou nom de camping
                    </p>
                  </div>
                  <SearchBar />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section CTA vers About */}
        <section className="py-16 md:py-24 px-4 bg-gray-50/30">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-[#84994F]/8 p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Pourquoi choisir{" "}
                  <span className="text-[#84994F]">SelfCamp</span> ?
                </h2>
                <p className="text-[15px] md:text-base text-gray-600 leading-relaxed max-w-xl">
                  Découvrez notre approche complète pour créer des aires de
                  camping qui bénéficient à tous : prestataires, régions et
                  Vanlife.
                </p>
                <Link
                  href="/about"
                  className="group flex items-center gap-3 mt-4"
                >
                  <span className="text-gray-900 font-medium text-base group-hover:text-[#84994F] transition-colors">
                    En savoir plus
                  </span>
                  <div className="w-12 h-12 rounded-full bg-[#84994F] flex items-center justify-center group-hover:bg-[#84994F]/90 transition-all active:scale-95">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-footer-dark text-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <Image
                    src="/selfcamp_logo_fribourg.png"
                    alt="SelfCamp Fribourg"
                    width={120}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <p className="text-gray-400 mb-4">
                  L&apos;accès de stationnement pour camping-cars en Suisse.
                </p>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4 text-lg text-white">
                  Contact
                </h4>
                <div className="space-y-2 text-gray-400">
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-[#84994F]" />
                    <span>Canton de Fribourg, Suisse</span>
                  </div>
                  <div>
                    <a
                      href="mailto:gp@webbing.ch"
                      className="text-[#84994F] hover:text-[#6d7d3f] transition-colors duration-300"
                    >
                      gp@webbing.ch
                    </a>
                  </div>
                  <div>
                    <a
                      href="tel:+41793414074"
                      className="text-[#84994F] hover:text-[#6d7d3f] transition-colors duration-300"
                    >
                      +41 79 341 40 74
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4 text-lg text-white">
                  Navigation
                </h4>
                <div className="space-y-2 text-gray-400">
                  <div>
                    <Link
                      href="/about"
                      className="hover:text-[#84994F] transition-colors"
                    >
                      À propos
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="/contact"
                      className="hover:text-[#84994F] transition-colors"
                    >
                      Contact
                    </Link>
                  </div>
                  <div>
                    <a
                      href={DOMAINS.SELFKEY}
                      className="text-[#84994F] hover:text-[#6d7d3f] transition-colors duration-300"
                    >
                      Système SelfKey
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4 text-lg text-white">
                  Informations légales
                </h4>
                <div className="space-y-2 text-gray-400">
                  <div>
                    <Link
                      href="/legal"
                      className="hover:text-[#84994F] transition-colors"
                    >
                      Mentions légales
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="/legal"
                      className="hover:text-[#84994F] transition-colors"
                    >
                      CGV & Droit de rétractation
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="/privacy"
                      className="hover:text-[#84994F] transition-colors"
                    >
                      Politique de confidentialité
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>
                &copy; 2025 SelfCamp. Tous droits réservés. Développé par{" "}
                <a
                  href="https://www.webbing.ch/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#84994F] hover:text-[#6d7d3f] transition-colors duration-300"
                >
                  Webbing.ch
                </a>
              </p>
              <p className="mt-2 text-xs">
                Paiements sécurisés par{" "}
                <span className="font-semibold">Stripe</span> • Cartes bancaires
                et TWINT acceptés
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
