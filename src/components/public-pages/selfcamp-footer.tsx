"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { DOMAINS } from "@/lib/domains";
import { useSelfcampTranslation } from "@/hooks/useSelfcampTranslation";

export function SelfcampFooter() {
  const { t } = useSelfcampTranslation();

  return (
    <>
      <style jsx>{`
        .bg-footer-dark {
          background-color: #2d3d1f;
        }
      `}</style>
      <footer className="py-12 px-4 bg-footer-dark text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
              <p className="text-gray-400 mb-4">{t.footer.description}</p>
            </div>

            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-lg text-white">
                {t.footer.contact.title}
              </h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-[#84994F]" />
                  <span>{t.footer.contact.location}</span>
                </div>
                <div>
                  <a
                    href="mailto:perrottet.guillaume.97@gmail.com"
                    className="text-[#84994F] hover:text-[#6d7d3f] transition-colors duration-300"
                  >
                    perrottet.guillaume.97@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-lg text-white">
                {t.footer.navigation.title}
              </h4>
              <div className="space-y-2 text-gray-400">
                <div>
                  <Link
                    href="/"
                    className="hover:text-[#84994F] transition-colors"
                  >
                    {t.footer.navigation.home}
                  </Link>
                </div>
                <div>
                  <Link
                    href="/map"
                    className="hover:text-[#84994F] transition-colors"
                  >
                    {t.footer.navigation.map}
                  </Link>
                </div>
                <div>
                  <Link
                    href="/about"
                    className="hover:text-[#84994F] transition-colors"
                  >
                    {t.footer.navigation.about}
                  </Link>
                </div>
                <div>
                  <Link
                    href="/contact"
                    className="hover:text-[#84994F] transition-colors"
                  >
                    {t.footer.navigation.contact}
                  </Link>
                </div>
                <div>
                  <a
                    href={DOMAINS.SELFKEY}
                    className="text-[#84994F] hover:text-[#6d7d3f] transition-colors duration-300"
                  >
                    {t.footer.navigation.selfkeySystem}
                  </a>
                </div>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-lg text-white">
                {t.footer.legal.title}
              </h4>
              <div className="space-y-2 text-gray-400">
                <div>
                  <Link
                    href="/legal"
                    className="hover:text-[#84994F] transition-colors"
                  >
                    {t.footer.legal.terms}
                  </Link>
                </div>
                <div>
                  <Link
                    href="/legal"
                    className="hover:text-[#84994F] transition-colors"
                  >
                    {t.footer.legal.termsConditions}
                  </Link>
                </div>
                <div>
                  <Link
                    href="/privacy"
                    className="hover:text-[#84994F] transition-colors"
                  >
                    {t.footer.legal.privacy}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>
              {t.footer.copyright}{" "}
              <a
                href="https://www.webbing.ch/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#84994F] hover:text-[#6d7d3f] transition-colors duration-300"
              >
                {t.footer.developedBy}
              </a>
            </p>
            <p className="mt-2 text-xs">{t.footer.payments}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
