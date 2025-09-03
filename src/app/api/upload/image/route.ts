import { NextRequest, NextResponse } from "next/server";
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Debug: vérifier la configuration Cloudinary
console.log("Configuration Cloudinary:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✓" : "✗",
  api_key: process.env.CLOUDINARY_API_KEY ? "✓" : "✗",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✓" : "✗",
});

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le fichier et l'établissement depuis FormData
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const establishmentSlug = formData.get("establishment") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    if (!establishmentSlug) {
      return NextResponse.json(
        { error: "Établissement requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { slug: establishmentSlug },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

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

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "L'image ne peut pas dépasser 5MB" },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload vers Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "selfkey-email-templates", // Organiser dans un dossier
              transformation: [
                { width: 800, height: 600, crop: "limit" }, // Limiter la taille
                { quality: "auto:good" }, // Optimisation automatique
              ],
            },
            (
              error: UploadApiErrorResponse | undefined,
              result: UploadApiResponse | undefined
            ) => {
              if (error) reject(error);
              else if (result) resolve(result);
              else reject(new Error("Upload failed"));
            }
          )
          .end(buffer);
      }
    );

    // Stocker les informations de l'image en base de données
    const emailImage = await prisma.emailImage.create({
      data: {
        fileName: file.name,
        originalName: file.name,
        cloudinaryUrl: uploadResult.secure_url,
        cloudinaryId: uploadResult.public_id,
        establishmentId: establishment.id,
      },
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      public_id: uploadResult.public_id,
      fileName: emailImage.fileName,
    });
  } catch (error) {
    console.error("Erreur upload image:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload de l'image" },
      { status: 500 }
    );
  }
}
