"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Building2, Users, LogOut } from "lucide-react";
import { SuperAdminCommissions } from "@/components/SuperAdminCommissions";
import { SuperAdminEstablishments } from "@/components/SuperAdminEstablishments";
import { SuperAdminUsers } from "@/components/SuperAdminUsers";
import { toastUtils } from "@/lib/toast-utils";

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/check-super-admin");
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error("Erreur vérification auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const response = await fetch("/api/admin/check-super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        toastUtils.success("Connexion réussie !");
      } else {
        toastUtils.error("Identifiants invalides");
      }
    } catch {
      toastUtils.error("Erreur de connexion");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Supprimer le cookie côté client en définissant une date d'expiration passée
      document.cookie =
        "super-admin-session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      setIsAuthenticated(false);
      toastUtils.success("Déconnexion réussie");
    } catch {
      toastUtils.error("Erreur lors de la déconnexion");
    }
  };

  // Interface de connexion
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="SelfKey"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <h1 className="text-2xl font-bold">SelfKey</h1>
            </div>
            <CardTitle className="text-xl">Super Admin</CardTitle>
            <CardDescription>
              Accès restreint aux administrateurs autorisés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@selfkey.local"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" disabled={loginLoading} className="w-full">
                {loginLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="link" asChild size="sm">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Retour à l&apos;accueil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
                <Button variant="outline" onClick={handleLogout} size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
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
              Commissions & Frais
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
            <SuperAdminEstablishments />
          </TabsContent>

          <TabsContent value="users">
            <SuperAdminUsers />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
