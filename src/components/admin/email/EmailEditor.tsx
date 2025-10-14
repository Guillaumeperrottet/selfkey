"use client";

import React, { useRef, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Save,
  RotateCcw,
  Code,
  Palette,
  Sparkles,
  Send,
} from "lucide-react";
import { EditorRef } from "react-email-editor";
import { getDefaultTemplate, TemplateType } from "@/lib/unlayer-templates";
import { toastUtils } from "@/lib/toast-utils";

// Import dynamique pour éviter les problèmes SSR
const EmailEditorComponent = dynamic(() => import("react-email-editor"), {
  ssr: false,
});

// Types pour l'éditeur Unlayer
interface UnlayerEditor {
  setMergeTags: (tags: Record<string, unknown>) => void;
  loadDesign: (design: unknown) => void;
  exportHtml: (
    callback: (data: { design: UnlayerDesign; html: string }) => void
  ) => void;
}

// Types pour Unlayer
interface UnlayerDesign {
  counters?: Record<string, number>;
  body?: {
    id?: string;
    rows?: Array<unknown>;
    headers?: Array<unknown>;
    footers?: Array<unknown>;
    values?: Record<string, unknown>;
  };
}

interface EmailEditorProps {
  initialDesign?: UnlayerDesign;
  initialHtml?: string;
  onSave: (design: UnlayerDesign, html: string) => void | Promise<void>;
  mergeTags?: Record<string, { name: string; value?: string }>;
  title?: string;
  description?: string;
  templateType?: TemplateType; // Type de template pour charger les défauts
  // Props pour le test email
  testEmail?: string;
  onTestEmailChange?: (email: string) => void;
  onTestEmailSend?: () => void;
  isTestLoading?: boolean;
}

const defaultMergeTags = {
  clientFirstName: {
    name: "Prénom du client",
    value: "John",
  },
  clientLastName: {
    name: "Nom du client",
    value: "Doe",
  },
  establishmentName: {
    name: "Nom de l'établissement",
    value: "Mon Hôtel",
  },
  roomName: {
    name: "Nom de la chambre",
    value: "Chambre Deluxe",
  },
  checkInDate: {
    name: "Date d'arrivée",
    value: "15 juillet 2025",
  },
  checkOutDate: {
    name: "Date de départ",
    value: "17 juillet 2025",
  },
  accessCode: {
    name: "Code d'accès",
    value: "1234",
  },
  hotelContactEmail: {
    name: "Email de contact",
    value: "contact@hotel.ch",
  },
  hotelContactPhone: {
    name: "Téléphone de contact",
    value: "+41 XX XXX XX XX",
  },
  bookingNumber: {
    name: "Numéro de réservation",
    value: "DEMO-12345-2025",
  },
  totalAmount: {
    name: "Montant total payé",
    value: "150.00",
  },
  currency: {
    name: "Devise",
    value: "CHF",
  },
  invoiceDownloadUrl: {
    name: "Lien de téléchargement de facture",
    value: "https://exemple.com/invoice/download",
  },
};

export function EmailEditor({
  initialDesign,
  initialHtml,
  onSave,
  mergeTags = defaultMergeTags,
  title = "Éditeur d'email",
  description = "Créez votre template d'email avec l'éditeur visuel",
  templateType,
  testEmail,
  onTestEmailChange,
  onTestEmailSend,
  isTestLoading,
}: EmailEditorProps) {
  const emailEditorRef = useRef<EditorRef>(null);
  const [isLoading, setSaveLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const onReady = useCallback(
    (unlayer: unknown) => {
      const editor = unlayer as UnlayerEditor;

      // Configuration des merge tags
      if (editor && editor.setMergeTags) {
        editor.setMergeTags(mergeTags);
      }

      // Chargement du design initial s'il existe
      if (initialDesign && editor && editor.loadDesign) {
        editor.loadDesign(initialDesign);
      } else if (initialHtml) {
        // Si on a seulement du HTML, on peut essayer de le convertir
        // Pour l'instant, on laisse l'éditeur vide et on ajoutera la conversion plus tard
      } else if (editor && editor.loadDesign) {
        // Charger le template par défaut si aucun design n'est fourni
        const defaultTemplate = getDefaultTemplate(templateType || "general");
        editor.loadDesign(defaultTemplate);
      }
    },
    [initialDesign, initialHtml, mergeTags, templateType]
  );

  const handleSave = useCallback(async () => {
    const editor = emailEditorRef.current?.editor;
    if (!editor || !editor.exportHtml) return;

    setSaveLoading(true);

    editor.exportHtml(async (data: { design: UnlayerDesign; html: string }) => {
      const { design, html } = data;
      try {
        await onSave(design, html);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
      } finally {
        setSaveLoading(false);
      }
    });
  }, [onSave]);

  const handlePreview = useCallback(() => {
    const editor = emailEditorRef.current?.editor;
    if (!editor || !editor.exportHtml) return;

    editor.exportHtml((data: { html: string }) => {
      const { html } = data;
      // Ouvrir dans une nouvelle fenêtre pour prévisualisation
      const previewWindow = window.open("", "_blank");
      if (previewWindow) {
        previewWindow.document.write(html);
        previewWindow.document.close();
      }
    });
  }, []);

  const handleReset = useCallback(() => {
    const editor = emailEditorRef.current?.editor;
    if (!editor || !editor.loadDesign) return;

    // Recharger le template par défaut
    const defaultTemplate = getDefaultTemplate(templateType || "general");
    editor.loadDesign(defaultTemplate);
    toastUtils.success("Éditeur réinitialisé avec le template par défaut");
  }, [templateType]);

  const handleLoadDefaultTemplate = useCallback(() => {
    if (!templateType) return;

    const editor = emailEditorRef.current?.editor;
    if (!editor) return;

    const defaultTemplate = getDefaultTemplate(templateType);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.loadDesign(defaultTemplate as any);
    toastUtils.success("Template par défaut chargé avec succès !");
  }, [templateType]);

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Card className="mb-4 flex-shrink-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {title}
              </CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </Button>
              {templateType && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadDefaultTemplate}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Template par défaut
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              <Button onClick={handleSave} disabled={isLoading} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </div>

          {/* Section de test email */}
          {onTestEmailSend && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <label className="text-sm font-medium text-muted-foreground min-w-fit">
                Test email :
              </label>
              <Input
                placeholder="votre-email@exemple.com"
                value={testEmail || ""}
                onChange={(e) => onTestEmailChange?.(e.target.value)}
                className="flex-1 max-w-md"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onTestEmailSend}
                disabled={isTestLoading || !testEmail}
              >
                <Send className="h-4 w-4 mr-2" />
                {isTestLoading ? "Envoi..." : "Tester"}
              </Button>
            </div>
          )}

          {lastSaved && (
            <Alert>
              <AlertDescription>
                Dernière sauvegarde : {lastSaved.toLocaleString("fr-FR")}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="editor" className="w-full px-6 pb-6 flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Éditeur Visuel</TabsTrigger>
          <TabsTrigger value="variables">Variables Disponibles</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-4">
          <div className="w-full h-[900px]">
            <EmailEditorComponent
              ref={emailEditorRef}
              onReady={onReady}
              minHeight="900px"
              options={{
                displayMode: "email",
                locale: "fr-FR",
                appearance: {
                  theme: "light",
                  panels: {
                    tools: {
                      dock: "left",
                    },
                  },
                },
                mergeTags,
                features: {
                  preview: true,
                  imageEditor: true,
                  undoRedo: true,
                  stockImages: false, // Désactivé pour éviter les coûts
                  colorPicker: {
                    presets: [
                      "#ffffff", // Blanc
                      "#f8f9fa", // Gris très clair
                      "#e9ecef", // Gris clair
                      "#dee2e6", // Gris
                      "#1f2937", // Gris foncé
                      "#374151",
                      "#3b82f6", // Bleu
                      "#1d4ed8",
                      "#059669", // Vert
                      "#047857",
                      "#dc2626", // Rouge
                      "#b91c1c",
                      "#f59e0b", // Orange
                      "#d97706",
                    ],
                  },
                },
                tools: {
                  button: { enabled: true },
                  text: { enabled: true },
                  image: { enabled: true },
                  divider: { enabled: true },
                  html: { enabled: true },
                  social: { enabled: true },
                  menu: { enabled: true },
                  heading: { enabled: true },
                  video: { enabled: false }, // Désactivé pour les emails
                  timer: { enabled: false }, // Désactivé pour simplifier
                },
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="variables" className="mt-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">
                Variables disponibles
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Glissez-déposez ces variables dans votre email ou utilisez-les
                dans les blocs de texte. Elles seront automatiquement remplacées
                par les vraies données lors de l&apos;envoi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(mergeTags).map(([key, tag]) => (
                <div key={key} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-mono">
                      {`{${key}}`}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`{${key}}`);
                      }}
                    >
                      <Code className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-medium">{tag.name}</p>
                  {tag.value && (
                    <p className="text-xs text-muted-foreground">
                      Exemple : {tag.value}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <Alert>
              <AlertDescription>
                <strong>💡 Conseil :</strong> Utilisez l&apos;onglet
                &quot;Éditeur Visuel&quot; pour créer votre template. Les
                variables peuvent être insérées directement dans les blocs de
                texte en tapant
                <code className="mx-1">{`{nomDeLaVariable}`}</code>.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
