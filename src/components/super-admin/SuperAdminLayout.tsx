"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Settings,
  Building2,
  Receipt,
  Users,
  Key,
  Webhook,
  Activity,
  LogOut,
  Home,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigationItems = [
    {
      id: "commissions",
      label: "Commissions & Frais",
      icon: Settings,
      description: "Gestion des commissions",
      href: "/super-admin",
    },
    {
      id: "establishments",
      label: "Établissements",
      icon: Building2,
      description: "Gestion des hôtels",
      href: "/super-admin",
      hash: "establishments", // Pour scroll vers la section
    },
    {
      id: "tourist-tax",
      label: "Taxe de Séjour",
      icon: Receipt,
      description: "Configuration des taxes",
      href: "/super-admin",
      hash: "tourist-tax",
    },
    {
      id: "users",
      label: "Utilisateurs",
      icon: Users,
      description: "Gestion des utilisateurs",
      href: "/super-admin",
      hash: "users",
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

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/check-super-admin");
      const data = await response.json();

      if (!data.isAuthenticated) {
        router.push("/super-admin");
        return;
      }

      setIsAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error("Erreur vérification auth:", error);
      router.push("/super-admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/check-super-admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      router.push("/super-admin");
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirection en cours
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
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "w-full flex items-center px-3 py-3 rounded-xl text-left transition-all duration-200 group",
                    isActive
                      ? "bg-gray-100 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
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
                </Link>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <Badge variant="secondary" className="text-xs">
                  Super Admin
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
