"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  Users,
  Mail,
  Calendar,
  Building2,
  ExternalLink,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean | null;
  createdAt: string;
  establishments: {
    establishment: {
      name: string;
      slug: string;
    };
    role: string;
  }[];
  _count: {
    excelExports: number;
  };
}

export function SuperAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/super-admin/users");
      if (!response.ok) throw new Error("Erreur récupération données");

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Erreur:", error);
      toastUtils.error("Impossible de récupérer les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gestion des Utilisateurs
            </CardTitle>
            <CardDescription>
              Administration des comptes utilisateurs et permissions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchUsers} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Utilisateurs
                    </p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Emails Vérifiés
                    </p>
                    <p className="text-2xl font-bold">
                      {users.filter((user) => user.emailVerified).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avec Établissements
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        users.filter((user) => user.establishments.length > 0)
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau des utilisateurs */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Utilisateur</TableHead>
                  <TableHead className="text-center">Email Vérifié</TableHead>
                  <TableHead className="text-center">Établissements</TableHead>
                  <TableHead className="text-center">Exports</TableHead>
                  <TableHead className="text-center">Inscription</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name || "Sans nom"}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">ID: {user.id}</p>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant={user.emailVerified ? "default" : "destructive"}
                      >
                        {user.emailVerified ? "Vérifié" : "Non vérifié"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="space-y-1">
                        {user.establishments.length > 0 ? (
                          user.establishments.map((userEst, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-center"
                            >
                              <Badge variant="outline" className="text-xs">
                                {userEst.establishment.name}
                                <span className="ml-1 text-gray-500">
                                  ({userEst.role})
                                </span>
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <Badge variant="secondary">Aucun</Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="font-medium">
                        {user._count.excelExports}
                      </span>
                    </TableCell>

                    <TableCell className="text-center text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        {user.establishments.map((userEst, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a
                              href={`/admin/${userEst.establishment.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Dashboard ${userEst.establishment.name}`}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
