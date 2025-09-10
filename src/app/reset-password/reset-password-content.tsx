"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, KeyRound, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "@/lib/auth-client";
import { toastUtils } from "@/lib/toast-utils";

export default function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (error) {
      toastUtils.error("Le lien de réinitialisation est invalide ou expiré");
    }
  }, [error]);

  const validatePasswords = () => {
    if (!newPassword) {
      setValidationError("Le nouveau mot de passe est requis");
      return false;
    }
    if (newPassword.length < 8) {
      setValidationError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("Les mots de passe ne correspondent pas");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    if (!token) {
      toastUtils.error("Token de réinitialisation manquant");
      return;
    }

    setIsResetting(true);

    try {
      console.log("🔄 Réinitialisation du mot de passe...");

      const { error } = await resetPassword({
        token,
        newPassword: newPassword,
      });

      if (error) {
        console.error("❌ Erreur réinitialisation:", error);
        if (error.message) {
          if (
            error.message.includes("expired") ||
            error.message.includes("invalid")
          ) {
            setValidationError(
              "Le lien de réinitialisation est invalide ou expiré"
            );
          } else {
            setValidationError(error.message);
          }
        } else {
          setValidationError("Erreur lors de la réinitialisation");
        }
        toastUtils.error("Erreur lors de la réinitialisation du mot de passe");
        return;
      }

      console.log("✅ Mot de passe réinitialisé avec succès");
      setIsSuccess(true);
      toastUtils.success("Mot de passe réinitialisé avec succès !");

      // Redirection vers login après 3 secondes
      setTimeout(() => {
        router.push("/login?message=password-reset-success");
      }, 3000);
    } catch (error) {
      console.error("💥 Exception réinitialisation:", error);
      setValidationError("Erreur lors de la réinitialisation du mot de passe");
      toastUtils.error("Erreur lors de la réinitialisation du mot de passe");
    } finally {
      setIsResetting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-green-800">
              Mot de passe réinitialisé !
            </CardTitle>
            <CardDescription>
              Votre mot de passe a été modifié avec succès.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-gray-600 mb-4">
              Vous allez être redirigé vers la page de connexion dans quelques
              instants...
            </p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Aller à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Nouveau mot de passe
          </CardTitle>
          <CardDescription>
            Choisissez un nouveau mot de passe sécurisé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nouveau mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Votre nouveau mot de passe"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Le mot de passe doit contenir au moins 8 caractères
              </p>
            </div>

            {/* Confirmation du mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {validationError && (
              <Alert variant="destructive">
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isResetting} className="w-full">
              {isResetting
                ? "Réinitialisation..."
                : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
