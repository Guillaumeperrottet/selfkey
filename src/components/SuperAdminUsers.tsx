"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  Users,
  Calendar,
  Building2,
  Trash2,
  Search,
} from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";
import { useTableSortAndFilter } from "@/hooks/useTableSortAndFilter";
import { SortableHeader } from "@/components/ui/sortable-header";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [confirmationName, setConfirmationName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);

  // Hook pour le tri et la recherche
  const {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    filteredAndSortedData,
  } = useTableSortAndFilter({
    data: users,
    searchFields: ["name", "email", "establishments"],
    defaultSortField: "createdAt",
    defaultSortDirection: "desc",
  });

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

  const syncEstablishments = async () => {
    try {
      const response = await fetch("/api/super-admin/sync-establishments", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Erreur lors de la synchronisation");

      const result = await response.json();
      toastUtils.success(result.message);
      fetchUsers();
    } catch (error) {
      console.error("Erreur:", error);
      toastUtils.error("Impossible de synchroniser les établissements");
    }
  };

  const runAdvancedDiagnostic = async () => {
    try {
      setDiagnosticLoading(true);
      const response = await fetch("/api/super-admin/diagnostic-advanced");

      if (!response.ok) throw new Error("Erreur lors du diagnostic");

      const diagnostic = await response.json();

      // Afficher les résultats dans la console pour debug
      console.log("🔍 Diagnostic avancé:", diagnostic);

      // Créer un message détaillé
      const messages = [];
      messages.push(`📊 Santé du système: ${diagnostic.summary.healthScore}%`);
      messages.push(
        `🏢 ${diagnostic.summary.totalEstablishments} établissements au total`
      );
      messages.push(
        `👥 ${diagnostic.summary.totalUsers} utilisateurs au total`
      );

      if (diagnostic.summary.orphanedEstablishments > 0) {
        messages.push(
          `⚠️ ${diagnostic.summary.orphanedEstablishments} établissements orphelins`
        );
      }

      if (diagnostic.details.orphanedWithBookings.length > 0) {
        messages.push(
          `🚨 ${diagnostic.details.orphanedWithBookings.length} établissements orphelins avec réservations`
        );
      }

      // Afficher les suggestions
      diagnostic.suggestions.forEach(
        (suggestion: { priority: string; message: string }) => {
          if (suggestion.priority === "critical") {
            toastUtils.error(`🚨 ${suggestion.message}`);
          } else if (suggestion.priority === "high") {
            toastUtils.warning(`⚠️ ${suggestion.message}`);
          } else {
            toastUtils.info(`ℹ️ ${suggestion.message}`);
          }
        }
      );

      toastUtils.success(`Diagnostic terminé: ${messages.join(" | ")}`);
    } catch (error) {
      console.error("Erreur diagnostic:", error);
      toastUtils.error("Impossible de lancer le diagnostic avancé");
    } finally {
      setDiagnosticLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setConfirmationName("");
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete || confirmationName !== userToDelete.name) {
      toastUtils.error("Le nom saisi ne correspond pas");
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(
        `/api/super-admin/users/${userToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la suppression");
      }

      toastUtils.success("Utilisateur supprimé avec succès");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setConfirmationName("");
      fetchUsers(); // Recharger la liste
    } catch (error) {
      console.error("Erreur suppression:", error);
      toastUtils.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer l'utilisateur"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    setConfirmationName("");
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
            <Button onClick={syncEstablishments} variant="outline" size="sm">
              <Building2 className="w-4 h-4 mr-2" />
              Synchroniser Établissements
            </Button>
            <Button
              onClick={runAdvancedDiagnostic}
              variant="outline"
              size="sm"
              disabled={diagnosticLoading}
            >
              <Search className="w-4 h-4 mr-2" />
              {diagnosticLoading ? "Diagnostic..." : "Diagnostic Avancé"}
            </Button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, email ou établissement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tableau des utilisateurs */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">
                    <SortableHeader
                      sortField="name"
                      currentSortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      Utilisateur
                    </SortableHeader>
                  </TableHead>
                  <TableHead className="text-center">
                    <SortableHeader
                      sortField="emailVerified"
                      currentSortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      Email Vérifié
                    </SortableHeader>
                  </TableHead>
                  <TableHead className="text-center">
                    <SortableHeader
                      sortField="establishments"
                      currentSortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      Établissements
                    </SortableHeader>
                  </TableHead>
                  <TableHead className="text-center">
                    <SortableHeader
                      sortField="_count.excelExports"
                      currentSortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      Exports
                    </SortableHeader>
                  </TableHead>
                  <TableHead className="text-center">
                    <SortableHeader
                      sortField="createdAt"
                      currentSortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      Inscription
                    </SortableHeader>
                  </TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.map((user) => (
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
                      <div className="flex flex-wrap gap-1 justify-center">
                        {user.establishments.length > 0 ? (
                          user.establishments.map((userEst, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs whitespace-nowrap"
                            >
                              {userEst.establishment.name}
                              <span className="ml-1 text-gray-500">
                                ({userEst.role})
                              </span>
                            </Badge>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? `Aucun utilisateur trouvé pour "${searchTerm}"`
                : "Aucun utilisateur trouvé"}
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;utilisateur</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. L&apos;utilisateur{" "}
              <strong>{userToDelete?.name || userToDelete?.email}</strong> sera
              définitivement supprimé.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Pour confirmer, tapez exactement le nom de l&apos;utilisateur :
            </p>
            <p className="text-sm font-medium bg-gray-100 p-2 rounded">
              {userToDelete?.name || "Sans nom"}
            </p>
            <Input
              placeholder="Tapez le nom ici..."
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              className="font-medium"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleteLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={
                deleteLoading || confirmationName !== (userToDelete?.name || "")
              }
            >
              {deleteLoading ? "Suppression..." : "Supprimer définitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
