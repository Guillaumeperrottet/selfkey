"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
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
        .bg-hero-light {
          background-color: #f8f9f6;
        }
        .bg-search-light {
          background-color: #f5f7f3;
        }
        .bg-footer-dark {
          background-color: #2d3d1f;
        }
      `}</style>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-hero-light">
          {/* Header intégré */}
          <header className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Desktop header */}
              <div className="hidden lg:flex items-center justify-between w-full">
                <div className="text-gray-800 font-bold uppercase tracking-wide text-sm lg:text-lg hover:text-[#84994F] transition-colors cursor-pointer">
                  24H/24 - 7J/7
                </div>
                <div className="text-gray-800 font-bold uppercase tracking-wide text-sm lg:text-lg hover:text-[#84994F] transition-colors cursor-pointer"></div>
                <div className="text-gray-800 font-bold uppercase tracking-wide text-sm lg:text-lg hover:text-[#84994F] transition-colors cursor-pointer">
                  CONTACTEZ-NOUS
                </div>
              </div>

              {/* Mobile header */}
              <div className="flex lg:hidden items-center justify-between w-full">
                <div className="text-gray-800 font-bold uppercase tracking-wide text-xs">
                  24H/24 - 7J/7
                </div>
                <div className="text-gray-800 font-bold uppercase tracking-wide text-xs text-center"></div>
                <div className="text-gray-800 font-bold uppercase tracking-wide text-xs">
                  CONTACT
                </div>
              </div>
            </div>
          </header>

          {/* Contenu Hero */}
          <div className="text-center py-6 md:py-12 px-4">
            <div className="container mx-auto">
              <div className="flex flex-col items-center justify-center min-h-[25vh]">
                {/* Logo en haut - agrandi et remonté */}
                <div className="mb-1">
                  <Image
                    src="/logo_map.png"
                    alt="SelfCamp Logo"
                    width={180}
                    height={180}
                    className="mx-auto"
                  />
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 md:mb-16 text-gray-900">
                  Selfcamp.ch
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#84994F] mb-4">
                  Développons le tourisme local ensemble
                </p>
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 md:mb-6 max-w-4xl mx-auto leading-relaxed text-center font-bold px-2">
                  <TextType
                    text="Spontané. Facile. Légal."
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
                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-2">
                  Solution d&apos;accès pour le tourisme de véhicules de
                  loisirs. Accédez aux emplacements, enregistrez-vous en
                  quelques secondes, et profitez de votre séjour.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section - mieux aérée */}
        <section className="relative bg-search-light px-4 pb-12 -mt-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="pt-8 p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-10 text-center">
                  Trouvez votre emplacement idéal
                </h2>
                <div className="mb-4">
                  <SearchBar />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section CTA vers About */}
        <section className="py-20 px-4 bg-hero-light">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Pourquoi choisir{" "}
                  <span className="text-[#84994F]">SelfCamp</span> ?
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                  Découvrez notre approche complète pour créer des aires de
                  camping qui bénéficient à tous : prestataires, régions et
                  camping-caristes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/about"
                    className="bg-[#84994F] text-white px-8 py-4 rounded-lg hover:bg-[#84994F]/90 transition-colors font-semibold text-lg inline-block"
                  >
                    En savoir plus
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-footer-dark text-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                      href="mailto:support@selfcamp.ch"
                      className="text-[#84994F] hover:text-[#6d7d3f] transition-colors duration-300"
                    >
                      gp@webbing.ch
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4 text-lg text-white">
                  Développement
                </h4>
                <div className="space-y-2 text-gray-400">
                  <p>Informatique & Solutions digitales :</p>
                  <div>
                    <a
                      href="https://www.webbing.ch/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#84994F] hover:text-[#6d7d3f] transition-colors duration-300 font-medium"
                    >
                      Webbing.ch
                    </a>
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
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
