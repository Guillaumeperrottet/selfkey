"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SelfcampFooter } from "@/components/public-pages/selfcamp-footer";
import { AmenityIcon } from "@/components/ui/amenity-icon";
import { SelfcampLanguageSelector } from "@/components/ui/selfcamp-language-selector";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSelfcampTranslation } from "@/hooks/useSelfcampTranslation";
import {
  MapPin,
  Globe,
  Mail,
  Phone,
  FileText,
  ArrowLeft,
  Download,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

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
    website?: string;
    mapsUrl?: string;
    image?: string;
    documents?: Array<{
      name: string;
      url: string;
    }>;
  }>;
  is24h7Access?: boolean;
  checkInStartTime?: string;
  checkInEndTime?: string;
  checkOutTime?: string;
  accessRestrictions?: string;
  showLocalImpact?: boolean;
  localImpactTitle?: string;
  localImpactDescription?: string;
  touristTaxImpactMessage?: string;
}

export default function EstablishmentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [establishment, setEstablishment] = useState<EstablishmentData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Translation hook
  const { t, locale } = useSelfcampTranslation();

  // Analytics hook
  const { trackEstablishment } = useAnalytics();

  // Fonction helper pour obtenir l'URL de téléchargement
  const getDownloadUrl = (url: string) => {
    // Pour Cloudinary, on utilise l'URL directe sans transformation
    // Les URLs raw doivent rester telles quelles
    return url;
  };

  useEffect(() => {
    const fetchEstablishment = async () => {
      try {
        const response = await fetch(
          `/api/public/establishment/${slug}?locale=${locale}`
        );
        if (response.ok) {
          const data = await response.json();
          setEstablishment(data);

          // Track establishment view
          trackEstablishment.viewed(slug, data.name || data.title);
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
  }, [slug, locale, router, trackEstablishment]);

  const openInMaps = () => {
    if (establishment) {
      // Track directions click
      trackEstablishment.directionsClicked(
        slug,
        establishment.name || establishment.title
      );

      const url = `https://www.google.com/maps/dir/?api=1&destination=${establishment.latitude},${establishment.longitude}`;
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#84994F]/8 via-white to-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#84994F]/8 via-white to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {t.establishment.notFound.title}
          </h1>
          <p className="text-gray-600">
            {t.establishment.notFound.description}
          </p>
          <Link href="/map">
            <Button className="bg-[#84994F] hover:bg-[#6d7d3f] mt-4">
              {t.establishment.notFound.backButton}
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
        /* Empêcher le scroll horizontal sur mobile */
        body {
          overflow-x: hidden;
        }
      `}</style>

      <div className="min-h-screen bg-white overflow-x-hidden">
        {/* Hero Section avec dégradé comme homepage */}
        <div className="relative bg-gradient-to-b from-[#84994F]/8 via-white to-white">
          {/* Header comme Selfcamp homepage */}
          <header className="container mx-auto px-4 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              {/* Desktop header */}
              <div className="hidden md:flex items-center justify-between w-full">
                <Link
                  href="/map"
                  className="flex items-center gap-2 text-gray-600 hover:text-[#84994F] transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">
                    {t.establishment.backToMap}
                  </span>
                </Link>

                <Link
                  href="/"
                  className="text-[#84994F] font-bold uppercase tracking-wide text-lg hover:text-[#6d7d3f] transition-colors"
                >
                  Selfcamp
                </Link>

                <div className="flex items-center gap-4">
                  <Link
                    href="/contact"
                    className="text-[#84994F] font-bold uppercase tracking-wide text-sm hover:text-[#6d7d3f] transition-colors"
                  >
                    {t.establishment.contactUs}
                  </Link>
                  <SelfcampLanguageSelector variant="compact" />
                </div>
              </div>

              {/* Mobile header */}
              <div className="flex md:hidden items-center justify-between w-full">
                <Link
                  href="/map"
                  className="flex items-center text-gray-600 hover:text-[#84994F] transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>

                <Link
                  href="/"
                  className="text-[#84994F] font-bold uppercase tracking-wide text-base hover:text-[#6d7d3f] transition-colors"
                >
                  Selfcamp
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    href="/contact"
                    className="text-[#84994F] font-bold uppercase tracking-wide text-xs hover:text-[#84994F]/80 transition-colors"
                  >
                    {t.establishment.contactShort}
                  </Link>
                  <SelfcampLanguageSelector variant="minimal" />
                </div>
              </div>
            </div>
          </header>

          {/* Contenu principal */}
          <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
            {/* Titre et localisation */}
            <div className="mb-8 md:mb-12">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                {establishment.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#84994F]" />
                  <span className="text-base md:text-lg">
                    {establishment.address && `${establishment.address}, `}
                    {establishment.city} {establishment.postalCode}
                  </span>
                </div>

                {/* Afficher les horaires si disponibles, sinon badge 24h/24 */}
                {establishment.is24h7Access ? (
                  <Badge className="bg-[#84994F]/10 text-[#84994F] border-[#84994F]/20 px-4 py-1.5">
                    <div className="w-2 h-2 bg-[#84994F] rounded-full animate-pulse mr-2"></div>
                    {t.establishment.header.open247}
                  </Badge>
                ) : establishment.checkInStartTime &&
                  establishment.checkInEndTime ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-[#84994F]/10 text-[#84994F] border-[#84994F]/20 px-4 py-1.5">
                      🕐 {t.establishment.header.arrival}{" "}
                      {establishment.checkInStartTime} -{" "}
                      {establishment.checkInEndTime}
                    </Badge>
                    {establishment.checkOutTime && (
                      <Badge className="bg-gray-100 text-gray-700 border-gray-200 px-4 py-1.5">
                        🏁 {t.establishment.header.departureBefore}{" "}
                        {establishment.checkOutTime}
                      </Badge>
                    )}
                  </div>
                ) : null}

                {/* Restrictions d'accès si présentes */}
                {establishment.accessRestrictions && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="whitespace-pre-line">
                      {establishment.accessRestrictions}
                    </span>
                  </div>
                )}
              </div>

              {/* Informations de contact - en ligne et discret */}
              {(establishment.website ||
                establishment.email ||
                establishment.phone) && (
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {establishment.website && (
                    <a
                      href={establishment.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-gray-600 hover:text-[#84994F] transition-colors group"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="group-hover:underline">
                        {t.establishment.info.website}
                      </span>
                    </a>
                  )}
                  {establishment.email && (
                    <a
                      href={`mailto:${establishment.email}`}
                      onClick={() =>
                        trackEstablishment.contactClicked(slug, "email")
                      }
                      className="flex items-center gap-1.5 text-gray-600 hover:text-[#84994F] transition-colors group"
                    >
                      <Mail className="h-4 w-4" />
                      <span className="group-hover:underline">
                        {establishment.email}
                      </span>
                    </a>
                  )}
                  {establishment.phone && (
                    <a
                      href={`tel:${establishment.phone}`}
                      onClick={() =>
                        trackEstablishment.contactClicked(slug, "phone")
                      }
                      className="flex items-center gap-1.5 text-gray-600 hover:text-[#84994F] transition-colors group"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="group-hover:underline">
                        {establishment.phone}
                      </span>
                    </a>
                  )}
                </div>
              )}
            </div>
            {/* Galerie d'images et informations principales */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Galerie d'images */}
              <div className="space-y-4">
                {establishment.images.length > 0 ? (
                  <>
                    <div
                      onClick={() => {
                        setLightboxOpen(true);
                        trackEstablishment.imageGalleryOpened(
                          slug,
                          currentImageIndex
                        );
                      }}
                      className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
                    >
                      <Image
                        src={establishment.images[currentImageIndex]}
                        alt={establishment.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                          <svg
                            className="w-8 h-8 text-[#84994F]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {establishment.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {establishment.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setLightboxOpen(true);
                            }}
                            className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                              index === currentImageIndex
                                ? "border-[#84994F] scale-105 shadow-md"
                                : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`${establishment.name} ${index + 1}`}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200">
                    <div className="text-center text-gray-400">
                      <MapPin className="h-16 w-16 mx-auto mb-2" />
                      <p>{t.establishment.images.noImage}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Carte d'informations */}
              <div className="space-y-6">
                {/* Description */}
                {establishment.description && (
                  <div className="bg-[#F5F5F0] rounded-3xl p-6 md:p-8 border border-[#E5E5DD]">
                    <h2 className="text-xl md:text-2xl font-bold text-[#84994F] mb-4 text-center">
                      {t.establishment.about.title}
                    </h2>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed text-center whitespace-pre-line">
                      {establishment.description}
                    </p>
                  </div>
                )}

                {/* Bouton de réservation */}
                <Link href={`/${establishment.slug}`}>
                  <Button
                    size="lg"
                    className="w-full bg-[#84994F] hover:bg-[#6d7d3f] text-white font-semibold"
                  >
                    {t.establishment.cta.bookNow}
                  </Button>
                </Link>

                {/* Bouton itinéraire */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-[#84994F] text-[#84994F] hover:bg-[#84994F] hover:text-white transition-all"
                    onClick={openInMaps}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {t.establishment.cta.getDirections}
                  </Button>
                </div>
              </div>
            </div>
            {/* Impact de votre séjour */}
            {establishment.showLocalImpact &&
              (establishment.touristTaxImpactMessage ||
                establishment.localImpactDescription) && (
                <div className="mb-16">
                  <div className="bg-[#84994F]/[0.02] rounded-3xl p-6 md:p-8 border border-[#84994F]/[0.08]">
                    <h2 className="text-xl md:text-2xl font-bold text-[#84994F] mb-4 text-center">
                      {establishment.localImpactTitle ||
                        t.establishment.impact.title}
                    </h2>
                    {establishment.touristTaxImpactMessage && (
                      <p className="text-gray-700 text-sm md:text-base mb-4 text-center leading-relaxed">
                        {establishment.touristTaxImpactMessage}
                      </p>
                    )}
                    {establishment.localImpactDescription && (
                      <div className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
                        {establishment.localImpactDescription}
                      </div>
                    )}
                  </div>
                </div>
              )}
            {/* Commerces à proximité */}
            {establishment.nearbyBusinesses.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  {t.establishment.nearby.title}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {establishment.nearbyBusinesses.map((business, index) => (
                    <div
                      key={index}
                      className="bg-[#84994F]/[0.02] rounded-2xl p-5 border border-[#84994F]/[0.08] hover:shadow-md transition-shadow"
                    >
                      {/* Image du commerce */}
                      {business.image && (
                        <div className="relative w-full h-40 mb-4 rounded-xl overflow-hidden">
                          <Image
                            src={business.image}
                            alt={business.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-base">
                          {business.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs border-[#84994F]/30 text-[#84994F] bg-white"
                        >
                          {business.distance}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#84994F] font-medium mb-2">
                        • {business.type}
                      </p>
                      {business.description && (
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                          {business.description}
                        </p>
                      )}
                      {/* Liens */}
                      {(business.website || business.mapsUrl) && (
                        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-[#84994F]/[0.1]">
                          {business.website && (
                            <a
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                trackEstablishment.nearbyBusinessClicked(
                                  slug,
                                  business.name,
                                  business.type
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-[#84994F] transition-colors group"
                            >
                              <Globe className="h-3.5 w-3.5" />
                              <span className="group-hover:underline">
                                {t.establishment.nearby.website}
                              </span>
                            </a>
                          )}
                          {business.mapsUrl && (
                            <a
                              href={business.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                trackEstablishment.nearbyBusinessClicked(
                                  slug,
                                  business.name,
                                  business.type
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-[#84994F] transition-colors group"
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="group-hover:underline">
                                {t.establishment.nearby.directions}
                              </span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Documents du commerce */}
                      {business.documents && business.documents.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#84994F]/[0.1]">
                          <p className="text-xs text-gray-600 mb-2 font-medium">
                            {t.establishment.nearby.documents}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {business.documents.map((doc, docIndex) => (
                              <a
                                key={docIndex}
                                href={getDownloadUrl(doc.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={doc.name}
                                className="inline-flex items-center gap-1.5 text-xs bg-white px-2 py-1 rounded border border-[#84994F]/20 text-gray-700 hover:text-[#84994F] hover:border-[#84994F]/40 transition-colors group"
                              >
                                <FileText className="h-3 w-3" />
                                <span className="group-hover:underline">
                                  {doc.name}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Équipements et services */}
            {activeAttributes.length > 0 && (
              <div className="mb-16">
                <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-100 shadow-sm">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <CheckCircle2 className="h-7 w-7 text-[#84994F]" />
                    {t.establishment.amenities.title}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {activeAttributes.map((key) => {
                      const attributeKey =
                        key as keyof typeof t.establishment.attributes;
                      const label = t.establishment.attributes[attributeKey];
                      if (!label) return null;
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#84994F]/5 to-transparent border-l-2 border-[#84994F]/30 hover:border-[#84994F] hover:from-[#84994F]/10 transition-all"
                        >
                          <AmenityIcon
                            type={
                              key as
                                | "wifi"
                                | "electricity"
                                | "water"
                                | "showers"
                                | "toilets"
                                | "wasteDisposal"
                                | "parking"
                                | "security"
                                | "restaurant"
                                | "store"
                                | "laundry"
                                | "playground"
                                | "petFriendly"
                            }
                            size={28}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {/* Documents téléchargeables */}
            {establishment.documents.length > 0 && (
              <div className="mb-16">
                <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-100 shadow-sm">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <FileText className="h-7 w-7 text-[#84994F]" />
                    {t.establishment.documents.title}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {establishment.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={getDownloadUrl(doc.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={doc.name}
                        className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-[#84994F]/5 to-transparent border-l-2 border-[#84994F]/30 hover:border-[#84994F] hover:from-[#84994F]/10 transition-all group min-w-0"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-[#84994F]/10 rounded-xl flex items-center justify-center group-hover:bg-[#84994F]/20 transition-colors">
                          <FileText className="h-6 w-6 text-[#84994F]" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
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
                </div>
              </div>
            )}
            {/* CTA final */}
            <div className="bg-gradient-to-br from-[#84994F]/10 to-[#84994F]/5 rounded-3xl p-8 md:p-12 border border-[#84994F]/20 shadow-sm">
              <div className="text-center space-y-6">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
                  {t.establishment.finalCta.title}
                </h2>
                <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  {t.establishment.finalCta.description}
                </p>
                <Link href={`/${establishment.slug}`}>
                  <Button
                    size="lg"
                    className="bg-[#84994F] hover:bg-[#6d7d3f] text-white font-semibold px-10 py-6 text-lg active:scale-95 transition-all shadow-md hover:shadow-lg"
                  >
                    {t.establishment.finalCta.button}
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <SelfcampFooter />
      </div>

      {/* Lightbox pour les images */}
      {establishment && establishment.images.length > 0 && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={establishment.images.map((image) => ({ src: image }))}
          index={currentImageIndex}
          on={{
            view: ({ index }) => setCurrentImageIndex(index),
          }}
          styles={{
            container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
          }}
          carousel={{
            finite: establishment.images.length <= 1,
          }}
          render={{
            buttonPrev:
              establishment.images.length <= 1 ? () => null : undefined,
            buttonNext:
              establishment.images.length <= 1 ? () => null : undefined,
          }}
        />
      )}
    </>
  );
}
