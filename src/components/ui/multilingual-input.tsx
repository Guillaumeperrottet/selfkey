"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MultilingualInputProps {
  label: string;
  name: string;
  value_fr?: string;
  value_en?: string;
  value_de?: string;
  onChange: (field: string, value: string) => void;
  type?: "text" | "textarea";
  placeholder_fr?: string;
  placeholder_en?: string;
  placeholder_de?: string;
  required?: boolean;
  description?: string;
}

export function MultilingualInput({
  label,
  name,
  value_fr = "",
  value_en = "",
  value_de = "",
  onChange,
  type = "text",
  placeholder_fr,
  placeholder_en,
  placeholder_de,
  required = false,
  description,
}: MultilingualInputProps) {
  const InputComponent = type === "textarea" ? Textarea : Input;

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <Tabs defaultValue="fr" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fr" className="flex items-center gap-1">
            <span className="text-base">🇫🇷</span> FR
          </TabsTrigger>
          <TabsTrigger value="en" className="flex items-center gap-1">
            <span className="text-base">🇬🇧</span> EN
          </TabsTrigger>
          <TabsTrigger value="de" className="flex items-center gap-1">
            <span className="text-base">🇩🇪</span> DE
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fr" className="mt-2">
          <InputComponent
            value={value_fr}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder_fr}
            required={required}
            rows={type === "textarea" ? 4 : undefined}
          />
          {required && (
            <p className="text-xs text-gray-500 mt-1">
              Champ obligatoire - utilisé comme fallback pour les autres langues
            </p>
          )}
        </TabsContent>

        <TabsContent value="en" className="mt-2">
          <InputComponent
            value={value_en}
            onChange={(e) => onChange(`${name}_en`, e.target.value)}
            placeholder={placeholder_en || placeholder_fr}
            rows={type === "textarea" ? 4 : undefined}
          />
          <p className="text-xs text-gray-500 mt-1">
            Optionnel - si vide, utilisera la version française
          </p>
        </TabsContent>

        <TabsContent value="de" className="mt-2">
          <InputComponent
            value={value_de}
            onChange={(e) => onChange(`${name}_de`, e.target.value)}
            placeholder={placeholder_de || placeholder_fr}
            rows={type === "textarea" ? 4 : undefined}
          />
          <p className="text-xs text-gray-500 mt-1">
            Optionnel - si vide, utilisera la version française
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
