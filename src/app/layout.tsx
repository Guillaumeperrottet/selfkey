import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import localFont from "next/font/local";

// Manjari pour le texte, navigation, boutons
const manjari = localFont({
  src: [
    {
      path: "../../public/fonts/Manjari-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Manjari-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-manjari",
  display: "swap",
});

// Poppins pour les titres
const poppins = localFont({
  src: [
    {
      path: "../../public/fonts/Poppins-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Poppins-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
  display: "swap",
});

// Configuration viewport séparée (Next.js 14+)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // Important pour iOS safe area
};

export const metadata: Metadata = {
  title: {
    default: "Selfcamp - La liberté de camper sans contrainte",
    template: "%s | Selfcamp",
  },
  description:
    "Découvrez des aires de camping-car officielles ! Accès spontané sans app, ni compte, paiement sécurisé, emplacements de qualité.",
  keywords: [
    "selfcamp",
    "selfcamp suisse",
    "selfcamp.ch",
    "camping-car",
    "aire de camping-car",
    "camping",
    "van life",
    "motorhome",
    "wohnmobil",
    "emplacements camping",
    "camping-car suisse",
    "aire camping-car suisse",
    "réservation camping",
    "Suisse",
    "Fribourg",
  ],
  authors: [{ name: "Selfcamp" }],
  creator: "Selfcamp",
  publisher: "Selfcamp",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.selfcamp.ch"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_CH",
    url: "https://www.selfcamp.ch",
    siteName: "Selfcamp",
    title: "Selfcamp - La liberté de camper sans contrainte",
    description:
      "Découvrez des aires de camping-car et vanlife officielles ! Accès spontané sans app, ni compte, paiement sécurisé, emplacements de qualité.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Selfcamp - Aires de camping-car",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selfcamp - La liberté de camper sans contrainte",
    description:
      "Découvrez des aires de camping-car et vanlife officielles ! Accès spontané sans app, ni compte, paiement sécurisé.",
    images: ["/logo.png"],
    creator: "@selfcamp",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/icons/favicon.ico",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/icons/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/icons/icon-96x96.png"
        />
        <link rel="icon" href="/icons/icon-96x96.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#84994F" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Schema.org pour Google - CRUCIAL pour afficher le logo dans les résultats de recherche */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Selfcamp",
              alternateName: ["self camp", "Self camp Suisse"],
              url: "https://www.selfcamp.ch",
              logo: {
                "@type": "ImageObject",
                url: "https://www.selfcamp.ch/logo.png",
                width: 4500,
                height: 4500,
              },
              image: "https://www.selfcamp.ch/logo.png",
              sameAs: ["https://www.instagram.com/selfcamp_ch/"],
              description:
                "Découvrez des aires de camping-car et vanlife officielles ! Accès spontané sans app, ni compte, paiement sécurisé, emplacements de qualité.",
              slogan: "La liberté de camper sans contrainte",
              founder: {
                "@type": "Person",
                name: "Selfcamp Team",
              },
              foundingDate: "2025",
              areaServed: {
                "@type": "Country",
                name: "Switzerland",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Service",
                availableLanguage: ["French", "German", "English"],
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "CH",
                addressRegion: "Fribourg",
              },
              priceRange: "$$",
              keywords:
                "camping-car, aire de camping-car, motorhome, wohnmobil, camping Suisse, van life, stationnement camping-car",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Selfcamp",
              url: "https://www.selfcamp.ch",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://www.selfcamp.ch/establishments?search={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SelfCamp" />
        <meta
          name="google-site-verification"
          content="S70Q1gnzCl6izZqimNMwfUPcK0y1XLPaXbfikVTtdZ4"
        />
      </head>
      <body className={`${manjari.variable} ${poppins.variable} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          closeButton
          richColors
          expand={false}
          duration={4000}
        />
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
