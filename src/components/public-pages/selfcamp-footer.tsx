"use client";

import Image from "next/image";
import Link from "next/link";
import { DOMAINS } from "@/lib/domains";
import { useSelfcampTranslation } from "@/hooks/useSelfcampTranslation";

export function SelfcampFooter() {
  const { t } = useSelfcampTranslation();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bg-footer-dark {
          background-color: #3a4d2a;
        }
      `,
        }}
      />
      <footer className="py-8 md:py-12 px-4 md:px-6 bg-footer-dark text-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-[500px_1fr] gap-8 md:gap-16">
            {/* Logo et tagline à gauche */}
            <div className="flex flex-col text-center md:text-left items-center md:items-start">
              <div className="mb-4 md:mb-8">
                <div className="w-[320px] h-[160px] md:w-[400px] md:h-[200px] relative">
                  <Image
                    src="/selfcamp_logo_fribourg.png"
                    alt="SelfCamp Fribourg"
                    fill
                    className="object-contain md:object-left"
                  />
                </div>
              </div>
              <p className="text-white text-center md:text-left font-normal text-sm leading-relaxed max-w-[280px] md:max-w-full">
                La liberté de camper sans contrainte
              </p>
            </div>

            {/* Conteneur pour les 3 colonnes + copyright */}
            <div className="flex flex-col">
              {/* 3 colonnes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mb-8 md:mb-18">
                {/* Contact */}
                <div className="text-center md:text-left">
                  <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base text-white">
                    {t.footer.contact.title}
                  </h4>
                  <div className="space-y-1.5 md:space-y-2 text-gray-300/90 text-xs md:text-sm">
                    <Link
                      href="/contact"
                      className="text-gray-300/90 hover:text-white transition-colors duration-200 block"
                    >
                      {t.footer.contact.location}
                    </Link>
                    <a
                      href="mailto:gp@webbing.ch"
                      className="text-gray-300/90 hover:text-white transition-colors duration-200 block"
                    >
                      gp@webbing.ch
                    </a>
                  </div>
                </div>

                {/* Navigation */}
                <div className="text-center md:text-left">
                  <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base text-white">
                    {t.footer.navigation.title}
                  </h4>
                  <div className="space-y-1.5 md:space-y-2 text-gray-300/90 text-xs md:text-sm">
                    <div>
                      <Link
                        href="/"
                        className="hover:text-white transition-colors duration-200"
                      >
                        {t.footer.navigation.home}
                      </Link>
                    </div>
                    <div>
                      <Link
                        href="/map"
                        className="hover:text-white transition-colors duration-200"
                      >
                        {t.footer.navigation.map}
                      </Link>
                    </div>
                    <div>
                      <Link
                        href="/about"
                        className="hover:text-white transition-colors duration-200"
                      >
                        {t.footer.navigation.about}
                      </Link>
                    </div>

                    <div>
                      <a
                        href={DOMAINS.SELFKEY}
                        className="hover:text-white transition-colors duration-200"
                      >
                        {t.footer.navigation.selfkeySystem}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Informations légales */}
                <div className="text-center md:text-left">
                  <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base text-white">
                    {t.footer.legal.title}
                  </h4>
                  <div className="space-y-1.5 md:space-y-2 text-gray-300/90 text-xs md:text-sm">
                    <div>
                      <Link
                        href="/legal"
                        className="hover:text-white transition-colors duration-200"
                      >
                        {t.footer.legal.terms}
                      </Link>
                    </div>
                    <div>
                      <Link
                        href="/legal"
                        className="hover:text-white transition-colors duration-200"
                      >
                        {t.footer.legal.termsConditions}
                      </Link>
                    </div>
                    <div>
                      <Link
                        href="/privacy"
                        className="hover:text-white transition-colors duration-200"
                      >
                        {t.footer.legal.privacy}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copyright et paiements - sous les colonnes */}
              <div className="pt-4 md:pt-6 border-t border-white/10 text-center">
                <p className="text-[10px] md:text-xs text-gray-300/80 leading-relaxed">
                  {t.footer.copyright}{" "}
                  <a
                    href="https://www.webbing.ch/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300/80 hover:text-white transition-colors duration-200"
                  >
                    {t.footer.developedBy}
                  </a>
                </p>
                <p className="text-[10px] md:text-xs text-gray-400/70 mt-1">
                  {t.footer.payments}
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
