"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Building2, Users } from "lucide-react";
import { SuperAdminCommissions } from "@/components/SuperAdminCommissions";

export default function SuperAdminPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Rediriger vers login si pas connecté
          window.location.href = "/login?callbackUrl=/super-admin";
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
        window.location.href = "/login?callbackUrl=/super-admin";
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <Card className="shadow-xl mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Image
                  src="/logo.png"
                  alt="SelfKey"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <CardTitle className="text-2xl">Super Admin</CardTitle>
                  <CardDescription>
                    Gestion des commissions et paramètres globaux
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild size="sm">
                  <Link href="/admin">
                    <Building2 className="w-4 h-4 mr-2" />
                    Dashboard Admin
                  </Link>
                </Button>
                <Button variant="outline" asChild size="sm">
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Accueil
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Contenu principal */}
        <Tabs defaultValue="commissions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="commissions"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Commissions
            </TabsTrigger>
            <TabsTrigger
              value="establishments"
              className="flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Établissements
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Utilisateurs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commissions">
            <SuperAdminCommissions />
          </TabsContent>

          <TabsContent value="establishments">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Établissements</CardTitle>
                <CardDescription>
                  Vue d&apos;ensemble et gestion des établissements de la
                  plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Cette section permettra de gérer tous les établissements de la
                  plateforme. Fonctionnalité à venir.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <CardDescription>
                  Administration des comptes utilisateurs et permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Cette section permettra de gérer tous les utilisateurs de la
                  plateforme. Fonctionnalité à venir.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Informations utilisateur connecté */}
        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Connecté en tant que: <strong>{user.name}</strong> ({user.email}
                )
              </div>
              <div>
                <Button variant="link" size="sm" asChild>
                  <Link href="/login">Se déconnecter</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
