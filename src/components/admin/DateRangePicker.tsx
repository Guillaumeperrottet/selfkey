"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subYears,
  startOfQuarter,
  endOfQuarter,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

type PresetKey =
  | "current-month"
  | "last-month"
  | "current-quarter"
  | "last-quarter"
  | "current-year"
  | "last-year"
  | "all-time";

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>(null);

  const presets: Record<PresetKey, { label: string; range: () => DateRange }> =
    {
      "current-month": {
        label: "Mois en cours",
        range: () => ({
          from: startOfMonth(new Date()),
          to: endOfMonth(new Date()),
        }),
      },
      "last-month": {
        label: "Mois précédent",
        range: () => {
          const lastMonth = subMonths(new Date(), 1);
          return {
            from: startOfMonth(lastMonth),
            to: endOfMonth(lastMonth),
          };
        },
      },
      "current-quarter": {
        label: "Trimestre en cours",
        range: () => ({
          from: startOfQuarter(new Date()),
          to: endOfQuarter(new Date()),
        }),
      },
      "last-quarter": {
        label: "Trimestre précédent",
        range: () => {
          const lastQuarter = subMonths(new Date(), 3);
          return {
            from: startOfQuarter(lastQuarter),
            to: endOfQuarter(lastQuarter),
          };
        },
      },
      "current-year": {
        label: "Année en cours",
        range: () => ({
          from: startOfYear(new Date()),
          to: endOfYear(new Date()),
        }),
      },
      "last-year": {
        label: "Année précédente",
        range: () => {
          const lastYear = subYears(new Date(), 1);
          return {
            from: startOfYear(lastYear),
            to: endOfYear(lastYear),
          };
        },
      },
      "all-time": {
        label: "Depuis le début",
        range: () => ({
          from: new Date(2020, 0, 1), // Date de début arbitraire
          to: new Date(),
        }),
      },
    };

  const handlePresetClick = (presetKey: PresetKey) => {
    const range = presets[presetKey].range();
    setTempRange(range);
    setSelectedPreset(presetKey);
  };

  const handleApply = () => {
    onChange(tempRange);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempRange(value);
    setSelectedPreset(null);
    setOpen(false);
  };

  const formatDisplayValue = () => {
    if (value.from && value.to) {
      return `${format(value.from, "d MMM yyyy", { locale: fr })} → ${format(value.to, "d MMM yyyy", { locale: fr })}`;
    }
    return "Sélectionner une période";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Sidebar avec les presets */}
          <div className="border-r p-3 space-y-1 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 mb-2 px-3">
              Plage de dates
            </div>
            {Object.entries(presets).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => handlePresetClick(key as PresetKey)}
                className={cn(
                  "block w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                  selectedPreset === key
                    ? "bg-blue-100 text-blue-900 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Calendrier avec sélection de plage */}
          <div className="flex flex-col p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-2">
                <div>Début</div>
                <div className="flex-1 text-center">
                  {tempRange.from &&
                    format(tempRange.from, "dd/MM/yyyy", { locale: fr })}
                </div>
                <div>Fin</div>
                <div className="flex-1 text-center">
                  {tempRange.to &&
                    format(tempRange.to, "dd/MM/yyyy", { locale: fr })}
                </div>
              </div>
              <Calendar
                mode="range"
                selected={{ from: tempRange.from, to: tempRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setTempRange({ from: range.from, to: range.to });
                    setSelectedPreset(null);
                  } else if (range?.from) {
                    setTempRange({ from: range.from, to: range.from });
                    setSelectedPreset(null);
                  }
                }}
                numberOfMonths={2}
                locale={fr}
                className="rounded-md border"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Effacer
              </Button>
              <Button size="sm" onClick={handleApply}>
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
