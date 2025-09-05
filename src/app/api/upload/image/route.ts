import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { prisma } from "@/lib/prisma";

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Support pour les deux noms de champ : "image" (ImageUploader) et "file" (image-upload)
    const file = (formData.get("image") || formData.get("file")) as File;
    const establishmentSlug = formData.get("establishment") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image" },
        { status: 400 }
      );
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Le fichier ne peut pas dépasser 5MB" },
        { status: 400 }
      );
    }

    // Si un establishment est fourni, vérifier qu'il existe
    let establishmentId: string | undefined;
    if (establishmentSlug) {
      const establishment = await prisma.establishment.findUnique({
        where: { slug: establishmentSlug },
        select: { id: true },
      });

      if (!establishment) {
        return NextResponse.json(
          { error: "Établissement non trouvé" },
          { status: 404 }
        );
      }

      establishmentId = establishment.id;
    }

    // Convertir le fichier en buffer pour Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload vers Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "selfkey/email_images",
              public_id: `${Date.now()}_${file.name.split(".")[0]}`,
            },
            (error, result) => {
              if (error) reject(error);
              else if (result) resolve(result);
              else reject(new Error("Upload failed"));
            }
          )
          .end(buffer);
      }
    );

    // Sauvegarder les informations de l'image en base de données si un establishment est fourni
    if (establishmentId) {
      await prisma.emailImage.create({
        data: {
          fileName: uploadResult.public_id,
          originalName: file.name,
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryId: uploadResult.public_id,
          establishmentId: establishmentId,
        },
      });
    }

    return NextResponse.json({
      message: "Upload réussi",
      url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      fileName: file.name,
      cloudinaryId: uploadResult.public_id,
    });
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
