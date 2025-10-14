import { prisma } from "@/lib/prisma";

/**
 * Transfert simple d'un établissement vers un autre utilisateur
 * Le Stripe account est réinitialisé pour que le nouveau propriétaire le reconfigure
 */
export async function transferEstablishment(
  establishmentId: string,
  fromUserId: string,
  toUserEmail: string
) {
  try {
    console.log(
      `🔄 Début du transfert de l'établissement ${establishmentId} vers ${toUserEmail}`
    );

    // Vérifier que l'utilisateur actuel est bien propriétaire
    const currentOwnership = await prisma.userEstablishment.findFirst({
      where: {
        establishmentId,
        userId: fromUserId,
        role: "owner",
      },
      include: {
        establishment: true,
      },
    });

    if (!currentOwnership) {
      throw new Error("Vous n'êtes pas propriétaire de cet établissement");
    }

    // Vérifier si l'utilisateur de destination existe
    const targetUser = await prisma.user.findUnique({
      where: { email: toUserEmail },
    });

    if (!targetUser) {
      throw new Error(
        "L'utilisateur destinataire n'existe pas. Il doit d'abord créer un compte."
      );
    }

    // Vérifier que l'utilisateur de destination n'a pas déjà accès
    const existingAccess = await prisma.userEstablishment.findFirst({
      where: {
        establishmentId,
        userId: targetUser.id,
      },
    });

    if (existingAccess) {
      throw new Error("L'utilisateur a déjà accès à cet établissement");
    }

    // Transaction pour effectuer le transfert
    await prisma.$transaction(async (tx) => {
      // 1. Supprimer l'ancien propriétaire
      await tx.userEstablishment.deleteMany({
        where: {
          establishmentId,
          userId: fromUserId,
        },
      });

      // 2. Ajouter le nouveau propriétaire
      await tx.userEstablishment.create({
        data: {
          establishmentId,
          userId: targetUser.id,
          role: "owner",
        },
      });

      // 3. Enregistrer l'historique du transfert
      await tx.establishmentTransfer.create({
        data: {
          establishmentId,
          fromUserId,
          toUserEmail,
          toUserId: targetUser.id,
        },
      });

      // 4. Réinitialiser le Stripe account pour que le nouveau propriétaire le reconfigure
      if (currentOwnership.establishment.stripeAccountId) {
        await tx.establishment.update({
          where: { id: establishmentId },
          data: {
            stripeAccountId: null,
            stripeOnboarded: false,
          },
        });

        // Note: On garde l'ancien compte Stripe en vie mais on le déconnecte
        // Le nouveau propriétaire devra créer son propre compte Stripe
      }
    });

    console.log(`✅ Transfert réussi vers ${toUserEmail}`);

    return {
      success: true,
      message: `Établissement transféré avec succès vers ${toUserEmail}`,
      targetUserEmail: toUserEmail,
    };
  } catch (error) {
    console.error("❌ Erreur lors du transfert:", error);
    throw error;
  }
}

/**
 * Récupérer l'historique des transferts d'un établissement
 */
export async function getEstablishmentTransferHistory(establishmentId: string) {
  return await prisma.establishmentTransfer.findMany({
    where: { establishmentId },
    include: {
      fromUser: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      transferredAt: "desc",
    },
  });
}
