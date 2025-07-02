import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUserEstablishments(userId: string) {
  return await prisma.userEstablishment.findMany({
    where: { userId },
    include: {
      establishment: true,
    },
  });
}

export async function hasAccessToEstablishment(
  userId: string,
  hotelSlug: string
) {
  const userEstablishment = await prisma.userEstablishment.findFirst({
    where: {
      userId,
      establishment: {
        slug: hotelSlug,
      },
    },
  });

  return !!userEstablishment;
}

export async function getSessionUser(headers?: Headers) {
  try {
    const session = await auth.api.getSession({
      headers: headers || new Headers(),
    });
    return session?.user || null;
  } catch {
    return null;
  }
}

export async function createEstablishmentForUser(
  userId: string,
  name: string,
  slug: string
) {
  // Créer l'établissement
  const establishment = await prisma.establishment.create({
    data: {
      name,
      slug,
    },
  });

  // Associer l'utilisateur comme propriétaire
  await prisma.userEstablishment.create({
    data: {
      userId,
      establishmentId: establishment.id,
      role: "owner",
    },
  });

  return establishment;
}
