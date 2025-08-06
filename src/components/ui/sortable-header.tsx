import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { SortDirection } from "@/hooks/useTableSortAndFilter";
import { Button } from "@/components/ui/button";

interface SortableHeaderProps<T = Record<string, unknown>> {
  children: React.ReactNode;
  sortField: keyof T | string;
  currentSortField: keyof T | string | null;
  sortDirection: SortDirection;
  onSort: (field: keyof T | string) => void;
  className?: string;
}

export function SortableHeader<T = Record<string, unknown>>({
  children,
  sortField,
  currentSortField,
  sortDirection,
  onSort,
  className = "",
}: SortableHeaderProps<T>) {
  const isCurrentField = currentSortField === sortField;

  const getSortIcon = () => {
    if (!isCurrentField) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }

    if (sortDirection === "asc") {
      return <ChevronUp className="w-4 h-4 text-blue-600" />;
    } else if (sortDirection === "desc") {
      return <ChevronDown className="w-4 h-4 text-blue-600" />;
    }

    return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
  };

  return (
    <Button
      variant="ghost"
      className={`h-auto p-2 justify-start font-medium hover:bg-gray-50 ${className}`}
      onClick={() => onSort(sortField)}
    >
      <span className="flex items-center gap-2">
        {children}
        {getSortIcon()}
      </span>
    </Button>
  );
}
