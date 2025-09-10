import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  // Vérifier l'authentification côté serveur
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  // Convertir les dates en strings pour le composant client
  const userForClient = {
    ...session.user,
    createdAt: session.user.createdAt.toISOString(),
    updatedAt: session.user.updatedAt.toISOString(),
  };

  return <ProfileClient user={userForClient} />;
}
