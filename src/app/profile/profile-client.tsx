"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Mail,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { changePassword, sendVerificationEmail } from "@/lib/auth-client";
import { toastUtils } from "@/lib/toast-utils";

interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProfileClientProps {
  user: User;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();

  // États pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // États pour la visibilité des mots de passe
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // État pour l'envoi d'email de vérification
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  // État pour savoir si l'utilisateur a un mot de passe
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isCheckingPassword, setIsCheckingPassword] = useState(true);

  // Vérifier si l'utilisateur a un mot de passe au chargement
  useEffect(() => {
    const checkUserHasPassword = async () => {
      try {
        // Utiliser notre endpoint pour vérifier s'il y a un compte credential
        const response = await fetch("/api/check-password", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setHasPassword(data.hasPassword);
        } else {
          // En cas d'erreur, on teste avec changePassword
          const { error } = await changePassword({
            currentPassword: "",
            newPassword: "test",
          });

          if (error) {
            if (error.code === "CREDENTIAL_ACCOUNT_NOT_FOUND") {
              setHasPassword(false); // Utilisateur OAuth sans mot de passe
            } else {
              setHasPassword(true); // Utilisateur avec mot de passe (erreur de validation)
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du mot de passe:", error);
        setHasPassword(true); // Par défaut, on assume qu'il y a un mot de passe
      } finally {
        setIsCheckingPassword(false);
      }
    };

    checkUserHasPassword();
  }, []);

  const validatePasswords = () => {
    // Si pas de mot de passe existant, on ne demande pas le mot de passe actuel
    if (hasPassword && !currentPassword) {
      setPasswordError("Le mot de passe actuel est requis");
      return false;
    }
    if (!newPassword) {
      setPasswordError("Le nouveau mot de passe est requis");
      return false;
    }
    if (newPassword.length < 8) {
      setPasswordError(
        "Le nouveau mot de passe doit contenir au moins 8 caractères"
      );
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return false;
    }
    if (hasPassword && newPassword === currentPassword) {
      setPasswordError(
        "Le nouveau mot de passe doit être différent de l'actuel"
      );
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSetInitialPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      setPasswordError("Le mot de passe est requis");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsChangingPassword(true);

    try {
      console.log("🔄 Définition du mot de passe initial...");

      const response = await fetch("/api/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(
          data.error || "Erreur lors de la définition du mot de passe"
        );
        toastUtils.error(
          data.error || "Erreur lors de la définition du mot de passe"
        );
        return;
      }

      console.log("✅ Mot de passe initial défini avec succès");
      toastUtils.success("Mot de passe défini avec succès !");
      setHasPassword(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("💥 Exception:", error);
      setPasswordError("Erreur lors de la définition du mot de passe");
      toastUtils.error("Erreur lors de la définition du mot de passe");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    setIsChangingPassword(true);

    try {
      console.log("🔄 Tentative de changement de mot de passe...");

      const { error } = await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true, // Déconnecter les autres sessions
      });

      console.log("📡 Réponse du serveur:", { error });

      if (error) {
        console.error("❌ Erreur du serveur:", error);
        if (error.message && error.message.includes("Invalid password")) {
          setPasswordError("Le mot de passe actuel est incorrect");
        } else {
          setPasswordError(error.message || "Erreur inconnue");
        }
        toastUtils.error("Erreur lors du changement de mot de passe");
        return;
      }

      // Succès
      console.log("✅ Mot de passe changé avec succès");
      toastUtils.success("Mot de passe modifié avec succès !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("💥 Exception:", error);
      toastUtils.error("Erreur lors du changement de mot de passe");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setIsSendingVerification(true);

    try {
      const { error } = await sendVerificationEmail({
        email: user.email,
        callbackURL: `${window.location.origin}/profile?verified=true`,
      });

      if (error) {
        toastUtils.error("Erreur lors de l'envoi de l'email de vérification");
        return;
      }

      toastUtils.success(
        "Email de vérification envoyé ! Vérifiez votre boîte mail."
      );
    } catch (error) {
      console.error("Erreur envoi email vérification:", error);
      toastUtils.error("Erreur lors de l'envoi de l'email de vérification");
    } finally {
      setIsSendingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600">
              Gérez vos informations personnelles et sécurité
            </p>
          </div>
        </div>

        {/* Informations du compte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations du compte
            </CardTitle>
            <CardDescription>Vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nom</Label>
                <div className="mt-1 text-sm text-gray-900">
                  {user.name || "Non renseigné"}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-gray-900">{user.email}</span>
                  <Badge variant={user.emailVerified ? "default" : "secondary"}>
                    {user.emailVerified ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Vérifié
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Non vérifié
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {!user.emailVerified && (
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Votre adresse email n&apos;est pas vérifiée.</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSendVerificationEmail}
                    disabled={isSendingVerification}
                  >
                    {isSendingVerification ? "Envoi..." : "Vérifier maintenant"}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Changement de mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              {isCheckingPassword
                ? "Vérification de votre configuration..."
                : hasPassword
                  ? "Modifiez votre mot de passe pour sécuriser votre compte"
                  : "Définissez un mot de passe pour sécuriser votre compte"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCheckingPassword ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">
                  Vérification en cours...
                </div>
              </div>
            ) : hasPassword ? (
              // Formulaire pour changer le mot de passe existant
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Mot de passe actuel */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Votre mot de passe actuel"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

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

                {/* Confirmation nouveau mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirmer le nouveau mot de passe
                  </Label>
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {passwordError && (
                  <Alert variant="destructive">
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full"
                >
                  {isChangingPassword ? (
                    "Modification en cours..."
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Modifier le mot de passe
                    </>
                  )}
                </Button>
              </form>
            ) : (
              // Formulaire pour définir un mot de passe initial
              <div className="space-y-4">
                <Alert>
                  <Plus className="h-4 w-4" />
                  <AlertDescription>
                    Vous vous êtes connecté via Google. Définissez un mot de
                    passe pour pouvoir vous connecter directement avec votre
                    email.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleSetInitialPassword} className="space-y-4">
                  {/* Nouveau mot de passe */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Définir un mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Votre mot de passe"
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

                  {/* Confirmation mot de passe */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmez votre mot de passe"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full"
                  >
                    {isChangingPassword ? (
                      "Définition en cours..."
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Définir le mot de passe
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations supplémentaires */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Compte créé le:</span>
              <span>
                {new Date(user.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Dernière mise à jour:</span>
              <span>
                {new Date(user.updatedAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
