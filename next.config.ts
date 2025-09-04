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
  // Configuration pour gérer les domaines multiples et permettre la communication
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

export default nextConfig;
