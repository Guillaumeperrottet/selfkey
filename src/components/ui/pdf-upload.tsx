"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface PdfUploadProps {
  value: string;
  onChange: (value: string) => void;
  fileName?: string;
  onFileNameChange?: (name: string) => void;
}

export function PdfUpload({
  value,
  onChange,
  fileName,
  onFileNameChange,
}: PdfUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Vérifier le type de fichier
      if (file.type !== "application/pdf") {
        toast.error("Veuillez sélectionner un fichier PDF");
        return;
      }

      // Vérifier la taille (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Le PDF ne doit pas dépasser 100MB");
        return;
      }

      // Avertissement si le fichier est lourd (>20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.warning(
          `Fichier volumineux (${(file.size / 1024 / 1024).toFixed(1)}MB). L'upload peut prendre du temps...`,
          {
            duration: 5000,
          }
        );
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'upload");
        }

        const data = await response.json();
        onChange(data.url);

        // Si pas de nom de fichier défini, utiliser le nom du fichier uploadé
        if (onFileNameChange && !fileName) {
          onFileNameChange(file.name.replace(".pdf", ""));
        }

        toast.success("PDF uploadé avec succès !");
      } catch (error) {
        console.error("Erreur upload:", error);
        toast.error("Erreur lors de l'upload du PDF");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onFileNameChange, fileName]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    disabled: isUploading,
  });

  const handleRemove = () => {
    onChange("");
    if (onFileNameChange) {
      onFileNameChange("");
    }
  };

  if (value) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">
                {fileName || "Document PDF"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Télécharger
                </a>
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-[#84994F] bg-[#84994F]/5"
          : "border-gray-300 hover:border-gray-400"
      } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <Upload className="h-6 w-6 text-gray-600" />
        </div>
        {isUploading ? (
          <p className="text-sm text-gray-600">Upload en cours...</p>
        ) : isDragActive ? (
          <p className="text-sm text-gray-600">Déposez le PDF ici...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-900">
              Glissez-déposez un PDF ici
            </p>
            <p className="text-xs text-gray-500">
              ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF uniquement, max 100MB
            </p>
            <p className="text-xs text-blue-600 mt-2">
              💡 Fichier trop lourd ? Utilisez{" "}
              <a
                href="https://www.ilovepdf.com/fr/compresser_pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-700"
                onClick={(e) => e.stopPropagation()}
              >
                iLovePDF
              </a>{" "}
              pour le compresser
            </p>
          </>
        )}
      </div>
    </div>
  );
}
