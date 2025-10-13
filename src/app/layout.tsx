import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import localFont from "next/font/local";

// Neue Montreal pour le corps de texte
const neueMontreal = localFont({
  src: [
    {
      path: "../../public/fonts/NeueMontreal-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueMontreal-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueMontreal-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueMontreal-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
});

// SF Pro Display pour les titres
const sfProDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/SF-Pro-Display-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/SF-Pro-Display-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/SF-Pro-Display-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/SF-Pro-Display-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro-display",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    default: "SelfKey - Check-in automatique pour votre établissement",
    template: "%s | SelfKey",
  },
  description:
    "Solution suisse de check-in automatique 24h/24 pour hôtels, campings, et locations. Paiement sécurisé via Stripe, accès instantané par QR code.",
  keywords: [
    "check-in automatique",
    "hôtel",
    "camping",
    "location saisonnière",
    "QR code",
    "paiement en ligne",
    "Stripe",
    "accès automatique",
    "réservation",
    "Suisse",
    "selfkey",
  ],
  authors: [{ name: "SelfKey" }],
  creator: "SelfKey",
  publisher: "SelfKey",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.selfkey.ch"), // Votre domaine officiel
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_CH",
    url: "https://www.selfkey.ch",
    siteName: "SelfKey",
    title: "SelfKey - Check-in automatique pour votre établissement",
    description:
      "Solution suisse de check-in automatique 24h/24 pour hôtels, campings, et locations. Paiement sécurisé via Stripe, accès instantané par QR code.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "SelfKey - Check-in automatique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SelfKey - Check-in automatique pour votre établissement",
    description:
      "Solution suisse de check-in automatique 24h/24 pour hôtels, campings, et locations.",
    images: ["/logo.png"],
    creator: "@selfkey",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
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
  verification: {
    google: "your-google-verification-code", // À remplacer par votre code Google
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
          href="/icons/icon-16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/icons/icon-96.png"
        />
        <link rel="icon" href="/icons/icon-96.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SelfKey" />
        <meta
          name="google-site-verification"
          content="mXZdvQwL0fl-BE6bB0kbSGBvyd7Tu7KW69tQi-pfbU0"
        />
      </head>
      <body
        className={`${neueMontreal.variable} ${sfProDisplay.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-center"
          closeButton
          richColors
          expand={false}
          duration={4000}
        />
      </body>
    </html>
  );
}
