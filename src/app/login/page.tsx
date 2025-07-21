"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";

function LoginContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

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
    if (!isLogin && password.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
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
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signIn.email({
          email,
          password,
          callbackURL: callbackUrl,
        });
        // Utiliser window.location.href pour forcer un rechargement complet
        window.location.href = callbackUrl;
      } else {
        try {
          // Inscription
          console.log("🔄 Début de l'inscription...");

          const signUpResult = await signUp.email({
            email,
            password,
            name,
          });

          console.log("✅ Inscription réussie:", signUpResult);

          // Attendre plus longtemps avant la connexion
          console.log("⏳ Attente avant connexion...");
          await new Promise((resolve) => setTimeout(resolve, 2000));

          console.log("🔄 Tentative de connexion automatique...");

          try {
            const signInResult = await signIn.email({
              email,
              password,
              callbackURL: callbackUrl,
            });

            console.log("✅ Connexion automatique réussie:", signInResult);

            // Vérifier la session
            try {
              const sessionCheck = await fetch("/api/debug-session");
              const sessionData = await sessionCheck.json();
              console.log("📊 Session data:", sessionData);

              if (sessionData.hasSession) {
                console.log("🎉 Session validée, redirection...");
                setTimeout(() => {
                  window.location.href = callbackUrl;
                }, 500);
              } else {
                console.log(
                  "❌ Pas de session, redirection manuelle vers login..."
                );
                setError("Inscription réussie ! Veuillez vous connecter.");
                setIsLogin(true);
              }
            } catch (sessionError) {
              console.error("❌ Erreur vérification session:", sessionError);
              setError("Inscription réussie ! Veuillez vous connecter.");
              setIsLogin(true);
            }
          } catch (signInError) {
            console.error("❌ Erreur connexion automatique:", signInError);
            setError("Inscription réussie ! Veuillez vous connecter.");
            setIsLogin(true);
          }
        } catch (signUpError) {
          console.error("❌ Erreur inscription:", signUpError);
          throw signUpError; // Relancer l'erreur pour la gestion normale
        }
      }
    } catch (err: unknown) {
      console.error("Erreur d'authentification:", err);

      // Gestion des erreurs spécifiques
      let errorMessage = "Une erreur est survenue";

      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();

        // Gestion des erreurs de connexion
        if (isLogin) {
          if (
            errorMsg.includes("invalid credentials") ||
            errorMsg.includes("invalid email or password") ||
            errorMsg.includes("unauthorized") ||
            errorMsg.includes("401") ||
            errorMsg.includes("incorrect") ||
            errorMsg.includes("wrong password") ||
            errorMsg.includes("user not found") ||
            errorMsg.includes("invalid login")
          ) {
            errorMessage =
              "Email ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.";
          } else if (
            errorMsg.includes("user not verified") ||
            errorMsg.includes("email not verified")
          ) {
            errorMessage =
              "Votre compte n'est pas encore vérifié. Vérifiez votre email.";
          } else if (
            errorMsg.includes("account locked") ||
            errorMsg.includes("too many attempts")
          ) {
            errorMessage =
              "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
          }
        }
        // Gestion des erreurs d'inscription
        else {
          if (
            errorMsg.includes("user already exists") ||
            errorMsg.includes("already exists") ||
            errorMsg.includes("email already registered") ||
            errorMsg.includes("422")
          ) {
            errorMessage =
              "Cette adresse email est déjà utilisée. Essayez de vous connecter ou utilisez une autre adresse.";
          } else if (
            errorMsg.includes("password too weak") ||
            errorMsg.includes("password requirements")
          ) {
            errorMessage =
              "Le mot de passe doit contenir au moins 8 caractères.";
          } else if (
            errorMsg.includes("invalid email format") ||
            errorMsg.includes("invalid email")
          ) {
            errorMessage =
              "Format d'email invalide. Vérifiez votre adresse email.";
          }
        }

        // Erreurs génériques
        if (
          errorMsg.includes("network") ||
          errorMsg.includes("fetch") ||
          errorMsg.includes("connection")
        ) {
          errorMessage =
            "Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.";
        } else if (
          errorMsg.includes("server error") ||
          errorMsg.includes("500") ||
          errorMsg.includes("503")
        ) {
          errorMessage =
            "Erreur du serveur. Veuillez réessayer dans quelques instants.";
        }

        // Si aucune erreur spécifique n'a été détectée, utiliser le message original s'il est informatif
        if (
          errorMessage === "Une erreur est survenue" &&
          err.message &&
          err.message.length > 0
        ) {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur avec Google";
      setError(errorMessage);
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
              <CardTitle className="text-xl">
                {isLogin ? "Connexion" : "Inscription"}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? "Connectez-vous à votre espace admin"
                  : "Créez votre compte administrateur"}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsLogin(true);
                        setError("");
                        setEmail(email); // Garder l'email saisi
                      }}
                      className="mt-2"
                    >
                      Se connecter avec cet email
                    </Button>
                  )}
                  {error.includes("Email ou mot de passe incorrect") &&
                    isLogin && (
                      <div className="text-sm text-red-700 dark:text-red-300 mt-2">
                        💡 Assurez-vous que votre email et mot de passe sont
                        corrects.
                      </div>
                    )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    placeholder="Votre nom complet"
                  />
                </div>
              )}

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
                {!isLogin && !passwordError && (
                  <p className="text-sm text-gray-500 mt-1">
                    Le mot de passe doit contenir au moins 8 caractères
                  </p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading
                  ? "Chargement..."
                  : isLogin
                    ? "Se connecter"
                    : "S'inscrire"}
              </Button>
            </form>

            <div className="space-y-4">
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    ou
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285f4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34a853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fbbc05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ea4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuer avec Google
              </Button>
            </div>

            <div className="text-center space-y-2">
              <Button
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setEmailError("");
                  setPasswordError("");
                }}
                className="text-sm"
              >
                {isLogin
                  ? "Pas encore de compte ? S'inscrire"
                  : "Déjà un compte ? Se connecter"}
              </Button>

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
