"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { DOMAINS } from "@/lib/domains";
import { StructuredData } from "@/components/structured-data";
import { Timeline } from "@/components/ui/timeline";

export function SelfcampAboutPage() {
  // Données pour la timeline de développement de SelfCamp
  const timelineData = [
    {
      title: "Avantages Prestataires",
      content: (
        <div className="py-8">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Avantages <span className="text-[#84994F]">Prestataires</span>
            </h3>
            <p className="text-lg text-gray-600 mb-12">(communes / privés)</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Conformité Réglementaire */}
              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40 hover:shadow-lg hover:bg-white/80 transition-shadow">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900">
                    Conformité Réglementaire
                  </h4>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Création d&apos;une structure légale permettant
                      d&apos;interdire le camping sauvage
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Respect des obligations légales de déclaration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Traçabilité complète pour contrôles et audits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Conformité RGPD et protection des données</span>
                  </li>
                </ul>
              </div>

              {/* Revenus Garantis */}
              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40 hover:shadow-lg hover:bg-white/80 transition-shadow">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900">
                    Revenus Garantis
                  </h4>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Collecte automatisée des taxes de séjour sans perte ni
                      oubli
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Augmentation significative des recettes fiscales
                      touristiques
                    </span>
                  </li>
                </ul>
              </div>

              {/* Partenariat Tout-en-un */}
              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40 hover:shadow-lg hover:bg-white/80 transition-shadow">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900">
                    Partenariat Tout-en-un
                  </h4>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Amélioration concrète des infrastructures (signalétique,
                      parkings)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Réseau de services intégrés via partenariats campings
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Possibilité de rendre payant les parkings (en sus des
                      taxes)
                    </span>
                  </li>
                </ul>
              </div>

              {/* Données Stratégiques */}
              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40 hover:shadow-lg hover:bg-white/80 transition-shadow">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900">
                    Données Stratégiques
                  </h4>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Fréquentation détaillée, flux par site, saisonnalité,
                      durée des séjours
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Profiling visiteurs : origine géographique, type de
                      tourisme
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Identification des zones sous/surexploitées</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#84994F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Anticipation des pics, dimensionnement des infrastructures
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                Partenariat Gagnant-Gagnant
              </h4>
              <p className="text-gray-700 text-lg leading-relaxed">
                Une solution complète qui bénéficie à tous : communes,
                prestataires privés, et camping-caristes. Revenus optimisés,
                conformité assurée, données précieuses.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Nos Prestations",
      content: (
        <div className="py-8">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Nos <span className="text-[#84994F]">prestations</span>
            </h3>

            <p className="text-lg text-gray-700 mb-12 leading-relaxed max-w-4xl">
              Nous offrons une solution d&apos;enregistrement, mais nous
              apportons également notre expertise sur l&apos;organisation du
              parking soit :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-lg text-gray-800">
                    Délimitation de la zone et des places
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-lg text-gray-800">
                    Mise en place de la signalétique
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-lg text-gray-800">
                    Mise en place du système d&apos;enregistrement (Totem et QR
                    code)
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-lg text-gray-800">
                    Solution de vidange (sur place ou dans campings partenaires)
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-lg text-gray-800">
                    Promotion sur site internet
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-lg text-gray-800">
                    Promotion sur réseaux sociaux
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-[#f2f4ed]/80 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-[#84994F]/30">
              <h4 className="text-2xl font-bold text-[#84994F] mb-4">
                Solution Complète Clé en Main
              </h4>
              <p className="text-gray-700 text-lg leading-relaxed">
                De la conception à la promotion, nous prenons en charge tous les
                aspects de votre aire de camping-car pour garantir son succès.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Soutien aux Régions",
      content: (
        <div className="py-8">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              Soutien aux <span className="text-[#84994F]">Régions</span>
            </h3>

            <div className="space-y-12">
              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40">
                <p className="text-xl text-gray-800 leading-relaxed text-center mb-8">
                  Le camping sauvage a l&apos;avantage de favoriser les visites
                  des régions moins touristiques. En créant des aires de camping
                  SelfCamp, cela permet d&apos;organiser les nuitées de ces
                  visiteurs et de faire découvrir des villages hors des grands
                  axes.
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40 hover:shadow-lg hover:bg-white/80 transition-all duration-300">
                <p className="text-lg text-gray-800 leading-relaxed text-center">
                  Dès lors, notre idée est de permettre aux artisans locaux
                  (boulangerie, épicerie et laiterie) de profiter de cette
                  présence en offrant des avantages dans leur commerce au moment
                  du paiement de la taxe de séjour.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#84994F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    Commerce Local
                  </h4>
                  <p className="text-gray-600">
                    Boulangeries, épiceries, laiteries bénéficient directement
                    du passage des camping-caristes
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-[#84994F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    Découverte Régionale
                  </h4>
                  <p className="text-gray-600">
                    Valorisation des villages et régions moins touristiques hors
                    des grands axes
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-[#84994F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    Économie Circulaire
                  </h4>
                  <p className="text-gray-600">
                    Avantages commerciaux liés au paiement des taxes de séjour,
                    retombées économiques directes
                  </p>
                </div>
              </div>

              <div className="mt-12 bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40">
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  Impact Territorial
                </h4>
                <p className="text-gray-700 text-lg leading-relaxed">
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
      <div className="min-h-screen">
        {/* Header avec retour */}
        <section className="relative bg-hero-light">
          <header className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="group flex items-center space-x-3 bg-white/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/40 shadow-md hover:shadow-lg hover:bg-white/80 transition-all duration-300 hover:-translate-y-0.5"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700 group-hover:text-[#84994F] transition-colors" />
                <span className="font-medium text-gray-800 group-hover:text-[#84994F] transition-colors">
                  Retour à l&apos;accueil
                </span>
              </Link>

              <div className="flex items-center space-x-3">
                <Image
                  src="/logo_map.png"
                  alt="SelfCamp Logo"
                  width={40}
                  height={40}
                  className="rounded"
                />
                <span className="text-xl font-bold text-gray-900">
                  SelfCamp
                </span>
              </div>
            </div>
          </header>

          {/* Hero About */}
          <div className="text-center py-20 px-4">
            <div className="container mx-auto">
              <div className="max-w-5xl mx-auto">
                <div className="bg-white/70 backdrop-blur-sm p-12 md:p-16 rounded-3xl shadow-lg border border-white/40 mb-16">
                  <h1 className="text-4xl md:text-6xl font-bold mb-8 text-gray-900">
                    À propos de <span className="text-[#84994F]">SelfCamp</span>
                  </h1>
                  <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                    Découvrez notre approche complète pour créer des aires de
                    camping qui bénéficient à tous : prestataires, régions et
                    camping-caristes.
                  </p>
                </div>
              </div>
              <Timeline data={timelineData} />
            </div>
          </div>
        </section>

        {/* Notre Solution Section */}
        <section className="py-20 px-4 bg-hero-light">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Notre <span className="text-[#84994F] italic">solution</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                En collaboration avec les communes nous équipons les aires mises
                à disposition, de places de parc limitées, d&apos;une
                signalétique et d&apos;un système d&apos;enregistrement conforme
                à la loi sur le tourisme.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Infrastructure */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40 hover:shadow-lg hover:bg-white/80 transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Infrastructure
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Amélioration des infrastructures, fourniture des totems,
                  signalétique adaptée, optimisation des parkings
                </p>
              </motion.div>

              {/* Enregistrement */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40 hover:shadow-lg hover:bg-white/80 transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Enregistrement
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Enregistrement automatique des visiteurs via QR code
                  (hébergements, campings, parkings)
                </p>
              </motion.div>

              {/* Conformité */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40 hover:shadow-lg hover:bg-white/80 transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Conformité
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Envoi des données à la police via Check-in FR
                </p>
              </motion.div>

              {/* Tableau de bord */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40 hover:shadow-lg hover:bg-white/80 transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Tableau de bord
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Tableau de bord centralisé via{" "}
                  <span className="text-[#84994F] font-semibold">
                    Selfcamp.ch
                  </span>{" "}
                  pour l&apos;UFT et les communes
                </p>
              </motion.div>

              {/* Facilité */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40 hover:shadow-lg hover:bg-white/80 transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Facilité
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Solution clé en main : aucune infrastructure IT requise,
                  rémunération uniquement à la transaction
                </p>
              </motion.div>

              {/* Traçabilité */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40 hover:shadow-lg hover:bg-white/80 transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Traçabilité
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Traçabilité complète des séjours et contrôle du camping
                  sauvage
                </p>
              </motion.div>
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-white/40 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Une solution complète et moderne
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Découvrez comment notre technologie peut transformer la
                  gestion des aires de camping-car dans votre région.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="bg-[#84994F] text-white px-8 py-3 rounded-lg hover:bg-[#84994F]/90 transition-colors font-semibold inline-block"
                  >
                    Nous contacter
                  </Link>
                  <Link
                    href="/map"
                    className="border border-[#84994F] text-[#84994F] px-8 py-3 rounded-lg hover:bg-[#84994F] hover:text-white transition-colors font-semibold inline-block"
                  >
                    Voir les aires
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
