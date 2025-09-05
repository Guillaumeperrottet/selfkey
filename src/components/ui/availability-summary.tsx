"use client";

interface AvailabilityData {
  establishmentSlug: string;
  totalRooms: number;
  availableRooms: number;
  status: "available" | "limited" | "full";
}

interface AvailabilitySummaryProps {
  availabilityData: Record<string, AvailabilityData>;
  totalEstablishments: number;
  loading: boolean;
}

export function AvailabilitySummary({
  availabilityData,
  loading,
}: AvailabilitySummaryProps) {
  if (loading) {
    return (
      <div className="text-sm text-gray-600">
        Chargement des disponibilités...
      </div>
    );
  }

  const totalAvailable = Object.values(availabilityData).reduce(
    (sum: number, data: AvailabilityData) => sum + (data.availableRooms || 0),
    0
  );
  const totalCapacity = Object.values(availabilityData).reduce(
    (sum: number, data: AvailabilityData) => sum + (data.totalRooms || 0),
    0
  );

  const availableEstablishments = Object.values(availabilityData).filter(
    (data: AvailabilityData) => data.status === "available"
  ).length;

  const limitedEstablishments = Object.values(availabilityData).filter(
    (data: AvailabilityData) => data.status === "limited"
  ).length;

  const fullEstablishments = Object.values(availabilityData).filter(
    (data: AvailabilityData) => data.status === "full"
  ).length;

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="text-gray-600">
        <span className="font-medium">{totalAvailable}</span>/{totalCapacity}{" "}
        places disponibles
      </div>

      <div className="flex items-center gap-2">
        {availableEstablishments > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700">
              {availableEstablishments} libres
            </span>
          </div>
        )}

        {limitedEstablishments > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-orange-700">
              {limitedEstablishments} limités
            </span>
          </div>
        )}

        {fullEstablishments > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-700">{fullEstablishments} complets</span>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        Mis à jour il y a{" "}
        {new Date().toLocaleTimeString("fr-CH", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
