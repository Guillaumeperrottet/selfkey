import type { NextConfig } from "next";
import { execSync } from "child_process";

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
  // Configuration pour gérer les domaines multiples
  async headers() {
    return [
      {
        // Permettre les appels API entre selfcamp.ch et selfkey.ch
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://selfcamp.ch",
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
  // Gérer les rewrites pour les différents domaines
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/:path*",
        has: [
          {
            type: "host",
            value: "selfcamp.ch",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
