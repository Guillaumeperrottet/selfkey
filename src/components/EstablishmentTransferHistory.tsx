"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Calendar, Mail, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Transfer {
  id: string;
  fromUser: {
    email: string;
    name: string | null;
  };
  toUserEmail: string;
  transferredAt: string;
}

interface EstablishmentTransferHistoryProps {
  establishmentSlug: string;
  className?: string;
}

export function EstablishmentTransferHistory({
  establishmentSlug,
  className,
}: EstablishmentTransferHistoryProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransferHistory = async () => {
      try {
        const response = await fetch(
          `/api/establishments/${establishmentSlug}/transfer-history`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur lors de la récupération");
        }

        setTransfers(data.transfers || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    if (establishmentSlug) {
      fetchTransferHistory();
    }
  }, [establishmentSlug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-gray-500">Chargement de l&apos;historique...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique des transferts
        </CardTitle>
        <CardDescription>
          Historique des transferts de propriété de cet établissement
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transfers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Aucun transfert effectué pour cet établissement
          </p>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {transfer.fromUser.name || "Utilisateur"}
                      </span>
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {transfer.fromUser.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        → Transféré vers :
                      </span>
                      <Badge variant="secondary">{transfer.toUserEmail}</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatDate(transfer.transferredAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
