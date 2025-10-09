import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Le fichier doit être un PDF" },
        { status: 400 }
      );
    }

    // Vérifier la taille (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Le fichier ne peut pas dépasser 100MB" },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer pour Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nettoyer le nom du fichier pour le public_id
    // Cloudinary n'accepte que : lettres, chiffres, tirets, underscores
    const cleanFileName = file.name
      .replace(".pdf", "")
      .replace(/[^a-zA-Z0-9_-]/g, "_") // Remplacer tous les caractères spéciaux par _
      .replace(/_+/g, "_") // Remplacer les underscores multiples par un seul
      .replace(/^_|_$/g, ""); // Retirer les underscores au début et à la fin

    // Upload vers Cloudinary
    // Note: Les PDFs doivent être uploadés comme des images, pas comme raw
    // Référence: https://cloudinary.com/blog/uploading_managing_and_delivering_pdfs
    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image", // PDFs sont traités comme des images sur Cloudinary
              folder: "selfkey/documents",
              public_id: `${Date.now()}_${cleanFileName}`,
              format: "pdf", // Spécifier le format PDF
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

    return NextResponse.json({
      message: "Upload réussi",
      url: uploadResult.secure_url, // URL normale, le flag sera ajouté côté client
      publicId: uploadResult.public_id,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Erreur upload PDF:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du PDF" },
      { status: 500 }
    );
  }
}
