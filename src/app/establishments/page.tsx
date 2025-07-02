"use client";

import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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
  };

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🔑</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  SelfKey
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Gestion des établissements
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Bonjour, {user?.name || user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mes établissements
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Gérez vos hôtels, chambres d&apos;hôtes et locations
            </p>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Nouvel établissement</span>
          </button>
        </div>

        {/* Liste des établissements */}
        {establishments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun établissement
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Créez votre premier établissement pour commencer
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Créer un établissement
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {establishments.map((establishment) => (
              <div
                key={establishment.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {establishment.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      establishment.stripeOnboarded
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                  >
                    {establishment.stripeOnboarded
                      ? "Configuré"
                      : "À configurer"}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Slug:</span>{" "}
                    {establishment.slug}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Chambres:</span>{" "}
                    {establishment._count.rooms}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Réservations:</span>{" "}
                    {establishment._count.bookings}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Link
                    href={`/admin/${establishment.slug}`}
                    className="flex-1 bg-indigo-600 text-white text-center py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Gérer
                  </Link>
                  <Link
                    href={`/${establishment.slug}`}
                    target="_blank"
                    className="flex-1 border border-indigo-600 text-indigo-600 dark:text-indigo-400 text-center py-2 px-4 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-sm font-medium"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de création */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Nouvel établissement
              </h3>

              <form onSubmit={handleCreateEstablishment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de l&apos;établissement
                  </label>
                  <input
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Mon Hôtel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={newEstablishment.slug}
                    onChange={(e) =>
                      setNewEstablishment({
                        ...newEstablishment,
                        slug: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="mon-hotel"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    URL: /{newEstablishment.slug}
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
