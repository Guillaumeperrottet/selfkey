"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommissionsDashboard } from "@/components/CommissionsDashboard";
import { CommissionsTable } from "@/components/CommissionsTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, LogOut } from "lucide-react";

export default function SuperAdminCommissionsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuthentication = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/check-super-admin");
      const data = await response.json();

      if (data.isAuthenticated) {
        setIsAuthenticated(true);
      } else {
        router.push("/admin/login");
      }
    } catch {
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      // Fallback: supprimer le cookie côté client
      document.cookie =
        "super-admin-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/admin/login");
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Vérification des droits d&apos;accès...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Commissions</h1>
          <p className="text-gray-600">
            Tableau de bord des commissions de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Super Admin
          </Badge>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>

      <CommissionsDashboard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Détail des Commissions par Établissement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CommissionsTable />
        </CardContent>
      </Card>
    </div>
  );
}
