import { createAuthClient } from "better-auth/client";

// Debug temporaire
console.log("🔧 NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
