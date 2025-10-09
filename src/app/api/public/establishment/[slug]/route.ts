import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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
        address: true,
        city: true,
        postalCode: true,
        country: true,
        latitude: true,
        longitude: true,

        // Informations de présentation
        presentationImages: true,
        presentationDescription: true,
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

        // Impact local
        showLocalImpact: true,
        localImpactTitle: true,
        localImpactDescription: true,
        touristTaxImpactMessage: true,

        // Infos de la carte (fallback si pas de présentation)
        mapTitle: true,
        mapDescription: true,
        mapImage: true,
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé ou non visible publiquement" },
        { status: 404 }
      );
    }

    // Formatter les données pour l'affichage public
    const publicData = {
      id: establishment.id,
      slug: establishment.slug,
      name: establishment.name,
      title: establishment.mapTitle || establishment.name,
      description:
        establishment.presentationDescription || establishment.mapDescription,
      address: establishment.address,
      city: establishment.city,
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
      documents: establishment.presentationDocuments || [],
      nearbyBusinesses: establishment.presentationNearbyBusinesses || [],

      // Horaires
      is24h7Access: establishment.is24h7Access,
      checkInStartTime: establishment.checkInStartTime,
      checkInEndTime: establishment.checkInEndTime,
      checkOutTime: establishment.checkOutTime,
      accessRestrictions: establishment.accessRestrictions,

      // Impact local
      showLocalImpact: establishment.showLocalImpact,
      localImpactTitle: establishment.localImpactTitle,
      localImpactDescription: establishment.localImpactDescription,
      touristTaxImpactMessage: establishment.touristTaxImpactMessage,
    };

    return NextResponse.json(publicData);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'établissement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
