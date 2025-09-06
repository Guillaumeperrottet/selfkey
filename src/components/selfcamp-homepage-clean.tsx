"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Building,
  MapIcon,
  BarChart3,
  Smartphone,
  Shield,
  AlertTriangle,
  Users,
  Globe,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { DOMAINS } from "@/lib/constants";

export function SelfcampHomepage() {
  return (
    <div className="min-h-screen">
      {/* Fixed background image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background-selfcamp.jpg"
          alt="Selfcamp Background"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Header */}
      <header className="relative z-40 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="SelfCamp"
                width={40}
                height={40}
                className="rounded"
              />
              <span className="text-2xl font-bold" style={{ color: "#E85A73" }}>
                SelfCamp
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#problemes"
                className="text-white hover:text-pink-400 transition-colors duration-300"
              >
                Problèmes
              </Link>
              <Link
                href="#solution"
                className="text-white hover:text-pink-400 transition-colors duration-300"
              >
                Solution
              </Link>
              <Link
                href="#services"
                className="text-white hover:text-pink-400 transition-colors duration-300"
              >
                Services
              </Link>
              <Link
                href="#avantages"
                className="text-white hover:text-pink-400 transition-colors duration-300"
              >
                Avantages
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-30 text-white text-center py-32 px-4">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
            Bienvenue dans le futur du camping
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Découvrez une nouvelle façon de camper avec notre plateforme
            innovante qui révolutionne l&apos;expérience outdoor en Suisse.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative z-20 py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Trouvez votre emplacement idéal
              </h2>
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for better visual separation */}
      <div className="h-20"></div>

      {/* Problems Section */}
      <section
        className="py-20 px-4 relative z-10"
        style={{ backgroundColor: "#212215" }}
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "#E85A73" }}
            >
              Les problématiques{" "}
              <span className="bg-purple-200 text-black px-4 py-2 rounded-lg">
                majeures
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Taxes de séjour */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <h3 className="text-2xl font-bold" style={{ color: "#E85A73" }}>
                  Taxes de séjour
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  "Non-paiement ou déclarations incomplètes",
                  "Perte de revenus significative pour les structures du canton",
                  "Contrôle difficile des séjours non déclarés",
                  "Impact sur le financement des infrastructures touristiques",
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Camping sauvage */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <Users className="h-8 w-8 text-red-500" />
                <h3 className="text-2xl font-bold" style={{ color: "#E85A73" }}>
                  Camping sauvage
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  "Augmentation des campements non autorisés",
                  "Dégradation des sites naturels",
                  "Nuisances pour les riverains",
                  "Manque de traçabilité des visiteurs",
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Infrastructure */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <Building className="h-8 w-8 text-yellow-500" />
                <h3 className="text-2xl font-bold" style={{ color: "#E85A73" }}>
                  Infrastructure et stationnement
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  "Saturation des parkings en haute saison",
                  "Manque de coordination entre hébergements",
                  "Difficultés d&apos;accès aux sites touristiques",
                  "Gestion sous-optimale des flux de visiteurs",
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact global */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <Globe className="h-8 w-8 text-purple-500" />
                <h3 className="text-2xl font-bold" style={{ color: "#E85A73" }}>
                  Impact global
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  "Manque de données fiables sur la fréquentation réelle",
                  "Difficultés de planification et d&apos;investissement",
                  "Image du canton affectée par ces problématiques",
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section
        className="py-20 px-4 relative z-10"
        style={{ backgroundColor: "#212215" }}
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "#E85A73" }}
            >
              Notre{" "}
              <span className="bg-purple-200 text-black px-4 py-2 rounded-lg">
                solution
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              En collaboration avec les communes nous équipons les aires mise à
              disposition de places de parc limitées, d&apos;une signalétique,
              et d&apos;un système d&apos;enregistrement conforme à la loi sur
              le tourisme.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Infrastructure",
                description:
                  "Amélioration des infrastructures, fourniture des totems, signalétique adaptée, optimisation des parkings",
                icon: Building,
              },
              {
                title: "Enregistrement",
                description:
                  "Enregistrement automatique des visiteurs via QR code (hébergements, campings, parkings)",
                icon: Smartphone,
              },
              {
                title: "Conformité",
                description: "Envoie des données à la police via Check-in FR",
                icon: Shield,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <item.icon
                  className="h-12 w-12 mb-6"
                  style={{ color: "#E85A73" }}
                />
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: "#E85A73" }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Tableau de bord",
                description:
                  "Tableau de bord centralisé via Selfcamp.ch pour l&apos;UFT et les communes",
                icon: BarChart3,
              },
              {
                title: "Facilité",
                description:
                  "Solution clé en main : aucune infrastructure IT requise, rémunération uniquement à la transaction",
                icon: CheckCircle,
              },
              {
                title: "Traçabilité",
                description:
                  "Traçabilité complète des séjours et contrôle du camping sauvage",
                icon: MapIcon,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <item.icon
                  className="h-12 w-12 mb-6"
                  style={{ color: "#E85A73" }}
                />
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: "#E85A73" }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        className="py-20 px-4 relative z-10"
        style={{ backgroundColor: "#212215" }}
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "#E85A73" }}
            >
              Nos{" "}
              <span className="bg-purple-200 text-black px-4 py-2 rounded-lg">
                prestations
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
              Nous offrons une solution d&apos;enregistrement, mais nous
              apportons également notre expertise sur l&apos;organisation du
              parking soit :
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {[
              "Délimitation de la zone et des places",
              "Mise en place de la signalétique",
              "Mise en place du système d&apos;enregistrement (Totem et QR code)",
              "Solution de vidange (sur place ou dans campings partenaires)",
              "Promotion sur site internet",
              "Promotion sur réseaux sociaux",
            ].map((service, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 mb-6 p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <p className="text-lg text-gray-300">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section
        className="py-20 px-4 relative z-10"
        style={{ backgroundColor: "#212215" }}
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "#E85A73" }}
            >
              Avantages{" "}
              <span className="bg-purple-200 text-black px-4 py-2 rounded-lg">
                utilisateurs
              </span>{" "}
              &
              <span className="bg-purple-200 text-black px-4 py-2 rounded-lg ml-2">
                prestataires
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Flexibilité",
                points: [
                  "Check-in/enregistrement 24h/24 et 7j/7",
                  "Pas d&apos;attente aux réceptions ou points d&apos;accueil",
                  "Liberté d&apos;arrivée selon ses horaires de voyage",
                ],
                icon: Clock,
              },
              {
                title: "Simplicité",
                points: [
                  "Enregistrement rapide via QR code depuis son smartphone",
                  "Aucune application à télécharger, fonctionne via navigateur web",
                  "Inventaire en live des emplacements disponible sur le site internet Selfcamp.ch",
                ],
                icon: Smartphone,
              },
              {
                title: "Expérience unique",
                points: [
                  "Accès facilité aux services partenaires",
                  "Informations touristiques intégrées sur la région",
                  "Solution moderne qui valorise l&apos;image du canton de Fribourg",
                ],
                icon: MapPin,
              },
              {
                title: "Sécurité et transparence",
                points: [
                  "Données personnelles protégées (conformité RGPD)",
                  "Processus transparent et légal pour les taxes de séjour",
                  "Traçabilité des réservations et paiements",
                ],
                icon: Shield,
              },
            ].map((advantage, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <advantage.icon
                  className="h-10 w-10 mb-4"
                  style={{ color: "#E85A73" }}
                />
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: "#E85A73" }}
                >
                  {advantage.title}
                </h3>
                <div className="space-y-3">
                  {advantage.points.map((point, pointIndex) => (
                    <div
                      key={pointIndex}
                      className="flex items-start space-x-2"
                    >
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-300">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto text-center">
          <div>
            <h3
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ color: "#E85A73" }}
            >
              Prêt pour votre prochaine aventure ?
            </h3>
            <p className="mb-8 max-w-2xl mx-auto text-lg text-gray-300">
              Découvrez nos emplacements disponibles et réservez votre séjour en
              quelques clics.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Link
                href={DOMAINS.SELFKEY}
                className="inline-flex items-center space-x-2"
              >
                <span>Commencer ma réservation</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-white py-12 px-4 relative z-10"
        style={{ backgroundColor: "#212215" }}
      >
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/logo.png"
                  alt="SelfCamp"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <span
                  className="text-xl font-bold"
                  style={{ color: "#E85A73" }}
                >
                  SelfCamp
                </span>
              </div>
              <p className="text-gray-400">
                Le camping du futur, disponible dès aujourd&apos;hui.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#E85A73" }}>
                Services
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors duration-300">
                  Réservation en ligne
                </li>
                <li className="hover:text-white transition-colors duration-300">
                  Accès automatisé
                </li>
                <li className="hover:text-white transition-colors duration-300">
                  Paiement sécurisé
                </li>
                <li className="hover:text-white transition-colors duration-300">
                  Support 24h/24
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#E85A73" }}>
                Contact
              </h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2 hover:text-white transition-colors duration-300">
                  <MapPin className="h-4 w-4" />
                  <span>Canton de Fribourg, Suisse</span>
                </div>
                <div>
                  <a
                    href={DOMAINS.SELFKEY}
                    className="text-pink-400 hover:text-pink-300 transition-colors duration-300"
                  >
                    Système de réservation
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 SelfCamp. Tous droits réservés. Propulsé par SelfKey.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
