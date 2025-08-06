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
  console.log(
    `🏗️ Début création établissement: ${name} (${slug}) pour utilisateur ${userId}`
  );

  try {
    // Utiliser une transaction pour garantir la cohérence
    const establishment = await prisma.$transaction(async (tx) => {
      console.log(`📝 Création de l'établissement dans la transaction...`);

      // Créer l'établissement avec les frais par défaut
      const newEstablishment = await tx.establishment.create({
        data: {
          name,
          slug,
          commissionRate: parseFloat(
            process.env.PLATFORM_COMMISSION_RATE || "0"
          ),
          fixedFee: parseFloat(process.env.PLATFORM_FIXED_FEE || "3.00"),
        },
      });

      console.log(`✅ Établissement créé avec ID: ${newEstablishment.id}`);
      console.log(`🔗 Création de la relation UserEstablishment...`);

      // Associer l'utilisateur comme propriétaire
      await tx.userEstablishment.create({
        data: {
          userId,
          establishmentId: newEstablishment.id,
          role: "owner",
        },
      });

      console.log(`✅ Relation UserEstablishment créée avec succès`);
      return newEstablishment;
    });

    console.log(
      `🎉 Établissement créé avec succès: ${establishment.name} (${establishment.slug}) pour l'utilisateur ${userId}`
    );
    return establishment;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la création de l'établissement ${name}:`,
      error
    );
    throw error;
  }
}
