"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
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
import { Loader2, ArrowLeft } from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const message = searchParams.get("message");

  // Messages de succès prédéfinis
  const successMessages = {
    "password-reset-success":
      "Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
    "email-verified": "Votre adresse email a été vérifiée avec succès !",
  };

  // Validation des champs
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("L'email est requis");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Format d'email invalide");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Le mot de passe est requis");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (emailError) {
      validateEmail(newEmail);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (passwordError) {
      validatePassword(newPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation côté client
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      toastUtils.error("Veuillez corriger les erreurs dans le formulaire.");
      setLoading(false);
      return;
    }

    try {
      // Connexion uniquement
      try {
        const response = await fetch("/api/auth/sign-in/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            callbackURL: callbackUrl,
          }),
        });

        console.log(
          "Réponse de l'API auth:",
          response.status,
          response.statusText
        );

        if (response.status === 401) {
          // Authentification échouée
          toastUtils.error(
            "Email ou mot de passe incorrect. Vérifiez vos identifiants."
          );
          setError(
            "Email ou mot de passe incorrect. Vérifiez vos identifiants."
          );
          return;
        } else if (response.status === 200) {
          // Authentification réussie
          toastUtils.success("Connexion réussie ! Redirection en cours...");
          setTimeout(() => {
            window.location.href = callbackUrl;
          }, 1000);
          return;
        } else {
          // Autre erreur
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      } catch (fetchError) {
        console.error("Erreur lors de l'appel direct à l'API:", fetchError);

        // Fallback: essayer avec signIn.email
        try {
          await signIn.email({
            email,
            password,
            callbackURL: callbackUrl,
          });

          // Si on arrive ici, vérifier la session
          await new Promise((resolve) => setTimeout(resolve, 500));

          const sessionCheck = await fetch("/api/debug-session");
          const sessionData = await sessionCheck.json();

          if (sessionData.hasSession) {
            toastUtils.success("Connexion réussie ! Redirection en cours...");
            setTimeout(() => {
              window.location.href = callbackUrl;
            }, 1000);
          } else {
            throw new Error("Échec de la connexion");
          }
        } catch (signInError) {
          console.error("Erreur avec signIn.email:", signInError);
          toastUtils.error(
            "Email ou mot de passe incorrect. Vérifiez vos identifiants."
          );
          setError(
            "Email ou mot de passe incorrect. Vérifiez vos identifiants."
          );
        }
      }
    } catch (err: unknown) {
      console.error("Erreur d'authentification:", err);
      console.log("Type d'erreur:", typeof err);
      console.log("Erreur détaillée:", JSON.stringify(err, null, 2));

      // Gestion des erreurs spécifiques avec toasts
      let errorMessage = "Une erreur est survenue";

      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();

        // Gestion des erreurs de connexion
        if (
          errorMsg.includes("invalid credentials") ||
          errorMsg.includes("invalid email or password") ||
          errorMsg.includes("unauthorized") ||
          errorMsg.includes("401") ||
          errorMsg.includes("incorrect") ||
          errorMsg.includes("wrong password") ||
          errorMsg.includes("user not found") ||
          errorMsg.includes("invalid login") ||
          errorMsg.includes("credential account not found") ||
          errorMsg.includes("email ou mot de passe incorrect")
        ) {
          errorMessage =
            "Email ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.";
          toastUtils.error(errorMessage);
        } else if (
          errorMsg.includes("user not verified") ||
          errorMsg.includes("email not verified")
        ) {
          errorMessage =
            "Votre compte n'est pas encore vérifié. Vérifiez votre email.";
          toastUtils.warning(errorMessage);
        } else if (
          errorMsg.includes("account locked") ||
          errorMsg.includes("too many attempts")
        ) {
          errorMessage =
            "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
          toastUtils.warning(errorMessage);
        } else {
          toastUtils.error("Erreur de connexion. Veuillez réessayer.");
        }

        // Erreurs génériques
        if (
          errorMsg.includes("network") ||
          errorMsg.includes("fetch") ||
          errorMsg.includes("connection")
        ) {
          errorMessage =
            "Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.";
          toastUtils.error(errorMessage);
        } else if (
          errorMsg.includes("server error") ||
          errorMsg.includes("500") ||
          errorMsg.includes("503")
        ) {
          errorMessage =
            "Erreur du serveur. Veuillez réessayer dans quelques instants.";
          toastUtils.error(errorMessage);
        }

        // Si aucune erreur spécifique n'a été détectée, utiliser le message original s'il est informatif
        if (
          errorMessage === "Une erreur est survenue" &&
          err.message &&
          err.message.length > 0
        ) {
          errorMessage = err.message;
          toastUtils.error(errorMessage);
        }
      } else {
        // Cas où l'erreur n'est pas une instance d'Error
        toastUtils.error(
          "Une erreur inattendue s'est produite. Veuillez réessayer."
        );
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
              <CardTitle className="text-xl">Connexion</CardTitle>
              <CardDescription>
                Connectez-vous à votre espace admin
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50 dark:bg-red-950/50"
              >
                <AlertDescription className="space-y-2">
                  <div className="font-medium text-red-800 dark:text-red-200">
                    {error}
                  </div>
                  {error.includes("déjà utilisée") && (
                    <div className="text-sm text-red-700 dark:text-red-300 mt-2">
                      💡 Assurez-vous que votre email et mot de passe sont
                      corrects.
                    </div>
                  )}
                  {error.includes("Email ou mot de passe incorrect") && (
                    <div className="text-sm text-red-700 dark:text-red-300 mt-2">
                      💡 Assurez-vous que votre email et mot de passe sont
                      corrects.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Message de succès */}
            {message &&
              successMessages[message as keyof typeof successMessages] && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {successMessages[message as keyof typeof successMessages]}
                  </AlertDescription>
                </Alert>
              )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  required
                  placeholder="votre@email.com"
                  className={
                    emailError ? "border-red-500 focus:ring-red-500" : ""
                  }
                />
                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => validatePassword(password)}
                  required
                  placeholder="••••••••"
                  className={
                    passwordError ? "border-red-500 focus:ring-red-500" : ""
                  }
                />
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Chargement..." : "Se connecter"}
              </Button>

              {/* Lien mot de passe oublié */}
              <div className="text-center">
                <Button
                  variant="link"
                  asChild
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  <Link href="/forgot-password">Mot de passe oublié ?</Link>
                </Button>
              </div>
            </form>

            <div className="text-center space-y-2">
              <div>
                <Button variant="link" asChild className="text-sm">
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Retour à l&apos;accueil
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  );
}
