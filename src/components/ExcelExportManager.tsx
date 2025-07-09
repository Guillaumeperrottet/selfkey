"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileSpreadsheet, Calendar } from "lucide-react";
import { toast } from "sonner";

interface ExcelExportManagerProps {
  hotelSlug: string;
}

export default function ExcelExportManager({
  hotelSlug,
}: ExcelExportManagerProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error("Veuillez sélectionner les dates de début et de fin");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("La date de début doit être antérieure à la date de fin");
      return;
    }

    try {
      setIsExporting(true);

      const response = await fetch(
        `/api/admin/${hotelSlug}/export-excel?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'exportation");
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `declaration_taxes_sejour_${hotelSlug}_${startDate}_${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Fichier Excel exporté avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast.error("Erreur lors de l'exportation du fichier Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Dates par défaut : premier jour du mois actuel et aujourd'hui
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Export Excel - Déclaration Taxes de Séjour
        </CardTitle>
        <CardDescription>
          Exportez les données de réservation au format Excel pour la
          déclaration des taxes de séjour à l&apos;état de Fribourg.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date de début
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder={formatDateForInput(firstDayOfMonth)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date de fin
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder={formatDateForInput(today)}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Informations sur l&apos;export
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Le fichier contiendra toutes les réservations entre les dates
              sélectionnées
            </li>
            <li>
              • Format compatible avec les exigences de l&apos;état de Fribourg
            </li>
            <li>
              • Les données incluent les informations client et les détails de
              séjour
            </li>
            <li>
              • Le fichier sera automatiquement téléchargé une fois généré
            </li>
          </ul>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting || !startDate || !endDate}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              Génération en cours...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exporter le fichier Excel
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          Le fichier sera téléchargé au format .xlsx compatible avec Excel et
          LibreOffice
        </div>
      </CardContent>
    </Card>
  );
}
