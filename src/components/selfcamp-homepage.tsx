"use client";

import { useEffect, useState } from "react";
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
import SearchBar from "@/components/ui/search-bar";
import { DOMAINS } from "@/lib/domains";

export function SelfcampHomepage() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);

  useEffect(() => {
    let lastScrollY = 0;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = currentScrollY - lastScrollY;

      setScrollY(currentScrollY);
      setScrollVelocity(velocity);
      setIsScrolling(true);

      // Détecter la fin du scroll
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        setScrollVelocity(0);
      }, 150);

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Calcul de l'effet de rebond
  const bounceEffect = isScrolling
    ? Math.abs(scrollVelocity) * 0.3 // Amplitude pendant le scroll
    : Math.sin(Date.now() * 0.003) * 3; // Rebond subtil au repos

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
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600 font-medium">24h/24 - 7j/7</div>
              <div className="text-gray-600 font-medium">
                Enregistrement automatique
              </div>
              <div className="text-gray-600 font-medium">CONTACTEZ-NOUS</div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-30 text-white text-center py-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-center mb-8">
              <Image
                src="/selfcamp_logo.png"
                alt="SelfCamp Logo"
                width={400}
                height={200}
                className="max-w-full h-auto"
                priority
              />
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="relative z-20 py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="p-8">
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

        {/* Animated Wave Separator with Bounce */}
        <div className="relative w-full h-40 overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1200 160"
            preserveAspectRatio="none"
          >
            <path
              d={`M0,80 C300,${30 + Math.sin(scrollY * 0.01) * 25 + bounceEffect} 600,${50 + Math.sin(scrollY * 0.008) * 20} 1200,60 L1200,160 L0,160 Z`}
              fill="#292D1C"
              className={`transition-all duration-300 ${isScrolling ? "ease-out" : "ease-bounce"}`}
              style={{
                filter: isScrolling
                  ? "none"
                  : "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            />
            <path
              d={`M0,100 C400,${40 + Math.sin(scrollY * 0.015 + 1) * 20 + bounceEffect * 0.7} 800,${70 + Math.sin(scrollY * 0.012 + 0.5) * 15} 1200,80 L1200,160 L0,160 Z`}
              fill="#292D1C"
              className={`transition-all duration-300 ${isScrolling ? "ease-out" : "ease-bounce"}`}
              opacity="0.8"
              style={{
                transform: isScrolling
                  ? "translateY(0)"
                  : `translateY(${Math.sin(Date.now() * 0.005) * 2}px)`,
              }}
            />
          </svg>
        </div>

        {/* Problems Section */}
        <section
          className="py-20 px-4 relative z-10 -mt-1"
          style={{ backgroundColor: "#292D1C" }}
        >
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{ color: "#D4AF37" }}
              >
                Les problématiques{" "}
                <span className="bg-amber-100/20 text-amber-100 px-4 py-2 rounded-lg border border-amber-200/30">
                  majeures
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Taxes de séjour */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#D4AF37" }}
                  >
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
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#D4AF37" }}
                  >
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
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#D4AF37" }}
                  >
                    Infrastructure et stationnement
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    "Saturation des parkings en haute saison",
                    "Manque de coordination entre hébergements",
                    "Difficultés d'accès aux sites touristiques",
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
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#D4AF37" }}
                  >
                    Impact global
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    "Manque de données fiables sur la fréquentation réelle",
                    "Difficultés de planification et d'investissement",
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
          style={{ backgroundColor: "#292D1C" }}
        >
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{ color: "#D4AF37" }}
              >
                Notre{" "}
                <span className="bg-amber-100/20 text-amber-100 px-4 py-2 rounded-lg border border-amber-200/30">
                  solution
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                En collaboration avec les communes nous équipons les aires mise
                à disposition de places de parc limitées, d&apos;une
                signalétique, et d&apos;un système d&apos;enregistrement
                conforme à la loi sur le tourisme.
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
                    style={{ color: "#D4AF37" }}
                  />
                  <h3
                    className="text-xl font-bold mb-4"
                    style={{ color: "#D4AF37" }}
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
                    "Tableau de bord centralisé via Selfcamp.ch pour l'UFT et les communes",
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
                    style={{ color: "#D4AF37" }}
                  />
                  <h3
                    className="text-xl font-bold mb-4"
                    style={{ color: "#D4AF37" }}
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
          style={{ backgroundColor: "#292D1C" }}
        >
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{ color: "#D4AF37" }}
              >
                Nos{" "}
                <span className="bg-amber-100/20 text-amber-100 border border-amber-200/30 px-4 py-2 rounded-lg">
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
                "Mise en place du système d'enregistrement (Totem et QR code)",
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
          style={{ backgroundColor: "#292D1C" }}
        >
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{ color: "#D4AF37" }}
              >
                Avantages{" "}
                <span className="bg-amber-100/20 text-amber-100 border border-amber-200/30 px-4 py-2 rounded-lg">
                  utilisateurs
                </span>{" "}
                &
                <span className="bg-amber-100/20 text-amber-100 border border-amber-200/30 px-4 py-2 rounded-lg ml-2">
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
                    "Pas d'attente aux réceptions ou points d'accueil",
                    "Liberté d'arrivée selon ses horaires de voyage",
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
                    "Solution moderne qui valorise l'image du canton de Fribourg",
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
                    style={{ color: "#D4AF37" }}
                  />
                  <h3
                    className="text-xl font-bold mb-4"
                    style={{ color: "#D4AF37" }}
                  >
                    {advantage.title}
                  </h3>
                  <div className="space-y-3">
                    {advantage.points.map((point, pointIndex) => (
                      <div
                        key={pointIndex}
                        className="flex items-start space-x-2"
                      >
                        <div className="w-2 h-2 bg-amber-300 rounded-full mt-2 flex-shrink-0"></div>
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
                style={{ color: "#D4AF37" }}
              >
                Prêt pour votre prochaine aventure ?
              </h3>
              <p className="mb-8 max-w-2xl mx-auto text-lg text-gray-300">
                Découvrez nos emplacements disponibles et réservez votre séjour
                en quelques clics.
              </p>
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white px-8 py-4 rounded-full text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
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
          style={{ backgroundColor: "#292D1C" }}
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
                    style={{ color: "#D4AF37" }}
                  >
                    SelfCamp
                  </span>
                </div>
                <p className="text-gray-400">
                  Le camping du futur, disponible dès aujourd&apos;hui.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4" style={{ color: "#D4AF37" }}>
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
                <h4 className="font-semibold mb-4" style={{ color: "#D4AF37" }}>
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
                      className="text-amber-400 hover:text-amber-300 transition-colors duration-300"
                    >
                      Système de réservation
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
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
