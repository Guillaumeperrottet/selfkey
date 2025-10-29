"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { StructuredData } from "@/components/shared/structured-data";
import { Timeline } from "@/components/ui/timeline";
import { SelfcampFooter } from "@/components/public-pages/selfcamp-footer";
import { VanIcon } from "@/components/ui/van-icon";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState, useEffect } from "react";
import { useSelfcampTranslation } from "@/hooks/useSelfcampTranslation";
import { SelfcampLanguageSelector } from "@/components/ui/selfcamp-language-selector";

export function SelfcampAboutPage() {
  const { trackAbout } = useAnalytics();
  const { t } = useSelfcampTranslation();

  // Carousel pour les phrases de mission
  const [currentQuote, setCurrentQuote] = useState(0);

  // Paramètres pour le swipe
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % t.mission.quotes.length);
    }, 5000); // Change toutes les 5 secondes

    return () => clearInterval(timer);
  }, [t.mission.quotes.length]);

  // Données pour la timeline de développement de SelfCamp
  const timelineData = [
    {
      title: t.timeline.regionalSupport.title,
      content: (
        <div className="py-6 md:py-10 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            {/* Mobile: Simple text blocks */}
            <div className="md:hidden space-y-8">
              {/* Intro paragraphes */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-[#84994F]/5 to-transparent rounded-2xl p-5 border-l-4 border-[#84994F]/40">
                  <p className="text-[15px] text-gray-700 leading-[1.7] font-medium">
                    {t.timeline.regionalSupport.intro1}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-[#84994F]/5 to-transparent rounded-2xl p-5 border-l-4 border-[#84994F]/40">
                  <p className="text-[15px] text-gray-700 leading-[1.7] font-medium">
                    {t.timeline.regionalSupport.intro2}
                  </p>
                </div>
              </div>

              {/* Avantages cards */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#84994F]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🏪</span>
                  </div>
                  <div className="pt-1">
                    <h4 className="text-[15px] font-semibold text-gray-900 mb-1">
                      {t.timeline.regionalSupport.localCommerce.title}
                    </h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      {t.timeline.regionalSupport.localCommerce.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#84994F]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🗺️</span>
                  </div>
                  <div className="pt-1">
                    <h4 className="text-[15px] font-semibold text-gray-900 mb-1">
                      {t.timeline.regionalSupport.regionalDiscovery.title}
                    </h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      {t.timeline.regionalSupport.regionalDiscovery.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#84994F]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💰</span>
                  </div>
                  <div className="pt-1">
                    <h4 className="text-[15px] font-semibold text-gray-900 mb-1">
                      {t.timeline.regionalSupport.circularEconomy.title}
                    </h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      {t.timeline.regionalSupport.circularEconomy.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Cards layout */}
            <div className="hidden md:block space-y-6 mb-10">
              <div className="bg-gradient-to-r from-[#84994F]/5 to-transparent rounded-2xl p-6 border-l-4 border-[#84994F]/40">
                <p className="text-base text-gray-700 leading-relaxed font-medium">
                  {t.timeline.regionalSupport.desktopIntro1}
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#84994F]/5 to-transparent rounded-2xl p-6 border-l-4 border-[#84994F]/40">
                <p className="text-base text-gray-700 leading-relaxed font-medium">
                  {t.timeline.regionalSupport.desktopIntro2}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-12 mt-10">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-[#84994F] rounded-full flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <h4 className="text-lg font-semibold text-[#84994F] mb-3">
                    {t.timeline.regionalSupport.localCommerce.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t.timeline.regionalSupport.localCommerce.description}
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-[#84994F] rounded-full flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <h4 className="text-lg font-semibold text-[#84994F] mb-3">
                    {t.timeline.regionalSupport.regionalDiscovery.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t.timeline.regionalSupport.regionalDiscovery.description}
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-[#84994F] rounded-full flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h4 className="text-lg font-semibold text-[#84994F] mb-3">
                    {t.timeline.regionalSupport.circularEconomy.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t.timeline.regionalSupport.circularEconomy.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t.timeline.services.title,
      content: (
        <div className="py-6 md:py-10 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            {/* Mobile: Simple list */}
            <div className="md:hidden space-y-7">
              <div>
                <p className="text-[15px] text-gray-600 leading-[1.7]">
                  {t.timeline.services.intro}{" "}
                  <span className="text-[#84994F] font-semibold">
                    {t.timeline.services.introHighlight}
                  </span>
                  , {t.timeline.services.introContinuation}
                </p>
              </div>

              <div className="pt-1">
                <h4 className="text-[14px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  {t.timeline.services.listTitle}
                </h4>
                <div className="space-y-3">
                  {t.timeline.services.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-[14px] text-gray-700 leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#84994F]/5 to-transparent rounded-2xl p-5 border border-[#84994F]/10">
                <h4 className="text-[15px] font-bold text-[#84994F] mb-2">
                  {t.timeline.services.highlight.title}
                </h4>
                <p className="text-gray-600 text-[14px] leading-relaxed">
                  {t.timeline.services.highlight.description}
                </p>
              </div>
            </div>

            {/* Desktop: Original layout */}
            <div className="hidden md:block">
              <div className="text-center mb-10">
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    {t.timeline.services.intro}{" "}
                    <span className="text-[#84994F] font-medium">
                      {t.timeline.services.introHighlight}
                    </span>
                    , {t.timeline.services.introContinuation}
                  </p>
                  <p className="text-base text-gray-600 font-medium">
                    {t.timeline.services.listTitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  {t.timeline.services.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-base text-gray-700 leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {t.timeline.services.items.slice(3).map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-base text-gray-700 leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 bg-[#84994F]/3 rounded-2xl p-6 border border-[#84994F]/30 text-center max-w-4xl mx-auto">
                <h4 className="text-xl font-semibold text-[#84994F] mb-3">
                  {t.timeline.services.highlight.title}
                </h4>
                <p className="text-gray-700 text-base leading-relaxed">
                  {t.timeline.services.highlight.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t.timeline.providerBenefits.title,
      content: (
        <div className="py-6 md:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            {/* Mobile: Simple sections */}
            <div className="md:hidden space-y-6">
              {/* Conformité Réglementaire */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-xl">✓</span>
                  <h4 className="text-[15px] font-bold text-gray-900">
                    {t.timeline.providerBenefits.regulatory.title}
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {t.timeline.providerBenefits.regulatory.items.map(
                    (item, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <div className="w-1 h-1 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-[13px] text-gray-600 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Revenus Garantis */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-xl">💰</span>
                  <h4 className="text-[15px] font-bold text-gray-900">
                    {t.timeline.providerBenefits.revenue.title}
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {t.timeline.providerBenefits.revenue.items.map(
                    (item, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <div className="w-1 h-1 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-[13px] text-gray-600 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Partenariat Tout-en-un */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-xl">🤝</span>
                  <h4 className="text-[15px] font-bold text-gray-900">
                    {t.timeline.providerBenefits.partnership.title}
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {t.timeline.providerBenefits.partnership.items.map(
                    (item, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <div className="w-1 h-1 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-[13px] text-gray-600 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Données Stratégiques */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-xl">📊</span>
                  <h4 className="text-[15px] font-bold text-gray-900">
                    {t.timeline.providerBenefits.data.title}
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {t.timeline.providerBenefits.data.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <div className="w-1 h-1 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-[13px] text-gray-600 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#84994F]/5 to-transparent rounded-2xl p-5 border border-[#84994F]/10 mt-2">
                <h4 className="text-[15px] font-bold text-[#84994F] mb-2">
                  {t.timeline.providerBenefits.highlight.title}
                </h4>
                <p className="text-gray-600 text-[14px] leading-relaxed">
                  {t.timeline.providerBenefits.highlight.description}
                </p>
              </div>
            </div>

            {/* Desktop: Cards layout */}
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-10 max-w-6xl mx-auto mb-16">
                {/* Conformité Réglementaire */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 border border-[#84994F]/30 hover:border-[#84994F]/50 transition-all duration-300"
                >
                  <h4 className="text-xl font-semibold text-[#84994F] mb-6">
                    {t.timeline.providerBenefits.regulatory.title}
                  </h4>
                  <ul className="space-y-4 text-gray-700">
                    {t.timeline.providerBenefits.regulatory.items.map(
                      (item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                          <span className="text-base leading-relaxed">
                            {item}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </motion.div>

                {/* Revenus Garantis */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 border border-[#84994F]/30 hover:border-[#84994F]/50 transition-all duration-300"
                >
                  <h4 className="text-xl font-semibold text-[#84994F] mb-6">
                    {t.timeline.providerBenefits.revenue.title}
                  </h4>
                  <ul className="space-y-4 text-gray-700">
                    {t.timeline.providerBenefits.revenue.items.map(
                      (item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                          <span className="text-base leading-relaxed">
                            {item}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </motion.div>

                {/* Partenariat Tout-en-un */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 border border-[#84994F]/30 hover:border-[#84994F]/50 transition-all duration-300"
                >
                  <h4 className="text-xl font-semibold text-[#84994F] mb-6">
                    {t.timeline.providerBenefits.partnership.title}
                  </h4>
                  <ul className="space-y-4 text-gray-700">
                    {t.timeline.providerBenefits.partnership.items.map(
                      (item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                          <span className="text-base leading-relaxed">
                            {item}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </motion.div>

                {/* Données Stratégiques */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 border border-[#84994F]/30 hover:border-[#84994F]/50 transition-all duration-300"
                >
                  <h4 className="text-xl font-semibold text-[#84994F] mb-6">
                    {t.timeline.providerBenefits.data.title}
                  </h4>
                  <ul className="space-y-4 text-gray-700">
                    {t.timeline.providerBenefits.data.items.map(
                      (item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                          <span className="text-base leading-relaxed">
                            {item}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </motion.div>
              </div>

              {/* Carte highlight */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-[#84994F]/3 rounded-2xl p-8 border border-[#84994F]/30 text-center max-w-4xl mx-auto"
              >
                <h4 className="text-xl font-semibold text-[#84994F] mb-3">
                  {t.timeline.providerBenefits.highlight.title}
                </h4>
                <p className="text-gray-700 text-base leading-relaxed">
                  {t.timeline.providerBenefits.highlight.description}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      ),
    },
  ];

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
      <div className="min-h-screen bg-white">
        {/* Header avec logo noir compact */}
        <header className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Desktop header */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* Logo à gauche */}
              <div className="flex items-center">
                <Link
                  href="/"
                  onClick={() => trackAbout.mapCtaClicked("logo_desktop")}
                >
                  <Image
                    src="/logo.png"
                    alt="SelfCamp Logo"
                    width={140}
                    height={70}
                    className="hover:opacity-80 transition-opacity"
                  />
                </Link>
              </div>

              {/* Navigation à droite */}
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  onClick={() => trackAbout.mapCtaClicked("home_menu_desktop")}
                  className="text-gray-900 font-bold text-base hover:text-gray-700 transition-colors"
                >
                  {t.map.home}
                </Link>
                <Link
                  href="/map"
                  className="text-gray-900 font-bold text-base hover:text-gray-700 transition-colors"
                >
                  Map
                </Link>
                <Link
                  href="/contact"
                  onClick={() => trackAbout.contactCtaClicked("header")}
                  className="text-gray-900 font-bold text-base hover:text-gray-700 transition-colors"
                >
                  {t.map.contact}
                </Link>
                <div className="border-l border-gray-300 pl-4">
                  <SelfcampLanguageSelector variant="compact" theme="dark" />
                </div>
              </div>
            </div>

            {/* Mobile header */}
            <div className="flex lg:hidden items-center justify-between w-full">
              {/* Logo à gauche */}
              <div className="flex items-center">
                <Link
                  href="/"
                  onClick={() => trackAbout.mapCtaClicked("logo_mobile")}
                >
                  <Image
                    src="/selfcamp_logo_black.png"
                    alt="SelfCamp Logo"
                    width={90}
                    height={45}
                    className="hover:opacity-80 transition-opacity"
                  />
                </Link>
              </div>

              {/* Navigation à droite */}
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  onClick={() => trackAbout.mapCtaClicked("home_menu_mobile")}
                  className="text-gray-900 font-bold uppercase tracking-wide text-[10px] hover:text-gray-700 transition-colors"
                >
                  {t.map.home}
                </Link>
                <Link
                  href="/map"
                  className="text-gray-900 font-bold uppercase tracking-wide text-[10px] hover:text-gray-700 transition-colors"
                >
                  Map
                </Link>
                <Link
                  href="/contact"
                  onClick={() => trackAbout.contactCtaClicked("header_mobile")}
                  className="text-gray-900 font-bold uppercase tracking-wide text-[10px] hover:text-gray-700 transition-colors"
                >
                  Contact
                </Link>
                <div className="border-l border-gray-300 pl-2">
                  <SelfcampLanguageSelector variant="minimal" theme="dark" />
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Hero Section épuré */}
        <section className="bg-white py-8 md:py-12 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-[#84994F]/10 text-[#84994F] px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-medium mb-6 md:mb-8"
            >
              <span>🏛️</span>
              <span>{t.about.badge}</span>
            </motion.div>

            {/* Titre principal */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 md:mb-8 leading-tight px-2"
            >
              {t.about.title}{" "}
              <span className="text-[#84994F]">{t.about.titleHighlight}</span>
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base md:text-xl lg:text-2xl text-gray-600 mb-10 md:mb-16 max-w-4xl mx-auto leading-relaxed px-2"
            >
              {t.about.subtitle}
            </motion.p>

            {/* Stats cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-10 md:mb-20"
            >
              <div className="bg-white border border-[#84994F]/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-[#84994F]/50 transition-all duration-300">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#84994F] mb-2 md:mb-3">
                  100%
                </div>
                <div className="text-gray-700 font-medium text-sm md:text-base">
                  {t.about.stats.legal}
                </div>
              </div>
              <div className="bg-white border border-[#84994F]/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-[#84994F]/50 transition-all duration-300">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#84994F] mb-2 md:mb-3">
                  24/7
                </div>
                <div className="text-gray-700 font-medium text-sm md:text-base">
                  {t.about.stats.access}
                </div>
              </div>
              <div className="bg-white border border-[#84994F]/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-[#84994F]/50 transition-all duration-300">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#84994F] mb-2 md:mb-3">
                  0
                </div>
                <div className="text-gray-700 font-medium text-sm md:text-base">
                  {t.about.stats.installation}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        {/* Notre mission */}
        <section className="bg-white py-12 md:py-20 px-4">
          <div className="container mx-auto max-w-full px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-16"
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight px-2">
                {t.mission.title}{" "}
                <span className="text-[#84994F]">
                  {t.mission.titleHighlight}
                </span>
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-2">
                {t.mission.subtitle}
              </p>
              <div className="mt-6 md:mt-8 text-center">
                <div className="relative h-16 md:h-20 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing">
                  <motion.div
                    key={currentQuote}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = swipePower(offset.x, velocity.x);

                      if (swipe < -swipeConfidenceThreshold) {
                        // Swipe vers la gauche - citation suivante
                        setCurrentQuote(
                          (prev) => (prev + 1) % t.mission.quotes.length
                        );
                      } else if (swipe > swipeConfidenceThreshold) {
                        // Swipe vers la droite - citation précédente
                        setCurrentQuote(
                          (prev) =>
                            (prev - 1 + t.mission.quotes.length) %
                            t.mission.quotes.length
                        );
                      }
                    }}
                    className="absolute inline-block text-base md:text-lg font-medium text-[#84994F] italic px-4"
                  >
                    &ldquo;{t.mission.quotes[currentQuote]}&rdquo;
                  </motion.div>
                </div>
                <div className="flex justify-center mt-4 space-x-2">
                  {t.mission.quotes.map((_, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuote(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentQuote
                          ? "bg-[#84994F] w-6"
                          : "bg-[#84994F]/30 hover:bg-[#84994F]/60"
                      }`}
                      aria-label={`Citation ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="w-full">
              <Timeline data={timelineData} />
            </div>

            {/* Call to Action redesigné */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mt-24 md:mt-32"
            >
              {/* Mobile: Simple CTA */}
              <div className="md:hidden">
                <div className="bg-white rounded-3xl p-8 border border-[#84994F]/20 shadow-lg">
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center opacity-80">
                      <VanIcon size="md" showRoad={false} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {t.finalCta.title}
                      </h3>
                      <p className="text-gray-600 text-[14px] leading-relaxed">
                        {t.finalCta.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                      <Link
                        href="/contact"
                        onClick={() =>
                          trackAbout.contactCtaClicked("mobile_bottom")
                        }
                        className="bg-[#84994F] text-white px-8 py-4 rounded-xl hover:bg-[#84994F]/90 transition-all duration-300 font-semibold text-[15px] shadow-md hover:shadow-lg active:scale-95"
                      >
                        {t.finalCta.contactButton}
                      </Link>
                      <Link
                        href="/map"
                        onClick={() =>
                          trackAbout.mapCtaClicked("mobile_bottom")
                        }
                        className="bg-white border-2 border-[#84994F]/30 text-[#84994F] px-8 py-4 rounded-xl hover:border-[#84994F] hover:bg-[#84994F]/5 transition-all duration-300 font-semibold text-[15px] active:scale-95"
                      >
                        {t.finalCta.mapButton}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop: Card CTA avec fond */}
              <div className="hidden md:block">
                <div className="bg-white rounded-3xl p-12 border border-[#84994F]/20 shadow-xl max-w-5xl mx-auto">
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center opacity-80 mb-4">
                      <VanIcon size="lg" showRoad={false} />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {t.finalCta.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                      {t.finalCta.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <Link
                        href="/contact"
                        onClick={() =>
                          trackAbout.contactCtaClicked("desktop_bottom")
                        }
                        className="bg-[#84994F] text-white px-10 py-4 rounded-xl hover:bg-[#84994F]/90 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        {t.finalCta.contactButton}
                      </Link>
                      <Link
                        href="/map"
                        onClick={() =>
                          trackAbout.mapCtaClicked("desktop_bottom")
                        }
                        className="border-2 border-[#84994F] text-[#84994F] px-10 py-4 rounded-xl hover:bg-[#84994F] hover:text-white transition-all duration-300 font-semibold text-lg"
                      >
                        {t.finalCta.mapButton}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        {/* Footer */}
        <SelfcampFooter />
      </div>
    </>
  );
}
