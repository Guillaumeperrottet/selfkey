"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { DOMAINS } from "@/lib/domains";
import { StructuredData } from "@/components/structured-data";
import { Timeline } from "@/components/ui/timeline";
import { useState, useEffect } from "react";

export function SelfcampAboutPage() {
  // Carousel pour les phrases de mission
  const quotes = [
    "Créer un pont entre tourisme durable et développement territorial",
    "Transformer chaque nuitée en opportunité pour les territoires",
    "Valoriser les régions tout en respectant l'environnement",
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  // Paramètres pour le swipe
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000); // Change toutes les 5 secondes

    return () => clearInterval(timer);
  }, [quotes.length]);

  // Données pour la timeline de développement de SelfCamp
  const timelineData = [
    {
      title: "Soutien aux Régions",
      content: (
        <div className="py-6 md:py-10 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            {/* Mobile: Simple text blocks */}
            <div className="md:hidden space-y-6">
              <div className="space-y-4">
                <p className="text-base text-gray-700 leading-relaxed">
                  Le camping sauvage a l&apos;avantage de favoriser les visites
                  des régions moins touristiques. En créant des aires de camping
                  SelfCamp, cela permet d&apos;organiser les nuitées de ces
                  visiteurs et de faire découvrir des villages hors des grands
                  axes.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-base text-gray-700 leading-relaxed">
                  Dès lors, notre idée est de permettre aux artisans locaux
                  (boulangerie, épicerie et laiterie) de profiter de cette
                  présence en offrant des avantages dans leur commerce au moment
                  du paiement de la taxe de séjour.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-5">
                <div className="flex items-start space-x-4">
                  <span className="text-2xl flex-shrink-0 mt-1">🏪</span>
                  <div>
                    <h4 className="text-base font-semibold text-[#84994F] mb-1.5">
                      Commerce Local
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Boulangeries, épiceries, laiteries bénéficient directement
                      du passage des camping-caristes
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <span className="text-2xl flex-shrink-0 mt-1">🗺️</span>
                  <div>
                    <h4 className="text-base font-semibold text-[#84994F] mb-1.5">
                      Découverte Régionale
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Valorisation des villages et régions moins touristiques
                      hors des grands axes
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <span className="text-2xl flex-shrink-0 mt-1">💰</span>
                  <div>
                    <h4 className="text-base font-semibold text-[#84994F] mb-1.5">
                      Économie Circulaire
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Avantages commerciaux liés au paiement des taxes de
                      séjour, retombées économiques directes
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-bold text-[#84994F] mb-3">
                  Impact Territorial
                </h4>
                <p className="text-gray-700 text-base leading-relaxed">
                  SelfCamp transforme le camping sauvage en opportunité
                  économique structurée, créant un cercle vertueux qui bénéficie
                  aux territoires, commerçants et visiteurs.
                </p>
              </div>
            </div>

            {/* Desktop: Cards layout */}
            <div className="hidden md:block space-y-6 mb-10">
              <div className="bg-[#84994F]/3 rounded-2xl p-6 border border-[#84994F]/30 text-center">
                <p className="text-base text-gray-700 leading-relaxed">
                  Le camping sauvage a l&apos;avantage de favoriser les visites
                  des régions moins touristiques. En créant des aires de camping
                  SelfCamp, cela permet d&apos;organiser les nuitées de ces
                  visiteurs et de faire découvrir des villages hors des grands
                  axes.
                </p>
              </div>

              <div className="bg-[#84994F]/3 rounded-2xl p-6 border border-[#84994F]/30 text-center">
                <p className="text-base text-gray-700 leading-relaxed">
                  Dès lors, notre idée est de permettre aux artisans locaux
                  (boulangerie, épicerie et laiterie) de profiter de cette
                  présence en offrant des avantages dans leur commerce au moment
                  du paiement de la taxe de séjour.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-10">
                <div className="bg-[#84994F]/5 p-6 rounded-2xl border border-[#84994F]/30 text-center hover:border-[#84994F]/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-[#84994F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">🏪</span>
                  </div>
                  <h4 className="text-lg font-semibold text-[#84994F] mb-3">
                    Commerce Local
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Boulangeries, épiceries, laiteries bénéficient directement
                    du passage des camping-caristes
                  </p>
                </div>

                <div className="bg-[#84994F]/5 p-6 rounded-2xl border border-[#84994F]/30 text-center hover:border-[#84994F]/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-[#84994F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">🗺️</span>
                  </div>
                  <h4 className="text-lg font-semibold text-[#84994F] mb-3">
                    Découverte Régionale
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Valorisation des villages et régions moins touristiques hors
                    des grands axes
                  </p>
                </div>

                <div className="bg-[#84994F]/5 p-6 rounded-2xl border border-[#84994F]/30 text-center hover:border-[#84994F]/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-[#84994F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">💰</span>
                  </div>
                  <h4 className="text-lg font-semibold text-[#84994F] mb-3">
                    Économie Circulaire
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Avantages commerciaux liés au paiement des taxes de séjour,
                    retombées économiques directes
                  </p>
                </div>
              </div>

              <div className="mt-10 bg-[#84994F]/3 rounded-2xl p-6 border border-[#84994F]/30 text-center max-w-4xl mx-auto">
                <h4 className="text-xl font-semibold text-[#84994F] mb-3">
                  Impact Territorial
                </h4>
                <p className="text-gray-700 text-base leading-relaxed">
                  SelfCamp transforme le camping sauvage en opportunité
                  économique structurée, créant un cercle vertueux qui bénéficie
                  aux territoires, commerçants et visiteurs.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Nos Prestations",
      content: (
        <div className="py-6 md:py-10 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            {/* Mobile: Simple list */}
            <div className="md:hidden space-y-6">
              <div className="space-y-3">
                <p className="text-base text-gray-700 leading-relaxed">
                  Au-delà de notre{" "}
                  <span className="text-[#84994F] font-medium">
                    solution d&apos;enregistrement
                  </span>
                  , nous vous accompagnons avec notre expertise complète pour
                  l&apos;organisation optimale de votre aire.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4">
                  Nos prestations incluent :
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Délimitation de la zone et des places
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Mise en place de la signalétique
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Mise en place du système d&apos;enregistrement (Totem et
                      QR code)
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Solution de vidange (sur place ou dans campings
                      partenaires)
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Promotion sur site internet
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Promotion sur réseaux sociaux
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-bold text-[#84994F] mb-3">
                  Solution Complète Clé en Main
                </h4>
                <p className="text-gray-700 text-base leading-relaxed">
                  De la conception à la promotion, nous prenons en charge tous
                  les aspects de votre aire de camping-car pour garantir son
                  succès.
                </p>
              </div>
            </div>

            {/* Desktop: Original layout */}
            <div className="hidden md:block">
              <div className="text-center mb-10">
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    Au-delà de notre{" "}
                    <span className="text-[#84994F] font-medium">
                      solution d&apos;enregistrement
                    </span>
                    , nous vous accompagnons avec notre expertise complète pour
                    l&apos;organisation optimale de votre aire.
                  </p>
                  <p className="text-base text-gray-600 font-medium">
                    Nos prestations incluent :
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 flex-shrink-0"></div>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Délimitation de la zone et des places
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 flex-shrink-0"></div>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Mise en place de la signalétique
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 flex-shrink-0"></div>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Mise en place du système d&apos;enregistrement (Totem et
                      QR code)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 flex-shrink-0"></div>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Solution de vidange (sur place ou dans campings
                      partenaires)
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 flex-shrink-0"></div>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Promotion sur site internet
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 flex-shrink-0"></div>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Promotion sur réseaux sociaux
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 bg-[#84994F]/3 rounded-2xl p-6 border border-[#84994F]/30 text-center max-w-4xl mx-auto">
                <h4 className="text-xl font-semibold text-[#84994F] mb-3">
                  Solution Complète Clé en Main
                </h4>
                <p className="text-gray-700 text-base leading-relaxed">
                  De la conception à la promotion, nous prenons en charge tous
                  les aspects de votre aire de camping-car pour garantir son
                  succès.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Avantages Prestataires",
      content: (
        <div className="py-6 md:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            {/* Mobile: Simple sections */}
            <div className="md:hidden space-y-8">
              {/* Conformité Réglementaire */}
              <div>
                <h4 className="text-lg font-bold text-[#84994F] mb-4">
                  Conformité Réglementaire
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Création d&apos;une structure légale permettant
                      d&apos;interdire le camping sauvage
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Respect des obligations légales de déclaration
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Traçabilité complète pour contrôles et audits
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Conformité RGPD et protection des données
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Revenus Garantis */}
              <div>
                <h4 className="text-lg font-bold text-[#84994F] mb-4">
                  Revenus Garantis
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Collecte automatisée des taxes de séjour sans perte ni
                      oubli
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Augmentation significative des recettes fiscales
                      touristiques
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Partenariat Tout-en-un */}
              <div>
                <h4 className="text-lg font-bold text-[#84994F] mb-4">
                  Partenariat Tout-en-un
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Amélioration concrète des infrastructures (signalétique,
                      parkings)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Réseau de services intégrés via partenariats campings
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Possibilité de rendre payant les parkings (en sus des
                      taxes)
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Données Stratégiques */}
              <div>
                <h4 className="text-lg font-bold text-[#84994F] mb-4">
                  Données Stratégiques
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Fréquentation détaillée, flux par site, saisonnalité,
                      durée des séjours
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Profiling visiteurs : origine géographique, type de
                      tourisme
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Identification des zones sous/surexploitées
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">
                      Anticipation des pics, dimensionnement des infrastructures
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-xl font-bold text-[#84994F] mb-3">
                  Solution Complète Clé en Main
                </h4>
                <p className="text-gray-700 text-base leading-relaxed">
                  De la conception à la promotion, nous prenons en charge tous
                  les aspects de votre aire de camping-car pour garantir son
                  succès.
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
                    Conformité Réglementaire
                  </h4>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Création d&apos;une structure légale permettant
                        d&apos;interdire le camping sauvage
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Respect des obligations légales de déclaration
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Traçabilité complète pour contrôles et audits
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Conformité RGPD et protection des données
                      </span>
                    </li>
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
                    Revenus Garantis
                  </h4>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Collecte automatisée des taxes de séjour sans perte ni
                        oubli
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Augmentation significative des recettes fiscales
                        touristiques
                      </span>
                    </li>
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
                    Partenariat Tout-en-un
                  </h4>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Amélioration concrète des infrastructures (signalétique,
                        parkings)
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Réseau de services intégrés via partenariats campings
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Possibilité de rendre payant les parkings (en sus des
                        taxes)
                      </span>
                    </li>
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
                    Données Stratégiques
                  </h4>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Fréquentation détaillée, flux par site, saisonnalité,
                        durée des séjours
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Profiling visiteurs : origine géographique, type de
                        tourisme
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Identification des zones sous/surexploitées
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                      <span className="text-base leading-relaxed">
                        Anticipation des pics, dimensionnement des
                        infrastructures
                      </span>
                    </li>
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
                <h4 className="text-2xl md:text-3xl font-bold text-[#84994F] mb-4">
                  Solution Complète Clé en Main
                </h4>
                <p className="text-gray-700 text-lg leading-relaxed">
                  De la conception à la promotion, nous prenons en charge tous
                  les aspects de votre aire de camping-car pour garantir son
                  succès.
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
        {/* Header harmonisé */}
        <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100/50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Desktop header */}
              <div className="hidden lg:flex items-center justify-between w-full">
                <div className="flex items-center space-x-2 bg-[#84994F]/10 text-[#84994F] px-3 py-1.5 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-[#84994F] rounded-full animate-pulse"></div>
                  <span>24H/24 - 7J/7</span>
                </div>
                <Link
                  href="/"
                  className="group flex items-center space-x-2 text-gray-600 hover:text-[#84994F] transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="font-medium">Retour à l&apos;accueil</span>
                </Link>
                <Link
                  href="/contact"
                  className="text-[#84994F] text-sm font-bold tracking-wide uppercase hover:text-[#84994F]/80 transition-colors duration-300"
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
                <Link
                  href="/"
                  className="group flex items-center space-x-2 text-gray-600 hover:text-[#84994F] transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="text-sm">Accueil</span>
                </Link>
                <Link
                  href="/contact"
                  className="text-[#84994F] text-xs font-bold tracking-wide uppercase hover:text-[#84994F]/80 transition-colors duration-300"
                >
                  CONTACT
                </Link>
              </div>
            </div>
          </div>
        </header>
        {/* Hero Section épuré */}
        <section className="bg-white py-12 md:py-20 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-[#84994F]/10 text-[#84994F] px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-medium mb-6 md:mb-8"
            >
              <span>🏛️</span>
              <span>Solution pour communes suisses</span>
            </motion.div>

            {/* Titre principal */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 md:mb-8 leading-tight px-2"
            >
              À propos de <span className="text-[#84994F]">SelfCamp</span>
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base md:text-xl lg:text-2xl text-gray-600 mb-10 md:mb-16 max-w-4xl mx-auto leading-relaxed px-2"
            >
              Une solution complète pour créer des aires de camping-car légales
              qui bénéficient aux communes, aux régions et aux vanlife.
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
                  Conformité légale
                </div>
              </div>
              <div className="bg-white border border-[#84994F]/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-[#84994F]/50 transition-all duration-300">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#84994F] mb-2 md:mb-3">
                  24/7
                </div>
                <div className="text-gray-700 font-medium text-sm md:text-base">
                  Accès autonome
                </div>
              </div>
              <div className="bg-white border border-[#84994F]/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-[#84994F]/50 transition-all duration-300">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#84994F] mb-2 md:mb-3">
                  0
                </div>
                <div className="text-gray-700 font-medium text-sm md:text-base">
                  Installation Informatique
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
                Notre <span className="text-[#84994F]">mission</span>
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-2">
                Transformer le camping sauvage en opportunité économique pour
                les communes suisses
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
                        setCurrentQuote((prev) => (prev + 1) % quotes.length);
                      } else if (swipe > swipeConfidenceThreshold) {
                        // Swipe vers la droite - citation précédente
                        setCurrentQuote(
                          (prev) => (prev - 1 + quotes.length) % quotes.length
                        );
                      }
                    }}
                    className="absolute inline-block text-base md:text-lg font-medium text-[#84994F] italic px-4"
                  >
                    &ldquo;{quotes[currentQuote]}&rdquo;
                  </motion.div>
                </div>
                <div className="flex justify-center mt-4 space-x-2">
                  {quotes.map((_, index) => (
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
              <div className="md:hidden text-center space-y-6">
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Prêt à transformer votre territoire ?
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed px-4">
                    Découvrez comment SelfCamp peut vous aider à créer des aires
                    de camping-car conformes et autonome.
                  </p>
                </div>
                <div className="flex flex-col gap-3 px-4">
                  <Link
                    href="/contact"
                    className="bg-[#84994F] text-white px-8 py-4 rounded-xl hover:bg-[#84994F]/90 transition-colors font-semibold text-base shadow-lg"
                  >
                    Nous contacter
                  </Link>
                  <Link
                    href="/map"
                    className="border-2 border-[#84994F] text-[#84994F] px-8 py-4 rounded-xl hover:bg-[#84994F] hover:text-white transition-colors font-semibold text-base"
                  >
                    Voir les aires existantes
                  </Link>
                </div>
              </div>

              {/* Desktop: Card CTA avec fond */}
              <div className="hidden md:block">
                <div className="bg-gradient-to-br from-[#84994F]/10 via-white to-[#84994F]/5 rounded-3xl p-12 border border-[#84994F]/20 shadow-xl max-w-5xl mx-auto">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#84994F] rounded-full mb-4">
                      <span className="text-3xl">🚐</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
                      Prêt à transformer votre territoire ?
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                      Découvrez comment SelfCamp peut vous aider à créer des
                      aires de camping-car conformes et autonomes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <Link
                        href="/contact"
                        className="bg-[#84994F] text-white px-10 py-4 rounded-xl hover:bg-[#84994F]/90 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        Contactez-nous
                      </Link>
                      <Link
                        href="/map"
                        className="border-2 border-[#84994F] text-[#84994F] px-10 py-4 rounded-xl hover:bg-[#84994F] hover:text-white transition-all duration-300 font-semibold text-lg"
                      >
                        Voir les aires existantes
                      </Link>
                    </div>
                  </div>
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
                      href="mailto:gp@webbing.ch"
                      className="text-[#84994F] hover:text-[#6d7d3f] transition-colors duration-300"
                    >
                      gp@webbing.ch
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
                      href="/"
                      className="hover:text-[#84994F] transition-colors"
                    >
                      Accueil
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="/map"
                      className="hover:text-[#84994F] transition-colors"
                    >
                      Carte des aires
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
