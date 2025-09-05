"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import {
  Tent,
  Car,
  Wifi,
  ShowerHead,
  Coffee,
  Shield,
  MapPin,
} from "lucide-react";
import { DOMAINS } from "@/lib/domains";
import SearchBar from "@/components/ui/search-bar";
import { useEffect, useRef } from "react";
import {
  animateOnScroll,
  setupCardHoverAnimations,
  pulseAnimation,
  createWaveAnimation,
  typewriterEffect,
  floatingIcons,
  morphButton,
  createParticles,
} from "@/lib/animations";

export function SelfcampHomepage() {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialiser les animations après le montage du composant
    const initializeAnimations = () => {
      // Animation des éléments au scroll
      animateOnScroll(".animate-on-scroll", 0);
      animateOnScroll(".animate-on-scroll-delayed", 200);

      // Animation des cartes au hover
      setupCardHoverAnimations(".service-card");

      // Animation flottante pour les icônes
      floatingIcons(".floating-icon");

      // Animation de pulsation pour les badges
      pulseAnimation(".pulse-badge");

      // Animation de morphing pour les boutons
      morphButton(".morph-button");

      // Animation de fond
      createWaveAnimation();

      // Créer des particules
      createParticles();

      // Effet typewriter pour le titre principal - une seule fois
      const typewriterElement = document.querySelector(".typewriter");
      if (
        typewriterElement &&
        !typewriterElement.getAttribute("data-typewriter-done")
      ) {
        setTimeout(() => {
          typewriterEffect(".typewriter", "au cœur de la nature", 80);
        }, 1500);
      }
    };

    // Effet parallax pour l'image de fond
    const handleScroll = () => {
      if (backgroundRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5; // Vitesse du parallax inversée
        backgroundRef.current.style.transform = `translateY(${rate}px)`;
      }
    };

    // Ajouter l'écouteur de scroll
    window.addEventListener("scroll", handleScroll);

    // Délai pour s'assurer que tous les éléments sont montés
    setTimeout(initializeAnimations, 100);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#212215" }}
    >
      {/* Background Image */}
      <div
        ref={backgroundRef}
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url(/background-selfcamp.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay pour assurer la lisibilité */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Gauche */}
          <div className="text-white/90 text-sm font-medium">
            CAMPING AUTOMATISÉ
          </div>

          {/* Centre */}
          <div className="text-white/90 text-sm font-medium text-center">
            SELFCAMP.CH - EXPÉRIENCE UNIQUE
          </div>

          {/* Droite */}
          <div className="text-white/90 text-sm font-medium">24H/24 - 7J/7</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto text-center">
          {/* Logo principal */}
          <div className="mb-6 animate-on-scroll">
            <Image
              src="/selfcamp_logo.png"
              alt="SelfCamp Logo"
              width={400}
              height={200}
              className="mx-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-14 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2
              className="text-3xl font-bold mb-4 animate-on-scroll"
              style={{ color: "#B8B8B8" }}
            >
              Trouvez votre{" "}
              <span style={{ color: "#B8B8B8" }}>emplacement</span>
            </h2>
            <p
              className="text-lg animate-on-scroll-delayed"
              style={{ color: "#B8B8B8" }}
            >
              Recherchez et découvrez nos emplacements de camping disponibles
            </p>
          </div>
          <SearchBar />
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="py-20 px-4"
        style={{ backgroundColor: "#212215" }}
      >
        <div className="container mx-auto">
          <h3
            className="text-3xl font-bold text-center mb-12 animate-on-scroll"
            style={{ color: "#E85A73" }}
          >
            Nos services & équipements
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center service-card card-vintage animate-on-scroll transition-all duration-300">
              <CardHeader>
                <Tent className="h-12 w-12 text-vintage-teal mx-auto mb-4 floating-icon" />
                <CardTitle style={{ color: "#E85A73" }}>
                  Emplacements spacieux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#B8B8B8" }}>
                  Emplacements délimités de 100m² avec accès électrique
                </p>
              </CardContent>
            </Card>

            <Card className="text-center service-card card-vintage animate-on-scroll transition-all duration-300">
              <CardHeader>
                <ShowerHead className="h-12 w-12 text-vintage-orange mx-auto mb-4 floating-icon" />
                <CardTitle style={{ color: "#E85A73" }}>
                  Sanitaires modernes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#B8B8B8" }}>
                  Douches chaudes, WC et lavabos dans des blocs sanitaires
                  propres
                </p>
              </CardContent>
            </Card>

            <Card className="text-center service-card card-vintage animate-on-scroll transition-all duration-300">
              <CardHeader>
                <Car className="h-12 w-12 text-vintage-yellow mx-auto mb-4 floating-icon" />
                <CardTitle style={{ color: "#E85A73" }}>
                  Parking sécurisé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#B8B8B8" }}>
                  Place de parking incluse pour chaque emplacement
                </p>
              </CardContent>
            </Card>

            <Card className="text-center service-card card-vintage animate-on-scroll transition-all duration-300">
              <CardHeader>
                <Wifi className="h-12 w-12 text-vintage-teal mx-auto mb-4 floating-icon" />
                <CardTitle style={{ color: "#E85A73" }}>WiFi gratuit</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#B8B8B8" }}>
                  Connexion internet haut débit sur tout le camping
                </p>
              </CardContent>
            </Card>

            <Card className="text-center service-card card-vintage animate-on-scroll transition-all duration-300">
              <CardHeader>
                <Coffee className="h-12 w-12 text-vintage-orange mx-auto mb-4 floating-icon" />
                <CardTitle style={{ color: "#E85A73" }}>
                  Espace détente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#B8B8B8" }}>
                  Coin café et espace commun pour se détendre
                </p>
              </CardContent>
            </Card>

            <Card className="text-center service-card card-vintage animate-on-scroll transition-all duration-300">
              <CardHeader>
                <Shield className="h-12 w-12 text-vintage-yellow mx-auto mb-4 floating-icon" />
                <CardTitle style={{ color: "#E85A73" }}>Accès 24h/24</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#B8B8B8" }}>
                  Système automatisé pour un accès libre à toute heure
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 px-4 relative overflow-hidden"
        style={{ backgroundColor: "#212215" }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <h3
            className="text-3xl font-bold mb-6 animate-on-scroll"
            style={{ color: "#E85A73" }}
          >
            Prêt pour votre prochaine aventure ?
          </h3>
          <p
            className="mb-8 max-w-2xl mx-auto animate-on-scroll-delayed"
            style={{ color: "#B8B8B8" }}
          >
            Réservez votre emplacement en quelques clics et profitez d&apos;une
            expérience camping unique et moderne.
          </p>
          <Button
            size="lg"
            asChild
            className="btn-vintage-secondary morph-button transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-on-scroll-delayed"
          >
            <Link href={DOMAINS.SELFKEY}>Commencer ma réservation</Link>
          </Button>
        </div>
        {/* Éléments décoratifs avec palette vintage */}
        <div
          className="absolute top-10 left-10 w-20 h-20 rounded-full blur-xl"
          style={{ background: "rgba(244, 208, 63, 0.2)" }}
        ></div>
        <div
          className="absolute bottom-10 right-10 w-32 h-32 rounded-full blur-xl"
          style={{ background: "rgba(230, 126, 34, 0.15)" }}
        ></div>
      </section>

      {/* Footer */}
      <footer
        className="text-white py-12 px-4"
        style={{ backgroundColor: "#212215" }}
      >
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="animate-on-scroll">
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/logo.png"
                  alt="SelfCamp"
                  width={32}
                  height={32}
                  className="rounded floating-icon"
                />
                <span className="text-xl font-bold text-vintage-yellow">
                  SelfCamp
                </span>
              </div>
              <p className="text-vintage-gray-light">
                Le camping du futur, disponible dès aujourd&apos;hui.
              </p>
            </div>

            <div className="animate-on-scroll-delayed">
              <h4 className="font-semibold mb-4 text-vintage-yellow">
                Services
              </h4>
              <ul className="space-y-2 text-vintage-gray-light">
                <li className="hover:text-vintage-yellow transition-colors duration-300">
                  Réservation en ligne
                </li>
                <li className="hover:text-vintage-yellow transition-colors duration-300">
                  Accès automatisé
                </li>
                <li className="hover:text-vintage-yellow transition-colors duration-300">
                  Paiement sécurisé
                </li>
                <li className="hover:text-vintage-yellow transition-colors duration-300">
                  Support 24h/24
                </li>
              </ul>
            </div>

            <div id="contact" className="animate-on-scroll-delayed">
              <h4 className="font-semibold mb-4 text-vintage-yellow">
                Contact
              </h4>
              <div className="space-y-2 text-vintage-gray-light">
                <div className="flex items-center space-x-2 hover:text-vintage-yellow transition-colors duration-300">
                  <MapPin className="h-4 w-4 floating-icon" />
                  <span>Suisse</span>
                </div>
                <div>
                  <a
                    href={DOMAINS.SELFKEY}
                    className="text-vintage-orange hover:text-vintage-yellow transition-colors duration-300"
                  >
                    Système de réservation
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-vintage-teal mt-8 pt-8 text-center text-vintage-gray-light animate-on-scroll">
            <p>
              &copy; 2025 SelfCamp. Tous droits réservés. Propulsé par SelfKey.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
