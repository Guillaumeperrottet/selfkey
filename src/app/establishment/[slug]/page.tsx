"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SelfcampFooter } from "@/components/selfcamp-footer";
import {
  MapPin,
  Globe,
  Mail,
  Phone,
  FileText,
  ArrowLeft,
  ExternalLink,
  Download,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";

interface EstablishmentData {
  id: string;
  slug: string;
  name: string;
  title: string;
  description?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude: number;
  longitude: number;
  images: string[];
  attributes: Record<string, boolean>;
  website?: string;
  email?: string;
  phone?: string;
  documents: Array<{
    name: string;
    url: string;
    type: string;
    description?: string;
  }>;
  nearbyBusinesses: Array<{
    name: string;
    type: string;
    distance: string;
    description?: string;
  }>;
}

const ATTRIBUTE_LABELS: Record<string, { label: string; icon: string }> = {
  wifi: { label: "WiFi gratuit", icon: "📶" },
  electricity: { label: "Électricité", icon: "⚡" },
  water: { label: "Eau potable", icon: "💧" },
  showers: { label: "Douches", icon: "🚿" },
  toilets: { label: "Toilettes", icon: "🚽" },
  wasteDisposal: { label: "Vidange eaux usées", icon: "🚰" },
  parking: { label: "Parking", icon: "🅿️" },
  security: { label: "Sécurité 24h/24", icon: "🔒" },
  restaurant: { label: "Restaurant", icon: "🍽️" },
  store: { label: "Boutique", icon: "🏪" },
  laundry: { label: "Laverie", icon: "🧺" },
  playground: { label: "Aire de jeux", icon: "🎮" },
  petFriendly: { label: "Animaux acceptés", icon: "🐕" },
};

export default function EstablishmentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [establishment, setEstablishment] = useState<EstablishmentData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchEstablishment = async () => {
      try {
        const response = await fetch(`/api/public/establishment/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setEstablishment(data);
        } else if (response.status === 404) {
          toast.error("Établissement non trouvé");
          router.push("/map");
        } else {
          toast.error("Erreur lors du chargement");
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEstablishment();
    }
  }, [slug, router]);

  const openInMaps = () => {
    if (establishment) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${establishment.latitude},${establishment.longitude}`;
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Établissement non trouvé</h1>
          <Link href="/map">
            <Button className="bg-[#84994F] hover:bg-[#6d7d3f]">
              Retour à la carte
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeAttributes = Object.entries(establishment.attributes || {})
    .filter(([, value]) => value)
    .map(([key]) => key);

  return (
    <>
      <style jsx global>{`
        .brand-green {
          color: #84994f;
        }
        .bg-brand-green {
          background-color: #84994f;
        }
        .hover-brand-green:hover {
          background-color: #6d7d3f;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-[#84994F]/5 to-white">
        {/* Header simple */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/map"
                className="flex items-center gap-2 text-gray-600 hover:text-[#84994F] transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Retour à la carte</span>
              </Link>

              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="SelfCamp"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Titre et localisation */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {establishment.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#84994F]" />
                <span>
                  {establishment.address && `${establishment.address}, `}
                  {establishment.city} {establishment.postalCode}
                </span>
              </div>

              <Badge className="bg-[#84994F]/10 text-[#84994F] border-[#84994F]/20">
                <div className="w-2 h-2 bg-[#84994F] rounded-full animate-pulse mr-2"></div>
                Ouvert 24h/24
              </Badge>
            </div>
          </div>

          {/* Galerie d'images et informations principales */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Galerie d'images */}
            <div className="space-y-4">
              {establishment.images.length > 0 ? (
                <>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={establishment.images[currentImageIndex]}
                      alt={establishment.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {establishment.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {establishment.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                            index === currentImageIndex
                              ? "border-[#84994F] scale-105"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${establishment.name} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <MapPin className="h-16 w-16 mx-auto mb-2" />
                    <p>Aucune image disponible</p>
                  </div>
                </div>
              )}
            </div>

            {/* Carte d'informations */}
            <div className="space-y-6">
              {/* Description */}
              {establishment.description && (
                <Card className="border-[#84994F]/20">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#84994F]" />À propos
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {establishment.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Bouton de réservation */}
              <Card className="border-[#84994F] bg-[#84994F]/5">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-900">
                        Disponible dès maintenant
                      </p>
                      <p className="text-sm text-gray-600">
                        Réservez votre place en quelques clics
                      </p>
                    </div>
                    <Link href={`/${establishment.slug}`}>
                      <Button
                        size="lg"
                        className="w-full bg-[#84994F] hover:bg-[#6d7d3f] text-white font-semibold"
                      >
                        Réserver maintenant
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Bouton itinéraire */}
              <Button
                variant="outline"
                className="w-full border-[#84994F] text-[#84994F] hover:bg-[#84994F] hover:text-white"
                onClick={openInMaps}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Obtenir l&apos;itinéraire
              </Button>
            </div>
          </div>

          {/* Équipements et services */}
          {activeAttributes.length > 0 && (
            <Card className="mb-8 border-[#84994F]/20">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-[#84994F]" />
                  Équipements et services
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {activeAttributes.map((key) => {
                    const attr = ATTRIBUTE_LABELS[key];
                    if (!attr) return null;
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[#84994F]/5 border border-[#84994F]/10"
                      >
                        <span className="text-2xl">{attr.icon}</span>
                        <span className="text-sm font-medium text-gray-700">
                          {attr.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact et informations */}
          {(establishment.website ||
            establishment.email ||
            establishment.phone) && (
            <Card className="mb-8 border-[#84994F]/20">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations de contact
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {establishment.website && (
                    <a
                      href={establishment.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#84994F] hover:bg-[#84994F]/5 transition-all group"
                    >
                      <Globe className="h-5 w-5 text-[#84994F]" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Site web</p>
                        <p className="font-medium text-gray-900 group-hover:text-[#84994F] transition-colors">
                          Visiter
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-[#84994F]" />
                    </a>
                  )}

                  {establishment.email && (
                    <a
                      href={`mailto:${establishment.email}`}
                      className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#84994F] hover:bg-[#84994F]/5 transition-all group"
                    >
                      <Mail className="h-5 w-5 text-[#84994F]" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900 group-hover:text-[#84994F] transition-colors truncate">
                          {establishment.email}
                        </p>
                      </div>
                    </a>
                  )}

                  {establishment.phone && (
                    <a
                      href={`tel:${establishment.phone}`}
                      className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#84994F] hover:bg-[#84994F]/5 transition-all group"
                    >
                      <Phone className="h-5 w-5 text-[#84994F]" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-medium text-gray-900 group-hover:text-[#84994F] transition-colors">
                          {establishment.phone}
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents téléchargeables */}
          {establishment.documents.length > 0 && (
            <Card className="mb-8 border-[#84994F]/20">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-[#84994F]" />
                  Documents utiles
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {establishment.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#84994F] hover:bg-[#84994F]/5 transition-all group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-[#84994F]/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-[#84994F]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 group-hover:text-[#84994F] transition-colors truncate">
                          {doc.name}
                        </p>
                        {doc.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {doc.description}
                          </p>
                        )}
                      </div>
                      <Download className="h-4 w-4 text-gray-400 group-hover:text-[#84994F] flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Commerces à proximité */}
          {establishment.nearbyBusinesses.length > 0 && (
            <Card className="mb-8 border-[#84994F]/20">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  À proximité
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {establishment.nearbyBusinesses.map((business, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-gray-200 hover:border-[#84994F]/50 hover:bg-[#84994F]/5 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {business.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {business.distance}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#84994F] font-medium mb-1">
                        {business.type}
                      </p>
                      {business.description && (
                        <p className="text-sm text-gray-600">
                          {business.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA final */}
          <Card className="border-[#84994F] bg-gradient-to-br from-[#84994F]/10 to-[#84994F]/5">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Prêt à réserver votre place ?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Réservation simple et rapide. Paiement sécurisé. Accès immédiat.
              </p>
              <Link href={`/${establishment.slug}`}>
                <Button
                  size="lg"
                  className="bg-[#84994F] hover:bg-[#6d7d3f] text-white font-semibold px-8"
                >
                  Réserver maintenant
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>

        <SelfcampFooter />
      </div>
    </>
  );
}
