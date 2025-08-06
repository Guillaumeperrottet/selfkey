"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ModernDataTableProps {
  children: ReactNode;
  className?: string;
}

export function ModernDataTable({
  children,
  className = "",
}: ModernDataTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <Table>{children}</Table>
    </div>
  );
}

interface ModernTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ModernTableHeader({
  children,
  className = "",
}: ModernTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow
        className={`bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 ${className}`}
      >
        {children}
      </TableRow>
    </TableHeader>
  );
}

interface ModernTableBodyProps {
  children: ReactNode;
  className?: string;
}

export function ModernTableBody({
  children,
  className = "",
}: ModernTableBodyProps) {
  return <TableBody className={className}>{children}</TableBody>;
}

export {
  TableRow as ModernTableRow,
  TableHead as ModernTableHead,
  Table as ModernTable,
};
