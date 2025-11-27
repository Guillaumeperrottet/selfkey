"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BirthDateSelectorProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  className?: string;
  dayPlaceholder?: string;
  monthPlaceholder?: string;
  yearPlaceholder?: string;
}

export function BirthDateSelector({
  date,
  onDateChange,
  className,
  dayPlaceholder = "Jour",
  monthPlaceholder = "Mois",
  yearPlaceholder = "Année",
}: BirthDateSelectorProps) {
  const [day, setDay] = React.useState<string>(
    date ? String(date.getDate()) : ""
  );
  const [month, setMonth] = React.useState<string>(
    date ? String(date.getMonth() + 1) : ""
  );
  const [year, setYear] = React.useState<string>(
    date ? String(date.getFullYear()) : ""
  );

  // Générer les jours (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Générer les années (de 1924 à l'année actuelle - 16 ans)
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 16; // Minimum 16 ans
  const minYear = 1924; // Année minimum fixe
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  // Mois avec leurs noms
  const months = [
    { value: "1", label: "Janvier / January" },
    { value: "2", label: "Février / February" },
    { value: "3", label: "Mars / March" },
    { value: "4", label: "Avril / April" },
    { value: "5", label: "Mai / May" },
    { value: "6", label: "Juin / June" },
    { value: "7", label: "Juillet / July" },
    { value: "8", label: "Août / August" },
    { value: "9", label: "Septembre / September" },
    { value: "10", label: "Octobre / October" },
    { value: "11", label: "Novembre / November" },
    { value: "12", label: "Décembre / December" },
  ];

  // Mettre à jour la date complète quand un champ change
  React.useEffect(() => {
    if (day && month && year) {
      const selectedDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );

      // Vérifier que la date est valide (pour gérer les cas comme 31 février)
      if (
        selectedDate.getDate() === parseInt(day) &&
        selectedDate.getMonth() === parseInt(month) - 1 &&
        selectedDate.getFullYear() === parseInt(year)
      ) {
        onDateChange(selectedDate);
      } else {
        // Si la date n'est pas valide (ex: 31 février), on réinitialise
        onDateChange(undefined);
      }
    } else {
      // Si un des champs est vide, réinitialiser
      onDateChange(undefined);
    }
  }, [day, month, year, onDateChange]);

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {/* Sélecteur de jour */}
      <Select value={day} onValueChange={setDay}>
        <SelectTrigger className="h-10">
          <SelectValue placeholder={dayPlaceholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {days.map((d) => (
            <SelectItem key={d} value={String(d)}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sélecteur de mois */}
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger className="h-10">
          <SelectValue placeholder={monthPlaceholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sélecteur d'année */}
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger className="h-10">
          <SelectValue placeholder={yearPlaceholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
