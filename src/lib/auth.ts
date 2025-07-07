import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Désactiver temporairement la vérification email
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // Mise à jour toutes les 24h
  },
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    process.env.NEXT_PUBLIC_APP_URL!,
    "https://selfkey.ch",
    "https://www.selfkey.ch",
    "http://localhost:3000", // pour le développement
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: process.env.NODE_ENV === "production" ? ".selfkey.ch" : undefined,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
