"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Settings,
  Building2,
  Users,
  LogOut,
  Receipt,
  Activity,
  Shield,
  Menu,
  X,
  Home,
  Key,
  Webhook,
  BookOpen,
} from "lucide-react";
import { SuperAdminCommissions } from "@/components/SuperAdminCommissions";
import { SuperAdminEstablishments } from "@/components/SuperAdminEstablishments";
import { SuperAdminUsers } from "@/components/SuperAdminUsers";
import { SuperAdminTouristTax } from "@/components/SuperAdminTouristTax";
import { toastUtils } from "@/lib/toast-utils";

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("commissions");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items
  const navigationItems = [
    {
      id: "commissions",
      label: "Commissions & Frais",
      icon: Settings,
      description: "Gestion des commissions",
    },
    {
      id: "establishments",
      label: "Établissements",
      icon: Building2,
      description: "Gestion des hôtels",
    },
    {
      id: "tourist-tax",
      label: "Taxe de Séjour",
      icon: Receipt,
      description: "Configuration des taxes",
    },
    {
      id: "users",
      label: "Utilisateurs",
      icon: Users,
      description: "Gestion des utilisateurs",
    },
    {
      id: "api-management",
      label: "Clés API",
      icon: Key,
      description: "Gestion des clés API",
      href: "/super-admin/api-management",
    },
    {
      id: "webhooks",
      label: "Webhooks",
      icon: Webhook,
      description: "Configuration des webhooks",
      href: "/super-admin/webhooks",
    },
    {
      id: "monitoring-api",
      label: "Monitoring API",
      icon: Activity,
      description: "Logs et statistiques",
      href: "/super-admin/monitoring-api",
    },
  ];

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  // Fonction utilitaire pour la déconnexion automatique silencieuse
  const performSilentLogout = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await fetch("/api/admin/check-super-admin", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Erreur lors de la déconnexion automatique:", error);
      }
    }
  }, [isAuthenticated]);

  // Déconnexion automatique UNIQUEMENT à la fermeture du navigateur/onglet
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Déconnexion silencieuse (pas de confirmation)
      performSilentLogout();
    };

    // Déconnexion UNIQUEMENT à la fermeture réelle du navigateur
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [performSilentLogout]);

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
      // Appeler l'API de déconnexion pour nettoyer la session
      await fetch("/api/admin/check-super-admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      toastUtils.success("Déconnexion réussie - Session fermée");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toastUtils.warning("Déconnexion forcée");
    }

    // Forcer la déconnexion côté client
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg border bg-white dark:bg-gray-800">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                  <Image
                    src="/logo.png"
                    alt="SelfKey"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Super Admin
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                Accès restreint aux administrateurs autorisés
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@selfkey.local"
                  className="h-11 border-gray-300 focus:border-gray-500 focus:ring-gray-500 dark:border-gray-600 dark:focus:border-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-11 border-gray-300 focus:border-gray-500 focus:ring-gray-500 dark:border-gray-600 dark:focus:border-gray-400"
                />
              </div>
              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full h-11 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loginLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Connexion...
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            <Separator />

            <div className="text-center">
              <Button
                variant="ghost"
                asChild
                size="sm"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Link href="/" className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Title */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="SelfKey"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Super Admin
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gestion globale
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              // Si l'item a un href, c'est un lien externe
              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "w-full flex items-center px-3 py-3 rounded-xl text-left transition-all duration-200 group",
                      "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 mr-3 transition-colors duration-200",
                        "text-gray-400 group-hover:text-gray-600"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              }

              // Sinon c'est un tab interne
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center px-3 py-3 rounded-xl text-left transition-all duration-200 group",
                    isActive
                      ? "bg-gray-100 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 mr-3 transition-colors duration-200",
                      isActive
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-400 group-hover:text-gray-600"
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          <Separator />

          {/* Footer Actions */}
          <div className="p-4 space-y-1">
            <Button
              variant="ghost"
              asChild
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50"
            >
              <Link href="/api-docs" target="_blank">
                <BookOpen className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">Documentation API</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Swagger UI
                  </div>
                </div>
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50"
            >
              <Link href="/super-admin/monitoring">
                <Activity className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">Monitoring</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Temps réel
                  </div>
                </div>
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">Accueil</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Retour au site
                  </div>
                </div>
              </Link>
            </Button>

            <Separator className="my-2" />

            <Button
              variant="ghost"
              onClick={handleLogout}
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="font-medium text-sm">Déconnexion</div>
                <div className="text-xs opacity-75">Quitter le panel</div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {navigationItems.find((item) => item.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {
                    navigationItems.find((item) => item.id === activeTab)
                      ?.description
                  }
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex">
              <Shield className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            {activeTab === "commissions" && <SuperAdminCommissions />}
            {activeTab === "establishments" && <SuperAdminEstablishments />}
            {activeTab === "tourist-tax" && <SuperAdminTouristTax />}
            {activeTab === "users" && <SuperAdminUsers />}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
