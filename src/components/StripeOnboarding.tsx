"use client";

import { useState, useEffect, useCallback } from "react";
import { StripeAccount } from "@/types/hotel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  CreditCard,
  Mail,
  ExternalLink,
  Settings,
  Zap,
  Loader2,
  ArrowRight,
  Shield,
  DollarSign,
  BarChart3,
  Building2,
} from "lucide-react";

interface Props {
  hotelSlug: string;
  hotelName: string;
}

export function StripeOnboarding({ hotelSlug }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<StripeAccount | null>(
    null
  );
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [email, setEmail] = useState("");
  const [setupError, setSetupError] = useState<string | null>(null);
  const [connectEnabled, setConnectEnabled] = useState(true);

  const checkConnectSetup = useCallback(async () => {
    try {
      const response = await fetch("/api/stripe/setup-check");
      const setup = await response.json();

      if (!setup.isSetup || !setup.connectEnabled) {
        setSetupError(setup.error);
        setConnectEnabled(false);
      }
    } catch (error) {
      console.error("Erreur vérification setup:", error);
    }
  }, []);

  const checkStripeStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/stripe/onboard?hotel=${hotelSlug}`);
      const data = await response.json();

      if (data.connected) {
        setAccountStatus(data.accountStatus);
        setNeedsOnboarding(data.needsOnboarding);
      } else {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error("Erreur vérification Stripe:", error);
    }
  }, [hotelSlug]);

  useEffect(() => {
    checkStripeStatus();
    checkConnectSetup();
  }, [checkStripeStatus, checkConnectSetup]);

  const startOnboarding = async () => {
    if (!email) {
      alert("Veuillez saisir votre email");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotelSlug,
          email,
          country: "CH",
          businessType: "individual",
        }),
      });

      const { onboardingUrl } = await response.json();

      if (onboardingUrl) {
        // Rediriger vers Stripe pour l'onboarding
        window.location.href = onboardingUrl;
      }
    } catch (error) {
      console.error("Erreur onboarding:", error);
      alert("Erreur lors de la configuration Stripe");
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher l'erreur de configuration Connect en premier
  if (!connectEnabled && setupError) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="border-destructive bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            Configuration Stripe Connect requise
          </AlertDescription>
        </Alert>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Settings className="h-5 w-5" />
              Stripe Connect non configuré
            </CardTitle>
            <CardDescription>{setupError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Étapes de configuration :
              </h4>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className="min-w-[20px] h-5 p-0 flex items-center justify-center text-xs"
                  >
                    1
                  </Badge>
                  <span>Connectez-vous à votre dashboard Stripe</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className="min-w-[20px] h-5 p-0 flex items-center justify-center text-xs"
                  >
                    2
                  </Badge>
                  <span>Allez dans Paramètres → Connect</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className="min-w-[20px] h-5 p-0 flex items-center justify-center text-xs"
                  >
                    3
                  </Badge>
                  <span>Activez Stripe Connect pour votre plateforme</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className="min-w-[20px] h-5 p-0 flex items-center justify-center text-xs"
                  >
                    4
                  </Badge>
                  <span>Configurez votre profil de plateforme</span>
                </li>
              </ol>
            </div>

            <Button asChild className="w-full">
              <a
                href="https://dashboard.stripe.com/settings/connect/platform-profile"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Configurer Stripe Connect
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accountStatus && !needsOnboarding) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            Compte Stripe configuré avec succès
          </AlertDescription>
        </Alert>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CreditCard className="h-5 w-5" />
              Configuration Stripe active
            </CardTitle>
            <CardDescription>
              Les paiements sont dirigés vers votre compte :{" "}
              <strong>{accountStatus.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-green-800">Paiements</div>
                  <div className="text-sm text-green-600">Activés</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-blue-800">Virements</div>
                  <div className="text-sm text-blue-600">Activés</div>
                </div>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full mt-4">
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Accéder au dashboard Stripe
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Alert className="border-amber-200 bg-amber-50">
        <Zap className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 font-medium">
          Configuration des paiements requise
        </AlertDescription>
      </Alert>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Configuration Stripe Connect
          </CardTitle>
          <CardDescription>
            Pour recevoir les paiements directement sur votre compte, vous devez
            configurer Stripe Connect.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {needsOnboarding && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email pour votre compte Stripe
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="proprietaire@hotel.com"
                />
              </div>

              <Button
                onClick={startOnboarding}
                disabled={isLoading || !email}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Configuration en cours...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Configurer mon compte Stripe
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Ce processus vous permettra de :
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>Recevoir les paiements directement</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <span>Gérer vos remboursements</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    <span>Accéder à votre dashboard Stripe</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-orange-600" />
                    <span>Contrôler vos virements</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
