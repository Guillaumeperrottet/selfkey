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
  /* config options here */
};

export default nextConfig;
