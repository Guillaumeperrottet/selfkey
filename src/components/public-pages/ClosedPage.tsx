"use client";

import { Clock, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClosedPageProps {
  establishmentName: string;
  cutoffTime: string;
  reopenTime: string;
  nextAvailableTime?: string;
}

export function ClosedPage({
  establishmentName,
  cutoffTime,
  reopenTime,
  nextAvailableTime,
}: ClosedPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {establishmentName}
            </h1>
            <h2 className="text-xl font-semibold text-red-600">
              Réservations fermées
            </h2>
          </div>

          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              Les réservations sont fermées depuis {cutoffTime}
              et rouvriront à {reopenTime}.
            </AlertDescription>
          </Alert>

          {nextAvailableTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">
                  Prochaine ouverture
                </span>
              </div>
              <p className="text-blue-700 text-sm">{nextAvailableTime}</p>
            </div>
          )}

          <div className="text-gray-600 text-sm">
            <p>
              Veuillez revenir pendant les heures d&apos;ouverture pour
              effectuer votre réservation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
