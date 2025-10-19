import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  localizeEstablishment,
  localizeNearbyBusinesses,
  localizeDocuments,
  type SupportedLocale,
} from "@/lib/i18n-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get locale from query params, default to 'fr'
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") || "fr") as SupportedLocale;

    // Récupérer l'établissement uniquement s'il est visible publiquement
    const establishment = await prisma.establishment.findFirst({
      where: {
        slug: slug,
        isPubliclyVisible: true,
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        name_en: true,
        name_de: true,
        address: true,
        address_en: true,
        address_de: true,
        city: true,
        city_en: true,
        city_de: true,
        postalCode: true,
        country: true,
        latitude: true,
        longitude: true,

        // Informations de présentation
        presentationImages: true,
        presentationDescription: true,
        presentationDescription_en: true,
        presentationDescription_de: true,
        presentationAttributes: true,
        presentationWebsite: true,
        presentationEmail: true,
        presentationPhone: true,
        presentationDocuments: true,
        presentationNearbyBusinesses: true,

        // Horaires
        is24h7Access: true,
        checkInStartTime: true,
        checkInEndTime: true,
        checkOutTime: true,
        accessRestrictions: true,
        accessRestrictions_en: true,
        accessRestrictions_de: true,

        // Impact local
        showLocalImpact: true,
        localImpactTitle: true,
        localImpactTitle_en: true,
        localImpactTitle_de: true,
        localImpactDescription: true,
        localImpactDescription_en: true,
        localImpactDescription_de: true,
        touristTaxImpactMessage: true,
        touristTaxImpactMessage_en: true,
        touristTaxImpactMessage_de: true,

        // Infos de la carte (fallback si pas de présentation)
        mapTitle: true,
        mapTitle_en: true,
        mapTitle_de: true,
        mapDescription: true,
        mapDescription_en: true,
        mapDescription_de: true,
        mapImage: true,
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé ou non visible publiquement" },
        { status: 404 }
      );
    }

    // Localize the establishment data
    const localized = localizeEstablishment(establishment, locale);

    if (!localized) {
      return NextResponse.json(
        { error: "Erreur lors de la localisation" },
        { status: 500 }
      );
    }

    // Formatter les données pour l'affichage public
    const publicData = {
      id: establishment.id,
      slug: establishment.slug,
      name: localized.name,
      title: localized.mapTitle || localized.name,
      description:
        localized.presentationDescription || localized.mapDescription,
      address: localized.address,
      city: localized.city,
      postalCode: establishment.postalCode,
      country: establishment.country,
      latitude: establishment.latitude,
      longitude: establishment.longitude,

      images:
        establishment.presentationImages ||
        (establishment.mapImage ? [establishment.mapImage] : []),
      attributes: establishment.presentationAttributes || {},
      website: establishment.presentationWebsite,
      email: establishment.presentationEmail,
      phone: establishment.presentationPhone,
      documents: localizeDocuments(
        establishment.presentationDocuments as
          | Record<string, unknown>[]
          | undefined,
        locale
      ),
      nearbyBusinesses: localizeNearbyBusinesses(
        establishment.presentationNearbyBusinesses as
          | Record<string, unknown>[]
          | undefined,
        locale
      ),

      // Horaires
      is24h7Access: establishment.is24h7Access,
      checkInStartTime: establishment.checkInStartTime,
      checkInEndTime: establishment.checkInEndTime,
      checkOutTime: establishment.checkOutTime,
      accessRestrictions: localized.accessRestrictions,

      // Impact local
      showLocalImpact: establishment.showLocalImpact,
      localImpactTitle: localized.localImpactTitle,
      localImpactDescription: localized.localImpactDescription,
      touristTaxImpactMessage: localized.touristTaxImpactMessage,
    };

    return NextResponse.json(publicData);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'établissement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
