import { prisma } from "@/lib/prisma";

export async function replaceImagePlaceholders(
  content: string,
  establishmentId: string
): Promise<string> {
  // Récupérer toutes les images de l'établissement
  const images = await prisma.emailImage.findMany({
    where: { establishmentId },
  });

  // Créer une map filename -> URL
  const imageMap = new Map(
    images.map((img) => [img.fileName, img.cloudinaryUrl])
  );

  // Remplacer les placeholders [IMAGE: filename] par les vraies balises img
  return content.replace(/\[IMAGE: ([^\]]+)\]/g, (match, filename) => {
    const imageUrl = imageMap.get(filename);

    if (imageUrl) {
      return `<img src="${imageUrl}" alt="${filename}" style="width: 300px; height: auto; margin: 10px 0; border: 1px solid #ddd;" />`;
    } else {
      // Si l'image n'est pas trouvée, retourner un placeholder informatif
      return `<p style="color: #666; font-style: italic;">[Image non trouvée: ${filename}]</p>`;
    }
  });
}
