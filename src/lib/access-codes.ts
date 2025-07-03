import { prisma } from "@/lib/prisma";

export type AccessCodeType = "room" | "general" | "custom";

export interface AccessCodeInfo {
  type: AccessCodeType;
  code?: string;
  instructions?: string;
  roomSpecificCode?: string;
}

/**
 * Récupère les informations d'accès pour une réservation
 */
export async function getAccessCodeForBooking(
  establishmentSlug: string,
  roomId: string
): Promise<AccessCodeInfo> {
  const establishment = await prisma.establishment.findUnique({
    where: { slug: establishmentSlug },
    include: {
      rooms: {
        where: { id: roomId },
      },
    },
  });

  if (!establishment) {
    throw new Error("Établissement non trouvé");
  }

  const room = establishment.rooms[0];
  if (!room) {
    throw new Error("Chambre non trouvée");
  }

  const accessCodeType = establishment.accessCodeType as AccessCodeType;

  switch (accessCodeType) {
    case "room":
      return {
        type: "room",
        roomSpecificCode: room.accessCode || undefined,
        code: room.accessCode || undefined,
      };

    case "general":
      return {
        type: "general",
        code: establishment.generalAccessCode || undefined,
      };

    case "custom":
      return {
        type: "custom",
        instructions: establishment.accessInstructions || undefined,
      };

    default:
      return {
        type: "room",
        roomSpecificCode: room.accessCode || undefined,
        code: room.accessCode || undefined,
      };
  }
}

/**
 * Met à jour le système de codes d'accès d'un établissement
 */
export async function updateAccessCodeSystem(
  establishmentSlug: string,
  accessCodeType: AccessCodeType,
  options: {
    generalAccessCode?: string;
    accessInstructions?: string;
  }
) {
  return await prisma.establishment.update({
    where: { slug: establishmentSlug },
    data: {
      accessCodeType,
      generalAccessCode: options.generalAccessCode,
      accessInstructions: options.accessInstructions,
    },
  });
}

/**
 * Met à jour le code d'accès d'une chambre spécifique
 */
export async function updateRoomAccessCode(
  roomId: string,
  accessCode: string | null
) {
  return await prisma.room.update({
    where: { id: roomId },
    data: { accessCode },
  });
}

/**
 * Génère le contenu de l'email avec les informations d'accès
 */
export function generateAccessInstructions(accessInfo: AccessCodeInfo): string {
  switch (accessInfo.type) {
    case "room":
      if (accessInfo.code) {
        return `
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d5016; margin-top: 0;">🔑 Accès à votre chambre</h3>
            <p style="font-size: 18px; margin: 10px 0;"><strong>Code d'accès :</strong> 
              <span style="background-color: #fff; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 20px; color: #2d5016; font-weight: bold;">${accessInfo.code}</span>
            </p>
            <p style="color: #2d5016; margin-bottom: 0;">Saisissez ce code sur le pavé numérique de votre chambre pour y accéder.</p>
          </div>
        `;
      } else {
        return `
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">🔑 Accès à votre chambre</h3>
            <p style="color: #856404;">Le code d'accès sera communiqué séparément par l'établissement.</p>
          </div>
        `;
      }

    case "general":
      if (accessInfo.code) {
        return `
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d5016; margin-top: 0;">🔑 Accès à l'établissement</h3>
            <p style="font-size: 18px; margin: 10px 0;"><strong>Code d'accès général :</strong> 
              <span style="background-color: #fff; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 20px; color: #2d5016; font-weight: bold;">${accessInfo.code}</span>
            </p>
            <p style="color: #2d5016; margin-bottom: 0;">Ce code vous donne accès à l'établissement et à votre chambre.</p>
          </div>
        `;
      } else {
        return `
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">🔑 Accès à l'établissement</h3>
            <p style="color: #856404;">Le code d'accès sera communiqué séparément par l'établissement.</p>
          </div>
        `;
      }

    case "custom":
      if (accessInfo.instructions) {
        return `
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1565c0; margin-top: 0;">🔑 Instructions d'accès</h3>
            <div style="color: #1565c0;">
              ${accessInfo.instructions}
            </div>
          </div>
        `;
      } else {
        return `
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">🔑 Accès à votre chambre</h3>
            <p style="color: #856404;">Les instructions d'accès seront communiquées séparément par l'établissement.</p>
          </div>
        `;
      }

    default:
      return `
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">🔑 Accès à votre chambre</h3>
          <p style="color: #856404;">Les informations d'accès seront communiquées par l'établissement.</p>
        </div>
      `;
  }
}
