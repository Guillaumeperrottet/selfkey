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
import { AvailabilityDisplay } from "../components/availability-display";
import { DOMAINS } from "@/lib/domains";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { useEffect } from "react";
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

    // Délai pour s'assurer que tous les éléments sont montés
    setTimeout(initializeAnimations, 100);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <FloatingParticles />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-vintage-gray sticky top-0 z-50 animate-on-scroll">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="SelfCamp Logo"
              width={40}
              height={40}
              className="rounded-lg floating-icon"
            />
            <h1 className="text-2xl font-bold text-vintage-teal">SelfCamp</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a
              href="#disponibilites"
              className="text-vintage-teal hover:text-vintage-yellow transition-colors duration-300"
            >
              Disponibilités
            </a>
            <a
              href="#services"
              className="text-vintage-teal hover:text-vintage-yellow transition-colors duration-300"
            >
              Services
            </a>
            <a
              href="#contact"
              className="text-vintage-teal hover:text-vintage-yellow transition-colors duration-300"
            >
              Contact
            </a>
          </nav>
          <Button
            asChild
            className="btn-vintage-primary morph-button transition-all duration-300 transform hover:scale-105"
          >
            <Link href={DOMAINS.SELFKEY}>Réserver maintenant</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="pulse-badge inline-block mb-6">
            <span className="bg-vintage-yellow text-vintage-teal px-4 py-2 rounded-full text-sm font-medium">
              🏕️ Camping automatisé 2025
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-vintage-black mb-6 animate-on-scroll">
            Votre <span className="text-gradient-vintage-primary">camping</span>{" "}
            <br />
            <span className="text-gradient-vintage-secondary">automatisé</span>
          </h2>
          <p className="text-xl text-vintage-teal mb-8 max-w-2xl mx-auto animate-on-scroll-delayed">
            Découvrez l&apos;expérience unique du camping automatisé. Réservez,
            payez et accédez à votre emplacement 24h/24 grâce à notre système
            révolutionnaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-on-scroll-delayed">
            <Button
              size="lg"
              asChild
              className="btn-vintage-primary morph-button transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Link href={DOMAINS.SELFKEY}>Réserver votre emplacement</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="morph-button transform hover:scale-105 transition-all duration-300 border-vintage-teal hover:border-vintage-yellow hover-vintage-yellow"
            >
              Découvrir nos services
            </Button>
          </div>
        </div>
      </section>

      {/* Disponibilités en temps réel */}
      <section
        id="disponibilites"
        className="py-16 px-4 section-vintage-accent backdrop-blur-sm"
      >
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-vintage-teal mb-12 animate-on-scroll">
            Disponibilités en temps réel
          </h3>
          <div className="animate-on-scroll-delayed">
            <AvailabilityDisplay />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-vintage-teal mb-12 animate-on-scroll">
            Nos services & équipements
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center service-card card-vintage animate-on-scroll transition-all duration-300">
              <CardHeader>
                <Tent className="h-12 w-12 text-vintage-teal mx-auto mb-4 floating-icon" />
                <CardTitle className="text-vintage-black">
                  Emplacements spacieux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-vintage-teal">
                  Emplacements délimités de 100m² avec accès électrique
                </p>
              </CardContent>
            </Card>

            <Card className="text-center service-card card-vintage animate-on-scroll transition-all duration-300">
              <CardHeader>
                <ShowerHead className="h-12 w-12 text-vintage-orange mx-auto mb-4 floating-icon" />
                <CardTitle className="text-vintage-black">
                  Sanitaires modernes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-vintage-teal">
                  Douches chaudes, WC et lavabos dans des blocs sanitaires
                  propres
                </p>
              </CardContent>
            </Card>

            <Card className="text-center service-card card-vintage animate-on-scroll transition-all duration-300">
              <CardHeader>
                <Car className="h-12 w-12 text-vintage-yellow mx-auto mb-4 floating-icon" />
                <CardTitle className="text-vintage-black">
                  Parking sécurisé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-vintage-teal">
                  Place de parking incluse pour chaque emplacement
                </p>
              </CardContent>
            </Card>

            <Card className="text-center service-card card-vintage animate-on-scroll transition-all duration-300">
              <CardHeader>
                <Wifi className="h-12 w-12 text-vintage-teal mx-auto mb-4 floating-icon" />
                <CardTitle className="text-vintage-black">
                  WiFi gratuit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-vintage-teal">
                  Connexion internet haut débit sur tout le camping
                </p>
              </CardContent>
            </Card>

            <Card className="text-center service-card card-vintage animate-on-scroll transition-all duration-300">
              <CardHeader>
                <Coffee className="h-12 w-12 text-vintage-orange mx-auto mb-4 floating-icon" />
                <CardTitle className="text-vintage-black">
                  Espace détente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-vintage-teal">
                  Coin café et espace commun pour se détendre
                </p>
              </CardContent>
            </Card>

            <Card className="text-center service-card card-vintage animate-on-scroll transition-all duration-300">
              <CardHeader>
                <Shield className="h-12 w-12 text-vintage-yellow mx-auto mb-4 floating-icon" />
                <CardTitle className="text-vintage-black">
                  Accès 24h/24
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-vintage-teal">
                  Système automatisé pour un accès libre à toute heure
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-vintage-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <h3 className="text-3xl font-bold text-white mb-6 animate-on-scroll">
            Prêt pour votre prochaine aventure ?
          </h3>
          <p className="text-vintage-gray-light mb-8 max-w-2xl mx-auto animate-on-scroll-delayed">
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
      <footer className="bg-vintage-teal-dark text-white py-12 px-4">
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
