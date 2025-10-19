"use client";

import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/ui/search-bar";
import { StructuredData } from "@/components/shared/structured-data";
import { SelfcampFooter } from "@/components/public-pages/selfcamp-footer";
import { VanIcon } from "@/components/ui/van-icon";
import { useAnalytics } from "@/hooks/useAnalytics";

export function SelfcampHomepage() {
  const { trackHomepage } = useAnalytics();

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
                  onClick={() => trackHomepage.contactClicked()}
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
                  onClick={() => trackHomepage.contactClicked()}
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
                {/* Logo */}
                <div className="mt-4 md:mt-6 relative">
                  <Image
                    src="/selfcamp_logo_black.png"
                    alt="SelfCamp Logo"
                    width={400}
                    height={200}
                    className="mx-auto"
                  />
                </div>

                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  La liberté de camper, sans contraintes
                </h3>

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

                  {/* Phrase de motivation pour les utilisateurs */}
                  <div className="text-center mt-6 md:mt-8 max-w-2xl mx-auto space-y-3">
                    {/* <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                      <span className="text-[#84994F] font-semibold">et</span>
                    </p> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section avantages pour les voyageurs - Style discret */}
        <section className="py-12 md:py-20 px-4 bg-gray-50/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Pourquoi choisir{" "}
                <span className="text-[#84994F]">SelfCamp</span> ?
              </h2>
              <div className="flex items-center justify-center opacity-70">
                <VanIcon size="md" showRoad={true} />
              </div>
            </div>

            <div className="space-y-6 md:space-y-8 max-w-3xl mx-auto">
              {/* Avantage 2 */}
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="flex-shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#84994F] rounded-full mt-2"></div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Accès 24h/24 et 7j/7
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    Enregistrement autonome et facile, sans application à
                    télécharger ni compte à créer. Arrivez quand vous voulez.
                  </p>
                </div>
              </div>

              {/* Avantage 3 */}
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="flex-shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#84994F] rounded-full mt-2"></div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Réductions auprès d&apos;artisans locaux
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    Profitez d&apos;avantages dans les boulangeries, épiceries
                    et boucheries... de la région
                  </p>
                </div>
              </div>

              {/* Avantage 1 */}
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="flex-shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#84994F] rounded-full mt-2"></div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Emplacements conforme à la loi
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    Dormez en toute tranquillité dans le respect des
                    réglementations locales
                  </p>
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
                  Intéressés par{" "}
                  <span className="text-[#84994F]">SelfCamp</span> ?
                </h2>
                <p className="text-[15px] md:text-base text-gray-600 leading-relaxed max-w-xl">
                  Si vous êtes propriétaire d&apos;un parking ou d&apos;un
                  espace pouvant accueillir des vans, découvrez comment devenir
                  prestataire vous aussi.
                </p>
                <Link
                  href="/about"
                  onClick={() => trackHomepage.ctaAboutClicked()}
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
        <SelfcampFooter />
      </div>
    </>
  );
}
