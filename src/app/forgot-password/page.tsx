"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth-client";
import { toastUtils } from "@/lib/toast-utils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("L'adresse email est requise");
      return;
    }

    if (!validateEmail(email)) {
      setError("Format d'email invalide");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
        console.error("Erreur demande reset:", error);
      }

      // On affiche toujours le succès, même si l'email n'existe pas
      setIsSuccess(true);
      toastUtils.success("Email de réinitialisation envoyé !");
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation:", error);
      // Même stratégie : on affiche toujours le succès
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Email envoyé !</CardTitle>
            <CardDescription>
              Si un compte existe avec cette adresse email, vous recevrez un
              lien pour réinitialiser votre mot de passe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Vérifiez votre boîte mail :</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Vérifiez votre dossier spam/courrier indésirable</li>
                <li>• Le lien expire dans 1 heure</li>
                <li>• Vous pouvez fermer cette page</li>
              </ul>
            </div>

            <Button className="w-full" onClick={() => router.push("/login")}>
              Retour à la connexion
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
                className="text-sm"
              >
                Envoyer à une autre adresse
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre adresse email pour recevoir un lien de réinitialisation
            de votre mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading
                ? "Envoi en cours..."
                : "Envoyer le lien de réinitialisation"}
            </Button>

            <div className="text-center space-y-2">
              <Button variant="link" asChild className="text-sm">
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Retour à la connexion
                </Link>
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Besoin d&apos;aide ?</strong>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Si vous ne recevez pas l&apos;email, vérifiez votre dossier spam
              ou contactez le support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
