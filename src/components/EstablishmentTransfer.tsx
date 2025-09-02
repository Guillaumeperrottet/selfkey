"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, AlertTriangle, CheckCircle } from "lucide-react";

interface EstablishmentTransferProps {
  establishmentSlug: string;
  establishmentName: string;
  onTransferComplete?: () => void;
}

export function EstablishmentTransfer({
  establishmentSlug,
  establishmentName,
  onTransferComplete,
}: EstablishmentTransferProps) {
  const [toUserEmail, setToUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/establishments/${establishmentSlug}/transfer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            toUserEmail: toUserEmail.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du transfert");
      }

      setSuccess(data.message);
      setToUserEmail("");

      if (onTransferComplete) {
        onTransferComplete();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Transférer l&apos;établissement
        </CardTitle>
        <CardDescription>
          Transférer la propriété de <strong>{establishmentName}</strong> à un
          autre utilisateur
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email du nouveau propriétaire</Label>
            <Input
              id="email"
              type="email"
              placeholder="nouveau@propriétaire.com"
              value={toUserEmail}
              onChange={(e) => setToUserEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention :</strong> Cette action est irréversible. Le
              nouveau propriétaire devra reconfigurer son compte Stripe pour
              recevoir les paiements.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            disabled={isLoading || !toUserEmail.trim()}
            className="w-full"
          >
            {isLoading ? "Transfert en cours..." : "Transférer l'établissement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
