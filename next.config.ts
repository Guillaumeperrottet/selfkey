import type { NextConfig } from "next";
import { execSync } from "child_process";
import { withSentryConfig } from "@sentry/nextjs";

// Générer le client Prisma avant le build
if (
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL ||
  process.env.CI
) {
  try {
    console.log("🔄 Generating Prisma Client...");
    execSync("npx prisma generate", { stdio: "inherit" });
    console.log("✅ Prisma Client generated successfully");
  } catch (error) {
    console.error("❌ Prisma generate failed:", error);
    // Ne pas throw l'erreur car elle sera gérée par le script de build
  }
}

const nextConfig: NextConfig = {
  // Configuration pour les images Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Configuration pour gérer les domaines multiples et permettre la communication
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "selfcamp.ch",
          },
        ],
        destination: "https://www.selfcamp.ch/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // Permettre les appels API depuis selfcamp.ch vers selfkey.ch
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              "https://selfcamp.ch, https://www.selfcamp.ch, http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Webpack-specific options
  webpack: {
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
      removeDebugLogging: true,
    },
    // Enables automatic instrumentation of Vercel Cron Monitors
    automaticVercelMonitors: true,
  },
};

// Export the configuration wrapped with Sentry
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
