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
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);

  useEffect(() => {
    let lastScrollY = 0;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = currentScrollY - lastScrollY;

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

        {/* Animated Wave Separator with Bounce and CSS Animation */}
        <div
          className="wave-container relative w-full overflow-hidden"
          style={{ height: "200px" }}
        >
          <svg
            viewBox="0 0 1000 200"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            style={{
              transform: isScrolling
                ? "translateY(0)"
                : `translateY(${Math.sin(Date.now() * 0.005) * 2}px) scale(${1 + bounceEffect * 0.001})`,
              filter: isScrolling
                ? "none"
                : "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              transition: isScrolling
                ? "transform 0.3s ease-out"
                : "transform 0.3s ease-bounce",
            }}
          >
            <path
              d="M0,200 L0.0,100.0 C 6.3,101.2 18.8,103.7 25.0,104.9 C 31.3,106.1 43.8,108.4 50.0,109.6 C 56.3,110.6 68.8,112.6 75.0,113.6 C 81.3,114.4 93.8,116.0 100.0,116.8 C 106.3,117.3 118.8,118.5 125.0,119.0 C 131.3,119.2 143.8,119.7 150.0,119.9 C 156.3,119.9 168.8,119.8 175.0,119.7 C 181.3,119.3 193.8,118.6 200.0,118.2 C 206.3,117.5 218.8,116.3 225.0,115.6 C 231.3,114.7 243.8,112.9 250.0,112.0 C 256.3,110.9 268.8,108.7 275.0,107.6 C 281.3,106.4 293.8,104.0 300.0,102.8 C 306.3,101.5 318.8,99.0 325.0,97.8 C 331.3,96.6 343.8,94.2 350.0,93.0 C 356.3,91.9 368.8,89.7 375.0,88.6 C 381.3,87.7 393.8,85.8 400.0,84.9 C 406.3,84.2 418.8,82.8 425.0,82.1 C 431.3,81.7 443.8,80.8 450.0,80.4 C 456.3,80.3 468.8,80.1 475.0,80.0 C 481.3,80.2 493.8,80.6 500.0,80.8 C 506.3,81.3 518.8,82.3 525.0,82.8 C 531.3,83.6 543.8,85.1 550.0,85.9 C 556.3,86.9 568.8,88.8 575.0,89.8 C 581.3,91.0 593.8,93.3 600.0,94.4 C 606.3,95.6 618.8,98.1 625.0,99.3 C 631.3,100.5 643.8,103.0 650.0,104.3 C 656.3,105.5 668.8,107.8 675.0,109.0 C 681.3,110.0 693.8,112.1 700.0,113.1 C 706.3,113.9 718.8,115.7 725.0,116.5 C 731.3,117.1 743.8,118.2 750.0,118.8 C 756.3,119.1 768.8,119.6 775.0,119.9 C 781.3,119.9 793.8,119.8 800.0,119.8 C 806.3,119.5 818.8,118.8 825.0,118.5 C 831.3,117.9 843.8,116.6 850.0,116.0 C 856.3,115.1 868.8,113.4 875.0,112.5 C 881.3,111.4 893.8,109.3 900.0,108.2 C 906.3,107.0 918.8,104.7 925.0,103.5 C 931.3,102.3 943.8,99.8 950.0,98.5 C 956.3,97.3 968.8,94.8 975.0,93.6 C 981.3,92.5 993.8,90.2 1000.0,89.1 C 1006.3,88.1 1018.8,86.3 1025.0,85.3 L1000.0,200.0 L0,200.0Z"
              fill="#292d1c"
            >
              <animate
                attributeName="d"
                dur="9.0s"
                repeatCount="indefinite"
                values="M0,200 L0.0,100.0 C 6.3,101.2 18.8,103.7 25.0,104.9 C 31.3,106.1 43.8,108.4 50.0,109.6 C 56.3,110.6 68.8,112.6 75.0,113.6 C 81.3,114.4 93.8,116.0 100.0,116.8 C 106.3,117.3 118.8,118.5 125.0,119.0 C 131.3,119.2 143.8,119.7 150.0,119.9 C 156.3,119.9 168.8,119.8 175.0,119.7 C 181.3,119.3 193.8,118.6 200.0,118.2 C 206.3,117.5 218.8,116.3 225.0,115.6 C 231.3,114.7 243.8,112.9 250.0,112.0 C 256.3,110.9 268.8,108.7 275.0,107.6 C 281.3,106.4 293.8,104.0 300.0,102.8 C 306.3,101.5 318.8,99.0 325.0,97.8 C 331.3,96.6 343.8,94.2 350.0,93.0 C 356.3,91.9 368.8,89.7 375.0,88.6 C 381.3,87.7 393.8,85.8 400.0,84.9 C 406.3,84.2 418.8,82.8 425.0,82.1 C 431.3,81.7 443.8,80.8 450.0,80.4 C 456.3,80.3 468.8,80.1 475.0,80.0 C 481.3,80.2 493.8,80.6 500.0,80.8 C 506.3,81.3 518.8,82.3 525.0,82.8 C 531.3,83.6 543.8,85.1 550.0,85.9 C 556.3,86.9 568.8,88.8 575.0,89.8 C 581.3,91.0 593.8,93.3 600.0,94.4 C 606.3,95.6 618.8,98.1 625.0,99.3 C 631.3,100.5 643.8,103.0 650.0,104.3 C 656.3,105.5 668.8,107.8 675.0,109.0 C 681.3,110.0 693.8,112.1 700.0,113.1 C 706.3,113.9 718.8,115.7 725.0,116.5 C 731.3,117.1 743.8,118.2 750.0,118.8 C 756.3,119.1 768.8,119.6 775.0,119.9 C 781.3,119.9 793.8,119.8 800.0,119.8 C 806.3,119.5 818.8,118.8 825.0,118.5 C 831.3,117.9 843.8,116.6 850.0,116.0 C 856.3,115.1 868.8,113.4 875.0,112.5 C 881.3,111.4 893.8,109.3 900.0,108.2 C 906.3,107.0 918.8,104.7 925.0,103.5 C 931.3,102.3 943.8,99.8 950.0,98.5 C 956.3,97.3 968.8,94.8 975.0,93.6 C 981.3,92.5 993.8,90.2 1000.0,89.1 C 1006.3,88.1 1018.8,86.3 1025.0,85.3 L1000.0,200.0 L0,200.0Z;
       M0,200 L0.0,100.0 C 6.3,98.8 18.8,96.3 25.0,95.1 C 31.3,93.9 43.8,91.6 50.0,90.4 C 56.3,89.4 68.8,87.4 75.0,86.4 C 81.3,85.6 93.8,84.0 100.0,83.2 C 106.3,82.7 118.8,81.5 125.0,81.0 C 131.3,80.8 143.8,80.3 150.0,80.1 C 156.3,80.1 168.8,80.3 175.0,80.3 C 181.3,80.7 193.8,81.4 200.0,81.8 C 206.3,82.5 218.8,83.8 225.0,84.4 C 231.3,85.3 243.8,87.1 250.0,88.0 C 256.3,89.1 268.8,91.3 275.0,92.4 C 281.3,93.6 293.8,96.0 300.0,97.2 C 306.3,98.5 318.8,101.0 325.0,102.2 C 331.3,103.4 343.8,105.8 350.0,107.0 C 356.3,108.1 368.8,110.3 375.0,111.4 C 381.3,112.3 393.8,114.2 400.0,115.1 C 406.3,115.8 418.8,117.2 425.0,117.9 C 431.3,118.3 443.8,119.2 450.0,119.6 C 456.3,119.7 468.8,119.9 475.0,120.0 C 481.3,119.8 493.8,119.4 500.0,119.2 C 506.3,118.7 518.8,117.7 525.0,117.2 C 531.3,116.4 543.8,114.9 550.0,114.1 C 556.3,113.1 568.8,111.2 575.0,110.2 C 581.3,109.0 593.8,106.8 600.0,105.6 C 606.3,104.4 618.8,101.9 625.0,100.7 C 631.3,99.5 643.8,97.0 650.0,95.7 C 656.3,94.5 668.8,92.2 675.0,91.0 C 681.3,90.0 693.8,87.9 700.0,86.9 C 706.3,86.1 718.8,84.3 725.0,83.5 C 731.3,82.9 743.8,81.8 750.0,81.2 C 756.3,80.9 768.8,80.4 775.0,80.1 C 781.3,80.1 793.8,80.2 800.0,80.2 C 806.3,80.5 818.8,81.2 825.0,81.5 C 831.3,82.1 843.8,83.4 850.0,84.0 C 856.3,84.9 868.8,86.6 875.0,87.5 C 881.3,88.6 893.8,90.7 900.0,91.8 C 906.3,93.0 918.8,95.3 925.0,96.5 C 931.3,97.8 943.8,100.3 950.0,101.5 C 956.3,102.7 968.8,105.2 975.0,106.4 C 981.3,107.5 993.8,109.8 1000.0,110.9 C 1006.3,111.9 1018.8,113.8 1025.0,114.7 L1000.0,200.0 L0,200.0Z;
       M0,200 L0.0,100.0 C 6.3,101.2 18.8,103.7 25.0,104.9 C 31.3,106.1 43.8,108.4 50.0,109.6 C 56.3,110.6 68.8,112.6 75.0,113.6 C 81.3,114.4 93.8,116.0 100.0,116.8 C 106.3,117.3 118.8,118.5 125.0,119.0 C 131.3,119.2 143.8,119.7 150.0,119.9 C 156.3,119.9 168.8,119.8 175.0,119.7 C 181.3,119.3 193.8,118.6 200.0,118.2 C 206.3,117.5 218.8,116.3 225.0,115.6 C 231.3,114.7 243.8,112.9 250.0,112.0 C 256.3,110.9 268.8,108.7 275.0,107.6 C 281.3,106.4 293.8,104.0 300.0,102.8 C 306.3,101.5 318.8,99.0 325.0,97.8 C 331.3,96.6 343.8,94.2 350.0,93.0 C 356.3,91.9 368.8,89.7 375.0,88.6 C 381.3,87.7 393.8,85.8 400.0,84.9 C 406.3,84.2 418.8,82.8 425.0,82.1 C 431.3,81.7 443.8,80.8 450.0,80.4 C 456.3,80.3 468.8,80.1 475.0,80.0 C 481.3,80.2 493.8,80.6 500.0,80.8 C 506.3,81.3 518.8,82.3 525.0,82.8 C 531.3,83.6 543.8,85.1 550.0,85.9 C 556.3,86.9 568.8,88.8 575.0,89.8 C 581.3,91.0 593.8,93.3 600.0,94.4 C 606.3,95.6 618.8,98.1 625.0,99.3 C 631.3,100.5 643.8,103.0 650.0,104.3 C 656.3,105.5 668.8,107.8 675.0,109.0 C 681.3,110.0 693.8,112.1 700.0,113.1 C 706.3,113.9 718.8,115.7 725.0,116.5 C 731.3,117.1 743.8,118.2 750.0,118.8 C 756.3,119.1 768.8,119.6 775.0,119.9 C 781.3,119.9 793.8,119.8 800.0,119.8 C 806.3,119.5 818.8,118.8 825.0,118.5 C 831.3,117.9 843.8,116.6 850.0,116.0 C 856.3,115.1 868.8,113.4 875.0,112.5 C 881.3,111.4 893.8,109.3 900.0,108.2 C 906.3,107.0 918.8,104.7 925.0,103.5 C 931.3,102.3 943.8,99.8 950.0,98.5 C 956.3,97.3 968.8,94.8 975.0,93.6 C 981.3,92.5 993.8,90.2 1000.0,89.1 C 1006.3,88.1 1018.8,86.3 1025.0,85.3 L1000.0,200.0 L0,200.0Z"
              />
            </path>
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
