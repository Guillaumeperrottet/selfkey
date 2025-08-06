"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";

interface ModernTableProps {
  title: string;
  description: string;
  icon: ReactNode;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  loading?: boolean;
  children: ReactNode;
  stats?: ReactNode;
  className?: string;
}

export function ModernTable({
  title,
  description,
  icon,
  searchValue,
  onSearchChange,
  onRefresh,
  loading = false,
  children,
  stats,
  className = "",
}: ModernTableProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec recherche */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64 h-9 border-gray-300 focus:border-gray-500 focus:ring-gray-500 dark:border-gray-600 dark:focus:border-gray-400"
            />
          </div>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="h-9"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques si fournies */}
      {stats && <div>{stats}</div>}

      {/* Contenu principal */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        {children}
      </Card>
    </div>
  );
}

interface ModernTableEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function ModernTableEmptyState({
  icon,
  title,
  description,
}: ModernTableEmptyStateProps) {
  return (
    <CardContent className="p-12">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 text-gray-400 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </CardContent>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant: "blue" | "orange" | "purple" | "teal" | "green" | "red";
}

export function StatsCard({ title, value, icon, variant }: StatsCardProps) {
  const variantClasses = {
    blue: "from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50",
    orange:
      "from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50",
    purple:
      "from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50",
    teal: "from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50",
    green: "from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50",
    red: "from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50",
  };

  const textClasses = {
    blue: "text-gray-600 dark:text-gray-400",
    orange: "text-gray-600 dark:text-gray-400",
    purple: "text-gray-600 dark:text-gray-400",
    teal: "text-gray-600 dark:text-gray-400",
    green: "text-gray-600 dark:text-gray-400",
    red: "text-gray-600 dark:text-gray-400",
  };

  const valueClasses = {
    blue: "text-gray-900 dark:text-gray-100",
    orange: "text-gray-900 dark:text-gray-100",
    purple: "text-gray-900 dark:text-gray-100",
    teal: "text-gray-900 dark:text-gray-100",
    green: "text-gray-900 dark:text-gray-100",
    red: "text-gray-900 dark:text-gray-100",
  };

  const iconClasses = {
    blue: "text-gray-500 dark:text-gray-400",
    orange: "text-gray-500 dark:text-gray-400",
    purple: "text-gray-500 dark:text-gray-400",
    teal: "text-gray-500 dark:text-gray-400",
    green: "text-gray-500 dark:text-gray-400",
    red: "text-gray-500 dark:text-gray-400",
  };

  return (
    <Card
      className={`border-0 shadow-sm bg-gradient-to-br ${variantClasses[variant]}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${textClasses[variant]}`}>
              {title}
            </p>
            <p className={`text-2xl font-bold ${valueClasses[variant]}`}>
              {value}
            </p>
          </div>
          <div className={`w-8 h-8 ${iconClasses[variant]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
