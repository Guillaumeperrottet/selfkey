import { cookies } from "next/headers";

export async function isSuperAdmin() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("super-admin-session");

    if (!adminSession || adminSession.value !== "authenticated") {
      return { valid: false, message: "Session non authentifiée" };
    }

    return { valid: true, message: "Session valide" };
  } catch (error) {
    console.error("Erreur lors de la vérification de session:", error);
    return { valid: false, message: "Erreur de vérification" };
  }
}
