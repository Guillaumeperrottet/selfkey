"use client";

import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageUploaded: (imageHtml: string, url: string) => void;
}

interface UploadedImage {
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  fileName: string;
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      // Pour l'instant, on va créer une URL locale et simuler l'upload
      // En production, cela fera appel à l'API Cloudinary

      return new Promise<UploadedImage>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const imageData: UploadedImage = {
              url: e.target?.result as string,
              width: img.width,
              height: img.height,
              format: file.type.split("/")[1] || "unknown",
              bytes: file.size,
              fileName: file.name,
            };

            setUploadedImages((prev) => [...prev, imageData]);

            // Générer un placeholder lisible pour le template
            const imageHtml = `[IMAGE: ${file.name}]`;

            onImageUploaded(imageHtml, imageData.url);
            resolve(imageData);
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    },
    [onImageUploaded]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setIsUploading(true);

      try {
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter((file) =>
          file.type.startsWith("image/")
        );

        if (imageFiles.length === 0) {
          alert("Veuillez déposer des fichiers image uniquement");
          return;
        }

        for (const file of imageFiles) {
          await uploadFile(file);
        }
      } catch (error) {
        console.error("Erreur upload:", error);
        alert("Erreur lors de l'upload de l'image");
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      setIsUploading(true);
      try {
        for (const file of Array.from(files)) {
          if (file.type.startsWith("image/")) {
            await uploadFile(file);
          }
        }
      } catch (error) {
        console.error("Erreur upload:", error);
        alert("Erreur lors de l'upload de l'image");
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFile]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const insertImage = (imageData: UploadedImage) => {
    const imageHtml = `[IMAGE: ${imageData.fileName}]`;
    onImageUploaded(imageHtml, imageData.url);
  };

  return (
    <div className="space-y-4">
      {/* Zone de drag & drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}

          <div className="text-sm text-gray-600">
            {isUploading ? (
              "Traitement en cours..."
            ) : isDragging ? (
              "Déposez vos images ici"
            ) : (
              <>
                <div>Glissez-déposez vos images ici</div>
                <div className="text-xs text-gray-500 mt-1">ou</div>
              </>
            )}
          </div>

          {!isUploading && (
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("image-upload")?.click()}
                className="text-xs"
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                Choisir des fichiers
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-3">
          Formats acceptés: JPG, PNG, GIF, WebP (max 5MB)
        </div>
      </div>

      {/* Images uploadées */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Images récentes :
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white border rounded cursor-pointer hover:bg-gray-50"
                onClick={() => insertImage(image)}
              >
                <div className="flex items-center space-x-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt="Miniature"
                    className="w-8 h-8 object-cover rounded"
                  />
                  <div className="text-xs">
                    <div className="font-medium">{image.fileName}</div>
                    <div className="text-gray-500">
                      {image.width}×{image.height} •{" "}
                      {formatFileSize(image.bytes)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    insertImage(image);
                  }}
                  className="text-xs"
                >
                  Insérer
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
