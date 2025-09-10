"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTutorial } from "@/components/TutorialManager";
import { TutorialMenu } from "@/components/TutorialMenu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Building2,
  ExternalLink,
  Settings,
  Bed,
  Calendar,
  CheckCircle,
  AlertCircle,
  LogOut,
  User,
  Trash2,
  Edit,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { toastUtils } from "@/lib/toast-utils";
import { EstablishmentTransfer } from "@/components/EstablishmentTransfer";
import { EstablishmentTransferHistory } from "@/components/EstablishmentTransferHistory";

interface User {
  id: string;
  name?: string;
  email: string;
}

interface Establishment {
  id: string;
  name: string;
  slug: string;
  stripeOnboarded: boolean;
  createdAt: string;
  _count: {
    rooms: number;
    bookings: number;
  };
}

export default function EstablishmentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [establishmentToDelete, setEstablishmentToDelete] =
    useState<Establishment | null>(null);
  const [establishmentToEdit, setEstablishmentToEdit] =
    useState<Establishment | null>(null);
  const [establishmentToTransfer, setEstablishmentToTransfer] =
    useState<Establishment | null>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
  const [editEstablishment, setEditEstablishment] = useState({
    name: "",
    slug: "",
  });
  const [editSlugValidation, setEditSlugValidation] = useState<{
    isChecking: boolean;
    isAvailable: boolean;
    suggestions: string[];
    message: string;
  }>({
    isChecking: false,
    isAvailable: true,
    suggestions: [],
    message: "",
  });
  const [newEstablishment, setNewEstablishment] = useState({
    name: "",
    slug: "",
  });
  const [slugValidation, setSlugValidation] = useState<{
    isChecking: boolean;
    isAvailable: boolean;
    suggestions: string[];
    message: string;
  }>({
    isChecking: false,
    isAvailable: true,
    suggestions: [],
    message: "",
  });
  const router = useRouter();

  // Configuration du tutorial
  const tutorialSteps = [
    {
      target: '[data-tutorial="header"]',
      title: "Bienvenue sur SelfKey !",
      content:
        "Ceci est votre tableau de bord principal. Vous pouvez voir tous vos établissements et gérer votre compte depuis cette page.",
      position: "bottom" as const,
    },
    {
      target: '[data-tutorial="add-establishment"]',
      title: "Créer un établissement",
      content:
        "Cliquez ici pour ajouter un nouvel hôtel, chambre d'hôtes ou location. C'est votre premier pas vers la gestion de vos réservations !",
      position: "left" as const,
    },
    {
      target: '[data-tutorial="establishment-card"]',
      title: "Gérer vos établissements",
      content:
        "Chaque carte représente un de vos établissements. Vous pouvez voir le statut, les places disponibles et accéder à la gestion complète.",
      position: "top" as const,
    },
    {
      target: '[data-tutorial="manage-button"]',
      title: "Administration",
      content:
        "Cliquez sur 'Gérer' pour accéder au tableau de bord complet de votre établissement : places, réservations, paramètres...",
      position: "top" as const,
    },
    {
      target: '[data-tutorial="view-button"]',
      title: "Vue client",
      content:
        "Le bouton 'Voir' vous permet de prévisualiser votre page de réservation telle que vos clients la verront.",
      position: "top" as const,
    },
    {
      target: '[data-tutorial="user-menu"]',
      title: "Gestion du compte",
      content:
        "Votre nom d'utilisateur et le bouton de déconnexion se trouvent ici. Vous pouvez vous déconnecter à tout moment.",
      position: "bottom" as const,
    },
  ];

  const tutorial = useTutorial({
    tutorialKey: "establishments-intro",
    steps: tutorialSteps,
    autoStart: true,
    delay: 1500,
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.user) {
          setUser(sessionData.user);
          fetchEstablishments();
        } else {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchEstablishments = async () => {
    try {
      const response = await fetch("/api/establishments");
      if (response.ok) {
        const data = await response.json();
        setEstablishments(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des établissements:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateSlug = async (name: string, slug: string) => {
    if (!slug.trim()) {
      setSlugValidation({
        isChecking: false,
        isAvailable: false,
        suggestions: [],
        message: "Le slug est requis",
      });
      return;
    }

    setSlugValidation((prev) => ({ ...prev, isChecking: true }));

    try {
      const response = await fetch("/api/establishments/validate-slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });

      if (response.ok) {
        const data = await response.json();
        setSlugValidation({
          isChecking: false,
          isAvailable: data.isAvailable,
          suggestions: data.suggestions || [],
          message: data.message,
        });
      }
    } catch (error) {
      console.error("Erreur validation slug:", error);
      setSlugValidation({
        isChecking: false,
        isAvailable: false,
        suggestions: [],
        message: "Erreur lors de la validation",
      });
    }
  };

  const handleCreateEstablishment = async (e: React.FormEvent) => {
    e.preventDefault();

    const loadingToast = toastUtils.loading("Création de l'établissement...");

    try {
      const response = await fetch("/api/establishments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEstablishment),
      });

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        toastUtils.crud.created(`Établissement "${newEstablishment.name}"`);
        setNewEstablishment({ name: "", slug: "" });
        setSlugValidation({
          isChecking: false,
          isAvailable: true,
          suggestions: [],
          message: "",
        });
        setShowCreateForm(false);
        fetchEstablishments();
      } else {
        const error = await response.json();

        // Si l'erreur contient des suggestions, les afficher
        if (error.suggestions && error.suggestions.length > 0) {
          setSlugValidation({
            isChecking: false,
            isAvailable: false,
            suggestions: error.suggestions,
            message:
              error.suggestion ||
              "Ce slug est déjà pris. Voici quelques suggestions :",
          });
          toastUtils.warning(
            "Le slug choisi n'est pas disponible. Consultez les suggestions ci-dessous."
          );
        } else {
          toastUtils.error(error.error || "Erreur lors de la création");
        }
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la création");
      console.error("Erreur:", error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleDeleteEstablishment = async () => {
    if (
      !establishmentToDelete ||
      deleteConfirmationName !== establishmentToDelete.name
    ) {
      return;
    }

    const loadingToast = toastUtils.loading(
      "Suppression de l'établissement..."
    );

    try {
      const response = await fetch(
        `/api/establishments/${establishmentToDelete.slug}`,
        {
          method: "DELETE",
        }
      );

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        toastUtils.crud.deleted(
          `Établissement "${establishmentToDelete.name}"`
        );
        setShowDeleteDialog(false);
        setEstablishmentToDelete(null);
        setDeleteConfirmationName("");
        fetchEstablishments();
      } else {
        const error = await response.json();
        toastUtils.error(error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la suppression");
      console.error("Erreur:", error);
    }
  };

  const openDeleteDialog = (establishment: Establishment) => {
    setEstablishmentToDelete(establishment);
    setDeleteConfirmationName("");
    setShowDeleteDialog(true);
  };

  const openEditDialog = (establishment: Establishment) => {
    setEstablishmentToEdit(establishment);
    setEditEstablishment({
      name: establishment.name,
      slug: establishment.slug,
    });
    setEditSlugValidation({
      isChecking: false,
      isAvailable: true,
      suggestions: [],
      message: "",
    });
    setShowEditDialog(true);
  };

  const validateEditSlug = async (
    name: string,
    slug: string,
    originalSlug: string
  ) => {
    // Si le slug n'a pas changé, pas besoin de validation
    if (slug === originalSlug) {
      setEditSlugValidation({
        isChecking: false,
        isAvailable: true,
        suggestions: [],
        message: "",
      });
      return;
    }

    if (!slug.trim()) {
      setEditSlugValidation({
        isChecking: false,
        isAvailable: false,
        suggestions: [],
        message: "Le slug est requis",
      });
      return;
    }

    setEditSlugValidation((prev) => ({ ...prev, isChecking: true }));

    try {
      const response = await fetch("/api/establishments/validate-slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });

      if (response.ok) {
        const data = await response.json();
        setEditSlugValidation({
          isChecking: false,
          isAvailable: data.isAvailable,
          suggestions: data.suggestions || [],
          message: data.message,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la validation du slug:", error);
      setEditSlugValidation({
        isChecking: false,
        isAvailable: false,
        suggestions: [],
        message: "Erreur lors de la validation",
      });
    }
  };

  const handleEditEstablishment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!establishmentToEdit) return;

    const loadingToast = toastUtils.loading(
      "Modification de l'établissement..."
    );

    try {
      const response = await fetch(
        `/api/establishments/${establishmentToEdit.slug}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editEstablishment),
        }
      );

      toastUtils.dismiss(loadingToast);

      if (response.ok) {
        toastUtils.crud.updated(`Établissement "${editEstablishment.name}"`);
        setShowEditDialog(false);
        setEstablishmentToEdit(null);
        setEditEstablishment({ name: "", slug: "" });
        setEditSlugValidation({
          isChecking: false,
          isAvailable: true,
          suggestions: [],
          message: "",
        });
        fetchEstablishments();
      } else {
        const error = await response.json();

        // Si l'erreur contient des suggestions, les afficher
        if (error.suggestions && error.suggestions.length > 0) {
          setEditSlugValidation({
            isChecking: false,
            isAvailable: false,
            suggestions: error.suggestions,
            message:
              error.suggestion ||
              "Ce slug est déjà pris. Voici quelques suggestions :",
          });
          toastUtils.warning(
            "Le slug choisi n'est pas disponible. Consultez les suggestions ci-dessous."
          );
        } else {
          toastUtils.error(error.error || "Erreur lors de la modification");
        }
      }
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      toastUtils.error("Erreur lors de la modification");
      console.error("Erreur:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header moderne */}
      <header className="border-b bg-card" data-tutorial="header">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="SelfKey Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SelfKey</h1>
                <p className="text-sm text-muted-foreground">
                  Gestion des établissements
                </p>
              </div>
            </div>

            <div
              className="flex items-center space-x-4"
              data-tutorial="user-menu"
            >
              <TutorialMenu onStartTutorial={tutorial.startTutorial} />
              <span className="text-sm text-muted-foreground">
                Bonjour, {user?.name || user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="flex items-center gap-2"
              >
                <Link href="/profile">
                  <User className="h-4 w-4" />
                  Mon Profil
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    // Essayer d'abord avec signOut()
                    const result = await signOut();
                    console.log("Déconnexion réussie:", result);
                    window.location.href = "/";
                  } catch (error) {
                    console.error(
                      "Erreur avec signOut(), tentative manuelle:",
                      error
                    );

                    // Fallback : requête directe à l'API
                    try {
                      const response = await fetch("/api/auth/sign-out", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        credentials: "include",
                      });

                      if (response.ok) {
                        console.log("Déconnexion manuelle réussie");
                        window.location.href = "/";
                      } else {
                        throw new Error(`HTTP ${response.status}`);
                      }
                    } catch (manualError) {
                      console.error(
                        "Erreur déconnexion manuelle:",
                        manualError
                      );
                      // Fallback final : effacer les cookies et rediriger
                      document.cookie =
                        "better-auth.session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      document.cookie =
                        "__Secure-better-auth.session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      window.location.href = "/";
                    }
                  }
                }}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Mes établissements
            </h2>
            <p className="text-muted-foreground mt-1">
              Gérez vos établissements, chambres et parkings etc...
            </p>
          </div>

          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-2"
                data-tutorial="add-establishment"
              >
                <Plus className="h-4 w-4" />
                Nouvel établissement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvel établissement</DialogTitle>
                <DialogDescription>
                  Créez un nouveau lieu d&apos;hébergement pour vos clients
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateEstablishment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l&apos;établissement</Label>
                  <Input
                    id="name"
                    type="text"
                    value={newEstablishment.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const newSlug = generateSlug(name);
                      setNewEstablishment({
                        name,
                        slug: newSlug,
                      });

                      // Valider le slug en temps réel si il y a du contenu
                      if (newSlug) {
                        validateSlug(name, newSlug);
                      }
                    }}
                    required
                    placeholder="Mon Hôtel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    type="text"
                    value={newEstablishment.slug}
                    onChange={(e) => {
                      const newSlug = e.target.value;
                      setNewEstablishment({
                        ...newEstablishment,
                        slug: newSlug,
                      });

                      // Valider le slug modifié manuellement
                      if (newSlug) {
                        validateSlug(newEstablishment.name, newSlug);
                      }
                    }}
                    required
                    placeholder="mon-hotel"
                    className={
                      !slugValidation.isAvailable && newEstablishment.slug
                        ? "border-red-500"
                        : slugValidation.isAvailable && newEstablishment.slug
                          ? "border-green-500"
                          : ""
                    }
                  />

                  {/* Indicateur de validation */}
                  {slugValidation.isChecking && (
                    <p className="text-xs text-blue-600">
                      ⏳ Vérification du slug...
                    </p>
                  )}

                  {!slugValidation.isChecking && newEstablishment.slug && (
                    <>
                      {slugValidation.isAvailable ? (
                        <p className="text-xs text-green-600">
                          ✅ Ce slug est disponible !
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-red-600">
                            ❌ {slugValidation.message}
                          </p>
                          {slugValidation.suggestions.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-700">
                                Suggestions disponibles :
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {slugValidation.suggestions.map(
                                  (suggestion, index) => (
                                    <Button
                                      key={index}
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="text-xs h-6 px-2"
                                      onClick={() => {
                                        setNewEstablishment({
                                          ...newEstablishment,
                                          slug: suggestion,
                                        });
                                        validateSlug(
                                          newEstablishment.name,
                                          suggestion
                                        );
                                      }}
                                    >
                                      {suggestion}
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <p className="text-xs text-muted-foreground">
                    URL: /{newEstablishment.slug}
                  </p>

                  {/* Message d'information rassurant */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                    <p className="text-xs text-blue-700">
                      💡 <strong>Info :</strong> Le slug peut être différent du
                      nom de votre établissement sans aucun problème. Vos
                      clients verront toujours le vrai nom (&quot;
                      {newEstablishment.name || "Mon Hôtel"}&quot;) sur la page
                      de réservation, seule l&apos;adresse web utilise le slug.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewEstablishment({ name: "", slug: "" });
                      setSlugValidation({
                        isChecking: false,
                        isAvailable: true,
                        suggestions: [],
                        message: "",
                      });
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={
                      slugValidation.isChecking ||
                      !slugValidation.isAvailable ||
                      !newEstablishment.name ||
                      !newEstablishment.slug
                    }
                  >
                    {slugValidation.isChecking ? "Vérification..." : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog de modification d'établissement */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier l&apos;établissement</DialogTitle>
                <DialogDescription>
                  Modifiez le nom et l&apos;URL de votre établissement.
                  Attention : changer l&apos;URL peut affecter les liens
                  existants.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleEditEstablishment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom de l&apos;établissement</Label>
                  <Input
                    id="edit-name"
                    type="text"
                    value={editEstablishment.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const newSlug = generateSlug(name);
                      setEditEstablishment({
                        name,
                        slug: newSlug,
                      });

                      // Valider le slug en temps réel si il y a du contenu et si il a changé
                      if (newSlug && establishmentToEdit) {
                        validateEditSlug(
                          name,
                          newSlug,
                          establishmentToEdit.slug
                        );
                      }
                    }}
                    required
                    placeholder="Mon Hôtel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug (URL)</Label>
                  <Input
                    id="edit-slug"
                    type="text"
                    value={editEstablishment.slug}
                    onChange={(e) => {
                      const newSlug = e.target.value;
                      setEditEstablishment({
                        ...editEstablishment,
                        slug: newSlug,
                      });

                      // Valider le slug modifié manuellement
                      if (newSlug && establishmentToEdit) {
                        validateEditSlug(
                          editEstablishment.name,
                          newSlug,
                          establishmentToEdit.slug
                        );
                      }
                    }}
                    required
                    placeholder="mon-hotel"
                    className={
                      !editSlugValidation.isAvailable &&
                      editEstablishment.slug &&
                      editEstablishment.slug !== establishmentToEdit?.slug
                        ? "border-red-500"
                        : editSlugValidation.isAvailable &&
                            editEstablishment.slug &&
                            editEstablishment.slug !== establishmentToEdit?.slug
                          ? "border-green-500"
                          : ""
                    }
                  />

                  {/* Indicateur de validation pour l'édition */}
                  {editSlugValidation.isChecking && (
                    <p className="text-xs text-blue-600">
                      ⏳ Vérification du slug...
                    </p>
                  )}

                  {!editSlugValidation.isChecking &&
                    editEstablishment.slug &&
                    editEstablishment.slug !== establishmentToEdit?.slug && (
                      <>
                        {editSlugValidation.isAvailable ? (
                          <p className="text-xs text-green-600">
                            ✅ Ce slug est disponible !
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-red-600">
                              ❌ {editSlugValidation.message}
                            </p>
                            {editSlugValidation.suggestions.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Suggestions :
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {editSlugValidation.suggestions
                                    .slice(0, 3)
                                    .map((suggestion, index) => (
                                      <Button
                                        key={index}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-6 px-2"
                                        onClick={() => {
                                          setEditEstablishment({
                                            ...editEstablishment,
                                            slug: suggestion,
                                          });
                                          if (establishmentToEdit) {
                                            validateEditSlug(
                                              editEstablishment.name,
                                              suggestion,
                                              establishmentToEdit.slug
                                            );
                                          }
                                        }}
                                      >
                                        {suggestion}
                                      </Button>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                  {/* URL d'exemple */}
                  {editEstablishment.slug && (
                    <p className="text-xs text-muted-foreground">
                      URL d&apos;accès :{" "}
                      <code className="bg-muted px-1 py-0.5 rounded">
                        {process.env.NODE_ENV === "production"
                          ? `https://yourdomain.com/${editEstablishment.slug}`
                          : `http://localhost:3000/${editEstablishment.slug}`}
                      </code>
                    </p>
                  )}

                  {/* Message d'information rassurant */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                    <p className="text-xs text-blue-700">
                      💡 <strong>Info :</strong> Le slug peut être différent du
                      nom de votre établissement sans aucun problème. Vos
                      clients verront toujours le vrai nom (&quot;
                      {editEstablishment.name || "Mon Hôtel"}&quot;) sur la page
                      de réservation, seule l&apos;adresse web utilise le slug.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowEditDialog(false);
                      setEstablishmentToEdit(null);
                      setEditEstablishment({ name: "", slug: "" });
                      setEditSlugValidation({
                        isChecking: false,
                        isAvailable: true,
                        suggestions: [],
                        message: "",
                      });
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={
                      editSlugValidation.isChecking ||
                      (!editSlugValidation.isAvailable &&
                        editEstablishment.slug !== establishmentToEdit?.slug) ||
                      !editEstablishment.name ||
                      !editEstablishment.slug
                    }
                  >
                    {editSlugValidation.isChecking
                      ? "Vérification..."
                      : "Modifier"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Liste des établissements */}
        {establishments.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-6">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Aucun établissement</h3>
                <p className="text-muted-foreground">
                  Créez votre premier établissement pour commencer
                </p>
              </div>
              <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogTrigger asChild>
                  <Button>Créer un établissement</Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {establishments.map((establishment, index) => (
              <Card
                key={establishment.id}
                className="hover:shadow-lg transition-shadow"
                data-tutorial={index === 0 ? "establishment-card" : undefined}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {establishment.name}
                      </CardTitle>
                      <CardDescription>/{establishment.slug}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          establishment.stripeOnboarded
                            ? "default"
                            : "secondary"
                        }
                        className="flex items-center gap-1"
                      >
                        {establishment.stripeOnboarded ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {establishment.stripeOnboarded
                          ? "Configuré"
                          : "À configurer"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(establishment)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        title="Modifier le nom de l'établissement"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(establishment)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Supprimer l'établissement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span>{establishment._count.rooms} places</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{establishment._count.bookings} réservations</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex space-x-3">
                      <Button
                        asChild
                        className="flex-1"
                        size="sm"
                        data-tutorial={
                          index === 0 ? "manage-button" : undefined
                        }
                      >
                        <Link
                          href={`/admin/${establishment.slug}`}
                          className="flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Gérer
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1"
                        size="sm"
                        data-tutorial={index === 0 ? "view-button" : undefined}
                      >
                        <Link
                          href={`/${establishment.slug}`}
                          target="_blank"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Voir la page de réservation
                        </Link>
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setEstablishmentToTransfer(establishment);
                        setShowTransferDialog(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Transférer l&apos;établissement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Tutorial Guide */}
      {tutorial.tutorialComponent}

      {/* Dialogue de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Supprimer l&apos;établissement
            </DialogTitle>
            <DialogDescription>
              Cette action est <strong>irréversible</strong>. Toutes les données
              associées à cet établissement seront définitivement supprimées.
            </DialogDescription>
          </DialogHeader>

          {establishmentToDelete && (
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="font-medium text-destructive mb-2">
                  Données qui seront supprimées :
                </h4>
                <ul className="text-sm text-destructive/80 space-y-1">
                  <li>
                    • L&apos;établissement &quot;{establishmentToDelete.name}
                    &quot;
                  </li>
                  <li>
                    • Toutes les places ({establishmentToDelete._count.rooms})
                  </li>
                  <li>
                    • Toutes les réservations (
                    {establishmentToDelete._count.bookings})
                  </li>
                  <li>• Tous les paramètres et configurations</li>
                  <li>• L&apos;historique des paiements</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmation-name"
                  className="text-sm font-medium"
                >
                  Pour confirmer, saisissez le nom exact de l&apos;établissement
                  :
                </Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Tapez :{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {establishmentToDelete.name}
                  </code>
                </div>
                <Input
                  id="confirmation-name"
                  type="text"
                  value={deleteConfirmationName}
                  onChange={(e) => setDeleteConfirmationName(e.target.value)}
                  placeholder={establishmentToDelete.name}
                  className={
                    deleteConfirmationName === establishmentToDelete.name &&
                    deleteConfirmationName !== ""
                      ? "border-green-500 focus:ring-green-500"
                      : deleteConfirmationName !== "" &&
                          deleteConfirmationName !== establishmentToDelete.name
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                  }
                />
                {deleteConfirmationName !== "" &&
                  deleteConfirmationName !== establishmentToDelete.name && (
                    <p className="text-xs text-red-500">
                      Le nom saisi ne correspond pas exactement.
                    </p>
                  )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setEstablishmentToDelete(null);
                    setDeleteConfirmationName("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  disabled={
                    deleteConfirmationName !== establishmentToDelete.name
                  }
                  onClick={handleDeleteEstablishment}
                >
                  Supprimer définitivement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue de transfert d'établissement */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-4xl w-[85vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transférer l&apos;établissement</DialogTitle>
            <DialogDescription>
              Transférer la propriété de l&apos;établissement vers un autre
              utilisateur
            </DialogDescription>
          </DialogHeader>

          {establishmentToTransfer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EstablishmentTransfer
                establishmentSlug={establishmentToTransfer.slug}
                establishmentName={establishmentToTransfer.name}
                onTransferComplete={() => {
                  setShowTransferDialog(false);
                  setEstablishmentToTransfer(null);
                  // Recharger la liste des établissements pour refléter le transfert
                  window.location.reload();
                }}
              />

              <EstablishmentTransferHistory
                establishmentSlug={establishmentToTransfer.slug}
                className="h-fit"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
