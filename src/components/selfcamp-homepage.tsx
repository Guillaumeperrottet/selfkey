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

export function SelfcampHomepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="SelfCamp Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-bold text-green-800">SelfCamp</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a
              href="#disponibilites"
              className="text-gray-600 hover:text-green-600"
            >
              Disponibilités
            </a>
            <a href="#services" className="text-gray-600 hover:text-green-600">
              Services
            </a>
            <a href="#contact" className="text-gray-600 hover:text-green-600">
              Contact
            </a>
          </nav>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href={DOMAINS.SELFKEY}>Réserver maintenant</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Votre <span className="text-green-600">camping</span> <br />
            au cœur de la nature
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Découvrez l&apos;expérience unique du camping automatisé. Réservez,
            payez et accédez à votre emplacement 24h/24 grâce à notre système
            révolutionnaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-green-600 hover:bg-green-700"
            >
              <Link href={DOMAINS.SELFKEY}>Réserver votre emplacement</Link>
            </Button>
            <Button size="lg" variant="outline">
              Découvrir nos services
            </Button>
          </div>
        </div>
      </section>

      {/* Disponibilités en temps réel */}
      <section id="disponibilites" className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Disponibilités en temps réel
          </h3>
          <AvailabilityDisplay />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Nos services & équipements
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Tent className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Emplacements spacieux</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Emplacements délimités de 100m² avec accès électrique
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <ShowerHead className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Sanitaires modernes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Douches chaudes, WC et lavabos dans des blocs sanitaires
                  propres
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Car className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Parking sécurisé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Place de parking incluse pour chaque emplacement
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Wifi className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>WiFi gratuit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connexion internet haut débit sur tout le camping
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Coffee className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Espace détente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Coin café et espace commun pour se détendre
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Accès 24h/24</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Système automatisé pour un accès libre à toute heure
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-600">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Prêt pour votre prochaine aventure ?
          </h3>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Réservez votre emplacement en quelques clics et profitez d&apos;une
            expérience camping unique et moderne.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-white text-green-600 hover:bg-gray-100"
          >
            <Link href={DOMAINS.SELFKEY}>Commencer ma réservation</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
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
                <span className="text-xl font-bold">SelfCamp</span>
              </div>
              <p className="text-gray-400">
                Le camping du futur, disponible dès aujourd&apos;hui.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Réservation en ligne</li>
                <li>Accès automatisé</li>
                <li>Paiement sécurisé</li>
                <li>Support 24h/24</li>
              </ul>
            </div>

            <div id="contact">
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Suisse</span>
                </div>
                <div>
                  <a
                    href={DOMAINS.SELFKEY}
                    className="text-green-400 hover:text-green-300"
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
