"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, Users, Calendar } from "lucide-react";
import { useSelfcampTranslation } from "@/hooks/useSelfcampTranslation";

interface AvailabilityBadgeProps {
  availableRooms: number;
  totalRooms: number;
  status: "available" | "limited" | "full" | "closed";
  nextAvailable?: string | null;
  loading?: boolean;
  className?: string;
}

export function AvailabilityBadge({
  availableRooms,
  totalRooms,
  status,
  nextAvailable,
  loading = false,
  className = "",
}: AvailabilityBadgeProps) {
  const { t } = useSelfcampTranslation();

  if (loading) {
    return (
      <Badge
        variant="outline"
        className={`flex items-center gap-1 ${className}`}
      >
        <Clock className="w-3 h-3 animate-spin" />
        <span className="text-xs">{t.loading.message}</span>
      </Badge>
    );
  }

  const getStatusColor = () => {
    switch (status) {
      case "closed":
        return "bg-gray-500 text-white hover:bg-gray-600";
      case "available":
        return "bg-green-500 text-white hover:bg-green-600";
      case "limited":
        return "bg-orange-500 text-white hover:bg-orange-600";
      case "full":
        return "bg-red-500 text-white hover:bg-red-600";
      default:
        return "bg-gray-500 text-white hover:bg-gray-600";
    }
  };

  const getStatusText = () => {
    if (status === "closed") {
      return t.map.closed;
    }
    if (status === "full") {
      return nextAvailable ? `Libre le ${nextAvailable}` : "Complet";
    }
    return `${availableRooms}/${totalRooms} ${t.map.placesAvailable}`;
  };

  const getIcon = () => {
    if (status === "closed") {
      return <Clock className="w-3 h-3" />;
    }
    if (status === "full") {
      return nextAvailable ? (
        <Calendar className="w-3 h-3" />
      ) : (
        <Users className="w-3 h-3" />
      );
    }
    return <Users className="w-3 h-3" />;
  };

  return (
    <Badge
      className={`flex items-center gap-1 text-xs font-medium ${getStatusColor()} ${className}`}
    >
      {getIcon()}
      <span>{getStatusText()}</span>
    </Badge>
  );
}
