"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  KeyRound,
} from "lucide-react";

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
  const [newEstablishment, setNewEstablishment] = useState({
    name: "",
    slug: "",
  });
  const router = useRouter();

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

  const handleCreateEstablishment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/establishments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEstablishment),
      });

      if (response.ok) {
        setNewEstablishment({ name: "", slug: "" });
        setShowCreateForm(false);
        fetchEstablishments();
      } else {
        const error = await response.json();
        alert(error.message || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la création");
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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <KeyRound className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SelfKey</h1>
                <p className="text-sm text-muted-foreground">
                  Gestion des établissements
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Bonjour, {user?.name || user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
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
              Gérez vos hôtels, chambres d&apos;hôtes et locations
            </p>
          </div>

          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
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
                      setNewEstablishment({
                        name,
                        slug: generateSlug(name),
                      });
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
                    onChange={(e) =>
                      setNewEstablishment({
                        ...newEstablishment,
                        slug: e.target.value,
                      })
                    }
                    required
                    placeholder="mon-hotel"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL: /{newEstablishment.slug}
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    Créer
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
            {establishments.map((establishment) => (
              <Card
                key={establishment.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">
                      {establishment.name}
                    </CardTitle>
                    <Badge
                      variant={
                        establishment.stripeOnboarded ? "default" : "secondary"
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
                  </div>
                  <CardDescription>/{establishment.slug}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span>{establishment._count.rooms} chambres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{establishment._count.bookings} réservations</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button asChild className="flex-1" size="sm">
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
                    >
                      <Link
                        href={`/${establishment.slug}`}
                        target="_blank"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Voir
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
