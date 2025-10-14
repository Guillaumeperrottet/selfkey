import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Sera configurable dans le profil
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe - SelfKey",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
            <p>Bonjour ${user.name || user.email},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe sur SelfKey.</p>
            <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
            <a href="${url}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Réinitialiser mon mot de passe</a>
            <p>Ce lien expirera dans 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #666; font-size: 12px;">SelfKey - Plateforme de gestion hôtelière</p>
          </div>
        `,
      });
    },
    onPasswordReset: async ({
      user,
    }: {
      user: { email: string; id: string; name?: string };
    }) => {
      console.log(
        `🔒 Mot de passe réinitialisé pour l'utilisateur ${user.email}`
      );
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Vérifiez votre adresse email - SelfKey",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Vérification de votre adresse email</h2>
            <p>Bonjour ${user.name || user.email},</p>
            <p>Merci de vous être inscrit sur SelfKey !</p>
            <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
            <a href="${url}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Vérifier mon email</a>
            <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #666; font-size: 12px;">SelfKey - Plateforme de gestion hôtelière</p>
          </div>
        `,
      });
    },
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
