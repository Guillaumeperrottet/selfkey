"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import Image from "next/image";
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
import { Loader2, XCircle } from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Valider le token au chargement
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Lien d'invitation invalide");
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/invite/validate?token=${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
          setInviteEmail(data.email);
        } else {
          setError(data.error || "Le lien d'invitation est invalide ou expiré");
        }
      } catch (err) {
        console.error("Erreur validation token:", err);
        setError("Erreur lors de la validation du lien");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Le mot de passe est requis");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!validatePassword(password)) {
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      // 1. Créer le compte
      console.log("🔄 Création du compte...");
      const signUpResult = await signUp.email({
        email: inviteEmail,
        password,
        name,
      });

      console.log("✅ Compte créé:", signUpResult);

      // 2. Marquer le token comme utilisé
      await fetch("/api/invite/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      // 3. Attendre un peu
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 4. Connexion automatique
      console.log("🔄 Connexion automatique...");
      await signIn.email({
        email: inviteEmail,
        password,
        callbackURL: "/establishments",
      });

      toastUtils.success("Compte créé avec succès ! Redirection...");

      setTimeout(() => {
        window.location.href = "/establishments";
      }, 1000);
    } catch (err: unknown) {
      console.error("Erreur création compte:", err);

      let errorMessage =
        "Une erreur est survenue lors de la création du compte";

      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();

        if (
          errorMsg.includes("user already exists") ||
          errorMsg.includes("already exists")
        ) {
          errorMessage =
            "Un compte existe déjà avec cet email. Veuillez vous connecter.";
        } else if (
          errorMsg.includes("password too weak") ||
          errorMsg.includes("password requirements")
        ) {
          errorMessage = "Le mot de passe doit contenir au moins 8 caractères.";
        }
      }

      setError(errorMessage);
      toastUtils.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // État de chargement
  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-gray-600">Vérification de votre invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Token invalide
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Invitation invalide</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-gray-600 mb-4">
              Ce lien d&apos;invitation n&apos;est pas valide ou a expiré.
              Veuillez contacter l&apos;administrateur pour obtenir une nouvelle
              invitation.
            </p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Aller à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulaire d'inscription
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Image
                src="/logo.png"
                alt="SelfKey"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SelfKey
              </h1>
            </div>
            <div className="text-center">
              <CardTitle className="text-xl">Créer votre compte</CardTitle>
              <CardDescription>
                Vous avez été invité à rejoindre SelfKey
              </CardDescription>
              <div className="mt-2 p-2 bg-green-50 rounded-md">
                <p className="text-sm text-green-800 font-medium">
                  Email: {inviteEmail}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Votre nom complet"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  required
                  placeholder="••••••••"
                  className={
                    passwordError ? "border-red-500 focus:ring-red-500" : ""
                  }
                />
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
                {!passwordError && (
                  <p className="text-sm text-gray-500 mt-1">
                    Au moins 8 caractères
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Création en cours..." : "Créer mon compte"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{" "}
                <Button
                  variant="link"
                  onClick={() => router.push("/login")}
                  className="text-sm p-0"
                >
                  Se connecter
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
