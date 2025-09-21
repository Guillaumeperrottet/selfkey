"use client";

import Image from "next/image";
import {
  MapPin,
  CheckCircle,
  Users,
  Clock,
  Shield,
  Star,
  TrendingUp,
} from "lucide-react";
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
          background-color: #f2f4ed;
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
        <section className="relative bg-search-light px-4 pb-20 -mt-4">
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

        {/* Nouvelle section: Comment ça marche */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Répertoire d&apos;emplacements et système de paiement en une app
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                SelfCamp fonctionne sans réservation et tous les sites
                d&apos;hôtes peuvent être approchés spontanément.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Étape 1 */}
              <div className="text-center">
                <div className="bg-[#84994F] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Rechercher un site
                </h3>
                <p className="text-gray-600">
                  Recherchez des sites dans votre région selon les activités,
                  services, environnement et plus encore, et conduisez
                  directement vers eux.
                </p>
              </div>

              {/* Étape 2 */}
              <div className="text-center">
                <div className="bg-[#84994F] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Démarrer spontanément
                </h3>
                <p className="text-gray-600">
                  SelfCamp fonctionne sans réservation. Un aperçu détaillé
                  fournit des informations sur le type de site, le prix, la
                  disponibilité et les règles.
                </p>
              </div>

              {/* Étape 3 */}
              <div className="text-center">
                <div className="bg-[#84994F] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Check-in numérique
                </h3>
                <p className="text-gray-600">
                  Sur place, le point de check-in signale que vous êtes au bon
                  endroit. Le processus simple sans téléchargement d&apos;app
                  facilite l&apos;usage.
                </p>
              </div>

              {/* Étape 4 */}
              <div className="text-center">
                <div className="bg-[#84994F] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Facturation sécurisée
                </h3>
                <p className="text-gray-600">
                  Dans votre profil, vous trouverez tous les paramètres
                  nécessaires. Contrôle des séjours actuels et passés,
                  évaluations et paiements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section statistiques */}
        <section className="bg-[#84994F] py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Nous redonnons la liberté au camping-cariste
              </h2>
              <p className="text-xl text-green-100 max-w-3xl mx-auto">
                SelfCamp est un nouveau concept qui reflète le tourisme moderne
                en camping-car. Campeurs, hôtes et municipalités utilisent le
                système avec succès.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-6xl font-bold text-white mb-2">
                  3
                </div>
                <div className="text-green-100 font-semibold">Cantons</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-6xl font-bold text-white mb-2">
                  120+
                </div>
                <div className="text-green-100 font-semibold">Emplacements</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-6xl font-bold text-white mb-2">
                  500+
                </div>
                <div className="text-green-100 font-semibold">Sites</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-6xl font-bold text-white mb-2">
                  2&apos;000+
                </div>
                <div className="text-green-100 font-semibold">
                  Utilisateurs actifs
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section types d'emplacements */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Types d&apos;emplacements disponibles
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez différents types d&apos;hébergements adaptés à vos
                besoins
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Parcs camping-cars */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-center">
                  <div className="bg-[#84994F] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Parcs Camping-Cars
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Nuitées dans des sites désignés, campings et parcs pour
                    camping-cars.
                  </p>
                  <button className="text-[#84994F] font-semibold hover:underline">
                    En savoir plus →
                  </button>
                </div>
              </div>

              {/* Sites de remontées mécaniques */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-center">
                  <div className="bg-[#84994F] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Sites de Montagne
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Hébergement nocturne directement aux remontées mécaniques et
                    sites alpins.
                  </p>
                  <button className="text-[#84994F] font-semibold hover:underline">
                    En savoir plus →
                  </button>
                </div>
              </div>

              {/* Fermes et vignobles */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-center">
                  <div className="bg-[#84994F] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Fermes & Vignobles
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Découvrez des lieux chez des agriculteurs, viticulteurs et
                    forestiers.
                  </p>
                  <button className="text-[#84994F] font-semibold hover:underline">
                    En savoir plus →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section devenir hôte */}
        <section className="bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Devenez hôte pour campeurs maintenant - sans aucun effort !
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Avec SelfCamp, vous louez votre site facilement et sans effort
                administratif pour une taxe de nuitée. Les campeurs se rendent
                sur votre site sans avoir à s&apos;inscrire à l&apos;avance et
                s&apos;enregistrent de manière indépendante.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-[#84994F] hover:bg-[#6d7d3f] text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 text-lg">
                  Enregistrer votre lieu
                </button>
                <button className="border-2 border-[#84994F] text-[#84994F] hover:bg-[#84994F] hover:text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 text-lg">
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-gray-900 text-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                  <Image
                    src="/logo_map.png"
                    alt="SelfCamp"
                    width={32}
                    height={32}
                    className="rounded"
                  />
                  <span className="text-xl font-bold">SelfCamp</span>
                </div>
                <p className="text-gray-400 mb-4">
                  L&apos;App de stationnement pour camping-cars en Suisse.
                </p>
                <div className="flex justify-center md:justify-start space-x-4">
                  <button className="bg-[#84994F] hover:bg-[#6d7d3f] text-white px-4 py-2 rounded-lg transition-colors duration-300">
                    Télécharger l&apos;App
                  </button>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4 text-lg text-white">
                  Navigation
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-[#84994F] transition-colors duration-300 cursor-pointer">
                    Télécharger l&apos;App
                  </li>
                  <li className="hover:text-[#84994F] transition-colors duration-300 cursor-pointer">
                    Acheter une carte annuelle
                  </li>
                  <li className="hover:text-[#84994F] transition-colors duration-300 cursor-pointer">
                    Acquérir du crédit
                  </li>
                  <li className="hover:text-[#84994F] transition-colors duration-300 cursor-pointer">
                    Devenir hôte
                  </li>
                  <li className="hover:text-[#84994F] transition-colors duration-300 cursor-pointer">
                    Pour les municipalités
                  </li>
                </ul>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4 text-lg text-white">
                  Centre d&apos;aide
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-[#84994F] transition-colors duration-300 cursor-pointer">
                    Informations générales
                  </li>
                  <li className="hover:text-[#84994F] transition-colors duration-300 cursor-pointer">
                    FAQ Campeurs
                  </li>
                  <li className="hover:text-[#84994F] transition-colors duration-300 cursor-pointer">
                    FAQ Hôtes
                  </li>
                  <li className="hover:text-[#84994F] transition-colors duration-300 cursor-pointer">
                    Conditions d&apos;utilisation
                  </li>
                  <li className="hover:text-[#84994F] transition-colors duration-300 cursor-pointer">
                    Protection des données
                  </li>
                </ul>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4 text-lg text-white">
                  Contact
                </h4>
                <div className="space-y-2 text-gray-400 mb-4">
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-[#84994F]" />
                    <span>Canton de Fribourg, Suisse</span>
                  </div>
                  <div>
                    <a
                      href="mailto:support@selfcamp.ch"
                      className="text-[#84994F] hover:text-[#6d7d3f] transition-colors duration-300"
                    >
                      support@selfcamp.ch
                    </a>
                  </div>
                  <div>
                    <a
                      href={DOMAINS.SELFKEY}
                      className="text-[#84994F] hover:text-[#6d7d3f] transition-colors duration-300"
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
