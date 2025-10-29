"use client";

import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/ui/search-bar";
import { StructuredData } from "@/components/shared/structured-data";
import { SelfcampFooter } from "@/components/public-pages/selfcamp-footer";
import { VanIcon } from "@/components/ui/van-icon";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSelfcampTranslation } from "@/hooks/useSelfcampTranslation";
import { SelfcampLanguageSelector } from "@/components/ui/selfcamp-language-selector";

export function SelfcampHomepage() {
  const { trackHomepage } = useAnalytics();
  const { t } = useSelfcampTranslation();

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
      <div className="min-h-screen" style={{ backgroundColor: "#EEEAE2" }}>
        {/* Hero Section avec image de fond */}
        <section className="relative">
          {/* Image de fond positionnée pour que le bas soit au milieu de la search bar */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ height: "calc(100vh - 120px)" }}
          >
            <Image
              src="/images/background_gruyere.jpg"
              alt="Gruyère Background"
              fill
              className="object-cover"
              style={{
                objectPosition: "center 70%",
              }}
              priority
              quality={90}
            />
            {/* Overlay blanc pour transparence comme sur Canva */}
            <div className="absolute inset-0 bg-white/18"></div>
          </div>

          {/* Contenu par-dessus l'image */}
          <div className="relative z-10">
            {/* Header intégré */}
            <header className="container mx-auto px-4 pt-0 pb-0">
              <div className="flex items-start justify-between">
                {/* Desktop header */}
                <div className="hidden lg:flex items-start justify-between w-full">
                  {/* Logo à gauche */}
                  <div className="flex items-center -ml-4 -mt-10">
                    <Image
                      src="/selfcamp_logo_fribourg.png"
                      alt="SelfCamp Logo"
                      width={360}
                      height={180}
                      className="drop-shadow-2xl"
                    />
                  </div>

                  {/* Navigation à droite */}
                  <div className="flex items-center gap-6 mt-8">
                    <Link
                      href="/map"
                      className="text-white font-medium text-base hover:text-white/80 transition-colors drop-shadow-lg"
                    >
                      Map
                    </Link>
                    <Link
                      href="/about"
                      className="text-white font-medium text-base hover:text-white/80 transition-colors drop-shadow-lg"
                    >
                      À propos
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => trackHomepage.contactClicked()}
                      className="text-white font-medium text-base hover:text-white/80 transition-colors drop-shadow-lg"
                    >
                      Contactez-nous
                    </Link>
                    <div className="border-l border-white/30 pl-4">
                      <SelfcampLanguageSelector variant="compact" />
                    </div>
                  </div>
                </div>

                {/* Mobile header */}
                <div className="flex lg:hidden items-center justify-between w-full">
                  {/* Logo mobile */}
                  <div className="flex items-center">
                    <Image
                      src="/selfcamp_logo_fribourg.png"
                      alt="SelfCamp Logo"
                      width={200}
                      height={100}
                      className="drop-shadow-2xl"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/contact"
                      onClick={() => trackHomepage.contactClicked()}
                      className="text-white font-bold uppercase tracking-wide text-xs hover:text-white/80 transition-colors drop-shadow-lg"
                    >
                      {t.header.contactShort}
                    </Link>
                    <SelfcampLanguageSelector variant="minimal" />
                  </div>
                </div>
              </div>
            </header>

            {/* Contenu Hero avec Search intégré */}
            <div className="text-center px-4">
              <div className="container mx-auto max-w-4xl">
                {/* Tagline positionné plus haut */}
                <div style={{ paddingTop: "calc(12vh - 60px)" }}>
                  <h3 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                    {t.hero.tagline}
                  </h3>
                </div>

                {/* Search Bar positionnée plus bas */}
                <div
                  className="flex flex-col items-center justify-center space-y-6 md:space-y-8"
                  style={{
                    paddingTop: "calc(32vh - 5px)",
                    paddingBottom: "150px",
                  }}
                >
                  {/* Search Bar intégrée */}
                  <div className="w-full max-w-2xl">
                    <div className="mb-4 md:mb-6">
                      <h2 className="text-lg md:text-2xl font-semibold text-white text-center drop-shadow-lg">
                        {t.hero.findSpot}{" "}
                        <span className="text-white">
                          {t.hero.findSpotHighlight}
                        </span>
                      </h2>
                      <p className="hidden md:block text-base text-white/90 text-center mt-2 drop-shadow-md">
                        {t.hero.searchPlaceholder}
                      </p>
                    </div>
                    <SearchBar />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section avantages pour les voyageurs - Style discret */}
        <section
          className="py-12 md:py-20 px-4"
          style={{ backgroundColor: "#EEEAE2" }}
        >
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {t.benefits.title}{" "}
                <span className="text-[#84994F]">
                  {t.benefits.titleHighlight}
                </span>{" "}
                ?
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
                    {t.benefits.access247.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {t.benefits.access247.description}
                  </p>
                </div>
              </div>

              {/* Avantage 3 */}
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="flex-shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#84994F] rounded-full mt-2"></div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    {t.benefits.discounts.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {t.benefits.discounts.description}
                  </p>
                </div>
              </div>

              {/* Avantage 1 */}
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="flex-shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#84994F] rounded-full mt-2"></div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    {t.benefits.legal.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {t.benefits.legal.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section CTA vers About */}
        <section
          className="py-16 md:py-24 px-4"
          style={{ backgroundColor: "#EEEAE2" }}
        >
          <div className="container mx-auto max-w-2xl">
            <div className="p-8 md:p-10">
              <div className="flex flex-col items-center text-center space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {t.cta.title}{" "}
                  <span className="text-[#84994F]">{t.cta.titleHighlight}</span>{" "}
                  ?
                </h2>
                <p className="text-[15px] md:text-base text-gray-600 leading-relaxed max-w-xl">
                  {t.cta.description}
                </p>
                <Link
                  href="/about"
                  onClick={() => trackHomepage.ctaAboutClicked()}
                  className="group flex items-center gap-3 mt-4"
                >
                  <span className="text-gray-900 font-medium text-base group-hover:text-[#84994F] transition-colors">
                    {t.cta.learnMore}
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
