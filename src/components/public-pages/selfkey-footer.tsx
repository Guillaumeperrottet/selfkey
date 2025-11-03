"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

export function SelfkeyFooter() {
  return (
    <>
      <style jsx>{`
        .bg-footer-selfkey {
          background-color: #1a1f2e;
        }
      `}</style>
      <footer className="py-12 px-4 bg-footer-selfkey text-white border-t border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo et description */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <span className="text-xl font-semibold">SelfKey</span>
              </div>
              <p className="text-gray-400 mb-4">
                Solution suisse de check-in automatique 24h/24 pour hôtels,
                campings et parkings.
              </p>
            </div>

            {/* Navigation */}
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-lg text-white">
                Navigation
              </h4>
              <div className="space-y-2 text-gray-400">
                <div>
                  <Link
                    href="/"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Accueil
                  </Link>
                </div>
                <div>
                  <Link
                    href="/contact-selfkey"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Contact
                  </Link>
                </div>
                <div>
                  <Link
                    href="/help"
                    className="hover:text-blue-400 transition-colors"
                  >
                    FAQ
                  </Link>
                </div>
                <div>
                  <Link
                    href="/establishments"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Connexion
                  </Link>
                </div>
              </div>
            </div>

            {/* Ressources & Solutions */}
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-lg text-white">
                Ressources & Solutions
              </h4>
              <div className="space-y-2 text-gray-400">
                <div>
                  <Link
                    href="/api-docs"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Documentation API
                  </Link>
                </div>
                <div>
                  <Link
                    href="/help"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Centre d&apos;aide
                  </Link>
                </div>
                <div>
                  <a
                    href={
                      process.env.NODE_ENV === "production"
                        ? "https://selfcamp.ch"
                        : "http://localhost:3000?app=selfcamp"
                    }
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    Selfcamp.ch
                  </a>
                </div>
              </div>
            </div>

            {/* Contact & Légal */}
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-lg text-white">
                Informations
              </h4>
              <div className="space-y-2 text-gray-400 mb-4">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-blue-400" />
                  <span>Canton de Fribourg, Suisse</span>
                </div>
              </div>
              <div className="space-y-2 text-gray-400">
                <div>
                  <Link
                    href="/legal"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Mentions légales
                  </Link>
                </div>
                <div>
                  <Link
                    href="/privacy"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Confidentialité
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bas du footer */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>
              &copy; 2025 SelfKey. Tous droits réservés. Développé par{" "}
              <a
                href="https://www.webbing.ch/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
              >
                Webbing.ch
              </a>
            </p>
            <p className="mt-2 text-xs">
              Paiements sécurisés par{" "}
              <span className="font-semibold">Stripe</span> • Cartes bancaires
              et TWINT acceptés
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
