import { useState, useMemo } from "react";

export type SortDirection = "asc" | "desc" | null;

interface UseSortAndFilterProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  defaultSortField?: keyof T;
  defaultSortDirection?: SortDirection;
}

export function useTableSortAndFilter<T>({
  data,
  searchFields,
  defaultSortField,
  defaultSortDirection = null,
}: UseSortAndFilterProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof T | null>(
    defaultSortField || null
  );
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(defaultSortDirection);

  const handleSort = (field: keyof T | string) => {
    if (sortField === field) {
      // Si on clique sur la même colonne, changer la direction
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      // Nouvelle colonne, commencer par ascendant
      setSortField(field as keyof T);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filtrage par recherche
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          if (value === null || value === undefined) return false;

          // Gestion des différents types de données
          if (typeof value === "string") {
            return value.toLowerCase().includes(lowerSearchTerm);
          } else if (typeof value === "number") {
            return value.toString().includes(lowerSearchTerm);
          } else if (typeof value === "boolean") {
            return value.toString().toLowerCase().includes(lowerSearchTerm);
          } else if (Array.isArray(value)) {
            return value.some((v) =>
              v && typeof v === "object" && "name" in v
                ? String(v.name).toLowerCase().includes(lowerSearchTerm)
                : String(v).toLowerCase().includes(lowerSearchTerm)
            );
          } else if (typeof value === "object" && value !== null) {
            // Pour les objets, on cherche dans leurs propriétés string
            return Object.values(value).some(
              (v) =>
                typeof v === "string" &&
                v.toLowerCase().includes(lowerSearchTerm)
            );
          }
          return false;
        })
      );
    }

    // Tri
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        // Gestion des valeurs nulles/undefined
        if (aValue === null || aValue === undefined)
          return sortDirection === "asc" ? 1 : -1;
        if (bValue === null || bValue === undefined)
          return sortDirection === "asc" ? -1 : 1;

        let comparison = 0;

        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
        } else if (Array.isArray(aValue) && Array.isArray(bValue)) {
          comparison = aValue.length - bValue.length;
        } else {
          // Conversion en string pour le tri par défaut
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortDirection === "desc" ? -comparison : comparison;
      });
    }

    return result;
  }, [data, searchTerm, sortField, sortDirection, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    filteredAndSortedData,
  };
}
